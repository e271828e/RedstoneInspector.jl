import { test } from "@playwright/test";
import { drop, openPath, P, press } from "./h";
test.use({ deviceScaleFactor: 3 });
test("6.1 crops", async ({ page }) => {
  await drop(page, "failure_probe");
  await openPath(page, "s");
  const b = (await page.locator('g.block[data-id="s/g"] > .shape').boundingBox())!;
  await page.screenshot({ path: `${P}/shots/cut_s_g_crop.${test.info().project.name}.png`, clip: { x: b.x - 20, y: b.y - 20, width: b.width + 40, height: b.height + 40 } });
  await drop(page, "warning");
  await press(page, "o");
  const g = (await page.locator('g.block[data-id="g"] > .shape').boundingBox())!;
  await page.screenshot({ path: `${P}/shots/cut_warning_order_crop.${test.info().project.name}.png`, clip: { x: g.x - 20, y: g.y - 20, width: g.width + 40, height: g.height + 40 } });
});
