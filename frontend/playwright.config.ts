import { mkdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { defineConfig } from "@playwright/test";

// The browser checks run headless against the built bundle, served by `vite preview`
// over dist/; `npm run build` runs first (build_release.md answer 5). Two projects:
// Chromium and Firefox, both blocking in CI.
const PORT = 4319;
const CI = !!process.env.CI;

// On macOS, Firefox's profile service reads ~/Library/Application Support/Firefox even
// with -profile, and macOS walls that folder off from a terminal's processes, so Firefox
// stops with "Could not find profile folder". An empty home avoids the user's own data.
const firefoxEnv = (() => {
  if (process.platform !== "darwin") return undefined;
  const home = join(tmpdir(), "playwright-firefox-home");
  mkdirSync(home, { recursive: true });
  return { ...process.env, CFFIXED_USER_HOME: home } as Record<string, string>;
})();

export default defineConfig({
  testDir: "e2e",
  forbidOnly: CI,
  retries: 0,
  reporter: "list",
  use: { baseURL: `http://localhost:${PORT}`, viewport: { width: 1600, height: 1000 } },
  projects: [
    { name: "chromium", use: { browserName: "chromium" } },
    { name: "firefox", use: { browserName: "firefox", launchOptions: firefoxEnv ? { env: firefoxEnv } : {} } },
  ],
  webServer: {
    command: `npx vite preview --port ${PORT} --strictPort`,
    url: `http://localhost:${PORT}/`,
    reuseExistingServer: !CI,
  },
});
