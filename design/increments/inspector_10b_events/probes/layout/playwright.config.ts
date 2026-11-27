import { mkdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { defineConfig } from "@playwright/test";

const home = join(tmpdir(), "playwright-firefox-home");
mkdirSync(home, { recursive: true });
const base = process.env.BASE_FRONTEND!;
export default defineConfig({
  testDir: ".",
  testMatch: "layout.spec.ts",
  reporter: "list",
  timeout: 600000,
  use: { viewport: { width: 1600, height: 1000 } },
  projects: [
    { name: "chromium", use: { browserName: "chromium" } },
    { name: "firefox", use: { browserName: "firefox", launchOptions: { env: { ...process.env, CFFIXED_USER_HOME: home } as Record<string, string> } } },
  ],
  webServer: [
    { command: `npx vite preview --port 4320 --strictPort`, cwd: base, url: "http://localhost:4320/", reuseExistingServer: false },
    { command: `npx vite preview --port 4321 --strictPort --outDir ${join(base, "..", "..", "new_dist")}`, cwd: base, url: "http://localhost:4321/", reuseExistingServer: false },
  ],
});
