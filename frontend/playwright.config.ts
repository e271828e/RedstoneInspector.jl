import { defineConfig } from "@playwright/test";

// The browser checks run headless Chromium against the built bundle, served by
// `vite preview` over dist/; `npm run build` runs first (build_release.md answer 5).
const PORT = 4319;
const CI = !!process.env.CI;

export default defineConfig({
  testDir: "e2e",
  forbidOnly: CI,
  retries: 0,
  reporter: "list",
  use: { baseURL: `http://localhost:${PORT}`, browserName: "chromium", viewport: { width: 1600, height: 1000 } },
  projects: [{ name: "chromium" }],
  webServer: {
    command: `npx vite preview --port ${PORT} --strictPort`,
    url: `http://localhost:${PORT}/`,
    reuseExistingServer: !CI,
  },
});
