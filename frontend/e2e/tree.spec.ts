// The model tree (workspace.md answer 2): rows and folders, the default
// expansion, selection shared both ways, the chevron expanding, the double-click
// opening, the open level's row, the tree's own h j k l and arrows; the polish
// batch's drawn chevron, a folder under a non-root node expanding with it, and a
// selection made while the pane is collapsed scrolled into view on expanding.
import { test, type Page } from "@playwright/test";
import { drop, expect, openPath, paneRing, press, readyLevel, rows, shot, viewBox } from "./fixtures";

const row = (page: Page, path: string) => page.locator(`nav.tree .row[data-path="${path}"]`);
const levelPath = (page: Page) => page.locator("nav.breadcrumb");
const pane = (page: Page) => page.locator("aside.detail");

test("closed_loop: seven rows with the root open; a click selects without opening, the chevron expands and collapses, a deeper row shows its parent's level, its block and row classed primitive, a block click selects its row, a double-click opens", async ({ page }) => {
  await drop(page, "closed_loop");
  await expect(rows(page)).toHaveCount(7);
  await expect(row(page, "")).toHaveClass(/\bopen\b/);
  await expect(row(page, "").locator(".segment")).toHaveText("closed_loop");
  await expect(row(page, "").locator(".name")).toHaveCount(0);
  await expect(page.locator("nav.tree .row.selected")).toHaveCount(0);

  // the root row clicked while the root is open: the level layout, no open button
  await row(page, "").click();
  await expect(row(page, "")).toHaveClass(/\bselected\b/);
  await expect(levelPath(page)).toHaveAttribute("data-level-path", "");
  await expect(pane(page)).toHaveAttribute("data-kind", "level");
  await expect(pane(page).locator("button.open-level")).toHaveCount(0);

  // the chevron expands and leaves the level alone
  await row(page, "sensing").locator("button.chevron").click();
  await expect(row(page, "sensing")).toHaveClass(/\bexpanded\b/);
  await expect(rows(page)).toHaveCount(9);
  await expect(levelPath(page)).toHaveAttribute("data-level-path", "");
  await shot(page, "closed_loop", "", "tree");

  // a click selects a closed assembly without opening it
  await row(page, "sensing").click();
  await expect(row(page, "sensing")).toHaveClass(/\bselected\b/);
  await expect(levelPath(page)).toHaveAttribute("data-level-path", "");
  await expect(pane(page)).toHaveAttribute("data-kind", "assembly");

  // a click on a deeper row shows its parent's level with its block selected
  await row(page, "sensing/noise").click();
  await page.locator(readyLevel("sensing")).waitFor();
  await expect(page.locator('g.block.selected[data-id="sensing/noise"]')).toHaveCount(1);
  await expect(row(page, "sensing/noise")).toHaveClass(/\bselected\b/);
  await expect(pane(page)).toHaveAttribute("data-kind", "primitive");
  await expect(row(page, "sensing/noise")).toHaveClass(/\bprimitive\b/);
  await expect(page.locator('g.block[data-id="sensing/noise"]')).toHaveClass(/\bprimitive\b/);

  // a block click selects its row
  await page.keyboard.press("Backspace");
  await page.locator(readyLevel("")).waitFor();
  await page.locator('g.block[data-id="plant"]').click();
  await expect(row(page, "plant")).toHaveClass(/\bselected\b/);
  await expect(page.locator("nav.tree .row.selected")).toHaveCount(1);

  // a double-click on an assembly row opens it
  await row(page, "actuators").dblclick();
  await page.locator(readyLevel("actuators")).waitFor();
  await expect(row(page, "actuators")).toHaveClass(/\bopen\b/);
  await expect(row(page, "actuators")).toHaveClass(/\bexpanded\b/);
  await expect(row(page, "")).not.toHaveClass(/\bopen\b/);
  await expect(page.locator("nav.tree .row.open")).toHaveCount(1);

  // the chevron collapses sensing: its two rows go
  const before = await rows(page).count();
  await row(page, "sensing").locator("button.chevron").click();
  await expect(row(page, "sensing")).not.toHaveClass(/\bexpanded\b/);
  await expect(rows(page)).toHaveCount(before - 2);
  await expect(row(page, "sensing/noise")).toHaveCount(0);
});

test("containers: the folder rows and the keyed rows under them", async ({ page }) => {
  await drop(page, "containers");
  await expect(rows(page)).toHaveCount(9);
  for (const f of ["gains", "pair"]) {
    await expect(row(page, f)).toHaveClass(/\bfolder\b/);
    await expect(row(page, f)).toHaveAttribute("data-depth", "1");
  }
  for (const p of ["gains/a", "gains/b", "pair/1"]) {
    await expect(row(page, p)).toHaveClass(/\bnode\b/);
    await expect(row(page, p)).toHaveAttribute("data-depth", "2");
  }
  for (const p of ["s1", "s2", "scale"]) await expect(row(page, p)).toHaveAttribute("data-depth", "1");
  const order = await rows(page).evaluateAll((rs) => rs.map((r) => (r as HTMLElement).dataset.path));
  expect(order).toEqual(["", "gains", "gains/a", "gains/b", "pair", "pair/1", "s1", "s2", "scale"]);

  await row(page, "gains").click();
  await expect(pane(page)).toHaveAttribute("data-kind", "folder");
  await expect(pane(page).locator(".facts")).toContainText("field gains");
  await expect(pane(page).locator(".keys a")).toHaveCount(2);
  // the folder's one mark on the canvas is its region's halo
  await expect(page.locator("svg.canvas .selected")).toHaveCount(1);
  await expect(page.locator('svg.canvas g.region[data-path="gains"]')).toHaveClass(/\bselected\b/);
});

test("containers: the folder taps under scale expands with scale, by the chevron, by l and by opening scale", async ({ page }) => {
  await drop(page, "containers");
  await expect(row(page, "scale")).not.toHaveClass(/\bexpanded\b/);
  await row(page, "scale").locator("button.chevron").click();
  await expect(row(page, "scale/taps")).toHaveClass(/\bexpanded\b/);
  await expect(row(page, "scale/taps")).toHaveAttribute("data-depth", "2");
  await expect(row(page, "scale/taps/c")).toHaveAttribute("data-depth", "3");
  await shot(page, "containers", "", "folder-under-node");
  // a folder collapsed by hand comes back expanded with its node
  await row(page, "scale/taps").locator("button.chevron").click();
  await expect(row(page, "scale/taps/c")).toHaveCount(0);
  await row(page, "scale").locator("button.chevron").click();
  await expect(row(page, "scale/taps")).toHaveCount(0);
  await row(page, "scale").click();
  await press(page, "l");
  await expect(row(page, "scale/taps/c")).toHaveCount(1);
  // opening scale on the canvas, with the row collapsed again
  await row(page, "scale").locator("button.chevron").click();
  await page.locator('g.block[data-id="scale"]').dblclick();
  await page.locator(readyLevel("scale")).waitFor();
  await expect(row(page, "scale/taps")).toHaveClass(/\bexpanded\b/);
  await expect(row(page, "scale/taps/c")).toHaveCount(1);
});

test("large: a selection made while the tree pane is collapsed scrolls its row into view when the pane expands", async ({ page }) => {
  await drop(page, "large");
  await press(page, "m");
  await expect(page.locator('.pane[data-pane="tree"]')).toHaveClass(/\bcollapsed\b/);
  await page.locator('g.block[data-id="b150"]').click();
  await press(page, "m");
  const body = page.locator('.pane[data-pane="tree"] .body');
  await expect(row(page, "b150")).toHaveClass(/\bselected\b/);
  await expect.poll(() => body.evaluate((e) => e.scrollTop)).toBeGreaterThan(0);
  const [b, r] = [(await body.boundingBox())!, (await row(page, "b150").boundingBox())!];
  expect(r.y).toBeGreaterThanOrEqual(b.y);
  expect(r.y + r.height).toBeLessThanOrEqual(b.y + b.height);
});

test("closed_loop: the chevron is drawn, at least 10 px tall, a quarter turn on an expanded row, with no glyph in the row's text", async ({ page }) => {
  await drop(page, "closed_loop");
  const chevron = (path: string) => row(page, path).locator("button.chevron svg");
  const box = (await chevron("sensing").boundingBox())!;
  expect(box.height).toBeGreaterThanOrEqual(10);
  expect(box.width).toBeGreaterThanOrEqual(10);
  await expect(row(page, "sensing").locator("button.chevron")).toHaveText("");
  const turn = (path: string) => row(page, path).locator("button.chevron").evaluate((b) => getComputedStyle(b).transform);
  expect(await turn("sensing")).toBe("none");
  await expect.poll(() => turn("")).toMatch(/^matrix\(0, 1, -1, 0|^matrix\(6\.\d+e-17, 1, -1, 6\.\d+e-17/);
  await shot(page, "closed_loop", "", "chevron");
});

test("rates: opening and selecting on the canvas expands, selects and marks the rows", async ({ page }) => {
  await drop(page, "rates");
  await expect(rows(page)).toHaveCount(4);
  await openPath(page, "fast/outer");
  await page.locator('g.block[data-id="fast/outer/hold"]').click();
  await expect(row(page, "fast")).toHaveClass(/\bexpanded\b/);
  await expect(row(page, "fast/outer")).toHaveClass(/\bexpanded\b/);
  await expect(row(page, "fast/outer/hold")).toHaveClass(/\bselected\b/);
  await expect(row(page, "fast/outer")).toHaveClass(/\bopen\b/);
  await expect(row(page, "fast/outer/hold")).toHaveAttribute("data-depth", "3");
});

test("rates: a block click re-expands the collapsed ancestors of its row", async ({ page }) => {
  await drop(page, "rates");
  await openPath(page, "fast/outer");
  await row(page, "fast").locator("button.chevron").click();
  await expect(row(page, "fast/outer")).toHaveCount(0);
  await page.locator('g.block[data-id="fast/outer/hold"]').click();
  await expect(row(page, "fast")).toHaveClass(/\bexpanded\b/);
  await expect(row(page, "fast/outer")).toHaveClass(/\bexpanded\b/);
  await expect(row(page, "fast/outer/hold")).toHaveClass(/\bselected\b/);
});

test("the root row reads the label: primitive alone, aircraft by its file name", async ({ page }) => {
  await drop(page, "primitive");
  await expect(rows(page)).toHaveCount(1);
  await expect(row(page, "").locator(".segment")).toHaveText("primitive");
  await expect(row(page, "").locator(".name")).toHaveCount(0);
  await drop(page, "aircraft");
  await expect(row(page, "").locator(".segment")).toHaveText("aircraft");
});

test("large: 151 rows at load, and a block click scrolls its row into view", async ({ page }) => {
  await drop(page, "large");
  await expect(rows(page)).toHaveCount(151);
  const body = page.locator('.pane[data-pane="tree"] .body');
  expect(await body.evaluate((e) => e.scrollTop)).toBe(0);
  await page.locator('g.block[data-id="b150"]').click();
  await expect(row(page, "b150")).toHaveClass(/\bselected\b/);
  await expect.poll(() => body.evaluate((e) => e.scrollTop)).toBeGreaterThan(0);
  const [b, r] = [(await body.boundingBox())!, (await row(page, "b150").boundingBox())!];
  expect(r.y).toBeGreaterThanOrEqual(b.y);
  expect(r.y + r.height).toBeLessThanOrEqual(b.y + b.height);
});

test("closed_loop: with the tree focused, j k l h walk, expand and collapse rows, Shift-j and Enter open", async ({ page }) => {
  await drop(page, "closed_loop");
  const paths = () => rows(page).evaluateAll((els) => els.map((e) => e.getAttribute("data-path")!));
  const selectedRow = page.locator("nav.tree .row.selected");
  await row(page, "").click();
  const at = await paths();
  const i = at.indexOf("sensing");
  // j and k: the next and previous visible row, selected as a click selects it
  await press(page, "j");
  await expect(selectedRow).toHaveAttribute("data-path", at[1]);
  await expect(page.locator(`svg.canvas g.block.selected[data-id="${at[1]}"]`)).toHaveCount(1);
  for (let k = 2; k <= i; k++) await press(page, "j");
  await press(page, "k");
  await expect(selectedRow).toHaveAttribute("data-path", at[i - 1]);
  await press(page, "j");
  await expect(selectedRow).toHaveAttribute("data-path", "sensing");
  // l on a collapsed assembly expands it, the level and the selection unchanged: the canvas's l stays out
  await press(page, "l");
  await expect(row(page, "sensing")).toHaveClass(/\bexpanded\b/);
  await expect(rows(page)).toHaveCount(at.length + 2);
  await expect(selectedRow).toHaveAttribute("data-path", "sensing");
  await expect(levelPath(page)).toHaveAttribute("data-level-path", "");
  // l on an expanded row steps to its first child, which shows its level as a click does
  await press(page, "l");
  const child = (await paths())[i + 1];
  await expect(selectedRow).toHaveAttribute("data-path", child);
  await expect(levelPath(page)).toHaveAttribute("data-level-path", "sensing");
  // h on a primitive steps to its parent's row; on an expanded row it collapses; then to the root's row
  await press(page, "h");
  await expect(selectedRow).toHaveAttribute("data-path", "sensing");
  await press(page, "h");
  await expect(row(page, "sensing")).not.toHaveClass(/\bexpanded\b/);
  await expect(rows(page)).toHaveCount(at.length);
  await press(page, "h");
  await expect(selectedRow).toHaveAttribute("data-path", "");
  // the root's row, expanded, collapses; collapsed, it has no row above; l expands it again
  await press(page, "h");
  await expect(rows(page)).toHaveCount(1);
  await press(page, "h");
  await expect(selectedRow).toHaveAttribute("data-path", "");
  await press(page, "l");
  await expect(rows(page)).toHaveCount(at.length);
  // Shift-j opens the selected assembly, Enter too
  for (let k = 1; k <= i; k++) await press(page, "j");
  await press(page, "Shift+J");
  await expect(levelPath(page)).toHaveAttribute("data-level-path", "sensing");
  await row(page, "actuators").click();
  await press(page, "Enter");
  await expect(levelPath(page)).toHaveAttribute("data-level-path", "actuators");
});

test("large: j walking the tree scrolls the selected row into view", async ({ page }) => {
  await drop(page, "large");
  const body = page.locator('.pane[data-pane="tree"] .body');
  await row(page, "").click();
  for (let k = 0; k < 60; k++) await press(page, "j");
  const at = (await rows(page).evaluateAll((els) => els.map((e) => e.getAttribute("data-path")!)))[60];
  await expect(page.locator("nav.tree .row.selected")).toHaveAttribute("data-path", at);
  await expect.poll(() => body.evaluate((e) => e.scrollTop)).toBeGreaterThan(0);
  const [b, r] = [(await body.boundingBox())!, (await row(page, at).boundingBox())!];
  expect(r.y).toBeGreaterThanOrEqual(b.y);
  expect(r.y + r.height).toBeLessThanOrEqual(b.y + b.height);
});

test("closed_loop: with the tree focused the arrows do what h j k l do, Down from no selection the first row, the view never panned", async ({ page }) => {
  /** The tree's state after each key: the selected row, the visible rows, the level, the view. */
  const walk = async (keys: string[]) => {
    await drop(page, "closed_loop");
    await press(page, "Tab");
    await expect(page.locator("nav.tree.focused")).toHaveCount(1);
    const out = [];
    for (const key of keys) {
      await press(page, key);
      out.push({
        key, selected: await page.locator("nav.tree .row.selected").getAttribute("data-path"),
        rows: await rows(page).evaluateAll((els) => els.map((e) => e.getAttribute("data-path"))),
        level: await levelPath(page).getAttribute("data-level-path"), view: await viewBox(page),
      });
    }
    return out;
  };
  // the first row, down to sensing, expanded, its first child (its level), back to it, collapsed, up a row
  const letters = ["j", "j", "j", "l", "l", "h", "h", "k"];
  const arrows = ["ArrowDown", "ArrowDown", "ArrowDown", "ArrowRight", "ArrowRight", "ArrowLeft", "ArrowLeft", "ArrowUp"];
  const byLetter = await walk(letters);
  const byArrow = await walk(arrows);
  expect(byArrow.map(({ key, ...s }) => s)).toEqual(byLetter.map(({ key, ...s }) => s));
  expect(byArrow[0].selected, "Down with nothing selected").toBe("");
  expect(byArrow[2].selected).toBe("sensing");
  expect(byArrow[3].rows.length, "Right expands").toBeGreaterThan(byArrow[2].rows.length);
  // on the root level the view stays as fitted: no arrow panned it
  const atRoot = byArrow.filter((s) => s.level === "");
  for (const s of atRoot) expect(s.view, s.key).toEqual(atRoot[0].view);
});

test("closed_loop: entered by a row's click, h h or Left Left collapsing the root keep the tree focused with its ring, and l then expands the root, the canvas untouched", async ({ page }) => {
  for (const back of ["h", "ArrowLeft"]) {
    await drop(page, "closed_loop");
    const all = await rows(page).count();
    await row(page, "sensing").locator(".segment").click();
    await press(page, back);
    await press(page, back);
    await expect(rows(page), back).toHaveCount(1);
    await expect(page.locator("nav.tree.focused"), back).toHaveCount(1);
    expect(await page.evaluate(() => document.activeElement?.matches("nav.tree")), back).toBe(true);
    expect(await paneRing(page, "tree"), back).toBe(true);
    await press(page, "l");
    await expect(rows(page), `${back}: l expands the root`).toHaveCount(all);
    await expect(page.locator("svg.canvas g.block.selected"), `${back}: the canvas's l stays out`).toHaveCount(0);
  }
});

test("closed_loop: after a row's click and j j no row draws a ring of its own, the tree's pane draws its ring", async ({ page }) => {
  await drop(page, "closed_loop");
  await row(page, "plant").locator(".segment").click();
  await press(page, "j");
  await press(page, "j");
  await expect(page.locator("nav.tree .row.selected")).not.toHaveAttribute("data-path", "plant");
  const outlined = await rows(page).evaluateAll((els) => els.filter((e) => getComputedStyle(e).outlineStyle !== "none").length);
  expect(outlined).toBe(0);
  expect(await paneRing(page, "tree")).toBe(true);
});
