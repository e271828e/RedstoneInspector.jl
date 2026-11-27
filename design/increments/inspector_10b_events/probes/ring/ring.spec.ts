// C8's probe: which mechanism paints a ring around a table's row group, in Chromium and Firefox.
// Each variant focuses the button in the second group's first row, screenshots, and reads the pixels just
// outside the group's box on its four sides through a canvas in a second page.
import { test, expect, type Page } from "@playwright/test";
import { writeFileSync } from "node:fs";

const HUE = "rgb(31, 111, 235)";
const rows = (path: string, n: number) =>
  Array.from({ length: n }, (_, i) => `<tr><td>${i ? "" : `<button>${path}</button>`}</td><td>${i + 1}</td><td>ev${i}</td><td>yes</td></tr>`).join("");
const table = (cls: string) => `<table class="${cls}"><thead><tr><th>path</th><th>#</th><th>event</th><th>loc</th></tr></thead>
  <tbody class="g">${rows("a", 1)}</tbody><tbody class="g" id="target">${rows("limited", 4)}</tbody><tbody class="g">${rows("c", 2)}</tbody></table>`;

const VARIANTS: Record<string, { css: string; html: string }> = {
  "outline-collapse": { css: `table { border-collapse: collapse } tbody:has(button:focus) { outline: 2px solid ${HUE}; outline-offset: 1px }`, html: table("t") },
  "outline-separate": { css: `table { border-collapse: separate; border-spacing: 0 } tbody:has(button:focus) { outline: 2px solid ${HUE}; outline-offset: 1px }`, html: table("t") },
  "after-collapse": {
    css: `table { border-collapse: collapse } tbody { position: relative } tbody:has(button:focus)::after { content: ""; position: absolute; inset: -3px; border: 2px solid ${HUE}; pointer-events: none }`,
    html: table("t"),
  },
  "grid-subgrid": {
    css: `.grid { display: grid; grid-template-columns: repeat(4, max-content); column-gap: 10px } .head, .grp { display: grid; grid-column: 1 / -1; grid-template-columns: subgrid }
      .r { display: contents } .grp:has(button:focus) { outline: 2px solid ${HUE}; outline-offset: 1px }`,
    html: `<div class="grid"><div class="head"><span>path</span><span>#</span><span>event</span><span>loc</span></div>
      <div class="grp">${[0].map((i) => `<div class="r"><span><button>a</button></span><span>1</span><span>ev</span><span>yes</span></div>`).join("")}</div>
      <div class="grp" id="target">${[0, 1, 2, 3].map((i) => `<div class="r"><span>${i ? "" : "<button>limited</button>"}</span><span>${i + 1}</span><span>ev${i}</span><span>yes</span></div>`).join("")}</div>
      <div class="grp"><div class="r"><span><button>c</button></span><span>1</span><span>ev</span><span>yes</span></div></div></div>`,
  },
};

async function pixels(page: Page, png: Buffer, points: [number, number][]): Promise<string[]> {
  const blank = await page.context().newPage();
  const out = await blank.evaluate(async ({ b64, points }) => {
    const img = new Image();
    img.src = `data:image/png;base64,${b64}`;
    await img.decode();
    const c = document.createElement("canvas");
    c.width = img.width; c.height = img.height;
    const g = c.getContext("2d")!;
    g.drawImage(img, 0, 0);
    return points.map(([x, y]) => { const d = g.getImageData(x, y, 1, 1).data; return `rgb(${d[0]}, ${d[1]}, ${d[2]})`; });
  }, { b64: png.toString("base64"), points });
  await blank.close();
  return out;
}

const results: Record<string, unknown> = {};
for (const [name, v] of Object.entries(VARIANTS)) {
  test(name, async ({ page }, info) => {
    await page.setContent(`<style>body { margin: 40px; font: 12px system-ui } td, th, span { padding: 2px 10px 2px 0 } ${v.css}</style>${v.html}`);
    await page.locator("#target button").focus();
    const r = await page.locator("#target").evaluate((e) => { const b = e.getBoundingClientRect(); return { x: b.x, y: b.y, w: b.width, h: b.height }; });
    const png = await page.screenshot();
    writeFileSync(`${info.project.name}.${name}.png`, png);
    // two px outside each side's middle, where a 2 px ring with a 1 px offset paints
    const mid = (a: number, l: number) => Math.round(a + l / 2);
    const pts: [number, number][] = [
      [Math.round(r.x - 2), mid(r.y, r.h)], [Math.round(r.x + r.w + 1), mid(r.y, r.h)],
      [mid(r.x, r.w), Math.round(r.y - 2)], [mid(r.x, r.w), Math.round(r.y + r.h + 1)],
    ];
    const got = await pixels(page, png, pts);
    results[`${info.project.name}/${name}`] = { rect: r, left: got[0], right: got[1], top: got[2], bottom: got[3] };
    writeFileSync(`${info.project.name}.${name}.json`, JSON.stringify(results[`${info.project.name}/${name}`]));
    expect(got.length).toBe(4);
  });
}
