/** Isolated test-only Supabase-shaped HTTP backend backed by the actual blog SQL. */
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";
import sharp from "sharp";
const db = new PGlite();
const owner = "11111111-1111-4111-8111-111111111111";
const port = Number(process.env.BLOG_FIXTURE_PORT ?? 54329);
const origin = `http://127.0.0.1:${port}`;
await db.exec(
  `create role anon; create role authenticated; create role service_role bypassrls; create schema auth; create schema storage; create table auth.users(id uuid primary key); create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$; create table storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]); grant usage on schema public,auth to anon,authenticated,service_role; grant execute on function auth.uid() to anon,authenticated,service_role; insert into auth.users values('${owner}');`,
);
await db.exec(
  await readFile(
    new URL("../../supabase/migrations/202610060001_blog.sql", import.meta.url),
    "utf8",
  ),
);
await db.exec(
  `insert into public.blog_admins values('${owner}'); grant all on all tables in schema public to service_role;`,
);
await db.exec(
  `select set_config('request.jwt.claim.sub','${owner}',false); set role authenticated;`,
);
const draft = (
  await db.query<{ id: string }>("select * from public.blog_create_draft()")
).rows[0];
await db
  .query("update public.blog_posts set id=$1 where id=$2", [
    "33333333-3333-4333-8333-333333333333",
    draft.id,
  ])
  .catch(async () => {
    await db.exec("reset role");
    await db.query("update public.blog_posts set id=$1 where id=$2", [
      "33333333-3333-4333-8333-333333333333",
      draft.id,
    ]);
    await db.exec(`set role authenticated;`);
  });
draft.id = "33333333-3333-4333-8333-333333333333";
const body =
  "# A small beginning\n\nReadable text with a [link](https://example.com), **emphasis**, and an idea worth sharing.\n\n## The implementation\n\n```typescript\nconst publish = (draft: string) => draft;\n```\n\n| Layer | Purpose |\n| --- | --- |\n| Database | Content |\n| CDN | Delivery |\n\n## What follows\n\n> Keep the writing simple.\n\n- One thought\n- Another thought\n";
await db.query("select * from public.blog_save_draft($1,1,$2)", [
  draft.id,
  JSON.stringify({
    title: "Building a quieter place to write",
    slug: "a-quieter-place-to-write",
    excerpt:
      "A test article about readable design and a reliable publishing workflow.",
    body_markdown: body,
    tags: ["engineering", "design"],
    cover_media_id: null,
    seo_title: "Quiet writing: engineering notes",
    seo_description:
      "How clear design and reliable publishing make technical writing easier.",
  }),
]);
await db.exec("reset role; set role service_role;");
await db.query(
  "select * from public.blog_publish($1,$2,2,'{}',2,'Vishal Jadeja')",
  [draft.id, owner],
);
await db.exec("reset role;");
// Enough published records to exercise crawlable pagination, without production data.
for (let index = 1; index <= 12; index++) {
  const { rows } = await db.query<{ id: string }>(
    "insert into public.blog_posts(author_id,slug,title,excerpt,body_markdown,tags,first_published_at) values($1,$2,$3,'A published pagination fixture.','## Notes\nUseful content.',array['pagination'],'2025-01-01T00:00:00Z'::timestamptz + $4 * interval '1 day') returning id",
    [owner, `pagination-note-${index}`, `Pagination note ${index}`, index],
  );
  await db.query(
    "select * from public.blog_publish($1,$2,1,'{}',1,'Vishal Jadeja')",
    [rows[0].id, owner],
  );
}
const png = await sharp({
  create: { width: 480, height: 240, channels: 3, background: "#dfd8c8" },
})
  .png()
  .toBuffer();
const objects = new Map<string, Buffer>();
if (process.env.BLOG_DEMO === "1") {
  const { seedBlogDemo } = await import("../../scripts/blog-demo-seed.mjs");
  await seedBlogDemo(db, objects, owner, draft.id);
}
let queue: Promise<unknown> = Promise.resolve();
const tables = new Set([
  "blog_admins",
  "blog_posts",
  "blog_media",
  "blog_publications",
  "blog_publication_media",
  "blog_public_media",
]);
const functions: Record<string, string[]> = {
  blog_create_draft: [],
  blog_save_draft: ["p_id", "p_version", "p_fields"],
  blog_publish: [
    "p_id",
    "p_actor",
    "p_version",
    "p_media_ids",
    "p_reading",
    "p_author",
  ],
  blog_set_state: ["p_id", "p_state"],
  blog_reserve_media: ["p_post", "p_bytes", "p_mime", "p_alt", "p_caption"],
};
function column(value: string) {
  if (!/^[a-z_]+$/.test(value)) throw new Error("Invalid fixture column");
  return `"${value}"`;
}
createServer(async (request, response) => {
  const url = new URL(request.url!, origin);
  const send = (data: unknown, status = 200) => {
    response.writeHead(status, {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "http://127.0.0.1:3100",
      "Access-Control-Allow-Headers": "*",
      "Access-Control-Allow-Methods": "GET,POST,PUT,PATCH,DELETE,OPTIONS",
      "Content-Range": "0-0/*",
    });
    response.end(JSON.stringify(data));
  };
  if (request.method === "OPTIONS") return send({});
  if (url.pathname === "/health") return send({ ready: true });
  if (url.pathname === "/fixture/image") {
    response.writeHead(200, { "Content-Type": "image/png" });
    return response.end(png);
  }
  const user = {
    id: owner,
    email: "writer@example.test",
    aud: "authenticated",
    role: "authenticated",
    app_metadata: {},
    user_metadata: {},
    created_at: new Date().toISOString(),
  };
  if (url.pathname === "/fixture/session") {
    const now = Math.floor(Date.now() / 1000);
    const token = `${Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url")}.${Buffer.from(JSON.stringify({ sub: owner, exp: now + 3600, iat: now, aud: "authenticated", role: "authenticated", iss: `${origin}/auth/v1` })).toString("base64url")}.fixture`;
    return send({
      name: "sb-127-auth-token",
      value: `base64-${Buffer.from(JSON.stringify({ access_token: token, refresh_token: "fixture-refresh", expires_in: 3600, expires_at: now + 3600, token_type: "bearer", user })).toString("base64url")}`,
    });
  }
  if (url.pathname === "/auth/v1/user") return send(user);
  if (url.pathname === "/auth/v1/.well-known/jwks.json")
    return send({ keys: [] });
  if (url.pathname === "/auth/v1/logout" || url.pathname === "/auth/v1/otp")
    return send({});
  const chunks: Buffer[] = [];
  for await (const chunk of request) chunks.push(Buffer.from(chunk));
  const raw = Buffer.concat(chunks);
  if (url.pathname.startsWith("/storage/v1/")) {
    const path = url.pathname.replace("/storage/v1/", "");
    if (path.startsWith("object/upload/sign/") && request.method === "POST")
      return send({ url: `/${path}?token=fixture-upload` });
    if (path.startsWith("object/sign/") && request.method === "POST")
      return send({ signedURL: `/${path}?token=fixture-read` });
    const key = path
      .replace(/^object\/(?:upload\/sign|sign|public|authenticated)\//, "")
      .replace(/^object\//, "");
    if (request.method === "PUT" || request.method === "POST") {
      let bytes = raw;
      if (request.headers["content-type"]?.startsWith("multipart/form-data")) {
        const form = await new Request(origin, {
          method: "POST",
          headers: { "Content-Type": request.headers["content-type"] },
          body: raw,
        }).formData();
        for (const value of form.values())
          if (typeof value !== "string")
            bytes = Buffer.from(await value.arrayBuffer());
      }
      objects.set(key, bytes);
      return send({ Key: key, Id: "fixture" });
    }
    if (objects.has(key)) {
      response.writeHead(200, {
        "Content-Type": key.endsWith(".webp") ? "image/webp" : "image/png",
      });
      return response.end(objects.get(key));
    }
    return send({ message: "Not found" }, 404);
  }
  const job = async () => {
    try {
      const secret = request.headers.apikey === "test-secret";
      const authenticated =
        !secret && String(request.headers.authorization).includes(".fixture");
      await db.exec(
        `reset role; select set_config('request.jwt.claim.sub','${authenticated ? owner : ""}',false); set role ${secret ? "service_role" : authenticated ? "authenticated" : "anon"};`,
      );
      const route = url.pathname.replace("/rest/v1/", "");
      if (route.startsWith("rpc/")) {
        const name = route.slice(4);
        const keys = functions[name];
        if (!keys) throw new Error("Unknown fixture RPC");
        const input = raw.length ? JSON.parse(raw.toString()) : {};
        const values = keys.map((k) =>
          typeof input[k] === "object" &&
          input[k] !== null &&
          !Array.isArray(input[k])
            ? JSON.stringify(input[k])
            : input[k],
        );
        const scalar = name === "blog_set_state";
        const result = await db.query(
          `select ${scalar ? "" : "* from "}public.${name}(${keys.map((_k, i) => `$${i + 1}`).join(",")})`,
          values,
        );
        return send(
          scalar
            ? Object.values(result.rows[0] as object)[0]
            : request.headers.accept?.includes("vnd.pgrst.object")
              ? result.rows[0]
              : result.rows,
        );
      }
      if (!tables.has(route)) return send({ message: "Unknown table" }, 404);
      const values: unknown[] = [];
      const filters: string[] = [];
      for (const [key, value] of url.searchParams) {
        if (["select", "order", "offset", "limit"].includes(key)) continue;
        const col = column(key);
        const dot = value.indexOf(".");
        const op = value.slice(0, dot);
        const val = value.slice(dot + 1);
        if (op === "eq" || op === "neq") {
          values.push(val);
          filters.push(`${col}${op === "eq" ? "=" : "<>"}$${values.length}`);
        } else if (op === "is") filters.push(`${col} is null`);
        else if (op === "not" && val === "is.null")
          filters.push(`${col} is not null`);
        else if (op === "in") {
          values.push(val.slice(1, -1).split(","));
          filters.push(`${col}=any($${values.length})`);
        } else if (op === "cs" || op === "ov") {
          values.push(val.slice(1, -1).split(","));
          filters.push(
            `${col}${op === "cs" ? "@>" : "&&"}$${values.length}::text[]`,
          );
        } else throw new Error(`Unsupported fixture filter: ${op}`);
      }
      const where = filters.length ? ` where ${filters.join(" and ")}` : "";
      if (request.method === "PATCH") {
        const input = JSON.parse(raw.toString());
        const sets = Object.entries(input).map(([key, value]) => {
          values.push(value);
          return `${column(key)}=$${values.length}`;
        });
        const result = await db.query(
          `update public.${route} set ${sets.join(",")}${where} returning *`,
          values,
        );
        return send(result.rows);
      }
      const select = url.searchParams.get("select") ?? "*";
      const columns =
        select === "*" ? "*" : select.split(",").map(column).join(",");
      const orders = (url.searchParams.get("order") ?? "")
        .split(",")
        .filter(Boolean)
        .map((v) => {
          const [c, direction] = v.split(".");
          return `${column(c)} ${direction === "desc" ? "desc" : "asc"}`;
        });
      const limit = Math.min(
        1000,
        Number(url.searchParams.get("limit")) || 1000,
      );
      const offset = Number(url.searchParams.get("offset")) || 0;
      const result = await db.query(
        `select ${columns} from public.${route}${where}${orders.length ? ` order by ${orders.join(",")}` : ""} limit ${limit} offset ${offset}`,
        values,
      );
      const count = (
        await db.query<{ count: number }>(
          `select count(*)::int as count from public.${route}${where}`,
          values,
        )
      ).rows[0].count;
      response.setHeader(
        "Content-Range",
        `${offset}-${offset + result.rows.length - 1}/${count}`,
      );
      // send() sets a default range; restore the real range for count requests.
      if (request.headers.accept?.includes("vnd.pgrst.object"))
        return result.rows.length === 1
          ? send(result.rows[0])
          : send({ code: "PGRST116", message: "No rows" }, 406);
      response.writeHead(200, {
        "Content-Type": "application/json",
        "Content-Range": `${offset}-${offset + result.rows.length - 1}/${count}`,
      });
      response.end(JSON.stringify(result.rows));
    } catch (error) {
      send(
        {
          message: error instanceof Error ? error.message : "Fixture failure",
          code: "fixture",
        },
        400,
      );
    }
  };
  // PGlite uses a shared connection; serialize role changes with each request.
  queue = queue.then(job, job);
  await queue;
}).listen(port, "127.0.0.1", () =>
  console.log("Isolated blog fixture backend ready"),
);
