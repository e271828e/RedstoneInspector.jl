import { mkdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { defineConfig } from "@playwright/test";
const home = join(tmpdir(), "playwright-firefox-home");
mkdirSync(home, { recursive: true });
const env = { ...process.env, CFFIXED_USER_HOME: home } as Record<string, string>;
export default defineConfig({
  testDir: ".", reporter: "line", workers: 1, timeout: 60000,
  use: { baseURL: "http://localhost:4329", viewport: { width: 1600, height: 1000 } },
  projects: [
    { name: "chromium", use: { browserName: "chromium" } },
    { name: "firefox", use: { browserName: "firefox", launchOptions: { env } } },
    { name: "webkit", use: { browserName: "webkit" } },
  ],
  webServer: { command: "npx vite preview --port 4329 --strictPort", cwd: process.env.FRONTEND, url: "http://localhost:4329/", reuseExistingServer: true },
});
