import { mkdirSync } from "node:fs";
import { join } from "node:path";
import { defineConfig } from "@playwright/test";

const home = "<probes>/browser/ffhome";
mkdirSync(home, { recursive: true });
export default defineConfig({
  testDir: ".",
  testMatch: process.env.SPEC ?? "*.spec.ts",
  reporter: "list",
  timeout: 300000,
  retries: 0,
  use: { baseURL: "http://localhost:4330", viewport: { width: 1600, height: 1000 } },
  projects: [
    { name: "chromium", use: { browserName: "chromium" } },
    { name: "firefox", use: { browserName: "firefox", launchOptions: { env: { ...process.env, CFFIXED_USER_HOME: home } as Record<string, string> } } },
  ],
  webServer: [
    { command: "npx vite preview --port 4330 --strictPort", cwd: "<worktree>/frontend", url: "http://localhost:4330/", reuseExistingServer: false },
    { command: "npx vite preview --port 4331 --strictPort", cwd: "<probes>/baseline_3d5/frontend", url: "http://localhost:4331/", reuseExistingServer: false },
  ],
});
