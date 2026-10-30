// The no-CDN rule (build_release.md answer 5): every request the page makes
// while loading, dropping closed_loop and opening sensing has the page's origin;
// the page makes exactly one WebSocket attempt, to its own host at `/ws`, which
// the preview server refuses. The help page's part waits for increment 8.
import { test } from "@playwright/test";
import { drop, expect, readyLevel, shot } from "./fixtures";

test("every request goes to the preview server's origin", async ({ page, baseURL }) => {
  const urls: string[] = [];
  const sockets: string[] = [];
  page.on("request", (r) => urls.push(r.url()));
  page.on("websocket", (w) => sockets.push(w.url()));
  await drop(page, "closed_loop");
  await page.locator('g.block[data-id="sensing"]').dblclick();
  await page.locator(readyLevel("sensing")).waitFor();
  await shot(page, "closed_loop", "sensing", "network");
  expect(urls.length).toBeGreaterThan(0);
  const origin = new URL(baseURL!).origin;
  expect(urls.filter((u) => new URL(u).origin !== origin)).toEqual([]);
  expect(sockets.map((s) => [new URL(s).host, new URL(s).pathname])).toEqual([[new URL(baseURL!).host, "/ws"]]);
});
