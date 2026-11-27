import { test, type Page } from "@playwright/test";
import { drop, P, press } from "./h";
test.use({ deviceScaleFactor: 2 });
async function setLabels(page: Page, on: boolean) {
  const has = await page.locator("svg.canvas").evaluate((e) => e.hasAttribute("data-labels"));
  if (has !== on) await press(page, "y");
}
async function dragBlock(page: Page, id: string, dx: number, dy: number) {
  const r = (await page.locator(`g.block[data-id="${id}"] > .shape`).boundingBox())!;
  await page.mouse.move(r.x + r.width / 2, r.y + 8);
  await page.mouse.down();
  await page.mouse.move(r.x + r.width / 2 + dx, r.y + 8 + dy, { steps: 10 });
  await page.mouse.up();
}
for (const gap of [30, 60, 120]) for (const labels of [true, false]) test(`plant ${gap} px right of actuators, labels ${labels}`, async ({ page }) => {
  await drop(page, "closed_loop");
  await setLabels(page, labels);
  const p = (await page.locator('g.block[data-id="plant"] > .shape').boundingBox())!;
  const a = (await page.locator('g.block[data-id="actuators"] > .shape').boundingBox())!;
  await dragBlock(page, "plant", a.x + a.width + gap - p.x, a.y - p.y + 40);
  const q = (await page.locator('g.block[data-id="plant"] > .shape').boundingBox())!;
  const x0 = a.x + a.width - 80, y0 = Math.min(a.y, q.y) - 30;
  await page.screenshot({ path: `${P}/shots/stub${process.env.SUFFIX ?? ""}_gap${gap}.labels_${labels}.${test.info().project.name}.png`, clip: { x: x0, y: y0, width: q.x + q.width + 40 - x0, height: Math.max(a.y + a.height, q.y + q.height) + 60 - y0 } });
});
