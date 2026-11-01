// The leave prompt (workspace.md answer 10): a model from a dropped file asks before
// the page unloads, so a back past the first level does not lose it; a model pushed
// over the socket does not ask. Chromium asks only after a real interaction, which
// the canvas click is.
import { test } from "@playwright/test";
import { drop, expect, fixtureText, live, readyLevel } from "./fixtures";

test("a dropped model asks before a back past the first entry, and stays when the prompt is dismissed", async ({ page }) => {
  await drop(page, "closed_loop");
  const dialogs: string[] = [];
  page.on("dialog", (d) => { dialogs.push(d.type()); d.dismiss(); });
  await page.locator('g.block[data-id="plant"]').click();
  await page.goBack({ timeout: 2000 }).catch(() => undefined);
  await expect.poll(() => dialogs).toEqual(["beforeunload"]);
  await expect(page.locator(readyLevel(""))).toHaveCount(1);
  await expect(page).toHaveTitle("closed_loop – Redstone inspector");
});

test("a pushed model leaves without asking", async ({ page }) => {
  const mock = await live(page, "/");
  await expect.poll(() => mock.sent.length).toBe(1);
  mock.send(fixtureText("closed_loop"));
  await page.locator(readyLevel("")).waitFor();
  const dialogs: string[] = [];
  page.on("dialog", (d) => { dialogs.push(d.type()); d.dismiss(); });
  await page.locator('g.block[data-id="plant"]').click();
  await page.goBack({ timeout: 2000 }).catch(() => undefined);
  await expect.poll(() => page.url()).toBe("about:blank");
  expect(dialogs).toEqual([]);
});
