import { spawn } from "node:child_process";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const previewOrigin = "http://127.0.0.1:3101";
const env = {
  ...process.env,
  BLOG_DEMO: "1",
  BLOG_FIXTURE_PORT: "54339",
  BLOG_TEST_BUILD_DIR: ".next/demo",
  NEXT_PUBLIC_SUPABASE_URL: "http://127.0.0.1:54339",
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "test-public-key",
  SUPABASE_SECRET_KEY: "test-secret",
  NEXT_PUBLIC_SITE_URL: previewOrigin,
  SITE_NOINDEX: "true",
  VERCEL_ENV: "development",
};
const backend = spawn(
  process.execPath,
  ["--import", "tsx", "scripts/blog-preview-backend.mts"],
  { env, stdio: "inherit" },
);
let stopped = false;
let app: ReturnType<typeof spawn> | undefined;
function stop() {
  if (stopped) return;
  stopped = true;
  app?.kill("SIGTERM");
  backend.kill("SIGTERM");
}
process.on("SIGINT", stop);
process.on("SIGTERM", stop);
process.on("exit", stop);
backend.on("exit", (code) => {
  if (!stopped && code !== 0) {
    stop();
    process.exitCode = code ?? 1;
  }
});
for (let attempt = 0; attempt < 60; attempt++) {
  if (stopped) break;
  try {
    const response = await fetch("http://127.0.0.1:54339/health");
    if (response.ok) break;
  } catch {
    /* Wait for the isolated database to initialize. */
  }
  if (attempt === 59) {
    stop();
    throw new Error("Preview database did not start.");
  }
  await new Promise((resolve) => setTimeout(resolve, 500));
}
function startApp() {
  app = spawn(
    process.execPath,
    [
      require.resolve("next/dist/bin/next"),
      process.argv.includes("--production") ? "start" : "dev",
      ...(process.argv.includes("--production") ? [] : ["--webpack"]),
      "--hostname",
      "127.0.0.1",
      "--port",
      "3101",
    ],
    { env, stdio: "inherit" },
  );
  app.on("exit", (code) => {
    stop();
    process.exitCode = code ?? 0;
  });
  console.log(
    `\nBlog preview: ${previewOrigin}/blog\nSample article: ${previewOrigin}/blog/building-a-quieter-place-to-write\nCtrl+C stops the demo.\n`,
  );
}
if (!stopped) {
  if (process.argv.includes("--production")) {
    app = spawn(
      process.execPath,
      [require.resolve("next/dist/bin/next"), "build", "--webpack"],
      { env, stdio: "inherit" },
    );
    app.on("exit", (code) => {
      if (stopped) return;
      if (code === 0) startApp();
      else {
        stop();
        process.exitCode = code ?? 1;
      }
    });
  } else startApp();
}
