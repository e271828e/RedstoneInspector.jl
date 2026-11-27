import { readFileSync } from "node:fs";
import { chromium } from "@playwright/test";
const [dir, port] = process.argv.slice(2);
const browser = await chromium.launch();
const ready = (level) => `svg.canvas[data-level="${level}"][data-ready]`;
const frame = () => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(() => r())));
async function run(name) {
  const context = await browser.newContext({ viewport: { width: 1200, height: 750 }, deviceScaleFactor: 2 });
  const page = await context.newPage();
  const press = async (key) => { await page.keyboard.press(key); await page.evaluate(frame); await page.waitForTimeout(250); };
  await page.goto(`http://localhost:${port}/`);
  const text = readFileSync(`${dir}/${name}.json`, "utf8");
  await page.evaluate(({ text, file }) => {
    const dt = new DataTransfer();
    dt.items.add(new File([text], file, { type: "application/json" }));
    window.dispatchEvent(new DragEvent("drop", { dataTransfer: dt, bubbles: true, cancelable: true }));
  }, { text, file: `${name}.json` });
  await page.locator(ready("")).waitFor();
  await press("Shift+E");
  await press("0");
  await page.screenshot({ path: `${dir}/${name}__root_tier.png` });
  await press("c"); await press("0");
  await page.screenshot({ path: `${dir}/${name}__root_rate.png` });
  await page.locator('g.block[data-id="cascade"]').dblclick();
  await page.locator(ready("cascade")).waitFor();
  await page.mouse.move(5, 400);
  await press("Escape"); await press("0");
  await page.screenshot({ path: `${dir}/${name}__cascade_rate.png` });
  await press("c"); await press("0");
  await page.screenshot({ path: `${dir}/${name}__cascade_tier.png` });
  console.log(name, await page.locator("footer.status").innerText());
  await context.close();
}
await run("autopilot");
await run("autopilot_deployment");
await browser.close();
