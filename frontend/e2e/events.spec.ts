// The state events (visual_grammar.md answer 11, workspace.md answers 4, 6 and 11, deployment_overlay.md answers 7
// and 9; increment 10b's notes, rulings 1 to 14 and C1 to C9): the pill on a block's top edge at the right in both
// modes, beside the rate pill on an assembly; the pane's EVENTS section and an assembly's fact; the drawer's fifth tab
// with its head, groups and empty states, a group one stop; the help page's term.
import { test, type Page } from "@playwright/test";
import { cursor, drop, effectiveOpacity, expect, fixtureText, openPath, openSection, press, readyLevel, section, shot } from "./fixtures";

/** size.ts's `BADGE_INSET` and `BADGE_GAP`, copied: an e2e check imports no app module. */
const INSET = 4, GAP = 2;

const pane = (page: Page) => page.locator("aside.detail");
const drawer = (page: Page) => page.locator("section.drawer");
const tab = (page: Page) => drawer(page).locator('button.tab[data-tab="events"]');

/** A block's top edge pills in its own coordinates, with its shape's width and each pill's text and title. */
const pills = (page: Page, id: string) => page.locator(`g.block[data-id="${id}"]`).evaluate((g) => {
  const pill = (sel: string) => {
    const p = g.querySelector(`:scope > ${sel}`);
    if (!p) return undefined;
    const r = p.querySelector("rect")!, t = p.querySelector("text")!;
    const n = (a: string) => Number(r.getAttribute(a));
    return { x: n("x"), y: n("y"), width: n("width"), height: n("height"), text: t.textContent, textLength: t.getComputedTextLength(), title: p.querySelector("title")!.textContent };
  };
  return { width: Number(g.querySelector(":scope > .shape")!.getAttribute("width")), rate: pill("g.badge-pill"), events: pill("g.events-pill") };
});

/** The drawer opened on the events tab. */
async function openEvents(page: Page) {
  await tab(page).click();
  await expect(drawer(page)).toHaveAttribute("data-tab", "events");
  await expect(drawer(page)).toHaveAttribute("data-open", "true");
}

/** The tab's rows as `path|#|name|localized`, the path cell empty past a group's first row. */
const tableRows = (page: Page) => drawer(page).locator("table.events tbody.group tr.event").evaluateAll((trs) =>
  trs.map((tr) => [...tr.querySelectorAll("td")].map((td) => td.textContent!.trim()).join("|")));

const items = (page: Page) => drawer(page).locator("dl.head .item").evaluateAll((es) =>
  es.map((e) => `${(e as HTMLElement).dataset.item}=${e.querySelector("dd")!.textContent}`));

test("approach_deployment: gear carries the events pill on its top edge at the right in both color modes, `1 event`, titled with its one event", async ({ page }) => {
  await drop(page, "approach_deployment");
  for (const mode of ["tier", "rate"]) {
    if (mode === "rate") await press(page, "c");
    await expect(page.locator("svg.canvas")).toHaveAttribute("data-mode", mode);
    const p = await pills(page, "gear");
    expect(p.events, mode).toMatchObject({ text: "1 event", title: "1 touchdown, localized" });
    // straddles the top edge, inset from the right end as the rate pill is from the left
    expect(p.events!.y).toBeLessThan(0);
    expect(p.events!.y + p.events!.height).toBeGreaterThan(0);
    expect(p.events!.x + p.events!.width).toBe(p.width - INSET);
    expect(p.events!.textLength).toBeLessThanOrEqual(p.events!.width);
    // a primitive with events is continuous, so it never carries the rate pill
    expect(p.rate).toBeUndefined();
  }
  // only the one declaring primitive has a pill, on any level
  await expect(page.locator("g.events-pill")).toHaveCount(1);
});

test("events_deployment: the keyed pods carry the rate pill at the left and the events pill at the right, apart, the events pill and the block's width the same in both modes; an assembly's title counts the primitives inside", async ({ page }) => {
  await drop(page, "events_deployment");
  const tier: Record<string, Awaited<ReturnType<typeof pills>>> = {};
  for (const id of ["pods/a", "pods/b", "nest", "heater"]) tier[id] = await pills(page, id);
  await shot(page, "events_deployment", "", "pills");
  await press(page, "c");
  await expect(page.locator("svg.canvas")).toHaveAttribute("data-mode", "rate");
  for (const id of ["pods/a", "pods/b"]) {
    const t = tier[id], r = await pills(page, id);
    expect(t.rate, `${id} in tier mode`).toBeUndefined();
    expect(r.rate, id).toMatchObject({ text: "1 clock", x: INSET });
    expect(r.events, id).toMatchObject({ text: "1 event", title: "1 event on 1 primitive inside" });
    // the two pills apart, the gap between them, whatever the fonts make of the widths
    expect(r.rate!.x + r.rate!.width + GAP, id).toBeLessThanOrEqual(r.events!.x);
    expect(r.events!.x + r.events!.width, id).toBe(r.width - INSET);
    // neither pill nor the block moves with the mode
    expect(r.width, id).toBe(t.width);
    expect(r.events!.x, id).toBe(t.events!.x);
  }
  // a nested assembly counts over depth; a primitive lists its events in priority order with their policies
  expect((await pills(page, "nest")).events).toMatchObject({ text: "2 events", title: "2 events on 2 primitives inside" });
  expect((await pills(page, "heater")).events).toMatchObject({
    text: "3 events", title: "1 heat_on, localized\n2 heat_off, localized\n3 trip, not localized",
  });
  await shot(page, "events_deployment", "", "pills-rate");
  await openPath(page, "nest");
  expect((await pills(page, "nest/step")).events).toMatchObject({ text: "1 event", title: "1 fire, not localized" });
  expect((await pills(page, "nest/deep")).events).toMatchObject({ text: "1 event", title: "1 event on 1 primitive inside" });
  await shot(page, "events_deployment", "nest", "pills-rate");
  await press(page, "c");
  await shot(page, "events_deployment", "nest", "pills");
});

test("events_deployment: the pods' natural width is below what their two pills need, so the reserved width acts", async ({ page }) => {
  await drop(page, "events_deployment");
  await press(page, "c");
  const p = await pills(page, "pods/a");
  const need = 2 * INSET + p.rate!.width + GAP + p.events!.width;
  expect(p.width).toBe(need);
  // the block's own lines would fit in less: its segment and display name with the 8 px pads, and the 60 px floor
  const own = await page.locator('g.block[data-id="pods/a"]').evaluate((g) =>
    Math.max(60, ...[...g.querySelectorAll(":scope > text.segment, :scope > text.display")].map((t) => (t as SVGTextElement).getComputedTextLength() + 16)));
  expect(own).toBeLessThan(need);
});

test("a primitive root that declares an event carries the pill on its block and the EVENTS section on the open level's pane", async ({ page }) => {
  const text = fixtureText("primitive").replace('"path": "",\n          "events": []', '"path": "",\n          "events": [{"name": "kick", "policy": "non_localized"}]');
  expect(text).not.toBe(fixtureText("primitive"));
  await drop(page, "primitive", text);
  expect((await pills(page, "")).events).toMatchObject({ text: "1 event", title: "1 kick, not localized" });
  await expect(section(page, "events").locator("tr.event")).toHaveText(["1kickno"]);
  // the tab's group names the root `/`, as the rest of the page does
  await openEvents(page);
  expect(await tableRows(page)).toEqual(["/|1|kick|no"]);
});

test("failure_cycle: a failure draws no pill and no EVENTS section, and its tab says the build did not reach the events, no count", async ({ page }) => {
  await drop(page, "failure_cycle");
  await expect(page.locator("g.events-pill")).toHaveCount(0);
  await page.locator('g.block[data-id="plant"]').click();
  await expect(pane(page)).toHaveAttribute("data-id", "plant");
  await expect(section(page, "events")).toHaveCount(0);
  await expect(pane(page).locator('dd[data-fact="events"]')).toHaveCount(0);
  await expect(tab(page).locator(".count")).toHaveCount(0);
  await openEvents(page);
  await expect(drawer(page).locator(".tab-body")).toHaveText("No events: the build did not reach them.");
});

test("events_deployment: heater's pane holds EVENTS open before PARAMETERS, a row per event in priority order with yes or no, the bundle under it, and no stop but its heading", async ({ page }) => {
  await drop(page, "events_deployment");
  await page.locator('g.block[data-id="heater"]').click();
  await expect(pane(page)).toHaveAttribute("data-id", "heater");
  const names = await pane(page).locator("details.section").evaluateAll((ds) => ds.map((d) => (d as HTMLElement).dataset.section));
  expect(names.indexOf("events")).toBe(names.indexOf("parameters") - 1);
  await expect(section(page, "events")).toHaveAttribute("open");
  await expect(section(page, "events").locator("thead th")).toHaveText(["#", "event", "localized"]);
  const rows = await section(page, "events").locator("tr.event").evaluateAll((trs) => trs.map((tr) => [...tr.querySelectorAll("td")].map((td) => td.textContent).join("|")));
  expect(rows).toEqual(["1|heat_on|yes", "2|heat_off|yes", "3|trip|no"]);
  await expect(section(page, "events").locator("p.bundle code")).toHaveText("(x, m, u, y, t)");
  await expect(section(page, "events").locator(":is(summary, button, a[href])")).toHaveCount(1);
  // a primitive's pane has no events fact; the section closes and reopens through the session
  await expect(pane(page).locator('dd[data-fact="events"]')).toHaveCount(0);
  await shot(page, "events_deployment", "", "events-pane");
  // a component without events has no section
  await openPath(page, "pods/a");
  await page.locator('g.block[data-id="pods/a/hold"]').click();
  await expect(pane(page)).toHaveAttribute("data-id", "pods/a/hold");
  await expect(section(page, "events")).toHaveCount(0);
});

test("events_deployment: an assembly's facts end with its events after its wires, titled; the open level shows its own, the root the model's", async ({ page }) => {
  await drop(page, "events_deployment");
  const fact = pane(page).locator('dl.facts dd[data-fact="events"]');
  const labels = () => pane(page).locator("dl.facts dt").allTextContents();
  // the open root, nothing selected: the model's count
  await expect(pane(page)).toHaveAttribute("data-kind", "level");
  await expect(fact).toHaveText("7");
  expect((await labels()).slice(-2)).toEqual(["wires", "events"]);
  await expect(pane(page).locator("dl.facts dt", { hasText: "events" })).toHaveAttribute("title", "State events declared by the primitives inside");
  await page.locator('g.block[data-id="nest"]').click();
  await expect(pane(page)).toHaveAttribute("data-kind", "assembly");
  await expect(fact).toHaveText("2");
  await page.locator('g.block[data-id="pods/a"]').click();
  await expect(fact).toHaveText("1");
  // the member row follows the events on a keyed assembly
  expect(await labels()).toEqual(["type", "class", "children", "wires", "events", "member"]);
  await openPath(page, "nest");
  await page.locator('g.block[data-id="nest/deep"]').click();
  await expect(fact).toHaveText("1");
  await press(page, "Escape");
  await expect(pane(page)).toHaveAttribute("data-kind", "level");
  await expect(fact).toHaveText("2");
  // a model with none shows no fact
  await drop(page, "closed_loop_deployment");
  await expect(pane(page)).toHaveAttribute("data-kind", "level");
  await expect(fact).toHaveCount(0);
});

test("events_deployment: the events tab, last, counts 7; its head shows the three parameters; a row per event grouped by primitive in walk order, the path on a group's first row alone, the number restarting", async ({ page }) => {
  await drop(page, "events_deployment");
  expect(await drawer(page).locator("button.tab").evaluateAll((bs) => bs.map((b) => (b as HTMLElement).dataset.tab))).toEqual(["diagnostics", "root-inputs", "timing", "order", "events"]);
  await expect(tab(page).locator(".count")).toHaveText("7");
  await openEvents(page);
  expect(await items(page)).toEqual(["firing_budget=2", "localization_tol=2.5e-5 of Δt_frame", "localization_budget=16"]);
  await expect(drawer(page).locator("table.events thead th")).toHaveText(["path", "#", "event", "localized"]);
  expect(await drawer(page).locator("tbody.group").evaluateAll((gs) => gs.map((g) => (g as HTMLElement).dataset.path))).toEqual(
    ["pods/a/ball", "pods/b/ball", "nest/step", "nest/deep/ball", "heater"]);
  expect(await tableRows(page)).toEqual([
    "pods/a/ball|1|bounce|yes", "pods/b/ball|1|bounce|yes", "nest/step|1|fire|no", "nest/deep/ball|1|bounce|yes",
    "heater|1|heat_on|yes", "|2|heat_off|yes", "|3|trip|no",
  ]);
});

test("approach_deployment and library_deployment: the tab's head and rows; the library's build has no head", async ({ page }) => {
  await drop(page, "approach_deployment");
  await expect(tab(page).locator(".count")).toHaveText("1");
  await openEvents(page);
  expect(await items(page)).toEqual(["firing_budget=4", "localization_tol=1e-6 of Δt_frame", "localization_budget=8"]);
  expect(await tableRows(page)).toEqual(["gear|1|touchdown|yes"]);
  await shot(page, "approach_deployment", "", "events-tab");
  await drop(page, "library_deployment");
  await expect(tab(page).locator(".count")).toHaveText("14");
  await openEvents(page);
  await expect(drawer(page).locator("tbody.group")).toHaveCount(6);
  await expect(drawer(page).locator("tr.event")).toHaveCount(14);
  // the number restarts at each component
  expect((await tableRows(page)).map((r) => r.split("|")[1]).join("")).toBe("11234121123412");
  await shot(page, "library_deployment", "", "events-tab");
  await drop(page, "library");
  await openEvents(page);
  await expect(drawer(page).locator("dl.head")).toHaveCount(0);
  await expect(drawer(page).locator("tr.event")).toHaveCount(14);
});

test("events_deployment with every policy edited to non_localized: the head shows firing_budget alone", async ({ page }) => {
  const text = fixtureText("events_deployment").replaceAll('"policy": "localized"', '"policy": "non_localized"');
  expect(text).not.toContain('"policy": "localized"');
  await drop(page, "events_deployment", text);
  await openEvents(page);
  expect(await items(page)).toEqual(["firing_budget=2"]);
  await expect(drawer(page).locator("td.localized")).toHaveText(Array(7).fill("no"));
});

test("closed_loop_deployment: a model with no events shows no count, no head and says so", async ({ page }) => {
  await drop(page, "closed_loop_deployment");
  await expect(tab(page)).toHaveText("Events");
  await expect(tab(page).locator(".count")).toHaveCount(0);
  await openEvents(page);
  await expect(drawer(page).locator("dl.head")).toHaveCount(0);
  await expect(drawer(page).locator(".tab-body")).toHaveText("No state events.");
});

test("library_deployment: j and k walk one stop per component, the ring around its group alone; Enter selects the component", async ({ page }) => {
  await drop(page, "library_deployment");
  await openEvents(page);
  await drawer(page).focus();
  const seen: string[] = [];
  for (let i = 0; i < 7; i++) {
    await press(page, "j");
    seen.push(await cursor(page));
  }
  expect(seen).toEqual(["step", "limited", "relay", "sequence", "ld_integrator", "comparator", "comparator"].map((p) => `button.row ${p}`));
  await press(page, "k");
  await press(page, "k");
  await press(page, "k");
  expect(await cursor(page)).toBe("button.row relay");
  // the ring: on the focused group's tbody, none on the button itself or on another group
  const rings = await drawer(page).locator("tbody.group").evaluateAll((gs) => gs.map((g) => `${(g as HTMLElement).dataset.path}:${getComputedStyle(g).outlineStyle}`));
  expect(rings.filter((r) => !r.endsWith(":none"))).toEqual(["relay:solid"]);
  expect(await page.evaluate(() => getComputedStyle(document.activeElement!).outlineStyle)).toBe("none");
  await press(page, "Enter");
  await expect(pane(page)).toHaveAttribute("data-id", "relay");
  expect(await cursor(page)).toBe("button.row relay");
  await shot(page, "library_deployment", "", "events-ring");
});

test("events_deployment: a click on a group's later row selects its component, on its parent's level, and puts the cursor on the group", async ({ page }) => {
  await drop(page, "events_deployment");
  await openEvents(page);
  await drawer(page).locator('tbody.group[data-path="heater"] tr.event[data-position="3"] td.name').click();
  await expect(pane(page)).toHaveAttribute("data-id", "heater");
  // the group's button holds the focus, the ring is on the group, and k walks on from there
  expect(await cursor(page)).toBe("button.row heater");
  const rings = await drawer(page).locator("tbody.group").evaluateAll((gs) => gs.map((g) => `${(g as HTMLElement).dataset.path}:${getComputedStyle(g).outlineStyle}`));
  expect(rings.filter((r) => !r.endsWith(":none"))).toEqual(["heater:solid"]);
  await press(page, "k");
  expect(await cursor(page)).toBe("button.row nest/deep/ball");
  await drawer(page).locator('tbody.group[data-path="nest/deep/ball"] td.localized').click();
  await expect(page.locator(readyLevel("nest/deep"))).toHaveCount(1);
  await expect(pane(page)).toHaveAttribute("data-id", "nest/deep/ball");
});

test("the narrowest pane, 240 px: heater's EVENTS section fits without a sideways scroll, long event names wrapping with the localized cell inside the pane", async ({ page }) => {
  await drop(page, "events_deployment");
  await page.evaluate(() => localStorage.setItem("redstone-inspector/prefs",
    JSON.stringify({ version: 1, sizes: { tree: 280, detail: 240, drawer: 200 }, collapsed: { tree: false, detail: false } })));
  const long = ["heat_on_when_the_room_falls_cold", "trip_when_the_heater_has_run_past_its_limit_for_longer_than_its_budget_allows"];
  const edited = fixtureText("events_deployment").replace('"name": "heat_on"', `"name": "${long[0]}"`).replace('"name": "trip"', `"name": "${long[1]}"`);
  expect(edited).toContain(long[0]);
  expect(edited).toContain(long[1]);
  for (const [name, text] of [["", undefined], ["long_names", edited]] as const) {
    await drop(page, "events_deployment", text);
    await page.locator('g.block[data-id="heater"]').click();
    expect(await pane(page).evaluate((e) => e.getBoundingClientRect().width)).toBe(240);
    await openSection(page, "events");
    expect(await page.locator('.pane[data-pane="detail"] .body').evaluate((e) => e.scrollWidth - e.clientWidth), name).toBeLessThanOrEqual(0);
    const right = await pane(page).evaluate((e) => e.getBoundingClientRect().right);
    for (const r of await section(page, "events").locator("td.localized").evaluateAll((ts) => ts.map((t) => t.getBoundingClientRect().right))) {
      expect(r, name).toBeLessThanOrEqual(right);
    }
    await shot(page, name ? `events_deployment_${name}` : "events_deployment", "", "events-narrow");
  }
});

test("library_deployment: j, k, gg and G scroll the whole group into the tab's body, not its button alone", async ({ page }) => {
  await drop(page, "library_deployment");
  await openEvents(page);
  await drawer(page).focus();
  /** The focused group's box against the tab body's visible box, borders and a sideways scrollbar left out. */
  const inBody = () => drawer(page).evaluate((d) => {
    const body = d.querySelector(".tab-body")!, b = body.getBoundingClientRect();
    const top = b.top + body.clientTop, bottom = top + body.clientHeight;
    const g = document.activeElement!.closest("tbody.group")!.getBoundingClientRect();
    return { fits: g.height <= body.clientHeight, inside: g.top >= top - 1 && g.bottom <= bottom + 1, scrolled: body.scrollTop };
  });
  for (let i = 0; i < 6; i++) {
    await press(page, "j");
    const at = await inBody();
    if (at.fits) expect(at.inside, await cursor(page)).toBe(true);
  }
  await press(page, "g");
  await press(page, "g");
  expect(await cursor(page)).toBe("button.row step");
  expect((await inBody()).inside).toBe(true);
  await press(page, "Shift+G");
  expect(await cursor(page)).toBe("button.row comparator");
  const end = await inBody();
  expect(end.scrolled).toBeGreaterThan(0);
  expect(end.inside).toBe(true);
  for (let i = 0; i < 5; i++) {
    await press(page, "k");
    const at = await inBody();
    if (at.fits) expect(at.inside, await cursor(page)).toBe(true);
  }
});

/** events.ts's `LOCALIZED_TITLE`, copied: an e2e check imports no app module. */
const LOCALIZED_TITLE = "yes: the event is located in time inside a step; no: its guard is checked at step boundaries only";

test("events_deployment: the localized head carries one title in the tab and in the pane, saying what yes and no mean", async ({ page }) => {
  await drop(page, "events_deployment");
  await page.locator('g.block[data-id="heater"]').click();
  await expect(section(page, "events").locator("thead th", { hasText: "localized" })).toHaveAttribute("title", LOCALIZED_TITLE);
  await openEvents(page);
  await expect(drawer(page).locator("table.events thead th", { hasText: "localized" })).toHaveAttribute("title", LOCALIZED_TITLE);
});

test("events_deployment: the pill takes no click of its own, a click at its center selecting its block and a double-click on an assembly's opening it", async ({ page }) => {
  await drop(page, "events_deployment");
  /** The pill's rect center in client coordinates, checked to be the pill's own point. */
  const centre = (id: string) => page.locator(`g.block[data-id="${id}"] > g.events-pill > rect`).evaluate((r) => {
    const b = r.getBoundingClientRect(), x = b.left + b.width / 2, y = b.top + b.height / 2;
    return { x, y, own: !!document.elementFromPoint(x, y)?.closest("g.events-pill") };
  });
  const p = await centre("heater");
  expect(p.own).toBe(true);
  await page.mouse.click(p.x, p.y);
  await expect(pane(page)).toHaveAttribute("data-id", "heater");
  const q = await centre("nest");
  expect(q.own).toBe(true);
  await page.mouse.dblclick(q.x, q.y);
  await expect(page.locator(readyLevel("nest"))).toHaveCount(1);
});

test("events_deployment: zoomed out to the frames text level, the pill still shows", async ({ page }) => {
  await drop(page, "events_deployment");
  const svg = page.locator("svg.canvas");
  for (let i = 0; i < 30 && (await svg.getAttribute("data-detail")) !== "frames"; i++) await press(page, "-");
  await expect(svg).toHaveAttribute("data-detail", "frames");
  await expect(page.locator('g.block[data-id="heater"] > g.events-pill')).toBeVisible();
  await expect(page.locator('g.block[data-id="nest"] > g.events-pill')).toBeVisible();
});

test("events_deployment: under a legend focus the pill dims with an unlit block and stays full on a lit one", async ({ page }) => {
  await drop(page, "events_deployment");
  await press(page, "c");
  await page.locator(".viewport .legend li[data-step] button.line").first().click();
  await expect(page.locator("svg.canvas")).toHaveClass(/\blegend-focus\b/);
  await expect(page.locator('g.block.lit[data-id="pods/a"]')).toHaveCount(1);
  await expect(page.locator('g.block.lit[data-id="heater"]')).toHaveCount(0);
  const shape = await effectiveOpacity(page, 'g.block[data-id="heater"] > .shape');
  expect(shape).toBeLessThan(1);
  expect(await effectiveOpacity(page, 'g.block[data-id="heater"] > g.events-pill > rect')).toBeCloseTo(shape, 5);
  expect(await effectiveOpacity(page, 'g.block[data-id="pods/a"] > g.events-pill > rect')).toBe(1);
});

test("the help page: the events pill is the sixteenth term, after the display name, with its drawing; it alone defines localized and says what no stands for", async ({ page }) => {
  await drop(page, "events_deployment");
  await press(page, "?");
  const term = page.locator('article.help ul.terms li[data-term="events"]');
  await expect(term.locator('svg.sample[data-sample="events"] rect.pill.events')).toHaveCount(1);
  await expect(term).toContainText("events pill");
  await expect(term).toContainText("A localized event");
  await expect(term.locator("code")).toHaveText(["no"]);
  const before = await page.locator("article.help ul.terms li[data-term]").evaluateAll((ls) => ls.map((l) => (l as HTMLElement).dataset.term));
  expect(before.indexOf("events")).toBe(before.indexOf("display-name") + 1);
  // the word stands in no other part of the help page
  const elsewhere = await page.locator("article.help").evaluate((a) => {
    const out: string[] = [];
    const walker = document.createTreeWalker(a, NodeFilter.SHOW_TEXT);
    for (let n = walker.nextNode(); n; n = walker.nextNode()) {
      if (/locali[sz]/i.test(n.textContent!) && !n.parentElement!.closest('li[data-term="events"]')) out.push(n.textContent!);
    }
    return out;
  });
  expect(elsewhere).toEqual([]);
  await term.scrollIntoViewIfNeeded();
  await shot(page, "events_deployment", "", "help-events");
});
