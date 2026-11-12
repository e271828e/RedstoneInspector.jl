// The frame (workspace.md answers 1, 6, 10 and 11): the status bar's kind, totals and help link,
// the drawer's strip, counts and open rule, the splitters and the collapsed panes
// kept per browser across a reload and a new drop; `m` and `i` collapsing the side
// panes, and the ring fixed on a focused pane's box while its body scrolls (increment 8b).
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

test("closed_loop: m and i collapse and expand the tree and the detail pane, kept across a reload; collapsing the pane holding the focus moves it to the canvas; Shift-m and Shift-i do nothing", async ({ page }) => {
  await drop(page, "closed_loop");
  const collapsed = /\bcollapsed\b/;
  const stored = () => page.evaluate(() => JSON.parse(localStorage.getItem("redstone-inspector/prefs") ?? "null")?.collapsed);
  const onCanvas = async (what: string) => {
    await expect(page.locator(".viewport.focused"), what).toHaveCount(1);
    expect(await page.evaluate(() => document.activeElement?.classList.contains("viewport")), what).toBe(true);
  };
  await press(page, "Shift+M");
  await press(page, "Shift+I");
  await expect(treePane(page)).not.toHaveClass(collapsed);
  await expect(detailPane(page)).not.toHaveClass(collapsed);

  await page.locator('nav.tree .row[data-path="plant"] .segment').click();
  await press(page, "m");
  await expect(treePane(page)).toHaveClass(collapsed);
  await expect(page.locator("nav.tree")).toHaveCount(0);
  await onCanvas("m with the tree focused");
  await page.locator("aside.detail h2").click();
  await press(page, "i");
  await expect(detailPane(page)).toHaveClass(collapsed);
  await expect(page.locator("aside.detail")).toHaveCount(0);
  await onCanvas("i with the detail pane focused");
  expect(await stored()).toEqual({ tree: true, detail: true });
  await shot(page, "closed_loop", "", "frame-collapsed-keys");

  await page.reload();
  await drop(page, "closed_loop");
  await expect(treePane(page)).toHaveClass(collapsed);
  await expect(detailPane(page)).toHaveClass(collapsed);
  // expanding leaves the focus where it was
  await press(page, "Tab");
  await onCanvas("Tab");
  await press(page, "m");
  await expect(treePane(page)).not.toHaveClass(collapsed);
  await press(page, "i");
  await expect(detailPane(page)).not.toHaveClass(collapsed);
  await onCanvas("after m and i expanded the panes");
  expect(await stored()).toEqual({ tree: false, detail: false });
  // collapsing a pane that does not hold the focus leaves it too
  await page.locator("aside.detail h2").click();
  await press(page, "m");
  await expect(treePane(page)).toHaveClass(collapsed);
  await expect(page.locator("aside.detail.focused")).toHaveCount(1);
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
