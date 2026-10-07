import type { Database } from "@/lib/database.types";
import "server-only";
import { createClient } from "@supabase/supabase-js";
import { blogEnv } from "@/lib/config/blog-env";
export function publicClient() {
  const { url, key } = blogEnv();
  return createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
