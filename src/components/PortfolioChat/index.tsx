"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { TextStreamChatTransport } from "ai";
import type { UIMessage, PrepareSendMessagesRequest } from "ai";
import { AnimatePresence, motion } from "framer-motion";
import ChatPanel from "./ChatPanel";
import styles from "./PortfolioChat.module.css";

const LS_HISTORY = "portfolio-bot-history";
const LS_OPENED = "portfolio-bot-opened";
const LS_SESSION = "portfolio-bot-session";

function getOrCreateSessionId(): string {
  try {
    const existing = localStorage.getItem(LS_SESSION);
    if (existing) return existing;
    const id = crypto.randomUUID();
    localStorage.setItem(LS_SESSION, id);
    return id;
  } catch {
    return crypto.randomUUID();
  }
}

function loadHistory(): UIMessage[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(LS_HISTORY);
    return raw ? (JSON.parse(raw) as UIMessage[]) : [];
  } catch {
    return [];
  }
}

export default function PortfolioChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [hasOpened, setHasOpened] = useState(
    () => typeof window !== "undefined" && !!localStorage.getItem(LS_OPENED)
  );
  const [input, setInput] = useState("");

  const [initialMessages] = useState<UIMessage[]>(() => loadHistory());

  const transport = useMemo(
    () => new TextStreamChatTransport({ api: "/api/chat", prepareSendMessagesRequest: (({ messages }) => ({
      body: {
        sessionId: getOrCreateSessionId(),
        messages: messages.filter(m => m.role === "user" || m.role === "assistant").map(m => ({
          role: m.role as "user" | "assistant",
          content: m.parts.filter((p): p is { type: "text"; text: string } => p.type === "text").map(p => p.text).join(""),
        })).filter(m => m.content.length > 0),
      },
    })) satisfies PrepareSendMessagesRequest<UIMessage> }),
    []
  );

  const { messages, sendMessage, status, setMessages } = useChat({
    messages: initialMessages,
    transport,
  });

  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem(LS_HISTORY, JSON.stringify(messages));
    }
  }, [messages]);

  const handleOpen = useCallback(() => {
    setIsOpen(true);
    if (!hasOpened) {
      setHasOpened(true);
      localStorage.setItem(LS_OPENED, "1");
    }
  }, [hasOpened]);

  useEffect(() => {
    const onOpenChat = () => handleOpen();
    window.addEventListener("openChat", onOpenChat);
    return () => window.removeEventListener("openChat", onOpenChat);
  }, [handleOpen]);

  function handleClear() {
    localStorage.removeItem(LS_HISTORY);
    localStorage.removeItem(LS_SESSION);
    getOrCreateSessionId();
    setMessages([]);
  }

  function handleSend(text: string) {
    if (!text.trim()) return;
    setInput("");
    sendMessage({ text: text.trim() });
  }

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end">
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Blurred backdrop */}
            <motion.div
              key="backdrop"
              className="fixed inset-0 z-[9998] bg-black/30 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              onClick={() => setIsOpen(false)}
            />

            {/* Chat panel — glass + framer transform on same element */}
            <motion.div
              key="panel"
              className={`mb-3.5 pointer-events-auto relative w-[400px] max-w-[calc(100vw-48px)] rounded-[20px] border border-[var(--theme-border-main)] overflow-hidden shadow-[0_24px_64px_rgba(0,0,0,0.5),0_8px_24px_rgba(0,0,0,0.3),0_1px_0_rgba(255,255,255,0.06)_inset,0_0_0_0.5px_rgba(255,255,255,0.04)_inset] bg-[var(--glass-bg)] backdrop-blur-[20px] saturate-[180%]`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 14 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              style={{ zIndex: 9999 }}
            >
              <ChatPanel
                messages={messages}
                status={status}
                input={input}
                onInputChange={setInput}
                onSend={handleSend}
                onClose={() => setIsOpen(false)}
                onClear={handleClear}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Floating toggle button */}
      <button
        className="relative w-[50px] h-[50px] rounded-full bg-[var(--theme-card)] border border-[var(--theme-border-main)] text-[var(--theme-text-muted)] cursor-pointer flex items-center justify-center flex-shrink-0 shadow-[0_4px_24px_rgba(0,0,0,0.25),0_1px_0_rgba(255,255,255,0.05)_inset] transition-all duration-200 hover:-translate-y-0.5 hover:scale-105 hover:shadow-[0_8px_32px_rgba(0,0,0,0.35),0_1px_0_rgba(255,255,255,0.08)_inset] hover:border-white/12 hover:text-[var(--theme-text-main)] active:translate-y-0 active:scale-[0.97]"
        onClick={isOpen ? () => setIsOpen(false) : handleOpen}
        aria-label={isOpen ? "Close chat" : "Open chat"}
      >
        {isOpen ? (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        ) : (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
          </svg>
        )}
        {!hasOpened && (
          <span className={styles.pulseDot} />
        )}
      </button>
    </div>
  );
}
