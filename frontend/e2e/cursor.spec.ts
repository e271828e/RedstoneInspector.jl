// The cursor in the panes (workspace.md answer 11, the keyboard session's rulings 7 to 28): the browser's focus on a
// stop of the detail pane or the drawer, walked by h j k l and the arrows; Enter pressing it; a click putting it there;
// its ring; what keeps it across a redraw and a push, and the region's root once it is removed. Then the keys of the
// other families by region: q w e s and Q E S, gg and G, gt and gT, zz, z with h j k l, d and u, / in the drawer, and
// the right-click menu's entry. The prefixes themselves are keys.spec.ts's.
import { test, type Page } from "@playwright/test";
import { clickWire, cursor, drop, dropOver, expect, fixtureText, openPath, openSection, press, pressAll, readyLevel, section, SCROLL_STEP, shot, status, viewBox } from "./fixtures";

const drawer = (page: Page) => page.locator("section.drawer");
const pane = (page: Page) => page.locator("aside.detail");
const body = (page: Page, region: "tree" | "detail" | "drawer") =>
  page.locator(region === "drawer" ? "section.drawer .tab-body" : `.pane[data-pane="${region}"] .body`);
const top = (page: Page, region: "tree" | "detail" | "drawer") => body(page, region).evaluate((e) => e.scrollTop);
/** Keys pressed one after another, the cursor read after each. */
async function walk(page: Page, ...keys: string[]): Promise<string[]> {
  const out: string[] = [];
  for (const k of keys) {
    await press(page, k);
    out.push(await cursor(page));
  }
  return out;
}
const pickBlock = (page: Page, id: string) => page.locator(`g.block[data-id="${id}"]`).click();
/** The drawer opened on a tab by its button, its root then focused. */
async function openTab(page: Page, tab: string) {
  await page.locator(`section.drawer button.tab[data-tab="${tab}"]`).click();
  await page.locator("section.drawer").focus();
}
/** How far the middle of the element named, the focused one for none, lies from its scroller's. */
const offMiddle = (page: Page, sel: string, region: "tree" | "detail" | "drawer") => page.evaluate(([sel, s]) => {
  const e = (sel ? document.querySelector(sel)! : document.activeElement!).getBoundingClientRect(), b = document.querySelector(s)!.getBoundingClientRect();
  return Math.abs(e.top + e.height / 2 - b.top - b.height / 2);
}, [sel, region === "drawer" ? "section.drawer .tab-body" : `.pane[data-pane="${region}"] .body`] as const);

test("the detail pane's stops are an outline: j and k walk them, the first taken when none is focused; l opens a heading, steps in and along a row's links; h comes back out and collapses; the arrows do the same, with Shift too", async ({ page }) => {
  await drop(page, "closed_loop");
  await pickBlock(page, "plant");
  for (const first of ["j", "k", "ArrowDown", "ArrowUp"]) {
    await pane(page).focus();
    expect(await walk(page, first), first).toEqual(["button.copy Copy"]);
  }
  await pane(page).focus();
  // h and l have nothing to move with no stop focused
  expect(await walk(page, "h", "l")).toEqual(["detail", "detail"]);
  expect(await walk(page, "j", "j", "j", "j", "j", "j", "j")).toEqual([
    "button.copy Copy", "docstring", "locations", "parameters", "faces", "button.row δe", "button.row δt",
  ]);
  expect(await walk(page, "k", "k", "k")).toEqual(["button.row δe", "faces", "parameters"]);
  // an open heading without a row: nothing to step into (ruling 26)
  expect(await walk(page, "l")).toEqual(["parameters"]);
  // a closed heading opens, the cursor staying, then l steps to its first row
  expect(await walk(page, "k", "l")).toEqual(["locations", "locations"]);
  await expect(section(page, "locations")).toHaveAttribute("open");
  const [row] = await walk(page, "l");
  expect(row).toContain("button.location ");
  // from a row h goes to its heading and folds nothing; from the heading it collapses
  expect(await walk(page, "h")).toEqual(["locations"]);
  await expect(section(page, "locations")).toHaveAttribute("open");
  expect(await walk(page, "h")).toEqual(["locations"]);
  await expect(section(page, "locations")).not.toHaveAttribute("open");
  expect(await walk(page, "h")).toEqual(["locations"]);
  await expect(section(page, "locations")).not.toHaveAttribute("open");
  // a closed section's rows are no stops
  expect(await walk(page, "j")).toEqual(["parameters"]);
  // the arrows, and with Shift
  expect(await walk(page, "ArrowDown", "Shift+ArrowDown", "Shift+ArrowUp", "ArrowRight", "ArrowRight", "ArrowLeft", "ArrowLeft")).toEqual([
    "faces", "button.row δe", "faces", "button.row δe", "a.producer actuators/δe_lag/y", "button.row δe", "faces",
  ]);
  // nothing selected elsewhere, nothing opened
  await expect(page.locator("g.block.selected")).toHaveAttribute("data-id", "plant");
  await expect(page.locator("svg.canvas")).toHaveAttribute("data-level", "");
});

test("a face's links are apart from the walk: l and h move along them and stop at the last and at the row; j and k from a link go on from its row", async ({ page }) => {
  await drop(page, "closed_loop");
  await pickBlock(page, "plant");
  const rows = await pane(page).locator("table.faces tbody tr").evaluateAll((trs) => trs.map((tr) => ({
    name: tr.querySelector(".face-name")!.textContent!, links: [...tr.querySelectorAll("td.links a")].map((a) => a.textContent!),
  })));
  const i = rows.findIndex((r) => r.links.length > 2);
  expect(i, "a face with three consumers or more").toBeGreaterThan(0);
  const { name, links } = rows[i];
  const button = pane(page).locator(`table.faces tr:nth-child(${i + 1}) button.row`);
  await button.focus();
  const along = links.map((l) => `a.consumer ${l}`);
  expect(await walk(page, ...links.map(() => "l"), "l")).toEqual([...along, along.at(-1)]);
  expect(await walk(page, ...links.map(() => "h"))).toEqual([...along.slice(0, -1).reverse(), `button.row ${name}`]);
  await pressAll(page, "l", "l");
  expect(await walk(page, "j")).toEqual([`button.row ${rows[i + 1].name}`]);
  await button.focus();
  await pressAll(page, "l", "l");
  expect(await walk(page, "k")).toEqual([`button.row ${rows[i - 1].name}`]);
});

test("a docstring's links are stops in reading order (ruling 10); a frames table's rows are none (ruling 26)", async ({ page }) => {
  await drop(page, "library_deployment");
  await pickBlock(page, "integrator");
  await section(page, "docstring").locator("summary").focus();
  expect(await walk(page, "l")).toEqual(["docstring"]);
  const links = await section(page, "docstring").locator("div.docstring a").evaluateAll((as) => as.map((a) => a.textContent!));
  expect(links).toHaveLength(14);
  const walked = await walk(page, ...links.map(() => "j"));
  expect(walked.map((w) => w.split(" ").slice(1).join(" "))).toEqual(links.map((l) => l.replace(/\s+/g, " ")));
  expect(await walk(page, "l", "h")).toEqual([walked.at(-1), "docstring"]);
  await pickBlock(page, "d_pid");
  await openSection(page, "timing");
  await section(page, "timing").locator("summary").focus();
  expect(await walk(page, "l", "j")).toEqual(["timing", "parameters"]);
});

test("a wire's, a pin's and a folder's panes hold flat stops, l and h moving nothing there", async ({ page }) => {
  await drop(page, "closed_loop");
  await clickWire(page, "sensing|in|h");
  await pane(page).focus();
  expect(await walk(page, "j", "j", "j", "j", "l", "h")).toEqual([
    "button.trace Trace", "a.producer plant/h", ...Array(4).fill("a.consumer sensing/altimeter/in1"),
  ]);
  await drop(page, "containers");
  await page.locator("nav.tree .row.folder").first().click();
  await pane(page).focus();
  expect(await walk(page, "j")).toEqual(["button.copy Copy"]);
  const keys = await pane(page).locator(".keys a").allTextContents();
  expect((await walk(page, ...keys.map(() => "j"), "l", "h")).map((w) => w.split(" ")[1])).toEqual([...keys, keys.at(-1), keys.at(-1)]);
});

test("Enter presses the focused stop and never opens the selected assembly, which Shift-j does; with no stop focused Enter opens it", async ({ page }) => {
  await drop(page, "closed_loop");
  const level = page.locator("svg.canvas");
  await pickBlock(page, "sensing");
  await pane(page).focus();
  // a heading
  await walk(page, "j", "j", "j");
  expect(await cursor(page)).toBe("signature");
  await press(page, "Enter");
  await expect(section(page, "signature")).toHaveAttribute("open");
  await expect(level).toHaveAttribute("data-level", "");
  // a face's row selects its port, whose pane has no such row, so the cursor falls to the pane
  await pane(page).locator("table.faces button.row").first().focus();
  await press(page, "Enter");
  await expect(pane(page)).toHaveAttribute("data-kind", "port");
  expect(await cursor(page)).toBe("detail");
  // a link
  await walk(page, "j", "j", "j");
  expect(await cursor(page)).toMatch(/^a\.(producer|consumer) /);
  await press(page, "Enter");
  await expect(pane(page)).not.toHaveAttribute("data-id", "sensing|in|h");
  // a drawer's row, the selected assembly left closed
  await page.locator('nav.breadcrumb a[data-path=""], nav.breadcrumb .current').first().click();
  await openTab(page, "root-inputs");
  await pickBlock(page, "sensing");
  await drawer(page).focus();
  await press(page, "j");
  await press(page, "Enter");
  await expect(page.locator('g.block.selected[data-id="⟨in⟩h_ref"]')).toHaveCount(1);
  await expect(level).toHaveAttribute("data-level", "");
  expect(await cursor(page)).toMatch(/^button\.row /);
  // a pane's root holds no stop
  await pickBlock(page, "sensing");
  await drawer(page).focus();
  await press(page, "Enter");
  await page.locator(readyLevel("sensing")).waitFor();
});

test("the cursor stays on its heading, the very element, through Shift-j, Shift-k, Escape, a new selection and a push (ruling 25), and falls to the pane where the new pane has no such stop", async ({ page }) => {
  await drop(page, "closed_loop");
  await pickBlock(page, "sensing");
  const heading = section(page, "locations").locator("summary");
  await heading.focus();
  await heading.evaluate((e) => { (e as any).__marked = true; });
  const kept = async (what: string) => expect(await page.evaluate(() => (document.activeElement as any).__marked === true), what).toBe(true);
  await press(page, "Shift+J");
  await page.locator(readyLevel("sensing")).waitFor();
  await expect(pane(page)).toHaveAttribute("data-kind", "level");
  await kept("Shift-j");
  await press(page, "Shift+K");
  await page.locator(readyLevel("")).waitFor();
  await expect(pane(page)).toHaveAttribute("data-kind", "assembly");
  await kept("Shift-k");
  await press(page, "Escape");
  await expect(pane(page)).toHaveAttribute("data-kind", "level");
  await kept("Escape");
  await page.evaluate(() => document.querySelector('svg.canvas g.block[data-id="plant"]')!.dispatchEvent(new MouseEvent("click", { bubbles: true })));
  await expect(pane(page)).toHaveAttribute("data-kind", "primitive");
  await kept("a primitive selected");
  await dropOver(page, "closed_loop_deployment");
  await expect(status(page)).toHaveAttribute("data-kind", "deployment");
  await expect(pane(page)).toHaveAttribute("data-id", "plant");
  await kept("a push");
  await page.evaluate(() => document.querySelector('svg.canvas g.block[data-id="⟨in⟩mode"]')!.dispatchEvent(new MouseEvent("click", { bubbles: true })));
  await expect(pane(page)).toHaveAttribute("data-kind", "pin");
  expect(await cursor(page)).toBe("detail");
  await expect(page.locator("aside.detail.focused")).toHaveCount(1);
});

test("a face's row keeps the cursor through n to a node holding the face in another order, and through a push that reorders the faces; the focus stays in the pane", async ({ page }) => {
  await drop(page, "closed_loop");
  await press(page, "/");
  await page.keyboard.type("path:_controller type:group");
  await press(page, "Enter");
  await expect(pane(page)).toHaveAttribute("data-id", "pid_controller");
  await press(page, "e");
  for (let i = 0; i < 30 && (await cursor(page)) !== "button.row h_ref"; i++) await press(page, "j");
  expect(await cursor(page)).toBe("button.row h_ref");
  const order = () => pane(page).locator("td.face-name button.row").allTextContents();
  const before = await order();
  await press(page, "n");
  await expect(pane(page)).toHaveAttribute("data-id", "lqr_controller");
  expect((await order()).indexOf("h_ref"), "the face moved").not.toBe(before.indexOf("h_ref"));
  expect(await cursor(page)).toBe("button.row h_ref");
  await expect(page.locator("aside.detail.focused")).toHaveCount(1);
  // a push with lqr_controller's inputs reversed
  const d = JSON.parse(fixtureText("closed_loop"));
  d.build.structure.nodes.find((n: { path: string }) => n.path === "lqr_controller").inputs.reverse();
  const reordered = await order();
  await dropOver(page, "closed_loop", JSON.stringify(d));
  await expect.poll(async () => (await order()).indexOf("h_ref")).not.toBe(reordered.indexOf("h_ref"));
  expect(await cursor(page)).toBe("button.row h_ref");
  await expect(page.locator("aside.detail.focused")).toHaveCount(1);
});

test("the drawer's stops: j and k walk the rows, h and l the controls on one, a diagnostic's location and a chart row's swatches among them; the sort button is a row of its own, the filter and the tabs no stops, a timing row with no target none", async ({ page }) => {
  await drop(page, "failure_probe");
  await drawer(page).focus();
  const rows = await page.locator("li.diagnostic button.row").evaluateAll((b) => b.map((e) => `button.row ${e.textContent!.trim().replace(/\s+/g, " ")}`));
  const links = await page.locator("li.diagnostic a.location").evaluateAll((a) => a.map((e) => `a.location ${e.textContent}`));
  expect([rows.length, links.length]).toEqual([2, 2]);
  expect(await walk(page, "j", "k", "h", "l", "l", "j", "l", "k", "j", "l", "h", "j")).toEqual([
    rows[0], rows[0], rows[0], links[0], links[0], rows[1], links[1], rows[0], rows[1], links[1], rows[1], rows[1],
  ]);

  await drop(page, "library_deployment");
  await openTab(page, "timing");
  const firsts = await drawer(page).locator(".swatches > button:first-child").evaluateAll((b) => b.map((e) => `swatch ${(e as HTMLElement).dataset.key}`));
  expect(firsts[1]).toBe("swatch 0,2,0");
  // the second row's two swatches
  expect(await walk(page, "j", "j", "l", "l", "h", "l", "k", "j", "l", "j")).toEqual([
    firsts[0], firsts[1], "swatch 2,1,0", "swatch 2,1,0", firsts[1], "swatch 2,1,0", firsts[0], firsts[1], "swatch 2,1,0", firsts[2],
  ]);

  // the whole tab's walk is the swatches' first of each row, the rows with a button and the sort button, in the page's order
  await drop(page, "timing_deployment");
  await openTab(page, "timing");
  const order = await page.locator("section.drawer .tab-body").evaluate((b) =>
    [...b.querySelectorAll(".swatches > button:first-child, button.row, button.sort-period")].map((e) => e.className.split(" ")[0] + (e.getAttribute("data-key") ?? "") + e.textContent!.trim()));
  expect(order.filter((o) => o.startsWith("sort-period"))).toHaveLength(1);
  const name = () => page.evaluate(() => { const e = document.activeElement!; return e.className.split(" ")[0] + (e.getAttribute("data-key") ?? "") + e.textContent!.trim(); });
  const walked: string[] = [];
  for (let i = 0; i < order.length; i++) {
    await press(page, "j");
    walked.push(await name());
  }
  expect(walked).toEqual(order);
  await press(page, "j");
  expect(await name(), "nothing past the last").toBe(order.at(-1));

  await openTab(page, "order");
  const steps = await page.locator("section.drawer .tab-body button.row").evaluateAll((b) => b.map((e) => `button.row ${e.textContent!.trim().replace(/\s+/g, " ")}`));
  expect(await walk(page, ...steps.map(() => "j")), "edges are rows of their own").toEqual(steps);
});

test("a click puts the cursor on the stop, and on a row's stop when it lands elsewhere on the row; the stop then shows the ring, as it does for a key (ruling 24)", async ({ page }) => {
  const ring = () => page.evaluate(() => getComputedStyle(document.activeElement!).outlineStyle + " " + getComputedStyle(document.activeElement!).outlineColor);
  await drop(page, "closed_loop");
  await pickBlock(page, "plant");
  const hue = await page.locator("aside.detail").evaluate((e) => {
    const s = document.createElement("i");
    s.style.color = "var(--highlight)";
    e.append(s);
    const c = getComputedStyle(s).color;
    s.remove();
    return `solid ${c}`;
  });
  await section(page, "docstring").locator("summary h3").click();
  expect([await cursor(page), await ring()]).toEqual(["docstring", hue]);
  await openSection(page, "locations");
  await section(page, "locations").locator("summary").click();
  expect([await cursor(page), await ring()]).toEqual(["locations", hue]);
  await shot(page, "closed_loop", "", "cursor-heading");
  await press(page, "j");
  expect([await cursor(page), await ring()]).toEqual(["parameters", hue]);
  // the location's button is block-wide; a click on its text
  await section(page, "locations").locator("summary").click();
  await pane(page).locator("button.location .file-name").first().click();
  expect([await cursor(page), await ring()]).toEqual([expect.stringContaining("button.location "), hue]);

  await openTab(page, "root-inputs");
  await page.locator('tr.root-input[data-name="mode"] td.kind').click();
  expect([await cursor(page), await ring()]).toEqual(["button.row mode", hue]);
  await shot(page, "closed_loop", "", "cursor-row");
  await expect(page.locator('g.block.selected[data-id="⟨in⟩mode"]')).toHaveCount(1);
  await press(page, "k");
  expect(await cursor(page)).toBe("button.row V_ref");
  await openTab(page, "order");
  await page.locator("section.order-group li.step li.port").first().click();
  const first = await page.locator("section.order-group li.step button.row").first().evaluate((e) => e.textContent!.trim());
  expect(await cursor(page)).toBe(`button.row ${first}`);
  // an edge's row, off its button
  const edge = page.locator("section.order-group li.edge").first();
  await edge.dispatchEvent("click");
  expect(await cursor(page)).toBe(`button.row ${(await edge.locator("button.row").textContent())!.trim().replace(/\s+/g, " ")}`);
  // a row cut at the body's top edge: the click's focus scrolls nothing
  const line = page.locator("section.order-group li.step .line").nth(6);
  await body(page, "drawer").evaluate((b, y) => { b.scrollTop += y; }, await line.evaluate((l) => {
    const b = l.closest(".tab-body")!.getBoundingClientRect();
    return l.getBoundingClientRect().top - b.top + 6;
  }));
  const scrolled = await top(page, "drawer");
  // by the pointer, since a locator's click scrolls its target whole first
  const port = (await line.locator("li.port").first().boundingBox())!;
  await page.mouse.click(port.x + port.width / 2, port.y + port.height - 3);
  expect(await cursor(page)).toContain("button.row ");
  expect(await top(page, "drawer")).toBe(scrolled);
  // the diagnostics tab's location link, the row left unfocused
  await drop(page, "failure_probe");
  await page.locator("li.diagnostic a.location").first().click();
  expect([await cursor(page), await ring()]).toEqual([expect.stringContaining("a.location "), hue]);
  // a click on no stop puts the cursor on none
  await page.locator("section.drawer .strip").click({ position: { x: 900, y: 8 } });
  expect(await cursor(page)).toBe("drawer");
});

test("a click on a face's row elsewhere than its name selects the face, the cursor falling to the pane its row leaves", async ({ page }) => {
  await drop(page, "closed_loop");
  await pickBlock(page, "plant");
  await pane(page).locator("table.faces tr .face-type").first().click();
  await expect(pane(page)).toHaveAttribute("data-kind", "port");
  expect(await cursor(page)).toBe("detail");
  // on the face's name, its button (ruling 28)
  await pickBlock(page, "plant");
  await pane(page).locator("td.face-name button.row").first().click();
  await expect(pane(page)).toHaveAttribute("data-kind", "port");
  expect(await cursor(page)).toBe("detail");
});

test("a chart swatch's ring lies outside the pressed swatch's, so both show", async ({ page }) => {
  await drop(page, "closed_loop_deployment");
  await openTab(page, "timing");
  await pressAll(page, "j", " ", "l");
  const style = (n: number) => page.locator("button.swatch").nth(n).evaluate((e) => {
    const s = getComputedStyle(e);
    return { pressed: s.boxShadow !== "none", ring: s.outlineStyle, offset: s.outlineOffset };
  });
  expect(await style(0)).toMatchObject({ pressed: true, ring: "none" });
  expect(await style(1)).toEqual({ pressed: false, ring: "solid", offset: "3px" });
  await press(page, "h");
  expect(await style(0)).toEqual({ pressed: true, ring: "solid", offset: "3px" });
  await shot(page, "closed_loop_deployment", "", "cursor-swatch");
});

test("a stop scrolled to by the cursor lies whole in its pane, its ring included", async ({ page }) => {
  await drop(page, "large");
  await openTab(page, "order");
  for (let i = 0; i < 12; i++) await press(page, "j");
  const inside = () => page.evaluate(() => {
    const e = document.activeElement!.getBoundingClientRect(), b = document.querySelector("section.drawer .tab-body")!.getBoundingClientRect();
    return e.top - 3 >= b.top && e.bottom + 3 <= b.bottom;
  });
  expect(await top(page, "drawer")).toBeGreaterThan(0);
  expect(await inside()).toBe(true);
  await pressAll(page, "Shift+G");
  expect(await inside()).toBe(true);
  await press(page, "k");
  expect(await inside()).toBe(true);
});

test("q w e s focus the tree, the canvas, the detail pane and the drawer from any region, a collapsed pane expanding and a closed drawer opening first; a cursor already there stays", async ({ page }) => {
  await drop(page, "closed_loop");
  const roots: [string, string][] = [["q", "tree"], ["w", "canvas"], ["e", "detail"], ["s", "drawer"]];
  for (const [from] of roots) {
    for (const [key, where] of roots) {
      await press(page, from);
      expect(await walk(page, key), `${key} after ${from}`).toEqual([where]);
    }
  }
  await expect(drawer(page)).toHaveAttribute("data-open", "true");
  // hidden: each shows first, and Q, E and S hide it, the focus it held going to the canvas
  for (const [key, where] of [["q", "tree"], ["e", "detail"], ["s", "drawer"]]) {
    await press(page, key);
    expect(await walk(page, `Shift+${key.toUpperCase()}`), `Shift-${key}`).toEqual(["canvas"]);
    await expect(page.locator(`.pane[data-pane="${where}"]`)).toHaveClass(/\bcollapsed\b/);
    expect(await walk(page, key)).toEqual([where]);
    await expect(page.locator(`.pane[data-pane="${where}"]`)).not.toHaveClass(/\bcollapsed\b/);
  }
  // a region's own key keeps the cursor on its stop, and leaves a control that is none for the root
  await press(page, "e");
  expect(await walk(page, "j", "e")).toEqual(["button.copy Copy", "button.copy Copy"]);
  await page.locator('section.drawer button.tab[data-tab="order"]').focus();
  expect(await walk(page, "s")).toEqual(["drawer"]);
  // Shift-w is no key, and none acts in a text field
  await press(page, "Shift+W");
  expect(await cursor(page)).toBe("drawer");
  await press(page, "ControlOrMeta+k");
  for (const k of ["q", "w", "e", "s"]) await page.keyboard.type(k);
  await expect(page.locator("input.query")).toHaveValue("qwes");
});

test("gg and G reach the tree's first and last visible row, a pane's first and last stop, and nothing on the canvas", async ({ page }) => {
  await drop(page, "closed_loop");
  await pickBlock(page, "sensing");
  const view = await viewBox(page);
  await pressAll(page, "Shift+G", "g", "g");
  await expect(page.locator("g.block.selected")).toHaveAttribute("data-id", "sensing");
  expect(await viewBox(page)).toEqual(view);
  await press(page, "q");
  await press(page, "Shift+G");
  await expect(page.locator("nav.tree .row").last()).toHaveClass(/\bselected\b/);
  await pressAll(page, "g", "g");
  await expect(page.locator("nav.tree .row").first()).toHaveClass(/\bselected\b/);
  await pickBlock(page, "plant");
  await press(page, "e");
  const faces = pane(page).locator("table.faces button.row");
  expect(await walk(page, "Shift+G", "g", "g")).toEqual([`button.row ${await faces.last().textContent()}`, expect.any(String), "button.copy Copy"]);
  await openTab(page, "order");
  const rows = page.locator("section.drawer .tab-body button.row");
  await press(page, "Shift+G");
  expect(await rows.last().evaluate((e) => e === document.activeElement)).toBe(true);
  await pressAll(page, "g", "g");
  expect(await rows.first().evaluate((e) => e === document.activeElement)).toBe(true);
  // the last row, not the location under it
  await drop(page, "failure_probe");
  await drawer(page).focus();
  expect((await walk(page, "Shift+G"))[0]).toContain("button.row EmptyFaceSelection");
});

test("gg and G scroll the tree's first and last row into view when it is already selected, as they do a pane's stop", async ({ page }) => {
  await page.setViewportSize({ width: 1600, height: 360 });
  await drop(page, "large");
  await press(page, "q");
  const inView = () => page.evaluate(() => {
    const r = document.querySelector("nav.tree .row.selected")!.getBoundingClientRect();
    const b = document.querySelector('.pane[data-pane="tree"] .body')!.getBoundingClientRect();
    return r.top >= b.top - 1 && r.bottom <= b.bottom + 1;
  });
  expect(await body(page, "tree").evaluate((e) => e.scrollHeight > e.clientHeight + 60)).toBe(true);
  for (const [keys, away] of [[["g", "g"], "bottom"], [["Shift+G"], "top"]] as const) {
    await pressAll(page, ...keys);
    expect(await inView(), keys.join("")).toBe(true);
    await body(page, "tree").evaluate((e, away) => e.scrollTo(0, away === "top" ? 0 : e.scrollHeight), away);
    expect(await inView(), `${keys.join("")} scrolled away`).toBe(false);
    await pressAll(page, ...keys);
    expect(await inView(), `${keys.join("")} again`).toBe(true);
  }
});

test("gt and gT step the drawer's tabs, wrapping, from any region, the focus staying; a closed drawer opens on its current tab; a stop the switch removes gives the focus to the drawer", async ({ page }) => {
  await drop(page, "closed_loop");
  await press(page, "q");
  const tabs = ["diagnostics", "root-inputs", "timing", "order", "events"];
  await expect(drawer(page)).toHaveAttribute("data-open", "false");
  await pressAll(page, "g", "t");
  await expect(drawer(page)).toHaveAttribute("data-open", "true");
  await expect(drawer(page)).toHaveAttribute("data-tab", "diagnostics");
  for (const tab of [...tabs.slice(1), "diagnostics"]) {
    await pressAll(page, "g", "t");
    await expect(drawer(page)).toHaveAttribute("data-tab", tab);
    expect(await cursor(page)).toBe("tree");
  }
  for (const tab of [...tabs].reverse()) {
    await pressAll(page, "g", "Shift+T");
    await expect(drawer(page)).toHaveAttribute("data-tab", tab);
  }
  await pressAll(page, "g", "t");
  await press(page, "s");
  expect(await walk(page, "j")).toEqual(["button.row h_ref"]);
  await pressAll(page, "g", "t");
  await expect(drawer(page)).toHaveAttribute("data-tab", "timing");
  await expect.poll(() => cursor(page)).toBe("drawer");
  await expect(page.locator("section.drawer.focused")).toHaveCount(1);
});

test("z with h j k l scrolls the focused pane by the step, the tree's selection and a pane's cursor staying; d and u scroll it by half its height", async ({ page }) => {
  await drop(page, "large");
  await page.locator("nav.tree .row").nth(3).click();
  await openSection(page, "faces");
  await openTab(page, "order");
  for (const [key, region] of [["q", "tree"], ["e", "detail"], ["s", "drawer"]] as const) {
    await press(page, key);
    if (region !== "tree") await press(page, "j");
    const before = [await cursor(page), await page.locator("nav.tree .row.selected").getAttribute("data-path")];
    // a tall child in each pane, whatever its own content
    await body(page, region).evaluate((e) => { const d = document.createElement("div"); d.style.cssText = "height: 4000px; flex: none"; e.append(d); e.scrollTop = 0; });
    const view = await viewBox(page);
    await pressAll(page, "z", "j", "z", "j", "z", "k");
    expect(await top(page, region), region).toBe(SCROLL_STEP);
    const half = await body(page, region).evaluate((e) => e.clientHeight / 2);
    await press(page, "d");
    expect(Math.abs((await top(page, region)) - SCROLL_STEP - half), `${region} d`).toBeLessThanOrEqual(1);
    await press(page, "u");
    expect(Math.abs((await top(page, region)) - SCROLL_STEP), `${region} u`).toBeLessThanOrEqual(1);
    expect([await cursor(page), await page.locator("nav.tree .row.selected").getAttribute("data-path")], region).toEqual(before);
    expect(await viewBox(page)).toEqual(view);
  }
});

test("zz brings the selected row or the focused stop to the middle of its pane, and nothing on the canvas moves; zi and zo zoom it from a pane", async ({ page }) => {
  await drop(page, "large");
  await page.locator("nav.tree .row").nth(60).click();
  const view = await viewBox(page);
  await body(page, "tree").evaluate((e) => { e.scrollTop = 0; });
  await pressAll(page, "z", "z");
  expect(await offMiddle(page, "nav.tree .row.selected", "tree")).toBeLessThanOrEqual(1);
  await openTab(page, "order");
  for (let i = 0; i < 30; i++) await press(page, "j");
  expect(await offMiddle(page, "", "drawer")).toBeGreaterThan(20);
  await pressAll(page, "z", "z");
  expect(await offMiddle(page, "", "drawer")).toBeLessThanOrEqual(1);
  // the frame itself never scrolls
  expect(await page.evaluate(() => [...document.querySelectorAll("html, .frame, .center")].every((e) => e.scrollTop === 0))).toBe(true);
  // the drawer's opening shrank the canvas; its scale and place stand
  const now = await viewBox(page);
  expect([now.x, now.y, now.width]).toEqual([view.x, view.y, view.width]);
  await pressAll(page, "z", "i");
  expect((await viewBox(page)).width).toBeCloseTo(view.width / 1.25, 3);
  await pressAll(page, "z", "o");
  expect((await viewBox(page)).width).toBeCloseTo(view.width, 3);
});

test("/ in the drawer on its diagnostics tab goes to the filter, its text selected; Escape gives the focus back to the drawer and keeps the text; with no filter shown / is the model's search, as Cmd-K is from everywhere (answer 5)", async ({ page }) => {
  await drop(page, "failure_probe");
  const filter = page.locator("input.filter");
  const on = (sel: string) => page.locator(sel).evaluate((e) => e === document.activeElement);
  await drawer(page).focus();
  await press(page, "/");
  expect(await on("input.filter")).toBe(true);
  await page.keyboard.type("boom");
  await expect(page.locator("li.diagnostic")).toHaveCount(1);
  await press(page, "Escape");
  expect(await cursor(page)).toBe("drawer");
  await expect(filter).toHaveValue("boom");
  await press(page, "j");
  expect(await cursor(page)).toContain("UserCodeFraming");
  // from a stop too, the text replaced by what is typed
  await press(page, "/");
  await page.keyboard.type("Empty");
  await expect(filter).toHaveValue("Empty");
  await expect(page.locator("li.diagnostic")).toHaveCount(1);
  await press(page, "Escape");
  await press(page, "ControlOrMeta+k");
  expect(await on("input.query")).toBe(true);
  // from another region, and from another tab
  await press(page, "Escape");
  await press(page, "q");
  await press(page, "/");
  expect(await on("input.query")).toBe(true);
  await openTab(page, "timing");
  await press(page, "/");
  expect(await on("input.query")).toBe(true);
  await drop(page, "closed_loop");
  await openTab(page, "diagnostics");
  await press(page, "/");
  expect(await on("input.query"), "no diagnostics, no filter").toBe(true);
});

test("Cmd-K and Ctrl-K reach the model's search with its text selected from the diagnostics filter and from the search field itself (ruling 51)", async ({ page }) => {
  await drop(page, "failure_probe");
  const query = page.locator("input.query");
  const on = (sel: string) => page.locator(sel).evaluate((e) => e === document.activeElement);
  const selected = () => query.evaluate((e: HTMLInputElement) => [e.selectionStart, e.selectionEnd, e.value.length]);
  await press(page, "/");
  await page.keyboard.type("plant");
  await press(page, "Tab");
  await drawer(page).focus();
  await press(page, "/");
  await page.keyboard.type("boom");
  expect(await on("input.filter")).toBe(true);
  await press(page, "ControlOrMeta+k");
  expect(await on("input.query"), "from the filter").toBe(true);
  expect(await selected()).toEqual([0, 5, 5]);
  await expect(page.locator("input.filter")).toHaveValue("boom");
  await query.evaluate((e: HTMLInputElement) => e.setSelectionRange(5, 5));
  await press(page, "ControlOrMeta+k");
  expect(await on("input.query"), "from the field itself").toBe(true);
  expect(await selected()).toEqual([0, 5, 5]);
  await expect(query).toHaveValue("plant");
});

test("a row the filter removes under the cursor gives the focus to the drawer, and one it keeps keeps it", async ({ page }) => {
  await drop(page, "failure_probe");
  await drawer(page).focus();
  await press(page, "j");
  const set = (v: string) => page.locator("input.filter").evaluate((e: HTMLInputElement, v) => { e.value = v; e.dispatchEvent(new Event("input", { bubbles: true })); }, v);
  await set("boom");
  await expect(page.locator("li.diagnostic")).toHaveCount(1);
  expect(await cursor(page)).toContain("UserCodeFraming");
  await set("Empty");
  await expect.poll(() => cursor(page)).toBe("drawer");
});

test("a push keeps a drawer's row that survives under the cursor", async ({ page }) => {
  await drop(page, "closed_loop");
  await openTab(page, "order");
  await pressAll(page, "j", "j", "j");
  const at = await cursor(page);
  await dropOver(page, "closed_loop_deployment");
  await expect(status(page)).toHaveAttribute("data-kind", "deployment");
  expect(await cursor(page)).toBe(at);
  await expect(page.locator("section.drawer.focused")).toHaveCount(1);
});

test("the right-click menu's entry takes the focus when the menu opens, Enter presses it, and Escape gives the focus back; the entry's focus leaving for another element closes it, the window's blur does not", async ({ page }) => {
  await drop(page, "closed_loop");
  const entry = ".viewport div.menu button.trace";
  const on = () => page.locator(entry).evaluate((e) => e === document.activeElement);
  // an assembly selected, which Enter would open
  await pickBlock(page, "sensing");
  await page.locator('rect.port[data-port="plant|out|V"]').click({ button: "right" });
  await expect.poll(on).toBe(true);
  await press(page, "Escape");
  await expect(page.locator(entry)).toHaveCount(0);
  expect(await cursor(page)).toBe("canvas");
  await expect(page.locator("g.block.selected")).toHaveAttribute("data-id", "sensing");
  await page.locator('rect.port[data-port="plant|out|V"]').click({ button: "right" });
  await expect.poll(on).toBe(true);
  await press(page, "Enter");
  await expect(status(page).locator("span.route")).toContainText("plant/V");
  await expect(page.locator("svg.canvas")).toHaveAttribute("data-level", "");
  // the pressed entry is gone, and the canvas keeps the focus
  await expect.poll(() => cursor(page)).toBe("canvas");
  // what held the focus when it opened, a stop of the pane, gets it back
  await pane(page).focus();
  const at = (await walk(page, "j"))[0];
  await page.locator('rect.port[data-port="plant|out|V"]').dispatchEvent("contextmenu");
  await expect.poll(on).toBe(true);
  await press(page, "Escape");
  expect(await cursor(page)).toBe(at);
  // q takes the focus from the entry: the menu closes, and Escape then leaves the focus where q put it
  await page.locator('rect.port[data-port="plant|out|V"]').dispatchEvent("contextmenu");
  await expect.poll(on).toBe(true);
  await press(page, "q");
  await expect(page.locator(entry)).toHaveCount(0);
  expect(await cursor(page)).toBe("tree");
  await press(page, "Escape");
  expect(await cursor(page)).toBe("tree");
  // the window's blur leaves the entry focused and the menu open, so Escape still gives the focus back
  await page.locator('rect.port[data-port="plant|out|V"]').dispatchEvent("contextmenu");
  await expect.poll(on).toBe(true);
  await page.locator(entry).evaluate((e) => {
    e.dispatchEvent(new FocusEvent("blur"));
    e.dispatchEvent(new FocusEvent("focusout", { bubbles: true }));
    window.dispatchEvent(new FocusEvent("blur"));
  });
  await page.evaluate(() => new Promise((r) => setTimeout(r, 50)));
  await expect(page.locator(entry)).toHaveCount(1);
  await press(page, "Escape");
  expect(await cursor(page)).toBe("tree");
});

test("the keys of the level and of go act from a stop as from anywhere: Shift-h back while the cursor stays in the drawer (ruling 13)", async ({ page }) => {
  await drop(page, "closed_loop");
  await openPath(page, "pid_controller");
  await openTab(page, "order");
  const at = (await walk(page, "j"))[0];
  await press(page, "Shift+H");
  await page.locator(readyLevel("")).waitFor();
  expect(await cursor(page)).toBe(at);
  await press(page, "Shift+L");
  await page.locator(readyLevel("pid_controller")).waitFor();
  await press(page, "Backspace");
  await page.locator(readyLevel("")).waitFor();
  expect(await cursor(page)).toBe(at);
});

test("failure_nested with ctl of a user type: a loop's declaration link is a control of its row", async ({ page }) => {
  const d = JSON.parse(fixtureText("failure_nested"));
  d.failure.structure.nodes.find((n: { path: string }) => n.path === "ctl").type = "Main.User.Ctl";
  d.failure.structure.types.push({ name: "Main.User.Ctl", locations: [{ function: "output_wires", file: "<repo>/ctl.jl", line: 7 }] });
  await drop(page, "failure_nested", JSON.stringify(d));
  await drawer(page).focus();
  expect((await walk(page, "j", "l", "h"))).toEqual([expect.stringContaining("button.row "), "a.declaration <repo>/ctl.jl:7", expect.stringContaining("button.row ")]);
});
