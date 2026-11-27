import { mkdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { defineConfig } from "@playwright/test";
const PORT = Number(process.env.PROBE_PORT ?? 4329);
// PROBE_ROOT: the frontend folder of the worktree under probe, built; its dist/ is served.
const ROOT = process.env.PROBE_ROOT!;
const home = join(tmpdir(), "playwright-firefox-home");
mkdirSync(home, { recursive: true });
export default defineConfig({
  testDir: "specs",
  retries: 0,
  reporter: "list",
  timeout: 60000,
  use: { baseURL: `http://localhost:${PORT}`, viewport: { width: 1600, height: 1000 } },
  projects: [
    { name: "chromium", use: { browserName: "chromium" } },
    { name: "firefox", use: { browserName: "firefox", launchOptions: { env: { ...process.env, CFFIXED_USER_HOME: home } as Record<string, string> } } },
  ],
  webServer: { command: `npx vite preview --port ${PORT} --strictPort`, cwd: ROOT, url: `http://localhost:${PORT}/`, reuseExistingServer: false },
});
