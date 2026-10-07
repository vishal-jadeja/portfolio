import "./blog-load-env.mts";
import { createClient } from "@supabase/supabase-js";
// Usage: npm run blog:set-password -- owner@example.com
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const secret = process.env.SUPABASE_SECRET_KEY;
if (!url || !secret)
  throw new Error("Set the blog Supabase environment before setting a password.");
const email = process.argv[2]?.trim().toLowerCase();
if (!email) throw new Error("Pass the owner email as the first argument.");
const client = createClient(url, secret, { auth: { persistSession: false } });

async function findUser() {
  for (let page = 1; ; page++) {
    const { data, error } = await client.auth.admin.listUsers({
      page,
      perPage: 1000,
    });
    if (error) throw new Error(error.message);
    const user = data.users.find((u) => u.email?.toLowerCase() === email);
    if (user || data.users.length < 1000) return user;
  }
}
// Read without echoing so the password never reaches the terminal or history.
function prompt(label: string) {
  return new Promise<string>((resolve) => {
    process.stdout.write(label);
    const stdin = process.stdin;
    stdin.setRawMode?.(true);
    stdin.resume();
    stdin.setEncoding("utf8");
    let value = "";
    const onData = (chunk: string) => {
      for (const char of chunk) {
        if (char === "\u0003") process.exit(130);
        if (char === "\r" || char === "\n") {
          stdin.setRawMode?.(false);
          stdin.pause();
          stdin.off("data", onData);
          process.stdout.write("\n");
          return resolve(value);
        }
        value = char === "\u007f" ? value.slice(0, -1) : value + char;
      }
    };
    stdin.on("data", onData);
  });
}

const user = await findUser();
if (!user) throw new Error(`No Supabase Auth user exists for ${email}.`);
const { data: owner, error: ownerError } = await client
  .from("blog_admins")
  .select("user_id")
  .eq("user_id", user.id)
  .maybeSingle();
if (ownerError) throw new Error(ownerError.message);
if (!owner) throw new Error(`${email} is not in blog_admins.`);
const password = await prompt("New password (min 12 characters): ");
if (password.length < 12 || password.length > 128)
  throw new Error("Password must be 12–128 characters.");
if ((await prompt("Confirm password: ")) !== password)
  throw new Error("Passwords do not match.");
const { error } = await client.auth.admin.updateUserById(user.id, { password });
if (error) throw new Error(error.message);
console.log(`Password set for ${email}. Sign in at /admin/login.`);
