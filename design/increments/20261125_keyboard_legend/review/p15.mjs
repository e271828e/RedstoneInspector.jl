import { each, drop, dropOver, press, cur, pref, focusedRegion, text } from "./common.mjs";
// F1 in more forms: a push with reordered faces, and the fix's reach; gestures with a real mouse
await each((process.argv[2] ?? "chromium,firefox,webkit").split(","), async (page, n) => {
  const say = (...a) => console.log(n, ...a);
  const t = JSON.parse(text("closed_loop")); 
  const node = (JSON.stringify(t).includes('"nodes"'), (t.build?.structure ?? t.structure ?? Object.values(t).find((v) => v?.structure)?.structure).nodes.find((x) => x.path === "lqr_controller"));
  await drop(page, "closed_loop"); await page.evaluate(() => [...document.querySelectorAll("g.block")].find((b) => b.dataset.id === "lqr_controller").dispatchEvent(new MouseEvent("click", { bubbles: true }))); await page.waitForTimeout(40);
  await page.locator("aside.detail td.face-name button.row").nth(2).focus(); const a = await cur(page);
  node.inputs.reverse(); await dropOver(page, "closed_loop", JSON.stringify(t)); await page.waitForTimeout(60); say("push, faces reversed:", a, "->", await cur(page), await focusedRegion(page));
  // a link in a moved row
  // Shift-h/l and Shift-k between nodes with different orders on other fixtures: search all fixtures for level/child pairs
});
