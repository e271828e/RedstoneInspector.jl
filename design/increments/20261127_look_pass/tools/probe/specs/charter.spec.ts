// The cold review's charter cases, driven and screenshotted.
import { test, type Page } from "@playwright/test";
import { drop, fixtureText, log, openPath, P, pillReport, press, readyLevel, shot } from "./h";

const svg = (page: Page) => page.locator("svg.canvas");
const scale = (page: Page) => svg(page).evaluate((s: SVGSVGElement) => s.clientWidth / s.viewBox.baseVal.width);
const L = (page: Page, line: string) => log(`charter.${test.info().project.name}.txt`, line);
async function setLabels(page: Page, on: boolean) {
  const has = await svg(page).evaluate((e) => e.hasAttribute("data-labels"));
  if (has !== on) await press(page, "y");
}
async function trace(page: Page, port: string) {
  await page.locator(`rect.port[data-port="${port}"]`).dispatchEvent("click");
  await press(page, "t");
}
async function dragBlock(page: Page, id: string, dx: number, dy: number) {
  const r = (await page.locator(`g.block[data-id="${id}"] > .shape`).boundingBox())!;
  await page.mouse.move(r.x + r.width / 2, r.y + 8);
  await page.mouse.down();
  await page.mouse.move(r.x + r.width / 2 + dx, r.y + 8 + dy, { steps: 10 });
  await page.mouse.up();
}

test("a pass-through child, entered and left: rates with slow's input wired to a new output thru", async ({ page }) => {
  const d = JSON.parse(fixtureText("rates"));
  const nodes = d.build.structure.nodes;
  const root = nodes[0], slow = nodes.find((n: any) => n.path === "slow");
  slow.outputs.push({ name: "thru" });
  slow.wires.push({ from: { path: "slow", port: "in" }, to: { path: "slow", port: "thru" } });
  root.outputs.push({ name: "thru" });
  root.wires.push({ from: { path: "slow", port: "thru" }, to: { path: "", port: "thru" } });
  await drop(page, "rates_thru", JSON.stringify(d));
  await setLabels(page, true);
  await trace(page, "src|out|out");
  const ports = await page.locator('g.overlay g.badge[data-role="route"]').evaluateAll((gs) => gs.map((g) => g.getAttribute("data-port")));
  L(page, `pass-through root pills: ${JSON.stringify(ports)} ${JSON.stringify((await pillReport(page)).issues)}`);
  await shot(page, "passthrough_root");
  await openPath(page, "slow");
  const inner = await page.locator('g.overlay g.badge[data-role="route"]').evaluateAll((gs) => gs.map((g) => g.getAttribute("data-port")));
  L(page, `pass-through slow pills: ${JSON.stringify(inner)} ${JSON.stringify((await pillReport(page)).issues)}`);
  await shot(page, "passthrough_slow");
});

test("a drag puts a pill on another block: closed_loop h_ref traced, pid_controller dragged up beside lqr_controller", async ({ page }) => {
  await drop(page, "closed_loop");
  await setLabels(page, false);
  await page.locator('g.block[data-id="⟨in⟩h_ref"]').dispatchEvent("click");
  await press(page, "t");
  const a = (await page.locator('g.block[data-id="pid_controller"] > .shape').boundingBox())!;
  const b = (await page.locator('g.block[data-id="lqr_controller"] > .shape').boundingBox())!;
  // put pid_controller's left edge 20 px right of lqr's right edge, same top
  await dragBlock(page, "pid_controller", b.x + b.width + 20 - a.x, b.y - a.y);
  const r = await pillReport(page);
  L(page, `drag pid next to lqr: ${JSON.stringify(r.issues)}`);
  await shot(page, "drag_pill_near_block");
});

test("far zoom with pills: large's root, a route traced, at the fit and zoomed out", async ({ page }) => {
  await drop(page, "large");
  const ports = await page.locator('svg.canvas rect.port[data-port*="|out|"]').evaluateAll((ps) => ps.map((p) => p.getAttribute("data-port")!));
  let best = "", n = 0;
  for (const p of ports.slice(0, 40)) {
    await trace(page, p);
    const k = await page.locator('g.overlay g.badge[data-role="route"]').count();
    if (k > n) { n = k; best = p; }
    await press(page, "Escape");
  }
  await trace(page, best);
  L(page, `large: ${best} gives ${n} pills at scale ${(await scale(page)).toFixed(3)}, detail ${await svg(page).getAttribute("data-detail")}`);
  await shot(page, "large_route_fit");
  await page.locator(".viewport").focus();
  for (let i = 0; i < 4; i++) await press(page, "-");
  L(page, `large zoomed out: scale ${(await scale(page)).toFixed(3)}`);
  await shot(page, "large_route_far");
});

test("a pill under the legend: closed_loop in rate mode, mode traced, the view panned so a pill sits under the legend", async ({ page }) => {
  await drop(page, "closed_loop");
  await press(page, "c");
  await trace(page, "⟨in⟩mode|out|mode");
  const pill = await page.locator('g.overlay g.badge[data-role="route"] rect').first().boundingBox();
  const leg = (await page.locator("div.legend").boundingBox())!;
  await page.locator(".viewport").focus();
  // pan with the arrows until the first pill's center lies inside the legend's box
  const dx = pill!.x - (leg.x + leg.width / 2), dy = (leg.y + leg.height / 2) - pill!.y;
  for (let i = 0; i < Math.round(Math.abs(dx) / 48); i++) await press(page, dx > 0 ? "ArrowRight" : "ArrowLeft");
  for (let i = 0; i < Math.round(Math.abs(dy) / 48); i++) await press(page, dy > 0 ? "ArrowUp" : "ArrowDown");
  L(page, `legend: ${JSON.stringify((await pillReport(page)).issues)}`);
  await shot(page, "pill_under_legend");
});

test("1.3: closed_loop, plant dragged right of actuators, labels on and off", async ({ page }) => {
  for (const labels of [true, false]) {
    await drop(page, "closed_loop");
    await setLabels(page, labels);
    const p = (await page.locator('g.block[data-id="plant"] > .shape').boundingBox())!;
    const a = (await page.locator('g.block[data-id="actuators"] > .shape').boundingBox())!;
    await dragBlock(page, "plant", a.x + a.width + 120 - p.x, 0);
    const route = await page.locator('path.wire[data-wire^="plant|in|"]').evaluateAll((ws) => ws.map((w) => `${w.getAttribute("data-wire")}: ${w.getAttribute("d")}`));
    L(page, `1.3 labels=${labels} plant right of actuators: ${route.join(" ; ")}`);
    await shot(page, `stub_plant_right.labels_${labels}`);
    // a forward drag close: plant just right of actuators, 30 px gap
    await drop(page, "closed_loop");
    await setLabels(page, labels);
    const p2 = (await page.locator('g.block[data-id="plant"] > .shape').boundingBox())!;
    const a2 = (await page.locator('g.block[data-id="actuators"] > .shape').boundingBox())!;
    await dragBlock(page, "plant", a2.x + a2.width + 30 - p2.x, a2.y - p2.y + 40);
    const route2 = await page.locator('path.wire[data-wire^="plant|in|"]').evaluateAll((ws) => ws.map((w) => `${w.getAttribute("data-wire")}: ${w.getAttribute("d")}`));
    L(page, `1.3 labels=${labels} plant 30 px right of actuators: ${route2.join(" ; ")}`);
    await shot(page, `stub_plant_close.labels_${labels}`);
  }
});

test("6.1: failure_probe's s/g cut, and its title", async ({ page }) => {
  await drop(page, "failure_probe");
  await openPath(page, "s");
  const g = page.locator('g.badge[data-role="diagnostic"][data-id="s/g"]');
  L(page, `6.1 text=${await g.locator("text").textContent()} title=${JSON.stringify(await g.locator("title").textContent())}`);
  await g.hover();
  await page.waitForTimeout(1500);
  await shot(page, "cut_s_g");
  await drop(page, "warning");
  await press(page, "o");
  const w = page.locator('g.badge[data-role="diagnostic"][data-id="g"]');
  const geo = await w.evaluate((b) => {
    const r = b.querySelector("rect")!.getBoundingClientRect();
    const o = b.ownerSVGElement!.querySelector('g.block[data-id="g"] g.order-badge rect')!.getBoundingClientRect();
    return { pillLeft: r.left, orderRight: o.right, text: b.querySelector("text")!.textContent };
  });
  L(page, `6.1 warning g with order: ${JSON.stringify(geo)}`);
  await shot(page, "cut_warning_order");
});

test("9: the chart on rates_deployment and timing_deployment, drawer at 640", async ({ page }) => {
  for (const f of ["rates_deployment", "timing_deployment"]) {
    await drop(page, f);
    await page.locator('section.drawer button.tab[data-tab="timing"]').click();
    for (let i = 0; i < 12; i++) { await page.locator("section.drawer").focus(); await press(page, ">"); }
    const fit = await page.locator(".chart").getAttribute("data-fit");
    const ticks = await page.locator(".chart svg.lane path.grid").first().evaluate((p) => {
      const xs = [...p.getAttribute("d")!.matchAll(/M([\d.]+)/g)].map((m) => Number(m[1]));
      return { n: xs.length, pitch: xs[1] - xs[0], stroke: getComputedStyle(p).stroke };
    });
    L(page, `9 ${f}: fit=${fit} ${JSON.stringify(ticks)}`);
    await page.locator(".chart").scrollIntoViewIfNeeded();
    await page.locator(".chart").screenshot({ path: `${P}/shots/chart_${f}.${test.info().project.name}.png` });
  }
});

test("4.1: the floors on library in a 1440 by 900 window, the zoom keys' steps", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await drop(page, "library");
  await page.locator(".viewport").focus();
  const steps: string[] = [];
  for (let i = 0; i <= 5; i++) {
    steps.push(`${(await scale(page)).toFixed(3)}:${await svg(page).getAttribute("data-detail")}`);
    if (i === 3 || i === 4) await shot(page, `library_step_${i}`);
    await press(page, "+");
  }
  L(page, `4.1 library 1440x900: ${steps.join(" ")}`);
});

test("2.1: face: out typed key by key on rates", async ({ page }) => {
  await drop(page, "rates");
  await press(page, "/");
  const q = page.locator("input.query");
  const seen: string[] = [];
  for (const ch of "face: out") {
    await q.press(ch === " " ? "Space" : ch);
    await page.evaluate(() => new Promise((r) => requestAnimationFrame(r)));
    const r = await page.evaluate(() => {
      const res = document.querySelector(".results");
      if (!res) return "no list";
      const g = [...res.querySelectorAll(".group")].map((x) => `${x.getAttribute("data-group")}=${x.querySelectorAll(".hit").length}`);
      const refine = res.querySelector(".refine")?.textContent;
      return `${g.join(",")}${refine ? ` [${refine}]` : ""}`;
    });
    seen.push(`${JSON.stringify(await q.inputValue())} -> ${r}`);
  }
  L(page, `2.1 rates: ${seen.join(" | ")}`);
  await shot(page, "search_face_out");
  await q.fill("face: ");
  await page.evaluate(() => new Promise((r) => requestAnimationFrame(r)));
  L(page, `2.1 'face: ' marks on canvas: ${await page.locator("g.block.search-hit").count()} hits, searching=${await svg(page).evaluate((s) => s.classList.contains("searching"))}`);
});
