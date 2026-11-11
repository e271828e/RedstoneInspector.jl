// The help page (workspace.md answers 11 and 10; initial_design.md answer 15;
// build_release.md answers 7 and 8): reached from the landing's link, `?` and the
// status bar's link; its four sections with the lead paragraph, the legend's fifteen
// drawn terms, the vocabulary of look_inspector_08.md's 7.2, the keyboard table as
// long as the map's, both Vimium patterns, the privacy statement and the versions;
// shown over the frame or the landing, kept mounted and inert, the focus, the tree's
// scroll and the drawer's sort surviving it; a history entry `#help` over the
// level's, closed by its button, Escape, `?` and back, a link-opened page too; a
// load under it read when it closes; the keys the browser's while it shows; a typed
// level hash this load's entry; no text a reader sees saying "block" or "leaf".
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
/** The frame or the landing kept beneath the help page, inert while it shows. */
const under = (page: Page) => page.locator("main > div.under");
/** The legend's terms in their order, each with its drawing. */
const TERM_KEYS = [
  "component", "face", "wire", "badge", "casing", "chord", "dim", "display-name", "halo", "hue", "legend", "pin", "modes", "region", "tag",
];
/** The root tag's outline at width 80, as the canvas's `tagD` draws it. */
const TAG_D = "M20,0 L71,0 L80,11 L71,22 L20,22 A11,11 0 0 1 20,0 Z";

/** Whether the element the locator names is the one focused. */
const isActive = (page: Page, sel: string) => page.locator(sel).evaluate((e) => e === document.activeElement);

/** A fixture dropped under the help page, which shows no canvas to wait for: the window's title names its label. */
async function dropUnder(page: Page, name: string) {
  await page.evaluate(({ text, file }) => {
    const dt = new DataTransfer();
    dt.items.add(new File([text], file, { type: "application/json" }));
    window.dispatchEvent(new DragEvent("drop", { dataTransfer: dt, bubbles: true, cancelable: true }));
  }, { text: fixtureText(name), file: `${name}.json` });
  await expect(page).toHaveTitle(`${name} – Redstone inspector`);
}

test("before a drop: the landing's link opens four sections over the inert landing, the lead, fifteen drawn terms, nineteen Simulink rows and the map's keys; the close button the landing again", async ({ page }) => {
  await page.goto("/");
  await page.locator(".landing a.help").click();
  await expect(help(page)).toHaveCount(1);
  await expect(under(page).locator(".landing")).toHaveCount(1);
  await expect(under(page)).toHaveAttribute("inert", "");
  expect(await hash(page)).toBe("#help");
  const h = help(page);
  await expect(h.locator("h1")).toHaveText("Redstone inspector");
  expect(await h.locator("section[data-section]").evaluateAll((s) => s.map((e) => (e as HTMLElement).dataset.section)))
    .toEqual(["reading", "simulink", "keyboard", "about"]);
  await expect(h.locator("nav a")).toHaveCount(4);
  await expect(h.locator("section[data-section] > h2")).toHaveCount(4);
  await expect(h.locator('section[data-section="refusals"]')).toHaveCount(0);
  // the lead paragraph opens the section, above the legend
  const lead = h.locator('section[data-section="reading"] > h2 + p.lead + ul.terms');
  await expect(lead).toHaveCount(1);
  await expect(h.locator("p.lead")).toContainText("Double-click a closed assembly to open its level.");
  await expect(h.locator("p.lead")).toContainText("A dragged component keeps its place for the session only.");
  // fifteen terms in their order, each with its drawing
  expect(await h.locator("ul.terms li[data-term]").evaluateAll((l) => l.map((e) => (e as HTMLElement).dataset.term))).toEqual(TERM_KEYS);
  await expect(h.locator("ul.terms li[data-term] > svg.sample")).toHaveCount(15);
  for (const t of ["level", "semantic-zoom", "triple", "block"]) await expect(h.locator(`li[data-term="${t}"]`)).toHaveCount(0);
  await expect(h.locator('li[data-term="component"] .term')).toHaveText("component");
  // the tag's outline is the canvas's own
  await expect(h.locator('svg.sample[data-sample="tag"] path')).toHaveAttribute("d", TAG_D);
  // the badge's clock pill straddles the assembly's bottom edge at its left, as the canvas draws it
  const pill = await h.locator('svg.sample[data-sample="badge"]').evaluate((svg) => {
    const [box, pill] = [svg.querySelector("rect")!, svg.querySelector("rect.pill")!].map((r) => (r as SVGRectElement).getBBox());
    return { left: pill.x - box.x, middle: pill.y + pill.height / 2 - (box.y + box.height) };
  });
  expect(pill.left).toBe(4);
  expect(Math.abs(pill.middle)).toBeLessThanOrEqual(1);
  // the display name: one component with its type's name, one with an icon; the legend: two swatches, two triples read out
  const names = h.locator('svg.sample[data-sample="display-name"]');
  await expect(names.locator("text.display")).toHaveText("Airframe");
  await expect(names.locator("g.icon path")).toHaveCount(1);
  const legend = h.locator('svg.sample[data-sample="legend"]');
  await expect(legend.locator("rect.legend")).toHaveCount(1);
  expect(new Set(await legend.locator("rect:not(.legend)").evaluateAll((r) => r.map((e) => e.getAttribute("fill")))).size).toBe(2);
  await expect(legend.locator("text")).toHaveText(["base grid", "anchor 1 (1/4 s)"]);
  const vocabulary = h.locator("table.vocabulary tbody tr");
  await expect(vocabulary).toHaveCount(19);
  await expect(vocabulary.first().locator("td").nth(0)).toHaveText("block");
  await expect(vocabulary.first().locator("td").nth(1)).toHaveText("primitive");
  for (const gone of ["virtual subsystem", "rate scope"]) await expect(vocabulary.filter({ hasText: gone })).toHaveCount(0);
  expect(MAP_KEYS).toBeGreaterThan(10);
  await expect(h.locator("table.keys tr")).toHaveCount(MAP_KEYS);
  await expect(h.locator("table.keys tr").nth(1)).toContainText("select the nearest component or pin in that direction");
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
  await h.locator('nav a[href="#help-simulink"]').click();
  await expect.poll(() => h.locator('section[data-section="simulink"]').evaluate((e) => e.getBoundingClientRect().top)).toBeLessThan(40);
  await shot(page, "none", "", "help-simulink");
  await h.evaluate((e) => { e.scrollTop = 0; });
  // The browser's keys scroll the page; a section link scrolls without touching the hash.
  await press(page, "Space");
  await expect.poll(() => h.evaluate((e) => e.scrollTop)).toBeGreaterThan(0);
  await h.locator('nav a[href="#help-about"]').click();
  await expect.poll(() => h.evaluate((e) => e.scrollTop + e.clientHeight >= e.scrollHeight - 2)).toBe(true);
  expect(await hash(page)).toBe("#help");
  await h.locator("button.close").click();
  await expect(page.locator(".landing")).toHaveCount(1);
  await expect(help(page)).toHaveCount(0);
  await expect(under(page)).not.toHaveAttribute("inert");
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
  await expect(under(page).locator(".frame")).toHaveCount(1);
  await expect(under(page)).toHaveAttribute("inert", "");
  expect(await hash(page)).toBe("#help");
  await press(page, "Escape");
  await atLevel();
  await expect(under(page)).not.toHaveAttribute("inert");
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

test("a load at #help with no model shows the help page over the inert landing, its close the landing", async ({ page }) => {
  await page.goto("/#help");
  await expect(help(page)).toHaveCount(1);
  await expect(under(page).locator(".landing")).toHaveCount(1);
  await expect(under(page)).toHaveAttribute("inert", "");
  await press(page, "?");
  await expect(page.locator(".landing")).toHaveCount(1);
  expect(await hash(page)).toBe("");
  await press(page, "?");
  await expect(help(page)).toHaveCount(1);
  await help(page).locator("button.close").click();
  await expect(page.locator(".landing")).toHaveCount(1);
  expect(await hash(page)).toBe("");
});

test("a model dropped under a page loaded at #help: the help page stands over the inert frame, its close the root", async ({ page }) => {
  await page.goto("/#help");
  await dropUnder(page, "closed_loop");
  await expect(help(page)).toHaveCount(1);
  await expect(under(page).locator(".frame")).toHaveCount(1);
  await expect(under(page)).toHaveAttribute("inert", "");
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

test("closed_loop: focus on a tree row comes back to that row whichever way the page closes, and j then walks the tree", async ({ page }) => {
  await drop(page, "closed_loop");
  const row = 'nav.tree .row[data-path="sensing"]';
  await page.locator(row).click();
  // the very element, marked, so a remounted row would not pass for it
  await page.locator(row).evaluate((e) => { (e as any).__before = true; });
  const back = () => page.evaluate(() => (document.activeElement as any)?.__before === true);
  const close: Record<string, () => Promise<void>> = {
    "?": () => press(page, "?"),
    Escape: () => press(page, "Escape"),
    button: () => help(page).locator("button.close").click(),
    back: async () => { await page.goBack(); },
  };
  for (const [way, act] of Object.entries(close)) {
    await press(page, "?");
    await expect(help(page)).toHaveCount(1);
    expect(await isActive(page, "article.help"), way).toBe(true);
    await act();
    await expect(help(page)).toHaveCount(0);
    await expect.poll(back, way).toBe(true);
  }
  const order = await page.locator("nav.tree .row").evaluateAll((r) => r.map((e) => e.getAttribute("data-path")));
  await press(page, "j");
  await expect(page.locator("nav.tree .row.selected")).toHaveAttribute("data-path", order[order.indexOf("sensing") + 1]!);
});

test("large: the tree's scroll and the drawer's period sort survive the help page", async ({ page }) => {
  await drop(page, "large");
  const body = page.locator('.pane[data-pane="tree"] .body');
  await body.evaluate((e) => { e.scrollTop = 900; });
  const top = await body.evaluate((e) => e.scrollTop);
  expect(top).toBeGreaterThan(0);
  await page.locator('section.drawer button.tab[data-tab="timing"]').click();
  const sort = page.locator("section.drawer button.sort-period");
  await sort.click();
  await expect(sort).toHaveAttribute("aria-pressed", "true");
  await press(page, "?");
  await expect(help(page)).toHaveCount(1);
  await press(page, "?");
  await expect(help(page)).toHaveCount(0);
  expect(await body.evaluate((e) => e.scrollTop)).toBe(top);
  await expect(sort).toHaveAttribute("aria-pressed", "true");
});

/** "block" or "leaf" as a reader's word, after the descriptor's data is struck out: a qualified name naming the core's module, a source file. */
const RETIRED = /\b(blocks?|leaf|leaves)\b/i;
const strip = (s: string) => s.replace(/[\w.]*\bBlocks\.[\w.{}]*/g, "").replace(/\S*\.jl\b(:\d+)?/g, "");

/** Every text a reader sees on the page: text content and the title, aria-label and placeholder attributes. */
const readerTexts = (page: Page) => page.evaluate(() => {
  // Left out: the descriptor's docstrings shown as data, and the help page's Simulink column, whose "block" is Simulink's.
  const skip = (n: Node) => !!(n.parentElement?.closest("div.docstring, table.vocabulary td:first-child"));
  const out: string[] = [];
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  for (let n = walker.nextNode(); n; n = walker.nextNode()) if (!skip(n) && n.textContent!.trim()) out.push(n.textContent!);
  for (const e of document.querySelectorAll("[title], [aria-label], [placeholder]")) {
    if (e.closest("div.docstring")) continue;
    for (const a of ["title", "aria-label", "placeholder"]) if (e.hasAttribute(a)) out.push(e.getAttribute(a)!);
  }
  return out;
});

test("closed_loop: no text a reader sees says block or leaf, over each drawer tab, rate mode, the badges, a primitive's pane and the help page", async ({ page }) => {
  await drop(page, "closed_loop");
  await press(page, "r");
  await press(page, "o");
  await press(page, "y");
  const seen: string[] = [];
  for (const tab of ["diagnostics", "root-inputs", "timing", "order"]) {
    await page.locator(`section.drawer button.tab[data-tab="${tab}"]`).click();
    await expect(page.locator("section.drawer")).toHaveAttribute("data-tab", tab);
    seen.push(...await readerTexts(page));
  }
  await page.locator('g.block[data-id="plant"]').click();
  await expect(page.locator("aside.detail")).toHaveAttribute("data-kind", "leaf");
  seen.push(...await readerTexts(page));
  await openPath(page, "pid_controller");
  await page.locator('g.block[data-id="pid_controller/h_ctl"]').click();
  seen.push(...await readerTexts(page));
  await press(page, "?");
  await expect(help(page)).toHaveCount(1);
  seen.push(...await readerTexts(page));
  expect(seen.length).toBeGreaterThan(100);
  expect(seen.filter((t) => RETIRED.test(strip(t)))).toEqual([]);
});
