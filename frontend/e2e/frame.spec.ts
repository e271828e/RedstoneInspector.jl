// The frame (workspace.md answers 1, 6, 10 and 11): the status bar's kind, totals and help link,
// the drawer's strip, counts and open rule, the splitters and the collapsed panes
// kept per browser across a reload and a new drop; `m` and `i` collapsing the side
// panes, and the ring fixed on a focused pane's box while its body scrolls (increment 8b);
// `<` and `>` resizing the focused pane (the user's ruling of 2026-11-26);
// a long route line's ellipsis and title with its clear control kept, the counts' and a
// notice's ellipsis and title too (the polish batch).
import { test, type Page } from "@playwright/test";
import { drop, expect, fixtureText, press, shot, status } from "./fixtures";

const drawer = (page: Page) => page.locator("section.drawer");
const tab = (page: Page, t: string) => drawer(page).locator(`button.tab[data-tab="${t}"]`);
const treePane = (page: Page) => page.locator('.pane[data-pane="tree"]');
const detailPane = (page: Page) => page.locator('.pane[data-pane="detail"]');

test("closed_loop: the status bar reads the kind and the model's totals, the help link at its right end", async ({ page }) => {
  await drop(page, "closed_loop");
  await expect(status(page)).toHaveAttribute("data-kind", "build");
  await expect(status(page)).toContainText("build");
  const counts = status(page).locator(".counts");
  for (const t of ["24 primitives", "6 assemblies", "94 wires"]) await expect(counts).toContainText(t);
  await expect(status(page).locator(".note")).toHaveCount(0);
  const link = status(page).locator('a.help[href="#help"]');
  await expect(link).toHaveText("?");
  await expect(link).toHaveAttribute("title", "The help page");
  const bar = (await status(page).boundingBox())!, box = (await link.boundingBox())!;
  expect(bar.x + bar.width - (box.x + box.width)).toBeLessThanOrEqual(10);
});

test("closed_loop: the drawer stays closed with its counts readable, and a tab opens and closes it", async ({ page }) => {
  await drop(page, "closed_loop");
  await expect(drawer(page)).toHaveAttribute("data-open", "false");
  await expect(tab(page, "root-inputs").locator(".count")).toHaveText("3");
  await expect(tab(page, "order").locator(".count")).toHaveText("24");
  await expect(tab(page, "diagnostics").locator(".count")).toHaveText("0");
  await expect(tab(page, "timing").locator(".count")).toHaveCount(0);
  await expect(drawer(page).locator(".tab-body")).toHaveCount(0);
  await tab(page, "root-inputs").click();
  await expect(drawer(page)).toHaveAttribute("data-open", "true");
  await expect(drawer(page)).toHaveAttribute("data-tab", "root-inputs");
  await expect(drawer(page).locator(".tab-body table.root-inputs tr.root-input")).toHaveCount(3);
  await tab(page, "root-inputs").click();
  await expect(drawer(page)).toHaveAttribute("data-open", "false");
});

test("closed_loop: the tree splitter's drag is kept across a reload and a new drop", async ({ page }) => {
  await drop(page, "closed_loop");
  const before = (await treePane(page).boundingBox())!.width;
  const s = (await page.locator('.splitter[data-pane="tree"]').boundingBox())!;
  const y = s.y + s.height / 2, x = s.x + s.width / 2;
  await page.mouse.move(x, y);
  await page.mouse.down();
  await page.mouse.move(x + 50, y, { steps: 4 });
  await page.mouse.move(x + 100, y, { steps: 4 });
  await page.mouse.up();
  const after = (await treePane(page).boundingBox())!.width;
  expect(Math.abs(after - before - 100)).toBeLessThanOrEqual(2);
  await page.reload();
  await drop(page, "descent");
  expect(Math.abs((await treePane(page).boundingBox())!.width - after)).toBeLessThanOrEqual(1);
});

test("closed_loop: the drawer splitter's drag is kept across a reload", async ({ page }) => {
  await drop(page, "closed_loop");
  await tab(page, "order").click();
  const drawerPane = page.locator('.pane[data-pane="drawer"]');
  const before = (await drawerPane.boundingBox())!.height;
  const s = (await page.locator('.splitter[data-pane="drawer"]').boundingBox())!;
  const x = s.x + s.width / 2, y = s.y + s.height / 2;
  await page.mouse.move(x, y);
  await page.mouse.down();
  await page.mouse.move(x, y - 75, { steps: 4 });
  await page.mouse.move(x, y - 150, { steps: 4 });
  await page.mouse.up();
  const after = (await drawerPane.boundingBox())!.height;
  expect(Math.abs(after - before - 150)).toBeLessThanOrEqual(2);
  await page.reload();
  await drop(page, "closed_loop");
  await tab(page, "order").click();
  expect(Math.abs((await drawerPane.boundingBox())!.height - after)).toBeLessThanOrEqual(2);
});

test("closed_loop: the detail pane collapses to its strip, kept across a reload, and expands", async ({ page }) => {
  await drop(page, "closed_loop");
  await expect(detailPane(page)).not.toHaveClass(/\bcollapsed\b/);
  await page.locator('button.collapse[data-pane="detail"]').click();
  await expect(detailPane(page)).toHaveClass(/\bcollapsed\b/);
  await expect(page.locator("aside.detail")).toHaveCount(0);
  await page.reload();
  await drop(page, "closed_loop");
  await expect(detailPane(page)).toHaveClass(/\bcollapsed\b/);
  await shot(page, "closed_loop", "", "frame-collapsed");
  await page.locator('button.collapse[data-pane="detail"]').click();
  await expect(detailPane(page)).not.toHaveClass(/\bcollapsed\b/);
  await expect(page.locator("aside.detail")).toHaveCount(1);
});

test("closed_loop_deployment reads deployment", async ({ page }) => {
  await drop(page, "closed_loop_deployment");
  await expect(status(page)).toHaveAttribute("data-kind", "deployment");
  await expect(status(page)).toContainText("deployment");
});

test("failure_cycle reads failure and opens the drawer on its one diagnostic", async ({ page }) => {
  await drop(page, "failure_cycle");
  await expect(status(page)).toHaveAttribute("data-kind", "failure");
  await expect(drawer(page)).toHaveAttribute("data-open", "true");
  await expect(drawer(page)).toHaveAttribute("data-tab", "diagnostics");
  await expect(tab(page, "diagnostics").locator(".count")).toHaveText("1");
  await expect(tab(page, "order").locator(".count")).toHaveCount(0);
});

test("a minor 1 copy of descent shows the note in the status bar", async ({ page }) => {
  const d = JSON.parse(fixtureText("descent"));
  d.format_version = { major: 1, minor: 1 };
  await drop(page, "descent", JSON.stringify(d));
  await expect(status(page).locator(".note")).toContainText("format 1.1");
});

test("closed_loop: Shift-q and Shift-e collapse and expand the tree and the detail pane, kept across a reload; collapsing the pane holding the focus moves it to the canvas; the retired m and i do nothing", async ({ page }) => {
  await drop(page, "closed_loop");
  const collapsed = /\bcollapsed\b/;
  const stored = () => page.evaluate(() => JSON.parse(localStorage.getItem("redstone-inspector/prefs") ?? "null")?.collapsed);
  const onCanvas = async (what: string) => {
    await expect(page.locator(".viewport.focused"), what).toHaveCount(1);
    expect(await page.evaluate(() => document.activeElement?.classList.contains("viewport")), what).toBe(true);
  };
  await press(page, "m");
  await press(page, "i");
  await expect(treePane(page)).not.toHaveClass(collapsed);
  await expect(detailPane(page)).not.toHaveClass(collapsed);

  await page.locator('nav.tree .row[data-path="plant"] .segment').click();
  await press(page, "Shift+Q");
  await expect(treePane(page)).toHaveClass(collapsed);
  await expect(page.locator("nav.tree")).toHaveCount(0);
  await onCanvas("Shift-q with the tree focused");
  await page.locator("aside.detail h2").click();
  await press(page, "Shift+E");
  await expect(detailPane(page)).toHaveClass(collapsed);
  await expect(page.locator("aside.detail")).toHaveCount(0);
  await onCanvas("Shift-e with the detail pane focused");
  expect(await stored()).toEqual({ tree: true, detail: true });
  await shot(page, "closed_loop", "", "frame-collapsed-keys");

  await page.reload();
  await drop(page, "closed_loop");
  await expect(treePane(page)).toHaveClass(collapsed);
  await expect(detailPane(page)).toHaveClass(collapsed);
  // expanding leaves the focus where it was
  await press(page, "Tab");
  await onCanvas("Tab");
  await press(page, "Shift+Q");
  await expect(treePane(page)).not.toHaveClass(collapsed);
  await press(page, "Shift+E");
  await expect(detailPane(page)).not.toHaveClass(collapsed);
  await onCanvas("after the two expanded the panes");
  expect(await stored()).toEqual({ tree: false, detail: false });
  // collapsing a pane that does not hold the focus leaves it too
  await page.locator("aside.detail h2").click();
  await press(page, "Shift+Q");
  await expect(treePane(page)).toHaveClass(collapsed);
  await expect(page.locator("aside.detail.focused")).toHaveCount(1);
});

test("closed_loop: < and > shrink and grow the focused tree, detail pane and open drawer by 40 px within the splitter's bounds, kept across a reload; with the canvas or a closed drawer focused they resize nothing and the status bar says so", async ({ page }) => {
  await drop(page, "closed_loop");
  const drawerPane = page.locator('.pane[data-pane="drawer"]');
  const width = async (pane: ReturnType<typeof treePane>) => (await pane.boundingBox())!.width;
  const sizes = () => page.evaluate(() => JSON.parse(localStorage.getItem("redstone-inspector/prefs") ?? "null")?.sizes);
  const notice = page.locator("footer.status span.notice");

  await press(page, "q");
  const tree = await width(treePane(page));
  await press(page, ">");
  expect(await width(treePane(page))).toBeCloseTo(tree + 40, 0);
  await press(page, "<");
  await press(page, "<");
  expect(await width(treePane(page))).toBeCloseTo(tree - 40, 0);
  // the tree's floor is 160: from 240 two presses reach it and a third stays
  for (let i = 0; i < 3; i++) await press(page, "<");
  expect((await sizes()).tree).toBe(160);

  await press(page, "e");
  const detail = await width(detailPane(page));
  await press(page, ">");
  expect(await width(detailPane(page))).toBeCloseTo(detail + 40, 0);

  await press(page, "s");
  await expect(drawer(page)).toHaveAttribute("data-open", "true");
  const height = (await drawerPane.boundingBox())!.height;
  await press(page, ">");
  expect((await drawerPane.boundingBox())!.height).toBeCloseTo(height + 40, 0);
  expect(await sizes()).toEqual({ tree: 160, detail: 400, drawer: 240 });
  await expect(notice).toHaveCount(0);

  // a click on the open tab closes the drawer, whose tab strip can still hold the focus
  await tab(page, (await drawer(page).getAttribute("data-tab"))!).click();
  await expect(drawer(page)).toHaveAttribute("data-open", "false");
  await page.locator("section.drawer button.tab").first().focus();
  await expect(page.locator("section.drawer.focused")).toHaveCount(1);
  await press(page, ">");
  await expect(notice).toHaveText("nothing to resize: focus the tree, the detail pane or an open drawer");
  await press(page, "w");
  await press(page, "<");
  expect(await sizes()).toEqual({ tree: 160, detail: 400, drawer: 240 });

  await page.reload();
  await drop(page, "closed_loop");
  expect(await width(detailPane(page))).toBeCloseTo(detail + 40, 0);
});

test("large: the ring stays on the pane's box while its body scrolls, for the tree, the detail pane and the drawer", async ({ page }) => {
  await drop(page, "large");
  await tab(page, "order").click();
  const cases: [string, string, string][] = [
    ["tree", '.pane[data-pane="tree"] .body', "nav.tree"],
    ["detail", '.pane[data-pane="detail"] .body', "aside.detail"],
    ["drawer", "section.drawer .tab-body", "section.drawer"],
  ];
  for (const [pane, scroller, root] of cases) {
    await page.locator(root).focus();
    await expect(page.locator(`${root}.focused`)).toHaveCount(1);
    const ring = () => page.evaluate(({ pane, root }) => {
      const p = document.querySelector(`.pane[data-pane="${pane}"]`)!, r = p.getBoundingClientRect();
      return { pane: getComputedStyle(p).outlineStyle, root: getComputedStyle(document.querySelector(root)!).outlineStyle, box: [r.x, r.y, r.width, r.height] };
    }, { pane, root });
    const before = await ring();
    expect(before.pane, pane).toBe("solid");
    expect(before.root, pane).toBe("none");
    await page.locator(scroller).evaluate((e) => e.scrollTo(0, 400));
    expect(await page.locator(scroller).evaluate((e) => e.scrollTop), pane).toBe(400);
    expect(await ring(), pane).toEqual(before);
  }
});

test("closed_loop at a narrow width: the route line ends in an ellipsis, its whole text the title under the pointer, the clear control at its right inside the bar; the counts and a notice end in an ellipsis, titled whole", async ({ page }) => {
  await page.setViewportSize({ width: 1000, height: 700 });
  await drop(page, "closed_loop");
  await page.locator('g.block[data-id="⟨in⟩h_ref"]').click();
  await press(page, "t");
  const line = status(page).locator("span.route > .line");
  await expect(line).toHaveAttribute("title", "tracing h_ref: 2 consumers across 3 levels");
  const look = await line.evaluate((l) => {
    const r = l.getBoundingClientRect(), c = getComputedStyle(l);
    const under = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2);
    return { clipped: l.scrollWidth > l.clientWidth, overflow: c.textOverflow, titled: under?.closest("[title]") === l, right: r.right };
  });
  expect(look).toEqual({ clipped: true, overflow: "ellipsis", titled: true, right: look.right });
  const [bar, clear, help] = [(await status(page).boundingBox())!, (await status(page).locator("button.clear-route").boundingBox())!, (await status(page).locator("a.help").boundingBox())!];
  expect(clear.x).toBeGreaterThanOrEqual(look.right - 0.5);
  expect(clear.x + clear.width).toBeLessThanOrEqual(bar.x + bar.width);
  expect(help.x + help.width).toBeLessThanOrEqual(bar.x + bar.width);
  await shot(page, "closed_loop", "", "status-narrow");
  await status(page).locator("button.clear-route").click();
  await expect(status(page).locator("span.route")).toHaveCount(0);

  // the counts and a notice, from t on a face with no producer, end in an ellipsis too, each titled whole
  const unfed = JSON.parse(fixtureText("closed_loop"));
  const root = unfed.build.structure.nodes[0];
  root.wires = root.wires.filter((w: any) => !(w.to.path === "plant" && w.to.port === "δe"));
  await drop(page, "closed_loop", JSON.stringify(unfed));
  await page.locator('rect.port[data-port="plant|in|δe"]').click();
  await press(page, "t");
  for (const sel of [".counts", "span.notice"]) {
    const seg = status(page).locator(sel);
    await expect(seg).toHaveCount(1);
    const { text, title, overflow } = await seg.evaluate((e) => ({ text: e.textContent!, title: e.getAttribute("title") ?? "", overflow: getComputedStyle(e).textOverflow }));
    expect(text.length).toBeGreaterThan(0);
    expect(title).toContain(text);
    expect(overflow).toBe("ellipsis");
  }
});
