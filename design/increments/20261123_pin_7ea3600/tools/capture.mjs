// Captures the inspector's existing surfaces on every committed fixture of one checkout.
//   node capture.mjs <frontend dir> <out dir> [port]
// The checkout's frontend must be built (`npm run build`). Each fixture gets the root canvas in
// both color modes, the detail pane on four selections with its sections open and the drawer's four tabs, each tab as
// a screenshot with the drawer at 640 px and as the tab body's text, which holds the rows a
// screenshot cuts off.
import { createRequire } from "node:module";
import { spawn } from "node:child_process";
import { mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";

const [frontendArg, outArg, portArg] = process.argv.slice(2);
const frontend = resolve(frontendArg);
const out = resolve(outArg);
const port = Number(portArg ?? 4331);
const require = createRequire(join(frontend, "package.json"));
const { chromium } = require("@playwright/test");

mkdirSync(out, { recursive: true });
const fixtures = readdirSync(join(frontend, "fixtures")).filter((f) => f.endsWith(".json")).map((f) => f.slice(0, -5)).sort();
const TABS = ["diagnostics", "root-inputs", "timing", "order"];
const PREFS = "redstone-inspector/prefs";
const prefs = (drawer) => JSON.stringify({
  version: 1, sizes: { tree: 280, detail: 360, drawer }, collapsed: { tree: false, detail: false },
  mode: "tier", labels: false, order: false,
});

const server = spawn("npx", ["vite", "preview", "--port", String(port), "--strictPort"], { cwd: frontend, stdio: "ignore" });
const base = `http://localhost:${port}/`;
for (let i = 0; ; i++) {
  try { if ((await fetch(base)).ok) break; } catch { /* not up yet */ }
  if (i > 100) throw new Error("the preview server did not start");
  await new Promise((r) => setTimeout(r, 100));
}

const browser = await chromium.launch();
const log = [];
const errors = [];

async function open(drawer) {
  const context = await browser.newContext({ viewport: { width: 1600, height: 1000 } });
  await context.addInitScript(([key, value]) => localStorage.setItem(key, value), [PREFS, prefs(drawer)]);
  const page = await context.newPage();
  page.on("pageerror", (e) => errors.push(`${page.__fixture}: ${e.message}`));
  page.on("console", (m) => { if (m.type() === "error" && !m.text().includes("WebSocket connection")) errors.push(`${page.__fixture}: console: ${m.text()}`); });
  return { context, page };
}

async function drop(page, name) {
  page.__fixture = name;
  await page.goto(base);
  const text = readFileSync(join(frontend, "fixtures", `${name}.json`), "utf8");
  await page.evaluate(({ text, file }) => {
    const dt = new DataTransfer();
    dt.items.add(new File([text], file, { type: "application/json" }));
    window.dispatchEvent(new DragEvent("drop", { dataTransfer: dt, bubbles: true, cancelable: true }));
  }, { text, file: `${name}.json` });
  await page.waitForFunction(() => {
    const outcome = document.querySelector("pre.outcome");
    return document.querySelector("svg.canvas[data-ready]") || (outcome && outcome.textContent !== "No file open.");
  });
  await page.waitForTimeout(150);
}

// Opens every closed section of the pane; the session keeps them open for the next node.
async function openSections(page) {
  const opened = await page.locator("aside.detail details.section:not([open]) > summary").evaluateAll((all) => all.map((s) => s.click()).length);
  if (opened) await page.waitForTimeout(80);
}

const save = async (page, name) => { await page.screenshot({ path: join(out, `${name}.png`) }); log.push(`${name}.png`); };
const saveText = async (page, selector, name) => {
  const text = await page.locator(selector).first().evaluate((el) => el.innerText).catch(() => "(absent)");
  writeFileSync(join(out, `${name}.txt`), text + "\n");
  log.push(`${name}.txt`);
};
const hasCanvas = (page) => page.locator("svg.canvas").count().then((n) => n > 0);

for (const name of fixtures) {
  // The canvas, the tree, the status bar and the pane, the drawer at its default height.
  {
    const { context, page } = await open(200);
    await drop(page, name);
    await openSections(page);
    await save(page, `${name}.canvas-tier`);
    await saveText(page, "nav.tree", `${name}.tree`);
    await saveText(page, "footer.status", `${name}.status`);
    await saveText(page, "aside.detail", `${name}.detail-level`);
    if (await hasCanvas(page)) {
      await page.keyboard.press("r");
      await page.waitForTimeout(150);
      await save(page, `${name}.canvas-rate`);
      await saveText(page, "div.legend", `${name}.legend`);
      await page.keyboard.press("r");
      await page.keyboard.press("y");
      await page.keyboard.press("o");
      await page.waitForTimeout(250);
      await save(page, `${name}.canvas-labels-order`);
      await page.keyboard.press("y");
      await page.keyboard.press("o");
      // The pane on the root's row, the first child, the first root input and the first wire.
      const picks = [
        ["root", "nav.tree .row.node >> nth=0 >> .segment"],
        ["child", "svg.canvas g.block:not(.pin) >> nth=0 >> .shape"],
        ["root-input", "svg.canvas g.block.pin.root-input >> nth=0 >> .shape"],
      ];
      for (const [what, selector] of picks) {
        const target = page.locator(selector);
        if ((await target.count()) === 0) continue;
        await target.first().click({ force: true });
        await page.waitForTimeout(120);
        await openSections(page);
        await save(page, `${name}.detail-${what}`);
        await saveText(page, "aside.detail", `${name}.detail-${what}`);
      }
      // Every primitive's and assembly's pane text, through the tree's rows, all expanded.
      const all = [];
      for (let guard = 0; guard < 400; guard++) {
        const closed = page.locator("nav.tree .row:not(.expanded) button.chevron");
        if ((await closed.count()) === 0) break;
        await closed.first().click();
      }
      const rows = page.locator("nav.tree .row.node");
      const count = Math.min(await rows.count(), 60);
      for (let i = 0; i < count; i++) {
        await rows.nth(i).locator(".segment").click({ force: true });
        await openSections(page);
        all.push(await page.locator("aside.detail").evaluate((el) => el.innerText));
      }
      writeFileSync(join(out, `${name}.detail-all-nodes.txt`), all.join("\n\n=====\n\n") + "\n");
      log.push(`${name}.detail-all-nodes.txt`);
    }
    await context.close();
  }
  // The drawer's tabs, the drawer at 640 px.
  {
    const { context, page } = await open(640);
    await drop(page, name);
    const drawer = page.locator("section.drawer");
    if ((await drawer.count()) > 0) {
      for (const tab of TABS) {
        if ((await drawer.getAttribute("data-open")) !== "true" || (await drawer.getAttribute("data-tab")) !== tab)
          await page.locator(`button.tab[data-tab="${tab}"]`).click();
        await page.waitForTimeout(150);
        await save(page, `${name}.tab-${tab}`);
        await saveText(page, "section.drawer .tab-body", `${name}.tab-${tab}`);
      }
      await saveText(page, "section.drawer", `${name}.tab-strip`);
    }
    await context.close();
  }
}

// The landing and the help page, once.
{
  const { context, page } = await open(200);
  page.__fixture = "landing";
  await page.goto(base);
  await page.waitForSelector(".landing");
  await save(page, "_landing");
  await page.keyboard.press("?");
  await page.waitForSelector("article.help");
  await save(page, "_help");
  await saveText(page, "article.help", "_help");
  await context.close();
}

writeFileSync(join(out, "_errors.txt"), errors.join("\n") + "\n");
writeFileSync(join(out, "_files.txt"), log.join("\n") + "\n");
await browser.close();
server.kill();
console.log(`${log.length} files, ${errors.length} page errors, in ${out}`);
