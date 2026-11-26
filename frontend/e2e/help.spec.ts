// The help page (workspace.md answers 11 and 10; initial_design.md answer 15;
// build_release.md answers 7 and 8): reached from the landing's link, `?` and the
// status bar's link; its five sections with the lead paragraph, the legend's fifteen
// drawn terms, the timing notation and the root inputs' type rule (deployment_overlay.md
// answers 3 and 14), the vocabulary of look_inspector_08.md's 7.2, the keyboard table as
// long as the map's with the search's prefixes under it, both Vimium patterns, the privacy statement and the versions;
// shown over the frame or the landing, kept mounted and inert, the focus, the tree's
// scroll and the drawer's sort surviving it; a history entry `#help` over the
// level's, closed by its button, Escape, `?` and back, a link-opened page too; a
// load under it read when it closes; the keys the browser's while it shows but `j k d
// u gg G`, which scroll it, and Cmd-O, landing.spec.ts's; a typed
// level hash this load's entry; no text a reader sees saying "block" or "leaf".
import { readFileSync } from "node:fs";
import { test, type Page } from "@playwright/test";
import { drop, expect, fixtureText, hash, openPath, press, pressAll, readyLevel, SCROLL_STEP, selected, shot, status } from "./fixtures";

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

test("before a drop: the landing's link opens five sections over the inert landing, the lead, fifteen drawn terms, nineteen Simulink rows and the map's keys; the close button the landing again", async ({ page }) => {
  await page.goto("/");
  await page.locator(".landing a.help").click();
  await expect(help(page)).toHaveCount(1);
  await expect(under(page).locator(".landing")).toHaveCount(1);
  await expect(under(page)).toHaveAttribute("inert", "");
  expect(await hash(page)).toBe("#help");
  const h = help(page);
  await expect(h.locator("h1")).toHaveText("Redstone inspector");
  expect(await h.locator("section[data-section]").evaluateAll((s) => s.map((e) => (e as HTMLElement).dataset.section)))
    .toEqual(["reading", "timing", "keyboard", "simulink", "about"]);
  expect(await h.locator("nav a").evaluateAll((a) => a.map((e) => e.getAttribute("href")))).toEqual(["#help-reading", "#help-timing", "#help-keyboard", "#help-simulink", "#help-about"]);
  await expect(h.locator("nav a")).toHaveText(["Reading the diagram", "Timing and root inputs", "The keyboard", "Coming from Simulink", "About"]);
  await expect(h.locator("section[data-section] > h2")).toHaveCount(5);
  await expect(h.locator('section[data-section="refusals"]')).toHaveCount(0);
  // the lead paragraph opens the section, above the legend
  const lead = h.locator('section[data-section="reading"] > h2 + p.lead + ul.terms');
  await expect(lead).toHaveCount(1);
  await expect(h.locator("p.lead")).toContainText("Double-click a closed assembly to open its level.");
  await expect(h.locator("p.lead")).toContainText("A dragged component keeps its place for the session only: x puts the last one dragged back in its computed place, and X or the Undo drags button every one.");
  // fifteen terms in their order, each with its drawing
  expect(await h.locator("ul.terms li[data-term]").evaluateAll((l) => l.map((e) => (e as HTMLElement).dataset.term))).toEqual(TERM_KEYS);
  await expect(h.locator("ul.terms li[data-term] > svg.sample")).toHaveCount(15);
  for (const t of ["level", "semantic-zoom", "triple", "block"]) await expect(h.locator(`li[data-term="${t}"]`)).toHaveCount(0);
  await expect(h.locator('li[data-term="component"] .term')).toHaveText("component");
  // the tag's outline is the canvas's own
  await expect(h.locator('svg.sample[data-sample="tag"] path')).toHaveAttribute("d", TAG_D);
  // the badge's clock pill straddles the assembly's top edge at its left, as the canvas draws it
  const pill = await h.locator('svg.sample[data-sample="badge"]').evaluate((svg) => {
    const [box, pill] = [svg.querySelector("rect")!, svg.querySelector("rect.pill")!].map((r) => (r as SVGRectElement).getBBox());
    return { left: pill.x - box.x, middle: pill.y + pill.height / 2 - box.y };
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
  await expect(legend.locator("text")).toHaveText(["D₀ 1 · Φ₀ 0", "D₀ 2 · Φ₀ 1"]);
  // the legend's sample keeps inside its frame, scaled to it
  const box = await legend.evaluate((svg) => {
    const s = svg.getBoundingClientRect(), g = svg.querySelector("g")!.getBoundingClientRect();
    return { left: g.left - s.left, right: s.right - g.right };
  });
  expect(Math.min(box.left, box.right)).toBeGreaterThanOrEqual(-0.5);
  const vocabulary = h.locator("table.vocabulary tbody tr");
  await expect(vocabulary).toHaveCount(19);
  await expect(vocabulary.first().locator("td").nth(0)).toHaveText("block");
  await expect(vocabulary.first().locator("td").nth(1)).toHaveText("primitive");
  for (const gone of ["virtual subsystem", "rate scope"]) await expect(vocabulary.filter({ hasText: gone })).toHaveCount(0);
  expect(MAP_KEYS).toBeGreaterThan(10);
  await expect(h.locator("table.keys tr")).toHaveCount(MAP_KEYS);
  await expect(h.locator("table.keys tr").nth(3)).toContainText("select the nearest component or pin in that direction");
  await expect(h.locator('table.keys kbd:text-is("?")')).toHaveCount(1);
  await expect(h.locator('table.keys kbd:text-is("o")')).toHaveCount(1);
  // the retired keys' rows are gone, and the search's prefixes stand in a table under the keys
  const rowOf = (key: string) => h.locator("table.keys tr").filter({ has: page.locator(`kbd:text-is("${key}")`) });
  for (const [key, action] of [["s", "focus the tree"], ["d", "half a page"], ["u", "half a page"], ["c", "tier and rate colors"], ["x", "computed place"], ["Escape", "close the right-click menu, else cancel a pending z or g, else"]]) {
    await expect(rowOf(key).first(), key).toContainText(action);
  }
  for (const gone of ["m", "i", "z", "U", "r", "R"]) await expect(rowOf(gone), gone).toHaveCount(0);
  await expect(h.locator("table.keys ~ table.prefixes th code")).toHaveText(["path:", "type:", "face:"]);
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
  await h.locator('nav a[href="#help-keyboard"]').click();
  await expect.poll(() => h.locator('section[data-section="keyboard"]').evaluate((e) => e.getBoundingClientRect().top)).toBeLessThan(40);
  await shot(page, "none", "", "help-keyboard");
  await h.locator("table.prefixes").scrollIntoViewIfNeeded();
  await shot(page, "none", "", "help-prefixes");
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

/** The notation's symbols (deployment_overlay.md answer 3), each defined once on the help page. */
const SYMBOLS = ["Δt_base", "Δt_frame", "A₁ (key)", "Dₛ", "Φₛ", "Dₐ", "Φₐ", "D₀", "Φ₀", "Δt", "τ"];

test("the timing section defines each symbol of the notation once, states the law's four lines and the root inputs' type rule once, holds no retired letter, and its link scrolls to it", async ({ page }) => {
  await page.goto("/#help");
  const h = help(page), t = h.locator('section[data-section="timing"]');
  await expect(t.locator("h2")).toHaveText("Timing and root inputs");
  const defined = (await t.locator("table.notation th code").allTextContents()).flatMap((x) => x.split(/,\s*/));
  expect([...defined].sort()).toEqual([...SYMBOLS].sort());
  // a symbol's row is its one definition: no other row's head names it
  expect(new Set(defined).size).toBe(defined.length);
  await expect(t.locator("table.law tr")).toHaveText([
    /^in seconds\s*Δt\(i\) = Dₐ\(i\) · Δt\(a\)\s*τ\(i\) = τ\(a\) \+ Φₐ\(i\) · Δt\(a\)$/, /^in base ticks\s*D₀\(i\) = Dₐ\(i\) · D₀\(a\)\s*Φ₀\(i\) = Φ₀\(a\) \+ Φₐ\(i\) · D₀\(a\)$/,
    /^linked by\s*Δt\(a\) = D₀\(a\) · Δt_base\s*τ\(a\) = Φ₀\(a\) · Δt_base$/, /^hence\s*Δt\(i\) = D₀\(i\) · Δt_base\s*τ\(i\) = Φ₀\(i\) · Δt_base$/,
  ]);
  // D-464's letters, which the core's D-478 retired, stand in no code span of the page, and no backquote is left as text
  // nor a bare count outside the constructor and the constraint, nor a subscript on the seconds pair
  const spans = (await h.locator("code").allTextContents()).filter((x) => !["Relative(D, Φ)", "0 ≤ Φ < D"].includes(x)).flatMap((x) => x.split(/[\s,·()=+]+/));
  expect(spans.filter((x) => ["Aₖ", "Dₖ", "Φₖ", "K", "φ", "m", "c", "D", "Φ"].includes(x) || /^(Δt|τ)[₀-₉ₖ]/.test(x))).toEqual([]);
  expect(await h.textContent()).not.toContain("`");
  // §14.10's type rule, stated once on the whole page
  const rule = "a Float64 reached by at most one index step";
  await expect(t.locator("p.type-rule")).toContainText(rule);
  expect((await h.textContent())!.split(rule).length - 1).toBe(1);
  await h.locator('nav a[href="#help-timing"]').click();
  await expect.poll(() => t.evaluate((e) => e.getBoundingClientRect().top)).toBeLessThan(40);
  await shot(page, "none", "", "help-timing");
});

test("at a window 360 px wide the help page does not scroll sideways, its addresses and patterns breaking", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 800 });
  await page.goto("/#help");
  const h = help(page);
  await expect(h.locator("dl.about")).toHaveCount(1);
  const widths = await h.evaluate((e) => ({ scroll: e.scrollWidth, client: e.clientWidth }));
  expect(widths.scroll).toBe(widths.client);
});

test("kinds: the wire term says a double line for a struct, and its sample draws the struct as the canvas does, one background core over a wider line", async ({ page }) => {
  await drop(page, "kinds");
  /** A struct's line and its cores: the core count, then each's computed stroke and width. */
  const struct = (root: string, line: string) => page.evaluate(({ root, line }) => {
    const wires = [...document.querySelectorAll(`${root} ${line}.wire[data-kind="struct"]`)];
    const w = wires[0], cores = [...document.querySelectorAll(`${root} ${line}.wire-core`)];
    const look = (e: Element) => [getComputedStyle(e).stroke, getComputedStyle(e).strokeWidth];
    return { wires: wires.length, cores: cores.length, wire: look(w), core: cores.length ? look(cores[0]) : [] };
  }, { root, line });
  const canvas = await struct("svg.canvas", "path");
  expect([canvas.wires, canvas.cores]).toEqual([1, 1]);
  expect(parseFloat(canvas.core[1])).toBeLessThan(parseFloat(canvas.wire[1]));
  expect(canvas.core[0]).not.toBe(canvas.wire[0]);
  await press(page, "?");
  await expect(help(page)).toHaveCount(1);
  await expect(help(page).locator('li[data-term="wire"] p')).toContainText("thick for a vector, a double line for a struct.");
  await expect(help(page).locator('li[data-term="wire"] p')).not.toContainText("triple");
  expect(await struct('svg.sample[data-sample="wire"]', "line")).toEqual(canvas);
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

test("closed_loop, at pid_controller with a primitive selected and at the root with an assembly: under the help page the frame's keys do nothing, the drawer, the modes, the badges, the labels, the selection and the level as before", async ({ page }) => {
  await drop(page, "closed_loop");
  /** The six states a leaked key would change. */
  const state = () => page.evaluate(() => {
    const svg = document.querySelector("svg.canvas")!;
    return {
      drawer: document.querySelector("section.drawer")!.getAttribute("data-open"),
      mode: svg.getAttribute("data-mode"),
      order: svg.getAttribute("data-order"),
      labels: svg.getAttribute("data-labels"),
      selection: document.querySelector("aside.detail")!.getAttribute("data-id"),
      level: svg.getAttribute("data-level"),
      collapsed: [...document.querySelectorAll(".pane.side.collapsed")].map((p) => p.getAttribute("data-pane")),
    };
  });
  // Backspace would climb from pid_controller; Enter would open sensing; j and k would move from either.
  for (const [level, id] of [["pid_controller", "pid_controller/θ_ctl"], ["", "sensing"]]) {
    if (level) await openPath(page, level);
    else await page.locator('nav.breadcrumb a[data-path=""]').click();
    await page.locator(readyLevel(level)).waitFor();
    await page.locator(`g.block[data-id="${id}"]`).click();
    const before = await state();
    expect([before.selection, before.level]).toEqual([id, level]);
    await press(page, "?");
    await expect(help(page)).toHaveCount(1);
    for (const key of ["j", "k", "h", "l", "d", "u", "g", "g", "Shift+G", "s", "e", "Shift+Q", "Shift+E", "Shift+S", "c", "o", "y", "t", "0", "x", "Shift+X", "g", "t", "z", "h", "Enter", "Backspace"]) await press(page, key);
    await press(page, "?");
    await expect(help(page)).toHaveCount(0);
    await page.locator(readyLevel(level)).waitFor();
    expect(await state(), level).toEqual(before);
  }
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

test("closed_loop: focus in the tree, from a row's click, comes back to the tree whichever way the page closes, and j then walks the tree", async ({ page }) => {
  await drop(page, "closed_loop");
  const row = 'nav.tree .row[data-path="sensing"]';
  await page.locator(row).click();
  // the very element, marked, so a remounted tree would not pass for it; a row takes no focus of its own
  await page.locator("nav.tree").evaluate((e) => { (e as any).__before = true; });
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

/** "block" or "leaf" as a reader's word. */
const RETIRED = /\b(blocks?|leaf|leaves)\b/i;

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
  await press(page, "c");
  await press(page, "o");
  await press(page, "y");
  const seen: string[] = [];
  for (const tab of ["diagnostics", "root-inputs", "timing", "order"]) {
    await page.locator(`section.drawer button.tab[data-tab="${tab}"]`).click();
    await expect(page.locator("section.drawer")).toHaveAttribute("data-tab", tab);
    seen.push(...await readerTexts(page));
  }
  await page.locator('g.block[data-id="plant"]').click();
  await expect(page.locator("aside.detail")).toHaveAttribute("data-kind", "primitive");
  seen.push(...await readerTexts(page));
  await openPath(page, "pid_controller");
  await page.locator('g.block[data-id="pid_controller/h_ctl"]').click();
  seen.push(...await readerTexts(page));
  await press(page, "?");
  await expect(help(page)).toHaveCount(1);
  seen.push(...await readerTexts(page));
  expect(seen.length).toBeGreaterThan(100);
  expect(seen.filter((t) => RETIRED.test(t))).toEqual([]);
});

test("closed_loop: on the help page j and k scroll it by the step, d and u by half its height, gg and G to its ends; Escape cancels a pending g first, z waits for nothing", async ({ page }) => {
  await drop(page, "closed_loop");
  await press(page, "?");
  await expect(help(page)).toHaveCount(1);
  const top = () => help(page).evaluate((e) => e.scrollTop);
  expect(await top()).toBe(0);
  for (const [key, at] of [["j", 1], ["j", 2], ["k", 1], ["k", 0], ["k", 0]] as const) {
    await press(page, key);
    expect(await top(), key).toBe(at * SCROLL_STEP);
  }
  const { half, end } = await help(page).evaluate((e) => ({ half: e.clientHeight / 2, end: e.scrollHeight - e.clientHeight }));
  for (const [key, at] of [["d", half], ["d", 2 * half], ["u", half], ["Shift+G", end]] as const) {
    await press(page, key);
    expect(Math.abs((await top()) - at), key).toBeLessThanOrEqual(1);
  }
  await press(page, "g");
  expect(Math.abs((await top()) - end)).toBeLessThanOrEqual(1);
  await press(page, "g");
  expect(await top()).toBe(0);
  // z is none of the page's keys, so the j after it scrolls
  await pressAll(page, "z", "j");
  expect(await top()).toBe(SCROLL_STEP);
  // a pending g drops a key it does not know and Escape cancels it before it closes the page
  await pressAll(page, "g", "j");
  expect(await top()).toBe(SCROLL_STEP);
  await pressAll(page, "g", "Escape");
  await expect(help(page)).toHaveCount(1);
  await press(page, "Escape");
  await expect(help(page)).toHaveCount(0);
});

test("a prefix pending as the help page opens by its link does not outlive the opening", async ({ page }) => {
  await drop(page, "closed_loop");
  await press(page, "z");
  await expect(status(page).locator("span.prefix")).toHaveCount(1);
  await status(page).locator("a.help").click();
  await expect(help(page)).toHaveCount(1);
  await press(page, "j");
  expect(await help(page).evaluate((e) => e.scrollTop)).toBe(SCROLL_STEP);
  await press(page, "Escape");
  await expect(help(page)).toHaveCount(0);
  await expect(status(page).locator("span.prefix")).toHaveCount(0);
});

test("closed_loop: the search field's title names the prefixes", async ({ page }) => {
  await drop(page, "closed_loop");
  for (const prefix of ["path:", "type:", "face:"]) await expect(page.locator("input.query")).toHaveAttribute("title", new RegExp(prefix));
});
