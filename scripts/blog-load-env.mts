import { existsSync } from "node:fs";
// Match local Next.js configuration without overriding explicitly provided variables.
for (const path of [".env.local", ".env"])
  if (existsSync(path)) process.loadEnvFile(path);
