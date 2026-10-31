// The live tab (live_session.md answers 4 to 6, workspace.md answer 10) over a
// mock socket: the greeting with the tab's channel, the connection's states in
// the status bar, a pushed descriptor drawn and saved byte for byte, a location
// sent to the editor, a second push replacing the model, a lost server retried
// and greeted again, a refused push; and the hosted copy, where none of it shows.
import { readFileSync } from "node:fs";
import { test } from "@playwright/test";
import { drop, expect, fixtureText, live, readyLevel, rows, shot, status } from "./fixtures";

const connection = (page: import("@playwright/test").Page) => status(page).locator(".connection");

const major2 = () => {
  const d = JSON.parse(fixtureText("descent"));
  d.format_version = { major: 2, minor: 0 };
  return JSON.stringify(d);
};

test("a live tab greets, draws pushes, saves the bytes, opens locations, and reconnects", async ({ page }) => {
  const mock = await live(page, "/?tab=loop");
  await expect.poll(() => mock.sent.length).toBe(1);
  expect(JSON.parse(mock.sent[0])).toEqual({ type: "hello", channel: "loop", major: 1 });

  await expect(connection(page)).toHaveText("connected, waiting for inspect");
  await expect(connection(page)).toHaveAttribute("data-state", "connected");
  await expect(page.locator(".landing")).toHaveCount(1);
  await expect(page.locator("button.download")).toHaveCount(0);
  await shot(page, "none", "", "live");

  // Valid but not canonical, so a re-serialized download would differ.
  const text = JSON.stringify(JSON.parse(fixtureText("closed_loop")), null, 4);
  mock.send(text);
  await page.locator(readyLevel("")).waitFor();
  await expect(page).toHaveTitle("closed_loop – Redstone inspector");
  await expect(connection(page)).toHaveText("connected");
  await expect(page.locator(".landing")).toHaveCount(0);
  await shot(page, "closed_loop", "", "live");

  const [download] = await Promise.all([page.waitForEvent("download"), page.locator("button.download").click()]);
  expect(download.suggestedFilename()).toBe("closed_loop.json");
  expect(readFileSync(await download.path()).equals(Buffer.from(text, "utf8"))).toBe(true);

  await page.locator('g.block[data-id="plant"]').click();
  const location = page.locator("aside.detail .locations li").first().locator("button.location");
  await expect(location).toHaveAttribute("title", "Open in the editor");
  const label = (await location.locator(".file").textContent())!;
  const at = label.lastIndexOf(":");
  await location.click();
  await expect.poll(() => mock.sent.length).toBe(2);
  expect(JSON.parse(mock.sent[1])).toEqual({ type: "open_location", file: label.slice(0, at), line: Number(label.slice(at + 1)) });

  mock.send(fixtureText("descent"));
  await expect(page).toHaveTitle("descent – Redstone inspector");
  await expect(status(page)).toHaveAttribute("data-kind", "build");
  await expect(rows(page)).toHaveCount(4);

  await mock.close();
  await expect(connection(page)).toHaveAttribute("data-state", "lost");
  await expect(connection(page)).toContainText("retrying");
  await expect.poll(() => mock.connections(), { timeout: 3000 }).toBe(2);
  await expect.poll(() => mock.sent.length, { timeout: 3000 }).toBe(3);
  expect(JSON.parse(mock.sent[2])).toEqual({ type: "hello", channel: "loop", major: 1 });
  await expect(connection(page)).toHaveAttribute("data-state", "connected");

  mock.send(major2());
  await expect(page.locator(".landing pre.outcome")).toContainText("format 2.0");
  await expect(page.locator(".frame")).toHaveCount(0);
});

test("a control frame from the server is dropped, and so is anything else", async ({ page }) => {
  // A frame fed to the loader would be refused, unloading the model, and descent would then load fresh with
  // nothing selected; dropped, descent replaces closed_loop and the rekeyed selection keeps `plant`.
  const mock = await live(page, "/?tab=loop");
  mock.send(fixtureText("closed_loop"));
  await page.locator(readyLevel("")).waitFor();
  await page.locator('g.block[data-id="plant"]').click();
  await expect(page.locator('g.block.selected[data-id="plant"]')).toHaveCount(1);
  mock.send(JSON.stringify({ type: "hello", channel: "loop", major: 1 }));
  mock.send("[]");
  mock.send("nonsense");
  mock.send(fixtureText("descent"));
  await expect(page).toHaveTitle("descent – Redstone inspector");
  await page.locator(readyLevel("")).waitFor();
  await expect(page.locator('g.block.selected[data-id="plant"]')).toHaveCount(1);
});

test("at / the hello names the default channel", async ({ page }) => {
  const mock = await live(page, "/");
  await expect.poll(() => mock.sent.length).toBe(1);
  expect(JSON.parse(mock.sent[0])).toEqual({ type: "hello", channel: "", major: 1 });
});

test("the hosted copy: no connection, no download, and a location click copies", async ({ page, context }) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await drop(page, "closed_loop");
  await expect(status(page)).toHaveAttribute("data-kind", "build");
  await page.locator('g.block[data-id="plant"]').click();
  const first = page.locator("aside.detail .locations li").first();
  await expect(first.locator("button.location")).toHaveAttribute("title", "Copy the file label");
  const label = (await first.locator(".file").textContent())!;
  await first.locator("button.location").click();
  await expect(first.locator(".copied")).toHaveCount(1);
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(label);
  await expect(connection(page)).toHaveCount(0);
  await expect(page.locator("button.download")).toHaveCount(0);
});
