import { PGlite } from "@electric-sql/pglite";
import { readFile } from "node:fs/promises";
import { beforeAll, afterAll, describe, expect, it } from "vitest";
const owner = "11111111-1111-4111-8111-111111111111";
const stranger = "22222222-2222-4222-8222-222222222222";
let db: PGlite;
async function asRole(role: string, uid: string | null) {
  await db.exec(
    `reset role; select set_config('request.jwt.claim.sub','${uid ?? ""}',false); set role ${role};`,
  );
}
async function createDraft() {
  await asRole("authenticated", owner);
  const { rows } = await db.query<{ id: string; version: number }>(
    "select * from public.blog_create_draft()",
  );
  return rows[0];
}
const fields = (slug: string) => ({
  title: "A real article",
  slug,
  excerpt: "Article description",
  body_markdown: "## One\nOriginal content",
  tags: ["systems"],
  cover_media_id: null,
  seo_title: null,
  seo_description: null,
});
describe.sequential(
  "Postgres authorization and publication transactions",
  () => {
    beforeAll(async () => {
      db = new PGlite();
      await db.exec(
        `create role anon; create role authenticated; create role service_role bypassrls; create schema auth; create schema storage; create table auth.users(id uuid primary key); create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$; create table storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]); grant usage on schema public,auth to anon,authenticated,service_role; grant execute on function auth.uid() to anon,authenticated,service_role; insert into auth.users values('${owner}'),('${stranger}');`,
      );
      await db.exec(
        await readFile(
          new URL(
            "../../supabase/migrations/202610060001_blog.sql",
            import.meta.url,
          ),
          "utf8",
        ),
      );
      await db.exec(
        `insert into public.blog_admins values('${owner}'); grant all on all tables in schema public to service_role;`,
      );
    });
    afterAll(async () => {
      await db.close();
    });
    it("blocks non-owners and anonymous draft access and direct publication writes", async () => {
      const draft = await createDraft();
      await asRole("authenticated", stranger);
      expect(
        (await db.query("select * from public.blog_posts")).rows,
      ).toHaveLength(0);
      await expect(
        db.query("select public.blog_create_draft()"),
      ).rejects.toThrow("Unauthorized");
      await asRole("anon", null);
      await expect(db.query("select * from public.blog_posts")).rejects.toThrow(
        "permission denied",
      );
      await expect(
        db.query("insert into public.blog_publications(post_id) values($1)", [
          draft.id,
        ]),
      ).rejects.toThrow("permission denied");
      await expect(
        db.query("select public.blog_publish($1,$2,1,'{}',1,'Author')", [
          draft.id,
          owner,
        ]),
      ).rejects.toThrow("permission denied");
    });
    it("keeps drafts separate, rejects stale saves, locks slugs and makes publication retries idempotent", async () => {
      const draft = await createDraft();
      const first = (
        await db.query<{ version: number }>(
          "select * from public.blog_save_draft($1,$2,$3)",
          [draft.id, draft.version, JSON.stringify(fields("snapshot-test"))],
        )
      ).rows[0];
      await expect(
        db.query("select public.blog_save_draft($1,1,$2)", [
          draft.id,
          JSON.stringify(fields("snapshot-test")),
        ]),
      ).rejects.toThrow("Conflict");
      await asRole("service_role", null);
      const published = (
        await db.query<{ modified_at: string; body_markdown: string }>(
          "select * from public.blog_publish($1,$2,$3,'{}',1,'Vishal')",
          [draft.id, owner, first.version],
        )
      ).rows[0];
      const retry = (
        await db.query<{ modified_at: string }>(
          "select * from public.blog_publish($1,$2,$3,'{}',1,'Vishal')",
          [draft.id, owner, first.version],
        )
      ).rows[0];
      expect(retry.modified_at).toEqual(published.modified_at);
      await asRole("authenticated", owner);
      const updated = (
        await db.query<{ version: number }>(
          "select * from public.blog_save_draft($1,$2,$3)",
          [
            draft.id,
            first.version,
            JSON.stringify({
              ...fields("snapshot-test"),
              body_markdown: "Private new content",
            }),
          ],
        )
      ).rows[0];
      expect(
        (
          await db.query<{ body_markdown: string }>(
            "select body_markdown from public.blog_publications where post_id=$1",
            [draft.id],
          )
        ).rows[0].body_markdown,
      ).toContain("Original content");
      await expect(
        db.query("select public.blog_save_draft($1,$2,$3)", [
          draft.id,
          updated.version,
          JSON.stringify(fields("new-slug")),
        ]),
      ).rejects.toThrow("slugs cannot change");
      await asRole("service_role", null);
      await expect(
        db.query("select public.blog_publish($1,$2,$3,'{}',1,'Vishal')", [
          draft.id,
          owner,
          first.version,
        ]),
      ).rejects.toThrow("Conflict");
      await db.query("select public.blog_publish($1,$2,$3,'{}',1,'Vishal')", [
        draft.id,
        owner,
        updated.version,
      ]);
      await asRole("anon", null);
      expect(
        (
          await db.query<{ body_markdown: string }>(
            "select body_markdown from public.blog_publications where post_id=$1",
            [draft.id],
          )
        ).rows[0].body_markdown,
      ).toBe("Private new content");
      await asRole("authenticated", owner);
      await db.query("select public.blog_set_state($1,'unpublish')", [
        draft.id,
      ]);
      await asRole("anon", null);
      expect(
        (
          await db.query(
            "select * from public.blog_publications where post_id=$1",
            [draft.id],
          )
        ).rows,
      ).toHaveLength(0);
      await asRole("authenticated", owner);
      expect(
        (
          await db.query("select * from public.blog_posts where id=$1", [
            draft.id,
          ])
        ).rows,
      ).toHaveLength(1);
    });
    it("enforces duplicate slugs and recoverable archive state", async () => {
      const draft = await createDraft();
      await db.query("select public.blog_save_draft($1,1,$2)", [
        draft.id,
        JSON.stringify(fields("unique-slug")),
      ]);
      const other = await createDraft();
      await expect(
        db.query("select public.blog_save_draft($1,1,$2)", [
          other.id,
          JSON.stringify(fields("unique-slug")),
        ]),
      ).rejects.toThrow("unique");
      await db.query("select public.blog_set_state($1,'archive')", [draft.id]);
      await expect(
        db.query("select public.blog_save_draft($1,3,$2)", [
          draft.id,
          JSON.stringify(fields("unique-slug")),
        ]),
      ).rejects.toThrow("Restore");
      await db.query("select public.blog_set_state($1,'restore')", [draft.id]);
      expect(
        (
          await db.query<{ archived_at: null }>(
            "select archived_at from public.blog_posts where id=$1",
            [draft.id],
          )
        ).rows[0].archived_at,
      ).toBeNull();
    });
    it("reserves media only for the owning draft and enforces persisted upload bounds", async () => {
      const draft = await createDraft();
      const reserve = () =>
        db.query(
          "select * from public.blog_reserve_media($1,1000,'image/png','Diagram',null)",
          [draft.id],
        );
      const media = (await reserve()).rows[0];
      expect(media).toHaveProperty("state", "pending");
      await asRole("authenticated", stranger);
      await expect(reserve()).rejects.toThrow("Unauthorized");
      await asRole("authenticated", owner);
      for (let i = 0; i < 11; i++) await reserve();
      await expect(reserve()).rejects.toThrow("Too many uploads");
      await asRole("anon", null);
      expect(
        (await db.query("select * from public.blog_public_media")).rows,
      ).toHaveLength(0);
      await expect(db.query("select * from public.blog_media")).rejects.toThrow(
        "permission denied",
      );
    });
  },
);
