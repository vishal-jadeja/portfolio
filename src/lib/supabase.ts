import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
let client: SupabaseClient | undefined;
function getClient() {
  if (!client) {
    const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
    const secret = process.env.SUPABASE_SECRET_KEY;
    if (!url || !secret) throw new Error("Supabase server configuration is missing.");
    client = createClient(url, secret, { auth: { persistSession: false } });
  }
  return client;
}
// Preserve existing API imports while avoiding chatbot configuration at module load.
export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, property) { const real = getClient(); const value = Reflect.get(real, property); return typeof value === "function" ? value.bind(real) : value; },
});
