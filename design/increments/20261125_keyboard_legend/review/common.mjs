import { chromium, firefox, webkit } from "playwright";
import { readFileSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join } from "node:path";
import { mkdirSync } from "node:fs"; import { tmpdir } from "node:os"; const ffhome = join(tmpdir(), "playwright-firefox-home"); mkdirSync(ffhome, { recursive: true });
const ROOT = new URL("./dist/", import.meta.url).pathname;
export const FIX = process.env.FRONTEND + "/fixtures/";
export const text = (n) => readFileSync(FIX + n + ".json", "utf8");
const types = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".svg": "image/svg+xml" };
export const PORT = 4431 + (process.pid % 400);
const srv = createServer((q, r) => { let p = q.url.split(/[?#]/)[0]; if (p === "/") p = "/index.html";
  try { const b = readFileSync(join(ROOT, p)); r.writeHead(200, { "content-type": types[extname(p)] ?? "application/octet-stream" }); r.end(b); } catch { r.writeHead(404); r.end(); } }).listen(PORT);
export const bye = () => srv.close();
export const B = { chromium, firefox, webkit };
export async function open(name, opt = {}) {
  let launch = {};
  if (name === "firefox") launch = { env: { ...process.env, CFFIXED_USER_HOME: ffhome, HOME: process.env.HOME } };
  const b = await B[name].launch({ ...launch, ...(opt.launch ?? {}) });
  const c = await b.newContext({ viewport: opt.viewport ?? { width: 1400, height: 900 } });
  const page = await c.newPage();
  page.errs = [];
  page.on("console", (m) => { if (m.type() === "error" && !/WebSocket|live|Firefox can’t establish|404|connection/i.test(m.text())) page.errs.push(m.text()); });
  page.on("pageerror", (e) => page.errs.push("PAGEERR " + e.message));
  page.b = b;
  return page;
}
export async function dropOver(page, name, t = text(name), wait = true) {
  await page.evaluate(({ t, f }) => { for (const el of document.querySelectorAll("svg.canvas, pre.outcome")) el.__before = true;
    const dt = new DataTransfer(); dt.items.add(new File([t], f, { type: "application/json" }));
    window.dispatchEvent(new DragEvent("drop", { dataTransfer: dt, bubbles: true, cancelable: true })); }, { t, f: name + ".json" });
  if (wait) await page.waitForFunction(() => { const s = document.querySelector("svg.canvas[data-ready]"), o = document.querySelector("pre.outcome");
    return (s && !s.__before) || (o && !o.__before && o.textContent !== "No file open."); });
}
export async function drop(page, name, t) { await page.goto(`http://localhost:${PORT}/`); await dropOver(page, name, t ?? text(name)); }
export const press = async (page, ...ks) => { for (const k of ks) { await page.keyboard.press(k); await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => r()))); } };
export const cur = (page) => page.evaluate(() => { const a = document.activeElement;
  if (a === document.body) return "BODY"; if (a.matches(".viewport")) return "canvas"; if (a.matches("aside.detail")) return "detail"; if (a.matches("nav.tree")) return "tree"; if (a.matches("section.drawer")) return "drawer";
  return `${a.localName}.${a.className.toString().split(" ")[0]} ${(a.textContent || "").trim().replace(/\s+/g, " ").slice(0, 50)}`; });
export const pref = (page) => page.evaluate(() => document.querySelector("span.prefix")?.textContent.trim() ?? "");
export const focusedRegion = (page) => page.evaluate(() => ["nav.tree", ".viewport", "aside.detail", "section.drawer"].filter((s) => document.querySelector(s + ".focused")).join(","));
export const each = async (names, f) => { for (const n of names) { const p = await open(n); try { await f(p, n); } catch (e) { console.log(n, "THREW", e.message.slice(0, 400)); } if (p.errs.length) console.log(n, "ERRS", p.errs.slice(0, 5)); await p.b.close(); } bye(); };
