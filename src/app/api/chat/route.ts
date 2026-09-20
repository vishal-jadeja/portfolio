import { createHash } from "crypto";
import Groq from "groq-sdk";
// import { GoogleGenAI } from "@google/genai";    // ← swap back: uncomment + re-comment Groq lines
// import type { Content } from "@google/genai";
import { env } from "@/lib/config/env";
import { supabase } from "@/lib/supabase";
import { getSecurityHeaders } from "@/lib/security/headers";
import { checkRateLimit } from "@/lib/security/rate-limiter";
import { validateChatInput, sanitizeMessage, detectAbuse } from "@/lib/security/input-validator";
import { embedText, EmbedError } from "@/lib/rag/embedder";
import { queryChunks } from "@/lib/rag/pinecone-client";
import { buildSystemPrompt } from "@/lib/rag/prompt-builder";

// ---------------------------------------------------------------------------
// Module-level singletons (instantiated once per server process)
// ---------------------------------------------------------------------------

const groq = new Groq({ apiKey: env.GROQ_API_KEY });
// const gemini = new GoogleGenAI({ apiKey: env.GOOGLE_API_KEY });
const isDev = env.NODE_ENV === "development";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function secureHeaders(extra?: Record<string, string>): Headers {
  const h = getSecurityHeaders();
  if (extra) {
    for (const [k, v] of Object.entries(extra)) h.set(k, v);
  }
  return h;
}

function jsonError(
  status: number,
  message: string,
  detail?: string
): Response {
  const body: Record<string, string | number> = { error: message };
  if (isDev && detail) body.detail = detail;
  return new Response(JSON.stringify(body), {
    status,
    headers: secureHeaders({ "Content-Type": "application/json" }),
  });
}

// ---------------------------------------------------------------------------
// Method guard
// ---------------------------------------------------------------------------

export async function GET(): Promise<Response> {
  return jsonError(405, "Method not allowed");
}
export async function PUT(): Promise<Response> {
  return jsonError(405, "Method not allowed");
}
export async function DELETE(): Promise<Response> {
  return jsonError(405, "Method not allowed");
}
export async function PATCH(): Promise<Response> {
  return jsonError(405, "Method not allowed");
}

// ---------------------------------------------------------------------------
// POST handler
// ---------------------------------------------------------------------------

// Legitimate bot responses are capped at 400 tokens (~1600 chars).
// Assistant messages longer than this in the client-sent history signal fabricated context.
const MAX_ASSISTANT_MSG_LENGTH = 1600;

// Reject requests whose body exceeds this byte limit before parsing JSON.
const MAX_BODY_BYTES = 200_000;

export async function POST(request: Request): Promise<Response> {
  // 1. Extract IP (for rate-limit + logging)
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";

  // 2. Body size guard — check Content-Length before parsing to reject oversized payloads fast
  const contentLength = request.headers.get("content-length");
  if (contentLength && parseInt(contentLength, 10) > MAX_BODY_BYTES) {
    return jsonError(413, "Request too large");
  }

  // 3. Rate limit
  const rl = checkRateLimit(request);
  if (!rl.allowed) {
    const retryAfter = Math.ceil(rl.resetInMs / 1000);
    return new Response(
      JSON.stringify({ error: "Too many requests", retryAfter }),
      {
        status: 429,
        headers: secureHeaders({
          "Content-Type": "application/json",
          "Retry-After": String(retryAfter),
        }),
      }
    );
  }

  // 3. Parse + validate body
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError(400, "Invalid JSON");
  }

  let input: ReturnType<typeof validateChatInput>;
  try {
    input = validateChatInput(body);
  } catch (err) {
    return jsonError(
      400,
      "Invalid request body",
      err instanceof Error ? err.message : undefined
    );
  }

  // 4. Extract last user message
  const lastUserMsg = [...input.messages]
    .reverse()
    .find((m) => m.role === "user");

  if (!lastUserMsg) {
    return jsonError(400, "No user message found");
  }

  // 4a. Abuse detection — runs on the raw message before sanitization
  //     so normalization catches unicode homoglyph bypass attempts.
  const abuse = detectAbuse(lastUserMsg.content);

  if (abuse.isInjection) {
    // Log with hashed IP for monitoring, never log raw message content
    console.warn("[chat] Injection attempt blocked:", {
      timestamp: new Date().toISOString(),
      ip_hash: createHash("sha256").update(ip).digest("hex"),
      labels: abuse.labels,
    });
    return jsonError(400, "Message flagged as unsafe.");
  }

  if (abuse.isCodingRequest) {
    // Return a 200 so the chat UI renders it as a bot reply, not an error
    const decline =
      "I'm Vishal's portfolio assistant — I can tell you about his projects, skills, and experience. For coding help, you'd want to reach out to him directly! 😄";
    const encoder = new TextEncoder();
    const body = new ReadableStream({
      start(controller) {
        controller.enqueue(encoder.encode(decline));
        controller.close();
      },
    });
    return new Response(body, {
      status: 200,
      headers: secureHeaders({ "Content-Type": "text/plain; charset=utf-8" }),
    });
  }

  // 4b. Sanitize (secondary layer — strips any patterns that slipped detection)
  const sanitized = sanitizeMessage(lastUserMsg.content);

  // 5. Embed the sanitized message
  let embedding: number[];
  try {
    embedding = await embedText(sanitized);
  } catch (err) {
    const detail = err instanceof Error ? err.message : undefined;
    console.error("[chat] EmbedError:", detail);
    if (err instanceof EmbedError) {
      return jsonError(502, "Embedding service unavailable", detail);
    }
    return jsonError(502, "Embedding service unavailable", detail);
  }

  // 6. Retrieve relevant chunks from Pinecone
  let chunks: Awaited<ReturnType<typeof queryChunks>>;
  try {
    chunks = await queryChunks(embedding, 5, 0.35);
  } catch (err) {
    const detail = err instanceof Error ? err.message : undefined;
    console.error("[chat] Pinecone error:", detail);
    return jsonError(502, "Search unavailable", detail);
  }

  // 7. Build system prompt
  const systemPrompt = buildSystemPrompt(chunks);

  // 8. Build messages array for the LLM
  const groqMessages: Groq.Chat.ChatCompletionMessageParam[] = [
    { role: "system", content: systemPrompt },
    ...input.messages.map((m) => ({
      role: m.role as "user" | "assistant",
      content:
        m.role === "user"
          ? sanitizeMessage(m.content)
          // Cap assistant messages — the visible answer budget is ~400 tokens
          // (~1600 chars). Values longer than this signal fabricated
          // conversation history being used to establish false context.
          : m.content.slice(0, MAX_ASSISTANT_MSG_LENGTH),
    })),
  ];

  // ── Gemini equivalent (swap back: uncomment below, comment out groqMessages above) ──
  // const contents: Content[] = [
  //   { role: "user", parts: [{ text: systemPrompt }] },
  //   { role: "model", parts: [{ text: "Understood." }] },
  //   ...input.messages.map((m) => ({
  //     role: m.role === "assistant" ? "model" : ("user" as "user" | "model"),
  //     parts: [{ text: m.role === "user" ? sanitizeMessage(m.content) : m.content }],
  //   })),
  // ];

  // 9. Start Groq streaming
  let groqStream: AsyncIterable<Groq.Chat.Completions.ChatCompletionChunk>;
  try {
    groqStream = await groq.chat.completions.create({
      model: "openai/gpt-oss-120b",
      messages: groqMessages,
      // gpt-oss is a reasoning model: reasoning tokens count against max_tokens
      // but never reach the client (we only read delta.content below), so the
      // budget is raised to leave ~400 tokens for the visible answer.
      max_tokens: 800,
      reasoning_effort: "low",
      reasoning_format: "hidden",
      temperature: 0.7,
      stream: true,
    });
  } catch (err) {
    const detail = err instanceof Error ? err.message : undefined;
    console.error("[chat] Groq error:", detail);
    return jsonError(502, "Generation unavailable", detail);
  }

  // ── Gemini streaming equivalent (swap back: uncomment below, comment out groqStream above) ──
  // let geminiStream: AsyncIterable<import("@google/genai").GenerateContentResponse>;
  // try {
  //   geminiStream = await gemini.models.generateContentStream({
  //     model: "gemini-2.5-flash",
  //     contents,
  //     config: { maxOutputTokens: 400, temperature: 0.7 },
  //   });
  // } catch (err) {
  //   const detail = err instanceof Error ? err.message : undefined;
  //   console.error("[chat] Gemini error:", detail);
  //   return jsonError(502, "Generation unavailable", detail);
  // }

  // 10. Log request metadata (SHA-256 IP, never raw)
  const log = {
    timestamp: new Date().toISOString(),
    ip_hash: createHash("sha256").update(ip).digest("hex"),
    message_length: sanitized.length,
    chunks_retrieved: chunks.length,
    response_started: true,
  };
  console.log("[chat]", JSON.stringify(log));

  // 11. Stream response in SSE / Vercel AI SDK data stream format
  const encoder = new TextEncoder();
  const sessionId = input.sessionId ?? null;
  const userContent = sanitized;

  const stream = new ReadableStream({
    async start(controller) {
      let assistantContent = "";
      try {
        for await (const chunk of groqStream) {
          const text = chunk.choices[0]?.delta?.content ?? "";
          if (text) {
            assistantContent += text;
            controller.enqueue(encoder.encode(text));
          }
        }
        // ── Gemini equivalent ──
        // for await (const chunk of geminiStream) {
        //   const text = chunk.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
        //   if (text) { assistantContent += text; controller.enqueue(encoder.encode(text)); }
        // }
      } catch (err) {
        // Mid-stream error — headers already sent, close gracefully
        console.error("[chat] Stream error:", err instanceof Error ? err.message : err);
      } finally {
        controller.close();
        // Persist messages to Supabase (non-blocking, fire-and-forget)
        if (sessionId && assistantContent) {
          const ipHash = createHash("sha256").update(ip).digest("hex");
          persistMessages(sessionId, userContent, assistantContent, ipHash).catch(
            (e) => console.error("[chat] Supabase persist error:", e)
          );
        }
      }
    },
  });

  return new Response(stream, {
    status: 200,
    headers: secureHeaders({
      "Content-Type": "text/plain; charset=utf-8",
    }),
  });
}

// ---------------------------------------------------------------------------
// Supabase persistence
// ---------------------------------------------------------------------------

async function persistMessages(
  sessionId: string,
  userContent: string,
  assistantContent: string,
  ipHash: string
): Promise<void> {
  // Upsert session — creates on first message, updates ip_hash on subsequent ones.
  // last_active_at and message_count are maintained by a DB trigger on messages insert.
  await supabase
    .from("sessions")
    .upsert({ id: sessionId, ip_hash: ipHash }, { onConflict: "id" });

  // Insert both turns in a single round-trip.
  // The trg_messages_sync_session trigger fires twice (once per row) and increments
  // message_count + updates last_active_at automatically.
  await supabase.from("messages").insert([
    { session_id: sessionId, role: "user",      content: userContent },
    { session_id: sessionId, role: "assistant", content: assistantContent },
  ]);
}
