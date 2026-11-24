// Runs one of the dumps here against a checkout's modules, from its frontend/:
//   FRONTEND=$PWD DUMP=<this folder>/look_modules.test.ts npx vitest run --config <this folder>/vitest.config.mjs
export default {
  root: process.env.FRONTEND,
  server: { fs: { strict: false } },
  define: { __INSPECTOR_VERSION__: '"0"', __FORMAT_MAJOR__: "1" },
  test: { include: [process.env.DUMP], environment: "node" },
};
