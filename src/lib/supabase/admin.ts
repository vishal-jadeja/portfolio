import type { Database } from "@/lib/database.types";
import "server-only";
import { createClient } from "@supabase/supabase-js";
import { blogEnv } from "@/lib/config/blog-env";
export function adminClient() {
  const { url } = blogEnv();
  const secret = process.env.SUPABASE_SECRET_KEY;
  if (!secret)
    throw new Error("SUPABASE_SECRET_KEY is required for image publishing.");
  return createClient<Database>(url, secret, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
