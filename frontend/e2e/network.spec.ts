// The no-CDN rule (build_release.md answer 5): every request the page makes
// while loading, dropping closed_loop and opening sensing has the page's origin.
// The help page's part waits for increment 8.
import { test } from "@playwright/test";
import { drop, expect, readyLevel, shot } from "./fixtures";

test("every request goes to the preview server's origin", async ({ page, baseURL }) => {
  const urls: string[] = [];
  page.on("request", (r) => urls.push(r.url()));
  await drop(page, "closed_loop");
  await page.locator('g.block[data-id="sensing"]').dblclick();
  await page.locator(readyLevel("sensing")).waitFor();
  await shot(page, "closed_loop", "sensing", "network");
  expect(urls.length).toBeGreaterThan(0);
  const origin = new URL(baseURL!).origin;
  expect(urls.filter((u) => new URL(u).origin !== origin)).toEqual([]);
});
