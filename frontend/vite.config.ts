import { defineConfig } from "vitest/config";
import { svelte } from "@sveltejs/vite-plugin-svelte";
export default defineConfig({
  plugins: [svelte()],
  // One stylesheet: the spike's build did not load the lazy Svelte Flow chunk's CSS.
  build: { cssCodeSplit: false },
  test: { include: ["src/**/*.test.ts"], environment: "node" },
});
