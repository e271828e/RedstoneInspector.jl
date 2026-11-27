// The sweep's cases, screenshotted with a crop around the pills, labels on and off.
import { test, type Page } from "@playwright/test";
import { drop, log, openPath, P, pillReport, press, readyLevel, shot } from "./h";
test.use({ deviceScaleFactor: 3 });

async function setLabels(page: Page, on: boolean) {
  const has = await page.locator("svg.canvas").evaluate((e) => e.hasAttribute("data-labels"));
  if (has !== on) await press(page, "y");
}
async function trace(page: Page, port: string) {
  await page.locator(`rect.port[data-port="${port}"]`).dispatchEvent("click");
  await press(page, "t");
}
/** A crop of the page around the pills named, padded, scaled up by zooming the canvas first. */
async function crop(page: Page, name: string, ports: string[], pad = 60) {
  const boxes = await page.evaluate((ports) => ports.map((p) => {
    const g = document.querySelector(`g.badge[data-port="${p}"] rect`) ?? document.querySelector(`rect.port[data-port="${p}"]`);
    const r = g!.getBoundingClientRect();
    return [r.left, r.top, r.right, r.bottom];
  }), ports);
  const x0 = Math.min(...boxes.map((b) => b[0])) - pad, y0 = Math.min(...boxes.map((b) => b[1])) - pad;
  const x1 = Math.max(...boxes.map((b) => b[2])) + pad, y1 = Math.max(...boxes.map((b) => b[3])) + pad;
  await page.screenshot({ path: `${P}/shots/${name}.${test.info().project.name}.png`, clip: { x: Math.max(0, x0), y: Math.max(0, y0), width: x1 - Math.max(0, x0), height: y1 - Math.max(0, y0) } });
}
/** Zooms about the middle of the given ports' bounding box until the scale reaches `to`. */
async function zoomTo(page: Page, to: number) {
  await page.locator(".viewport").focus();
  for (let i = 0; i < 20; i++) {
    const s = await page.evaluate(() => { const v = document.querySelector<SVGSVGElement>("svg.canvas")!; return v.clientWidth / v.viewBox.baseVal.width; });
    if (s >= to) break;
    await press(page, "+");
  }
}

test("closed_loop: selection's δt traced, the pills at both ends of the short wire to actuators", async ({ page }) => {
  for (const labels of [true, false]) {
    await drop(page, "closed_loop");
    await setLabels(page, labels);
    await trace(page, "selection|out|δt");
    const r = await pillReport(page);
    log(`cases.${test.info().project.name}.txt`, `closed_loop δt labels=${labels} scale=${r.scale.toFixed(3)} ${JSON.stringify(r.issues)}`);
    await crop(page, `closed_loop_dt.labels_${labels}`, ["selection|out|δt", "actuators|in|δt_cmd"]);
    if (labels) await shot(page, "closed_loop_dt_full");
  }
});

test("failure_nested: plant's power traced, ctl's pill over plant", async ({ page }) => {
  for (const labels of [true, false]) {
    await drop(page, "failure_nested");
    await setLabels(page, labels);
    await trace(page, "plant|out|power");
    const r = await pillReport(page);
    log(`cases.${test.info().project.name}.txt`, `failure_nested power labels=${labels} scale=${r.scale.toFixed(3)} ${JSON.stringify(r.issues)}`);
    await crop(page, `failure_nested_power.labels_${labels}`, ["ctl|in|y", "plant|out|y"], 80);
    if (labels) await shot(page, "failure_nested_power_full");
  }
});

test("timing's fast: fast/outer's deep traced, the pills at the two ends of the wire to the pin", async ({ page }) => {
  for (const labels of [true, false]) {
    await drop(page, "timing");
    await setLabels(page, labels);
    await openPath(page, "fast");
    await trace(page, "fast/outer|out|deep");
    const r = await pillReport(page);
    log(`cases.${test.info().project.name}.txt`, `timing fast deep labels=${labels} scale=${r.scale.toFixed(3)} ${JSON.stringify(r.issues)}`);
    await crop(page, `timing_fast_deep.labels_${labels}`, ["fast/outer|out|deep", "⟨out⟩deep|in|deep"]);
    if (labels) await shot(page, "timing_fast_deep_full");
  }
});
