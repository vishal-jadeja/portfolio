import type { Database } from "@/lib/database.types";
import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { blogEnv } from "@/lib/config/blog-env";
export async function sessionClient() {
  const store = await cookies();
  const { url, key } = blogEnv();
  return createServerClient<Database>(url, key, {
    cookies: {
      getAll: () => store.getAll(),
      setAll: (values) => {
        try {
          values.forEach(({ name, value, options }) =>
            store.set(name, value, options),
          );
        } catch {
          /* Proxy refreshes cookies for Server Components. */
        }
      },
    },
  });
}
