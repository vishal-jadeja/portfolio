import "server-only";
import { redirect } from "next/navigation";
import { sessionClient } from "@/lib/supabase/server";
export async function requireOwner(page = false) {
  const client = await sessionClient();
  const {
    data: { user },
    error,
  } = await client.auth.getUser();
  if (error || !user) {
    if (page) redirect("/admin/login");
    throw new Error("Please sign in again.");
  }
  const { data, error: membershipError } = await client
    .from("blog_admins")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();
  if (membershipError || !data)
    throw new Error("This account is not authorized to manage the blog.");
  return { client, user };
}
