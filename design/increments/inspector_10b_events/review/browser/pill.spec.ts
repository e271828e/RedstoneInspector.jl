// Probe: the events pill under the focus states, clicks, drag, zoom, both modes; the root path.
import { writeFileSync } from "node:fs";
import { test } from "@playwright/test";
import { drop, dropOver, press, pressAll, fixtureText, effectiveOpacity, readyLevel, shot } from "<worktree>/frontend/e2e/fixtures.ts";

const OUT = "<probes>/browser/out";
const SHOTS = OUT + "/shots";

const pillFacts = (page: any) => page.evaluate(() => {
  const op = (e: Element | null) => { let o = 1; for (let n: Element | null = e; n; n = n.matches("svg.canvas") ? null : n.parentElement) o *= Number(getComputedStyle(n).opacity); return Math.round(o * 100) / 100; };
  return [...document.querySelectorAll("svg.canvas g.block")].filter((b) => b.querySelector("g.events-pill")).map((b) => {
    const pill = b.querySelector("g.events-pill")!;
    const rp = b.querySelector("g.badge-pill");
    const shape = b.querySelector(".shape")!.getBoundingClientRect();
    const pr = pill.querySelector("rect")!.getBoundingClientRect();
    const rr = rp?.querySelector("rect")!.getBoundingClientRect();
    return {
      id: (b as HTMLElement).dataset.id, cls: b.getAttribute("class"),
      pill: pill.querySelector("text")!.textContent, title: pill.querySelector("title")?.textContent,
      opPill: op(pill.querySelector("rect")), opShape: op(b.querySelector(".shape")),
      pillPE: getComputedStyle(pill).pointerEvents,
      shapeL: Math.round(shape.left), shapeR: Math.round(shape.right), shapeW: Math.round(shape.width),
      pillL: Math.round(pr.left), pillR: Math.round(pr.right), pillTop: Math.round(pr.top), shapeTop: Math.round(shape.top),
      rateL: rr ? Math.round(rr.left) : null, rateR: rr ? Math.round(rr.right) : null, rateText: rp?.querySelector("text")?.textContent ?? null,
    };
  });
});

const svgClass = (page: any) => page.evaluate(() => document.querySelector("svg.canvas")!.getAttribute("class") + " focus=" + document.querySelector("svg.canvas")!.getAttribute("data-focus"));

test("the pill under search, legend, route and diagnostic focus; clicks", async ({ page }, info) => {
  const log: any[] = [];
  // a warning on heater added, so a diagnostic focus can light a block with events
  const d = JSON.parse(fixtureText("events_deployment"));
  d.deployment.build.warnings.push({ kind: "EmptyFaceSelection", severity: "warning", path: "heater", message: "probe warning on heater" });
  await drop(page, "events_deployment", JSON.stringify(d));
  log.push(["plain", await svgClass(page), await pillFacts(page)]);
  // search: "heater" lights heater only
  await page.locator("input.query").fill("heater");
  await page.locator("svg.canvas.searching").waitFor();
  log.push(["search heater", await svgClass(page), await pillFacts(page)]);
  await shot(page, "events_deployment", "root", "probe-search");
  await page.locator("input.query").fill("");
  await page.locator(".viewport").click({ position: { x: 5, y: 5 } });
  // legend focus: rate mode then the A1 line
  await press(page, "c");
  await page.locator("div.legend li[data-step] button.line").first().click();
  log.push(["legend first step", await svgClass(page), await pillFacts(page)]);
  await shot(page, "events_deployment", "root", "probe-legend");
  await page.locator("div.legend li[data-step] button.line").first().click();
  await press(page, "c");
  // route: right-click the ambient root input's tag, trace
  await page.locator('g.block[data-id="⟨in⟩ambient"]').click();
  await press(page, "t");
  log.push(["route ambient", await svgClass(page), await pillFacts(page)]);
  await shot(page, "events_deployment", "root", "probe-route");
  await press(page, "t");
  await press(page, "Escape");
  // diagnostic focus on the warning row
  await page.locator('button.tab[data-tab="diagnostics"]').click();
  await page.locator("li.diagnostic button.row").first().click();
  log.push(["diagnostic heater", await svgClass(page), await pillFacts(page)]);
  await shot(page, "events_deployment", "root", "probe-diagnostic");
  await page.locator("li.diagnostic button.row").first().click();
  await press(page, "Escape");
  await press(page, "Escape");
  // clicks on the pill: what is under its center, what a click selects, what a double-click opens
  const centers = await page.evaluate(() => [...document.querySelectorAll("svg.canvas g.events-pill")].map((p) => {
    const r = p.querySelector("rect")!.getBoundingClientRect();
    const x = (r.left + r.right) / 2, y = (r.top + r.bottom) / 2;
    const hit = document.elementFromPoint(x, y);
    return { id: (p.closest("g.block") as HTMLElement).dataset.id, x, y, hit: hit?.tagName + "." + hit?.getAttribute("class"), inPill: !!hit?.closest("g.events-pill"), inBlock: (hit?.closest("g.block") as HTMLElement | null)?.dataset.id };
  }));
  log.push(["centers", centers]);
  for (const c of centers) {
    await page.mouse.click(c.x, c.y);
    log.push(["click " + c.id, await page.evaluate(() => [document.querySelector("aside.detail")!.getAttribute("data-id"), document.querySelector("svg.canvas g.block.selected")?.getAttribute("data-id")])]);
  }
  // hover title through the pill: Playwright hover then read the block's hover class
  const nest = centers.find((c: any) => c.id === "nest")!;
  await page.mouse.move(nest.x, nest.y);
  log.push(["hover nest pill", await page.evaluate(() => document.querySelector("svg.canvas g.block.hover")?.getAttribute("data-id"))]);
  await page.mouse.dblclick(nest.x, nest.y);
  await page.waitForTimeout(500);
  log.push(["dblclick nest pill", await page.evaluate(() => document.querySelector("svg.canvas")!.getAttribute("data-level"))]);
  writeFileSync(`${OUT}/pill-${info.project.name}.json`, JSON.stringify(log, null, 1));
});

test("a dragged pod in both modes; zoom out; the reserved width mode-independent", async ({ page }, info) => {
  const log: any[] = [];
  await drop(page, "events_deployment");
  log.push(["tier", await pillFacts(page)]);
  const a = await page.locator('g.block[data-id="pods/a"] .shape').boundingBox();
  await page.mouse.move(a!.x + 30, a!.y + 40);
  await page.mouse.down();
  await page.mouse.move(a!.x + 80, a!.y + 60, { steps: 5 });
  await page.mouse.move(a!.x + 230, a!.y + 90, { steps: 5 });
  await page.mouse.up();
  log.push(["tier dragged", await pillFacts(page)]);
  await shot(page, "events_deployment", "root", "probe-drag-tier");
  await press(page, "c");
  log.push(["rate dragged", await pillFacts(page)]);
  await shot(page, "events_deployment", "root", "probe-drag-rate");
  // drag again in rate mode
  const b = await page.locator('g.block[data-id="pods/b"] .shape').boundingBox();
  await page.mouse.move(b!.x + 30, b!.y + 40);
  await page.mouse.down();
  await page.mouse.move(b!.x + 80, b!.y + 70, { steps: 5 });
  await page.mouse.move(b!.x + 250, b!.y + 100, { steps: 5 });
  await page.mouse.up();
  log.push(["rate dragged b", await pillFacts(page)]);
  await press(page, "c");
  log.push(["tier after", await pillFacts(page)]);
  // zoom far out: badges never drop
  for (let i = 0; i < 12; i++) await press(page, "-");
  log.push(["zoomed out", await page.evaluate(() => document.querySelector("svg.canvas")!.getAttribute("data-detail")), await page.evaluate(() => [...document.querySelectorAll("svg.canvas g.events-pill")].map((p) => [getComputedStyle(p).display, getComputedStyle(p).visibility, getComputedStyle(p.querySelector("text")!).display]))]);
  await shot(page, "events_deployment", "root", "probe-zoomed-out");
  writeFileSync(`${OUT}/drag-${info.project.name}.json`, JSON.stringify(log, null, 1));
});

test("fresh loads in tier and in rate give the same layout", async ({ page }, info) => {
  const boxes = () => page.evaluate(() => [...document.querySelectorAll("svg.canvas g.block")].map((b) => {
    const s = (b.querySelector(".shape") as SVGGraphicsElement).getBBox();
    const t = b.getAttribute("transform");
    return [(b as HTMLElement).dataset.id, t, Math.round(s.width * 10) / 10, Math.round(s.height * 10) / 10];
  }));
  const out: any = {};
  for (const mode of ["tier", "rate"]) {
    await page.addInitScript((m) => { try { localStorage.setItem("redstone-inspector/prefs", JSON.stringify({ version: 1, mode: m })); } catch {} }, mode);
    for (const [name, level] of [["events_deployment", ""], ["events_deployment", "nest"], ["library_deployment", ""], ["rates_deployment", ""], ["approach_deployment", ""]]) {
      await drop(page, name, fixtureText(name), level ? `/#level=${level}` : "/");
      await page.locator(readyLevel(level)).waitFor();
      out[`${mode} ${name} ${level}`] = await boxes();
    }
  }
  const diffs: string[] = [];
  for (const k of Object.keys(out).filter((k) => k.startsWith("tier"))) {
    const r = out["rate" + k.slice(4)];
    if (JSON.stringify(r) !== JSON.stringify(out[k])) diffs.push(k);
  }
  writeFileSync(`${OUT}/modes-${info.project.name}.json`, JSON.stringify({ diffs, out }, null, 1));
});
