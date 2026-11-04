// The help page (workspace.md answers 11 and 10; build_release.md answers 7 and 8):
// reached from the landing's link, `?` and the status bar's link; its five sections
// with the legend's samples, the vocabulary, the refusals, the keyboard table as
// long as the map's, both Vimium patterns, the privacy statement and the versions;
// a history entry `#help` over the level's, closed by its button, Escape, `?` and
// back, a link-opened page too; a load under it read when it closes; the keys the
// browser's while it shows; a typed level hash this load's entry.
import { readFileSync } from "node:fs";
import { test, type Page } from "@playwright/test";
import { drop, expect, fixtureText, hash, openPath, press, readyLevel, selected, shot, status } from "./fixtures";

/** The inspector's version, read from the package's `Project.toml` as the build reads it. */
const VERSION = /^version\s*=\s*"([^"]+)"/m.exec(readFileSync(new URL("../../Project.toml", import.meta.url), "utf8"))![1];
/** The rows of the map's keyboard table, its header row left out. */
const MAP_KEYS = readFileSync(new URL("../MAP.md", import.meta.url), "utf8")
  .split("\n## The keyboard\n")[1].split("\n## ")[0]
  .split("\n").filter((l) => l.startsWith("| ")).length - 1;

const help = (page: Page) => page.locator("article.help");

/** A fixture dropped under the help page, which shows no canvas to wait for: the window's title names its label. */
async function dropUnder(page: Page, name: string) {
  await page.evaluate(({ text, file }) => {
    const dt = new DataTransfer();
    dt.items.add(new File([text], file, { type: "application/json" }));
    window.dispatchEvent(new DragEvent("drop", { dataTransfer: dt, bubbles: true, cancelable: true }));
  }, { text: fixtureText(name), file: `${name}.json` });
  await expect(page).toHaveTitle(`${name} – Redstone inspector`);
}

test("before a drop: the landing's link opens the five sections, the close button the landing again", async ({ page }) => {
  await page.goto("/");
  await page.locator(".landing a.help").click();
  await expect(help(page)).toHaveCount(1);
  await expect(page.locator(".landing")).toHaveCount(0);
  expect(await hash(page)).toBe("#help");
  const h = help(page);
  await expect(h.locator("h1")).toHaveText("Redstone inspector");
  expect(await h.locator("section[data-section]").evaluateAll((s) => s.map((e) => (e as HTMLElement).dataset.section)))
    .toEqual(["reading", "simulink", "refusals", "keyboard", "about"]);
  await expect(h.locator("nav a")).toHaveCount(5);
  await expect(h.locator("section[data-section] > h2")).toHaveCount(5);
  await expect(h.locator("ul.terms li[data-term]")).toHaveCount(18);
  await expect(h.locator("ul.terms li[data-term] svg.sample")).toHaveCount(13);
  for (const t of ["display-name", "legend", "level", "semantic-zoom", "triple"]) {
    await expect(h.locator(`li[data-term="${t}"] svg.sample`)).toHaveCount(0);
  }
  const vocabulary = h.locator("table.vocabulary tbody tr");
  await expect(vocabulary).toHaveCount(13);
  await expect(vocabulary.first().locator("td").nth(0)).toHaveText("subsystem");
  await expect(vocabulary.first().locator("td").nth(1)).toHaveText("assembly");
  await expect(h.locator("ul.refusals li")).toHaveCount(3);
  await expect(h.locator("ul.refusals li b")).toHaveText(["Editing", "Saved hand layout", "Author-supplied icons or masks"]);
  await expect(h.locator("ul.not-yet li")).toHaveCount(3);
  expect(MAP_KEYS).toBeGreaterThan(10);
  await expect(h.locator("table.keys tr")).toHaveCount(MAP_KEYS);
  await expect(h.locator('table.keys kbd:text-is("?")')).toHaveCount(1);
  await expect(h.locator('table.keys kbd:text-is("o")')).toHaveCount(1);
  await expect(h.locator("p.vimium code")).toHaveText([
    "http://localhost:8601/*", "https://e271828e.github.io/RedstoneInspector.jl/*",
  ]);
  await expect(h.locator("p.privacy")).toContainText("never uploaded");
  await expect(h.locator("p.privacy")).toContainText("The page loads nothing from any other site.");
  const about = h.locator("dl.about");
  await expect(about.locator("dd").nth(0)).toHaveText(VERSION);
  await expect(about.locator("dd").nth(1)).toHaveText("major 1");
  await expect(about.locator('a[target="_blank"][rel="noopener"]')).toHaveCount(3);
  await expect(about.locator("a").nth(0)).toHaveAttribute("href", "https://github.com/e271828e/RedstoneInspector.jl");
  await expect(about.locator("a").nth(1)).toHaveAttribute("href", "https://e271828e.github.io/RedstoneInspector.jl/");
  await expect(about.locator("a").nth(2)).toHaveAttribute("href", "https://e271828e.github.io/Redstone.jl/dev/");
  await shot(page, "none", "", "help");
  // The browser's keys scroll the page; a section link scrolls without touching the hash.
  await press(page, "Space");
  await expect.poll(() => h.evaluate((e) => e.scrollTop)).toBeGreaterThan(0);
  await h.locator('nav a[href="#help-about"]').click();
  await expect.poll(() => h.evaluate((e) => e.scrollTop + e.clientHeight >= e.scrollHeight - 2)).toBe(true);
  expect(await hash(page)).toBe("#help");
  await h.locator("button.close").click();
  await expect(page.locator(".landing")).toHaveCount(1);
  await expect(help(page)).toHaveCount(0);
  expect(await hash(page)).toBe("");
});

test("closed_loop at pid_controller: ? and Escape, ? twice, ? and back, a push under it, the status bar's link", async ({ page }) => {
  await drop(page, "closed_loop");
  await openPath(page, "pid_controller");
  const atLevel = async () => {
    await page.locator(readyLevel("pid_controller")).waitFor();
    await expect(help(page)).toHaveCount(0);
    expect(await hash(page)).toBe("#level=pid_controller");
  };
  await press(page, "?");
  await expect(help(page)).toHaveCount(1);
  await expect(page.locator(".frame")).toHaveCount(0);
  expect(await hash(page)).toBe("#help");
  await press(page, "Escape");
  await atLevel();
  // Closing went back: the help page's entry is the one forward.
  await page.goForward();
  await expect(help(page)).toHaveCount(1);
  await press(page, "?");
  await atLevel();
  await press(page, "?");
  await expect(help(page)).toHaveCount(1);
  await page.goBack();
  await atLevel();

  await press(page, "?");
  await dropUnder(page, "closed_loop_deployment");
  await expect(help(page)).toHaveCount(1);
  expect(await hash(page)).toBe("#help");
  await help(page).locator("button.close").click();
  await atLevel();
  await expect(status(page)).toHaveAttribute("data-kind", "deployment");

  const link = status(page).locator("a.help");
  await link.click();
  await expect(help(page)).toHaveCount(1);
  expect(await hash(page)).toBe("#help");
  await press(page, "h");
  await press(page, "ArrowDown");
  await expect(help(page)).toHaveCount(1);
  await help(page).locator("button.close").click();
  await atLevel();
  await expect(selected(page)).toHaveCount(0);
});

test("a load at #help with no model shows the help page over the landing, its close the landing", async ({ page }) => {
  await page.goto("/#help");
  await expect(help(page)).toHaveCount(1);
  await expect(page.locator(".landing")).toHaveCount(0);
  await press(page, "?");
  await expect(page.locator(".landing")).toHaveCount(1);
  expect(await hash(page)).toBe("");
  await press(page, "?");
  await expect(help(page)).toHaveCount(1);
  await help(page).locator("button.close").click();
  await expect(page.locator(".landing")).toHaveCount(1);
  expect(await hash(page)).toBe("");
});

test("a model dropped under a page loaded at #help: the help page stands, its close the root", async ({ page }) => {
  await page.goto("/#help");
  await dropUnder(page, "closed_loop");
  await expect(help(page)).toHaveCount(1);
  await help(page).locator("button.close").click();
  await page.locator(readyLevel("")).waitFor();
  expect(await hash(page)).toBe("");
});

test("a page opened by the landing's link or the status bar's closes by going back, its entry the one forward", async ({ page }) => {
  await page.goto("/");
  await page.locator(".landing a.help").click();
  await expect(help(page)).toHaveCount(1);
  await help(page).locator("button.close").click();
  await expect(page.locator(".landing")).toHaveCount(1);
  expect(await hash(page)).toBe("");
  await page.goForward();
  await expect(help(page)).toHaveCount(1);

  await drop(page, "closed_loop");
  await status(page).locator("a.help").click();
  await expect(help(page)).toHaveCount(1);
  await help(page).locator("button.close").click();
  await page.locator(readyLevel("")).waitFor();
  await expect(help(page)).toHaveCount(0);
  expect(await hash(page)).toBe("");
  await page.goForward();
  await expect(help(page)).toHaveCount(1);
});

test("a level hash typed on a loaded closed_loop is this load's entry: Shift-h returns to the root", async ({ page }) => {
  await drop(page, "closed_loop");
  await page.evaluate(() => { location.hash = "#level=pid_controller"; });
  await page.locator(readyLevel("pid_controller")).waitFor();
  await press(page, "Shift+H");
  await page.locator(readyLevel("")).waitFor();
  expect(await hash(page)).toBe("");
});
