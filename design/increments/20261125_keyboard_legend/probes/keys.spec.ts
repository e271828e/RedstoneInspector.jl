// The held z: keydown, its repeats, a direction's repeats under it, keyup, and a blur while it is down.
import { test } from "@playwright/test";
import { active, drop, say } from "./common";
const log = async (page: any) => {
  await page.evaluate(() => {
    (window as any).__l = [];
    for (const t of ["keydown", "keyup", "blur", "focus"]) window.addEventListener(t, (e: any) => {
      if ((t === "blur" || t === "focus") && e.target !== window) return;
      (window as any).__l.push(t + (e.key ? ":" + e.key + "/" + e.code + (e.repeat ? " R" : "") + (e.metaKey ? " M" : "") + (e.shiftKey ? " S" : "") + " @" + (e.target.className?.toString().split(" ")[0] || e.target.tagName || "window") : ""));
    }, true);
  });
};
const read = (page: any) => page.evaluate(() => { const l = (window as any).__l; (window as any).__l = []; return l.join(" | "); });
test("held z", async ({ page, context }) => {
  await drop(page, "closed_loop");
  await log(page);
  await page.locator(".viewport").focus();
  const k = page.keyboard;
  await read(page);
  await k.down("z"); await k.down("z"); await k.down("z"); say("z held alone: " + await read(page));
  await k.down("j"); await k.down("j"); await k.up("j"); await k.down("k"); await k.up("k"); await k.up("z"); say("j j-repeat k under z: " + await read(page));
  await k.down("z"); await k.down("Shift"); await k.up("KeyZ"); await k.up("Shift"); say("shift pressed before z's up: " + await read(page));
  await k.down("z"); await k.down("Meta"); await k.up("z"); await k.up("Meta"); say("meta pressed before z's up: " + await read(page));
  await k.down("z"); await k.press("/"); await k.up("z"); say("slash under z, z's up: " + await read(page) + " active " + await active(page));
  await page.keyboard.press("Escape"); await page.locator(".viewport").focus(); await read(page);
  await k.down("z");
  const p2 = await context.newPage(); await p2.goto("about:blank"); await p2.bringToFront(); await p2.waitForTimeout(200);
  await p2.keyboard.up("z"); await p2.close(); await page.bringToFront(); await page.waitForTimeout(200);
  say("another tab in front while z is down: " + await read(page) + " hasFocus " + await page.evaluate(() => document.hasFocus()));
  await k.down("j"); say("then j: " + await read(page)); await k.up("j"); await k.up("z");
});
