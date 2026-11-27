import { mkdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { defineConfig } from "@playwright/test";

const home = join(tmpdir(), "playwright-firefox-home");
mkdirSync(home, { recursive: true });
const firefoxEnv = { ...process.env, CFFIXED_USER_HOME: home } as Record<string, string>;

export default defineConfig({
  testDir: ".",
  reporter: "list",
  use: { viewport: { width: 800, height: 600 } },
  projects: [
    { name: "chromium", use: { browserName: "chromium" } },
    { name: "firefox", use: { browserName: "firefox", launchOptions: { env: firefoxEnv } } },
  ],
});
