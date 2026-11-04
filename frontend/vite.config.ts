import { readFileSync } from "node:fs";
import { defineConfig } from "vitest/config";
import { svelte } from "@sveltejs/vite-plugin-svelte";

// The help page's about section (build_release.md answer 8): the inspector's version from the package's
// `Project.toml`, the one place it is stated, and the format's major from the schema copy.
const read = (path: string) => readFileSync(new URL(path, import.meta.url), "utf8");
const version = /^version\s*=\s*"([^"]+)"/m.exec(read("../Project.toml"))![1];
const major = JSON.parse(read("./schema/descriptor.json")).definitions.FormatVersion.properties.major.const;

export default defineConfig({
  plugins: [svelte()],
  define: { __INSPECTOR_VERSION__: JSON.stringify(version), __FORMAT_MAJOR__: JSON.stringify(major) },
  // One stylesheet: the spike's build did not load the lazy Svelte Flow chunk's CSS.
  build: { cssCodeSplit: false },
  test: { include: ["src/**/*.test.ts"], environment: "node" },
});
