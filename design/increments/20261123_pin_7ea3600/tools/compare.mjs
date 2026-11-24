// Compares two capture folders file by file.
//   node compare.mjs <frontend dir with node_modules> <before dir> <after dir> <diff dir>
// A screenshot pair that differs gets its count of differing pixels, their bounding box and a
// copy of the after image with those pixels in magenta. A text pair that differs gets a unified
// diff. The table goes to <diff dir>/_table.tsv.
import { createRequire } from "node:module";
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";

const [frontendArg, beforeArg, afterArg, diffArg] = process.argv.slice(2);
const before = resolve(beforeArg), after = resolve(afterArg), diff = resolve(diffArg);
const require = createRequire(join(resolve(frontendArg), "package.json"));
const { chromium } = require("@playwright/test");
mkdirSync(diff, { recursive: true });

const names = [...new Set([...readdirSync(before), ...readdirSync(after)])].filter((n) => !n.startsWith("_files")).sort();
const browser = await chromium.launch();
const page = await browser.newPage();
const rows = [["file", "verdict", "detail"]];

for (const name of names) {
  const a = join(before, name), b = join(after, name);
  if (!existsSync(a)) { rows.push([name, "only after", ""]); continue; }
  if (!existsSync(b)) { rows.push([name, "only before", ""]); continue; }
  const bytesA = readFileSync(a), bytesB = readFileSync(b);
  if (bytesA.equals(bytesB)) { rows.push([name, "same", ""]); continue; }
  if (name.endsWith(".txt")) {
    let text = "";
    try { execFileSync("diff", ["-u", a, b]); } catch (e) { text = String(e.stdout); }
    writeFileSync(join(diff, `${name}.diff`), text);
    const changed = text.split("\n").filter((l) => /^[+-][^+-]/.test(l)).length;
    rows.push([name, "differs", `${changed} changed lines`]);
    continue;
  }
  const result = await page.evaluate(async ([ua, ub]) => {
    const load = async (u) => { const i = new Image(); i.src = u; await i.decode(); return i; };
    const [ia, ib] = [await load(ua), await load(ub)];
    if (ia.width !== ib.width || ia.height !== ib.height) return { size: true };
    const data = (i) => { const c = new OffscreenCanvas(i.width, i.height); const x = c.getContext("2d"); x.drawImage(i, 0, 0); return x; };
    const xa = data(ia), xb = data(ib);
    const da = xa.getImageData(0, 0, ia.width, ia.height).data, out = xb.getImageData(0, 0, ia.width, ia.height);
    let count = 0, x0 = ia.width, y0 = ia.height, x1 = -1, y1 = -1;
    for (let p = 0; p < da.length; p += 4) {
      if (da[p] === out.data[p] && da[p + 1] === out.data[p + 1] && da[p + 2] === out.data[p + 2]) continue;
      count++;
      const x = (p / 4) % ia.width, y = Math.floor(p / 4 / ia.width);
      x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y);
      out.data[p] = 255; out.data[p + 1] = 0; out.data[p + 2] = 255;
    }
    xb.putImageData(out, 0, 0);
    const blob = await xb.canvas.convertToBlob({ type: "image/png" });
    const bytes = new Uint8Array(await blob.arrayBuffer());
    let binary = ""; for (const v of bytes) binary += String.fromCharCode(v);
    return { count, box: [x0, y0, x1, y1], png: btoa(binary) };
  }, [`data:image/png;base64,${bytesA.toString("base64")}`, `data:image/png;base64,${bytesB.toString("base64")}`]);
  if (result.size) { rows.push([name, "differs", "another size"]); continue; }
  if (result.count === 0) { rows.push([name, "same pixels", ""]); continue; }
  writeFileSync(join(diff, name), Buffer.from(result.png, "base64"));
  rows.push([name, "differs", `${result.count} px in x ${result.box[0]}-${result.box[2]}, y ${result.box[1]}-${result.box[3]}`]);
}
await browser.close();
writeFileSync(join(diff, "_table.tsv"), rows.map((r) => r.join("\t")).join("\n") + "\n");
const tally = {};
for (const r of rows.slice(1)) tally[r[1]] = (tally[r[1]] ?? 0) + 1;
console.log(JSON.stringify(tally));
