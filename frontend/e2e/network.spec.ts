// The no-CDN rule (build_release.md answer 5): every request the page makes
// while loading, dropping closed_loop, opening sensing and showing the help page
// has the page's origin; the page makes exactly one WebSocket attempt, to its own
// host at `/ws`, which the preview server refuses. The favicon, the loop icon,
// loads relatively with no failed request (the polish batch).
import { test } from "@playwright/test";
import { drop, expect, readyLevel, shot } from "./fixtures";

test("every request goes to the preview server's origin, the help page's included", async ({ page, baseURL }) => {
  const urls: string[] = [];
  const sockets: string[] = [];
  page.on("request", (r) => urls.push(r.url()));
  page.on("websocket", (w) => sockets.push(w.url()));
  await drop(page, "closed_loop");
  await page.locator('g.block[data-id="sensing"]').dblclick();
  await page.locator(readyLevel("sensing")).waitFor();
  await shot(page, "closed_loop", "sensing", "network");
  await page.keyboard.press("?");
  await page.locator("article.help svg.sample").first().waitFor();
  expect(urls.length).toBeGreaterThan(0);
  const origin = new URL(baseURL!).origin;
  expect(urls.filter((u) => new URL(u).origin !== origin)).toEqual([]);
  expect(sockets.map((s) => [new URL(s).host, new URL(s).pathname])).toEqual([[new URL(baseURL!).host, "/ws"]]);
});

test("the favicon: a relative link to the loop icon, which the server serves as SVG, and no failed request on load", async ({ page }) => {
  const failed: string[] = [];
  page.on("response", (r) => { if (r.status() >= 400) failed.push(`${r.status()} ${r.url()}`); });
  await drop(page, "closed_loop");
  const link = page.locator('head link[rel="icon"]');
  await expect(link).toHaveAttribute("href", "icon.svg");
  const icon = await page.evaluate(async () => {
    const r = await fetch((document.querySelector('link[rel="icon"]') as HTMLLinkElement).href);
    const svg = new DOMParser().parseFromString(await r.text(), "image/svg+xml");
    return { status: r.status, type: r.headers.get("content-type"), fills: [...svg.querySelectorAll("rect")].map((e) => e.getAttribute("fill")) };
  });
  // a blue block and an amber block, the palette's continuous and discrete fills
  expect(icon).toEqual({ status: 200, type: expect.stringContaining("image/svg+xml"), fills: ["#d6e6fb", "#fde7c8"] });
  expect(failed).toEqual([]);
});
