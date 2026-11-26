<script lang="ts">
  // The shell: a file picked or dropped anywhere on the page, the landing panel
  // before a model, the frame over the session once one loads; the window's
  // title, the hash and back and forward, the help page over either, which stays
  // mounted and inert beneath it, and
  // the keyboard table outside text fields (workspace.md answer 11), its families
  // by the focused region and the cursor on a pane's stops, Cmd-O's file input of its own; the live
  // tab's socket, its descriptors fed
  // to the loader a dropped file goes through (live_session.md answer 5).
  import Canvas, { type Target } from "./canvas/Canvas.svelte";
  import { palette } from "./canvas/palette";
  import Breadcrumb from "./frame/Breadcrumb.svelte";
  import Detail from "./frame/Detail.svelte";
  import Drawer from "./frame/Drawer.svelte";
  import Frame from "./frame/Frame.svelte";
  import Help from "./frame/Help.svelte";
  import Landing from "./frame/Landing.svelte";
  import Search from "./frame/Search.svelte";
  import StatusBar from "./frame/StatusBar.svelte";
  import Tree from "./frame/Tree.svelte";
  import { parsePortId } from "./lib/level";
  import { dragged } from "./frame/tabs/rowClick";
  import { connect, sendOpenLocation } from "./live/socket";
  import { fromFile, parseDescriptor, type Loaded, type Refusal } from "./lib/loader";
  import { loadModel } from "./lib/model";
  import { nearest, stopStep, walkOf, type Direction, type Stop } from "./lib/navigate";
  import { outlineRows, rowSelection, treeStep } from "./lib/outline";
  import { endsHold, keyName, pressPrefix, releasePrefix, type Prefix } from "./lib/prefix";
  import { beneath, levelHits, marked, parseQuery, searchModel, stepHit } from "./lib/search";
  import { legendLit, legendMarks } from "./lib/focus";
  import { diagnosticsOf, diagnosticTarget, litBy, overlayOf, treeMarks } from "./lib/diagnostics";
  import type { Face } from "./lib/resolve";
  import { faceText, originOf, routeDrawing, routeLevels, routeLit, routeOf, routeStatus, sameFace } from "./lib/routes";
  import {
    back, clearLegendFocus, clearRoute, climb, closeHelp, escape, forward, load, open, openDrawer, openFromHistory, select, session, setFocus,
    say, setLayout, setQuery, setSection, setView, TABS, toggleDiagnosticFocus, toggleDrawer, toggleExpanded, toggleHelp, toggleLegendFocus, trace, type Region,
  } from "./state/session.svelte";
  import { live } from "./state/live.svelte";
  import { prefs, RESIZE_STEP, setMode, setSize, toggleCollapsed, toggleLabels, toggleOrder, type Side } from "./state/prefs.svelte";
  import { onMount, tick, untrack } from "svelte";

  let refusal = $state<string | undefined>();
  let dragging = $state(false);
  let canvasView = $state<ReturnType<typeof Canvas>>();
  let listing = $state(false);
  /** The `z` or `g` waiting for its second key. */
  let prefix = $state.raw<Prefix | undefined>();
  /** The shell's own file input, outside the frame, for Cmd-O and Ctrl-O wherever the page shows. */
  let picker = $state<HTMLInputElement>();
  /** The model came over the socket, so `live.text` holds its bytes for the download. */
  let pushed = $state(false);

  /** Screen pixels a panning key moves the view by. */
  const PAN_STEP = 48;
  /** Pixels a scrolling key moves a pane's body or the help page by, the browser's own arrow step. */
  const SCROLL_STEP = 40;
  /** The zoom keys' factor, about the viewport's center. */
  const ZOOM_STEP = 1.25;
  /** The directions as `[dx, dy]`, and the arrows as directions. */
  const STEPS: Record<Direction, [number, number]> = { h: [-1, 0], j: [0, 1], k: [0, -1], l: [1, 0] };
  const ARROWS: Record<string, Direction> = { ArrowLeft: "h", ArrowDown: "j", ArrowUp: "k", ArrowRight: "l" };
  /** The four regions in Tab's order, by their roots. */
  const REGIONS: [Region, string][] = [["tree", "nav.tree"], ["canvas", ".viewport"], ["detail", "aside.detail"], ["drawer", "section.drawer"]];

  const model = $derived(session.model);
  /** The selection the canvas draws: one made on the open level, a folder as its region. */
  const drawn = $derived.by((): Target | undefined => {
    const s = session.selection;
    return s && s.level === session.level ? s.target : undefined;
  });

  // The standing query's hits over the whole model, the marks on the tree and the hits on the drawn level.
  const found = $derived.by(() => {
    const terms = parseQuery(session.query);
    return model?.tree && terms.length ? searchModel(model, terms) : undefined;
  });
  const hits = $derived(model?.tree && found ? levelHits(model.tree, session.level, found) : undefined);
  // The legend's focus, rate mode's alone: tier mode clears it. The canvas shows it over a standing query's hits,
  // the tree the query's marks over its own.
  $effect(() => {
    if (prefs.mode === "tier") clearLegendFocus();
  });
  const legendFocus = $derived(prefs.mode === "rate" ? session.legendFocus : undefined);
  // The diagnostics and warnings, what the open level draws of them, and the focused one.
  const diagnostics = $derived(model ? diagnosticsOf(model) : []);
  const overlay = $derived(model?.tree ? overlayOf(model, session.level) : undefined);
  const diagnosticMarks = $derived(model ? treeMarks(model) : undefined);
  const focusedDiagnostic = $derived(session.diagnosticFocus === undefined ? undefined : diagnostics[session.diagnosticFocus]);
  // The standing route, what the open level draws of it and its status line.
  const traced = $derived(model?.tree && session.route ? routeOf(model, session.route) : undefined);
  const routeDrawn = $derived(traced ? routeDrawing(model!, traced, session.level) : undefined);
  const routeMarks = $derived(traced && routeLevels(model!.tree!, traced));
  /** The selection's face when it has a route: the pane's trace button. */
  const selectionOrigin = $derived.by(() => {
    const o = model?.tree ? originOf(model, session.selection) : undefined;
    return o && routeOf(model!, o) ? o : undefined;
  });
  // One dimming focus at a time: the route, else the focused diagnostic, else the legend line; the legend's button stays pressed.
  const focus = $derived(
    !model?.tree ? undefined : traced ? "route" as const : focusedDiagnostic ? "diagnostic" as const : legendFocus !== undefined ? "legend" as const : undefined,
  );
  const lit = $derived(
    focus === "route" ? routeLit(model!, traced!, session.level)
    : focus === "diagnostic" ? litBy(model!, session.level, focusedDiagnostic!)
    : focus === "legend" ? legendLit(model!, session.level, legendFocus!) : undefined,
  );
  // A focus with nothing on the open level dims nothing there, and the status bar says why.
  const unlit = $derived(!!lit && !lit.blocks.size && !lit.wires.size && !lit.ports.size);
  const focusNote = $derived(
    !unlit ? undefined
    : focus === "route" ? "the route does not cross this level, so nothing dims"
    : focus === "diagnostic" ? "the focused diagnostic has nothing on this level, so nothing dims"
    : "the focused rate has nothing on this level, so nothing dims",
  );
  const focusKey = $derived(
    focus === "route" ? faceText(traced!.origin) : focus === "diagnostic" ? String(focusedDiagnostic!.index) : focus === "legend" ? legendFocus : undefined,
  );
  const marks = $derived(found ? marked(found) : model?.tree && legendFocus !== undefined ? legendMarks(model, legendFocus) : undefined);
  const counts = $derived(model?.tree && marks ? beneath(model.tree, marks) : undefined);

  $effect(() => {
    document.title = model ? `${model.label} – Redstone inspector` : "Redstone inspector";
  });

  // A model from a dropped or picked file asks before the page unloads; the socket serves its model again, and the
  // development server reloads freely (workspace.md answer 10).
  $effect(() => {
    if (!model || pushed || import.meta.env.DEV) return;
    const ask = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", ask);
    return () => window.removeEventListener("beforeunload", ask);
  });

  /** A descriptor loaded, replacing the model, or refused, unloading it with the reason on the landing. */
  function accept(r: Loaded | Refusal, fromSocket: boolean) {
    if (!r.ok) {
      load(undefined);
      refusal = r.reason;
      prefix = undefined;
      return;
    }
    refusal = undefined;
    pushed = fromSocket;
    // A replaced canvas takes the focus with it, and a moved stop loses it; the stop gets it back while it stands, else
    // the region that held it.
    const held = session.model ? session.focus : undefined;
    const stop = paneFocus();
    load(loadModel(r));
    if (held) {
      tick().then(() => {
        if (document.activeElement && document.activeElement !== document.body) return;
        if (stop?.isConnected) stop.focus({ preventScroll: true });
        else rootOf(held)?.focus();
      });
    }
  }

  async function openFile(file: File | undefined) {
    if (!file) return;
    accept(await fromFile(file), false);
  }

  onMount(() => connect((text) => accept(parseDescriptor(text), true)));

  /** A diagnostic's badge: the drawer open on diagnostics with its row focused. */
  function badge(index: number) {
    openDrawer("diagnostics");
    if (session.diagnosticFocus !== index) toggleDiagnosticFocus(index);
  }

  /** A drawer row: its focus toggled and, once focused, what it names selected, which shows its level. */
  function diagnostic(index: number) {
    toggleDiagnosticFocus(index);
    const s = session.diagnosticFocus === index ? diagnosticTarget(model!, diagnostics[index]) : undefined;
    if (s) select(s);
  }

  /** A timing chart's swatch: the legend's focus, rate mode's alone, so a press in tier mode turns rate mode on first. */
  function chartSwatch(key: string) {
    if (prefs.mode === "tier") setMode("rate");
    toggleLegendFocus(key);
  }

  /**
   * The trace action from the pane, the menu or `t`: a face with a route traced, or its standing route cleared; a
   * face with no producer, which the pane offers no button for, says so in the status bar.
   */
  function traceFrom(face: Face | undefined) {
    if (!face) return;
    if (sameFace(face, session.route) || routeOf(model!, face)) trace(face);
    else say(`nothing to trace: \`${faceText(face)}\` has no producer`);
  }

  // The help page leaves the frame or the landing mounted and inert, which drops the focus inside it: the element
  // focused at the open, and its region, get it back at the close, whichever way the page closes.
  let before: { element: HTMLElement; region: Region | undefined } | undefined;
  $effect.pre(() => {
    const shown = session.help;
    untrack(() => {
      prefix = undefined;
      if (shown) {
        const a = document.activeElement;
        before = a instanceof HTMLElement && a !== document.body ? { element: a, region: session.focus } : undefined;
      } else if (before) {
        const { element, region } = before;
        before = undefined;
        tick().then(() => {
          if (element.isConnected) element.focus({ preventScroll: true });
          else if (region) rootOf(region)?.focus({ preventScroll: true });
        });
      }
    });
  });

  // A pane's keyed rows move a stop when the selection, the level or the model changes, and the browser blurs a moved
  // focused element; the stop gets the focus back while it stands (answer 11). A removed one is the removal rule's.
  $effect.pre(() => {
    void session.selection;
    void session.level;
    void session.model;
    const stop = paneFocus();
    if (stop) tick().then(() => {
      if (stop.isConnected && document.activeElement === document.body) stop.focus({ preventScroll: true });
    });
  });

  /** A location click: sent to the editor while connected, else false and the pane copies it. */
  const onlocation = (file: string, line: number) => sendOpenLocation(file, line);

  const typing = (t: EventTarget | null) =>
    t instanceof HTMLInputElement || t instanceof HTMLTextAreaElement || t instanceof HTMLSelectElement
    || (t instanceof HTMLElement && t.isContentEditable);

  const regionOf = (t: Element | null): Region | undefined => REGIONS.find(([, sel]) => t?.closest(sel))?.[0];
  const rootOf = (region: Region) => document.querySelector<HTMLElement>(REGIONS.find(([r]) => r === region)![1]);
  /** The focused element inside the detail pane or the drawer, its root apart. */
  function paneFocus(): HTMLElement | undefined {
    const a = document.activeElement;
    return a instanceof HTMLElement && !a.matches("aside.detail, section.drawer") && a.closest("aside.detail, section.drawer") ? a : undefined;
  }

  /** Tab and Shift-Tab: the next or previous region root present, wrapping; false when there is none. */
  function cycle(back: boolean): boolean {
    const roots = REGIONS.map(([, sel]) => document.querySelector<HTMLElement>(sel)).filter((r) => r !== null);
    if (!roots.length) return false;
    const i = roots.findIndex((r) => r.contains(document.activeElement));
    const next = i < 0 ? (back ? roots.length - 1 : 0) : (i + (back ? -1 : 1) + roots.length) % roots.length;
    roots[next].focus();
    return true;
  }

  /** `q w e s`: a region focused, a collapsed pane expanded and a closed drawer opened first; a cursor already in it stays. */
  async function focusRegion(region: Region) {
    if (session.focus === region && focusedStop()) return;
    if (region === "drawer") openDrawer(session.drawer.tab);
    else if (region !== "canvas" && prefs.collapsed[region]) toggleCollapsed(region);
    await tick();
    rootOf(region)?.focus();
  }

  /** `/` with the drawer focused on its diagnostics tab: the filter focused with its text selected; false while none shows. */
  function focusFilter(): boolean {
    const input = session.focus === "drawer" ? document.querySelector<HTMLInputElement>("section.drawer input.filter") : null;
    input?.focus();
    input?.select();
    return !!input;
  }

  /** `/`, Cmd-K and Ctrl-K: the search field focused with its text selected, the tree pane expanded first if collapsed. */
  async function focusSearch() {
    if (prefs.collapsed.tree) {
      toggleCollapsed("tree");
      await tick();
    }
    const input = document.querySelector<HTMLInputElement>("input.query");
    input?.focus();
    input?.select();
  }
  const focusCanvas = () => document.querySelector<HTMLElement>(".viewport")?.focus();

  /** `Q` and `E`: a side pane collapsed or expanded; the focus a collapsing pane held moves to the canvas. */
  async function togglePane(side: Side) {
    const held = session.focus === side;
    toggleCollapsed(side);
    if (!held || !prefs.collapsed[side]) return;
    await tick();
    focusCanvas();
  }

  /** `S`: the drawer toggled on its tab; the focus the closing drawer held moves to the canvas. */
  async function toggleDrawerKey() {
    const held = session.focus === "drawer" && session.drawer.open;
    toggleDrawer(session.drawer.tab);
    if (!held) return;
    await tick();
    focusCanvas();
  }

  /** `<` and `>`: the focused tree, detail pane or open drawer shrunk or grown by a step, as its splitter's drag does. */
  function resizeFocused(grow: boolean) {
    const region = session.focus;
    if (!region || region === "canvas" || (region === "drawer" && !session.drawer.open)) say("nothing to resize: focus the tree, the detail pane or an open drawer");
    else setSize(region, prefs.sizes[region] + (grow ? RESIZE_STEP : -RESIZE_STEP));
  }

  /** `gt` and `gT`: the drawer's next or previous tab, wrapping; a closed drawer opens on its current one. */
  function stepTab(step: 1 | -1) {
    const { open, tab } = session.drawer;
    openDrawer(open ? TABS[(TABS.indexOf(tab) + step + TABS.length) % TABS.length] : tab);
  }

  /** What a pane's view keys scroll: a side pane's body, the drawer's open tab body. */
  const scrollerOf = (region: Exclude<Region, "canvas">) =>
    document.querySelector<HTMLElement>(region === "drawer" ? "section.drawer .tab-body" : `.pane[data-pane="${region}"] .body`);

  /** `z` with `h j k l`, a step, and `d` and `u`, half the region's height: a pane scrolled, the canvas panned, nothing focused included. */
  function viewBy([dx, dy]: [number, number], half = false) {
    const region = session.focus ?? "canvas";
    const box = region === "canvas" ? rootOf(region) : scrollerOf(region);
    if (!box) return;
    const step = half ? box.clientHeight / 2 : region === "canvas" ? PAN_STEP : SCROLL_STEP;
    if (region === "canvas") canvasView?.panBy(dx * step, dy * step);
    else box.scrollBy(dx * step, dy * step);
  }

  /** The block a direction key starts from: the selected block or pin, a port's block, a wire's consumer. */
  function origin(): string | undefined {
    const t = drawn;
    if (!t) return undefined;
    if (t.kind === "folder") return undefined;
    return t.kind === "block" ? t.id : parsePortId(t.id).block;
  }

  /** `h j k l`: the selection to the nearest block or pin in that direction, the view following. */
  function move(direction: Direction) {
    const boxes = canvasView?.boxes() ?? [];
    if (!boxes.length) return;
    const from = origin();
    const to = from !== undefined && boxes.some((b) => b.id === from) ? nearest(boxes, from, direction) : boxes[0].id;
    if (to === undefined) return;
    select({ level: session.level, target: { kind: "block", id: to } });
    canvasView?.follow(to);
  }

  /** The tree's `h j k l` (workspace.md answer 2): a row selected as a click selects it, or a row toggled. */
  function treeMove(key: Direction) {
    const tree = model?.tree;
    if (!tree) return;
    const t = session.selection?.target;
    const at = t && (t.kind === "folder" || tree.byPath.has(t.id)) ? t.id : undefined;
    const step = treeStep(outlineRows(tree, model!.label, session.expanded), at, key, session.expanded);
    if (!step) return;
    if ("toggle" in step) toggleExpanded(step.toggle);
    else select(rowSelection(tree, session.level, step.select));
  }

  /** A pane's stops in the page's order, those in a closed section left out: the detail pane's, or the open tab's. */
  const stopsOf = (region: "detail" | "drawer"): HTMLElement[] =>
    [...document.querySelectorAll<HTMLElement>(`${region === "detail" ? "aside.detail" : "section.drawer .tab-body"} :is(summary, button, a[href])`)]
      .filter((e) => e.checkVisibility());
  const asStop = (e: HTMLElement): Stop =>
    e.localName === "summary" ? { depth: 0, open: (e.parentElement as HTMLDetailsElement).open }
    : { depth: e.matches("td.links a, li.diagnostic a, .swatch ~ .swatch") ? 2 : e.closest("details") ? 1 : 0 };
  /** The focused stop, the cursor of the pane holding the focus. */
  function focusedStop(): HTMLElement | undefined {
    const region = session.focus;
    return region === "detail" || region === "drawer" ? stopsOf(region).find((e) => e === document.activeElement) : undefined;
  }
  function focusStop(e: HTMLElement | undefined) {
    e?.focus({ preventScroll: true });
    e?.scrollIntoView({ block: "nearest", inline: "nearest" });
  }

  /** A pane's `h j k l`: the cursor to another stop, or a section opened or closed. */
  function stopMove(region: "detail" | "drawer", key: Direction) {
    const all = stopsOf(region);
    const step = stopStep(all.map(asStop), all.findIndex((e) => e === document.activeElement), key);
    if (!step) return;
    if ("toggle" in step) all[step.toggle].click();
    else focusStop(all[step.focus]);
  }

  /** `gg` and `G`: the region's first or last stop, in the tree its first or last visible row; nothing on the canvas. */
  function toEnd(last: boolean) {
    const region = session.focus;
    if (region === "tree" && model?.tree) {
      const rows = outlineRows(model.tree, model.label, session.expanded);
      select(rowSelection(model.tree, session.level, rows[last ? rows.length - 1 : 0]));
      // the tree scrolls on a change of selection, and the row may already be the selected one
      tick().then(() => document.querySelector("nav.tree .row.selected")?.scrollIntoView({ block: "nearest" }));
    } else if (region === "detail" || region === "drawer") {
      const all = stopsOf(region);
      const walk = walkOf(all.map(asStop));
      focusStop(all[walk[last ? walk.length - 1 : 0]]);
    }
  }

  /** `zz`: the cursor brought to the middle of its region: the selection on the canvas, the selected row, the focused stop. */
  function centreCursor() {
    const region = session.focus ?? "canvas";
    if (region !== "canvas") {
      const at = region === "tree" ? document.querySelector("nav.tree .row.selected") : focusedStop();
      at?.scrollIntoView({ block: "center", inline: "nearest" });
    } else if (drawn) canvasView?.centre(drawn);
  }

  /** A prefix's second key. */
  function run(command: string) {
    const second = command[1];
    if (second in STEPS) viewBy(STEPS[second as Direction]);
    else if (command === "zz") centreCursor();
    else if (command === "zi") canvasView?.zoomBy(ZOOM_STEP);
    else if (command === "zo") canvasView?.zoomBy(1 / ZOOM_STEP);
    else if (command === "gg") toEnd(false);
    else stepTab(command === "gt" ? 1 : -1);
  }

  /** `n` and `N`: the next or previous search hit selected as a pick selects it, its level opened, the view following. */
  async function stepSearch(step: 1 | -1) {
    const tree = model?.tree;
    const s = tree && found ? stepHit(tree, session.level, found, session.selection, step) : undefined;
    if (!s) return;
    select(s);
    await tick();
    const t = s.target;
    if (t.kind !== "folder") canvasView?.follow(t.kind === "block" ? t.id : parsePortId(t.id).block);
  }

  /** Shift-j, and Enter with no stop focused: the selected closed assembly opened; false when the selection is none. */
  function openSelected(): boolean {
    const t = session.selection?.target;
    if (t?.kind !== "block" || model?.tree?.byPath.get(t.id)?.class !== "assembly") return false;
    open(t.id);
    return true;
  }

  function onkeydown(e: KeyboardEvent) {
    const name = keyName(e);
    const modified = e.ctrlKey || e.metaKey;
    // A key with Cmd or Ctrl is the browser's or acts on its own, so no prefix waits past it.
    if (modified) prefix = undefined;
    // Cmd-O and Ctrl-O pick a file wherever the page shows: a text field, the landing, under the help page.
    if (modified && !e.shiftKey && !e.altKey && name === "o") {
      e.preventDefault();
      picker?.click();
      return;
    }
    // The help page takes `?`, Escape, `j k d u gg G`; Tab and every other key are the browser's, so the page scrolls.
    if (session.help) {
      const page = document.querySelector("article.help");
      if (modified || !page || (e.altKey && e.key !== "Escape" && e.key !== "?")) return;
      const p = prefix || name === "g" ? pressPrefix(prefix, name, e.repeat) : undefined;
      if (p) {
        prefix = p.next;
        if (p.command === "gg") page.scrollTo(0, 0);
      } else if (e.key === "?") toggleHelp();
      else if (e.key === "Escape") escape();
      else if (name === "j" || name === "k") page.scrollBy(0, name === "j" ? SCROLL_STEP : -SCROLL_STEP);
      else if (name === "d" || name === "u") page.scrollBy(0, ((name === "d" ? 1 : -1) * page.clientHeight) / 2);
      else if (name === "G") page.scrollTo(0, page.scrollHeight);
      else return;
      e.preventDefault();
      return;
    }
    if (e.key === "Tab" && !modified && !e.altKey && (!prefix || typing(e.target))) {
      if (session.model && cycle(e.shiftKey)) e.preventDefault();
      return;
    }
    // Cmd-K and Ctrl-K reach the model's search from a text field too, the search field itself included.
    if (session.model && modified && !e.altKey && !e.shiftKey && name === "k") {
      e.preventDefault();
      focusSearch();
      return;
    }
    if (typing(e.target)) {
      if (endsHold(prefix, name)) prefix = undefined;
      return;
    }
    const p = session.model && !modified && (prefix || !e.altKey) ? pressPrefix(prefix, name, e.repeat) : undefined;
    if (p) {
      e.preventDefault();
      prefix = p.next;
      if (p.command) run(p.command);
      return;
    }
    if (e.key === "?" && !modified) {
      e.preventDefault();
      toggleHelp();
      return;
    }
    if (!session.model) return;
    if (modified) return;
    // `h j k l` and the arrows follow the focused region: the tree's rows, the detail pane's or the drawer's stops,
    // else the canvas's cursor and pan.
    const vim = name in STEPS ? (name as Direction) : undefined;
    const arrow: Direction | undefined = ARROWS[e.key];
    const dir = vim ?? arrow;
    const region = session.focus;
    let handled = true;
    if (e.key === "Backspace" || (e.key === "ArrowUp" && e.altKey) || (name === "K" && !e.altKey)) climb();
    else if (e.altKey) handled = false;
    // Enter on a stop or the menu's entry is the browser's press
    else if (e.key === "Enter") handled = !focusedStop() && !document.activeElement?.closest(".menu") && openSelected();
    else if (name === "J") openSelected();
    else if (e.key === "Escape") escape();
    else if (name === "H") back();
    else if (name === "L") forward();
    else if (dir && region === "tree") treeMove(dir);
    else if (dir && (region === "detail" || region === "drawer")) stopMove(region, dir);
    else if (vim) move(vim);
    else if (arrow) canvasView?.panBy(STEPS[arrow][0] * PAN_STEP, STEPS[arrow][1] * PAN_STEP);
    else if (name === "q") focusRegion("tree");
    else if (name === "w") focusRegion("canvas");
    else if (name === "e") focusRegion("detail");
    else if (name === "s") focusRegion("drawer");
    else if (name === "Q") togglePane("tree");
    else if (name === "E") togglePane("detail");
    else if (name === "S") toggleDrawerKey();
    else if (e.key === "<" || e.key === ">") resizeFocused(e.key === ">");
    else if (name === "d" || name === "u") viewBy(STEPS[name === "d" ? "j" : "k"], true);
    else if (name === "G") toEnd(true);
    else if (e.key === "0") canvasView?.fit();
    else if (e.key === "+" || e.key === "=") canvasView?.zoomBy(ZOOM_STEP);
    else if (e.key === "-") canvasView?.zoomBy(1 / ZOOM_STEP);
    else if (name === "n" || name === "N") stepSearch(name === "N" ? -1 : 1);
    else if (name === "x" || name === "X") canvasView?.undrag(name === "X");
    else if (e.key === "/") focusFilter() || focusSearch();
    else if (name === "c") setMode(prefs.mode === "tier" ? "rate" : "tier");
    else if (name === "y") toggleLabels();
    else if (name === "o") toggleOrder();
    else if (name === "t") traceFrom(model?.tree ? originOf(model, session.selection) : undefined);
    else handled = false;
    if (handled) e.preventDefault();
  }

  /**
   * A click on a stop, or on a row elsewhere than on its button, puts the cursor on it, before the click acts: WebKit
   * focuses no button and no link, and no browser a row. A click that only left a text selection on the row moves
   * nothing, since WebKit's `focus()` would clear it before the row reads it (answer 6).
   */
  function onclick(e: MouseEvent) {
    const t = e.target instanceof Element ? e.target : null;
    const region = regionOf(t);
    if (!t || (region !== "detail" && region !== "drawer")) return;
    const stop = t.closest("summary, button, a[href]");
    const row = t.closest("tr, .line, li.edge");
    if (!stop && row && dragged(e, row)) return;
    const at = stop ?? row?.querySelector("button.row");
    stopsOf(region).find((s) => s === at)?.focus({ preventScroll: true });
  }

  /** The region a focus change lands in, from the focused element's nearest region root. */
  function focusin(e: FocusEvent) {
    const t = e.target instanceof Element ? e.target : null;
    const region = regionOf(t);
    setFocus(region);
    watchRemoval(region, t);
  }
  /**
   * Focus leaving for no element clears the region. When the focused element was removed, its region keeps the
   * focus on its root while one stands: Chromium fires this before the removal, so the check waits a microtask.
   */
  function focusout(e: FocusEvent) {
    if (e.relatedTarget !== null) return;
    setFocus(undefined);
    watchRemoval(undefined, null);
    const t = e.target instanceof Element ? e.target : null;
    const region = regionOf(t);
    if (!t || !region) return;
    queueMicrotask(() => {
      const a = document.activeElement;
      if (!t.isConnected && (!a || a === document.body)) rootOf(region)?.focus({ preventScroll: true });
    });
  }
  /**
   * Firefox fires no `focusout` when the focused element is removed. So while an element inside a region root holds
   * the focus, the root's subtree is watched, and the root takes the focus once that element is gone and the body
   * holds it. A focused root itself is never watched.
   */
  let held: { region: Region; el: Element } | undefined;
  const removal = new MutationObserver(() => {
    const a = document.activeElement;
    if (held && !held.el.isConnected && (!a || a === document.body)) rootOf(held.region)?.focus({ preventScroll: true });
  });
  function watchRemoval(region: Region | undefined, el: Element | null) {
    removal.disconnect();
    held = undefined;
    const root = region && rootOf(region);
    if (!region || !el || !root || root === el) return;
    held = { region, el };
    removal.observe(root, { childList: true, subtree: true });
  }
  function drop(e: DragEvent) {
    e.preventDefault();
    dragging = false;
    openFile(e.dataTransfer?.files[0]);
  }
</script>

<svelte:window
  ondragover={(e) => { e.preventDefault(); dragging = true; }}
  ondragleave={() => (dragging = false)}
  ondrop={drop}
  {onkeydown}
  onkeyup={(e) => (prefix = releasePrefix(prefix, e.key))}
  onblur={() => { if (prefix?.held) prefix = undefined; }}
  onclickcapture={onclick}
  onfocusin={focusin}
  onfocusout={focusout}
  onpopstate={(e) => openFromHistory(location.hash, e.state)}
/>

<main
  class:dragging
  style="--text:{palette.text};--text-light:{palette.textLight};--bg:{palette.background};--border:{palette.paneBorder};--strip:{palette.strip}"
>
  {#if session.help}
    <Help onclose={closeHelp} />
  {/if}
  <input
    class="pick" type="file" accept=".json,application/json" hidden bind:this={picker}
    onchange={(e) => { openFile(e.currentTarget.files?.[0]); e.currentTarget.value = ""; }}
  />
  <div class="under" inert={session.help}>
  {#if model}
    <Frame drawerOpen={session.drawer.open}>
      {#snippet tree()}
        <Tree
          {model} level={session.level} mode={prefs.mode} selection={session.selection} expanded={session.expanded}
          focused={session.focus === "tree"} {listing} {marks} {counts} {diagnosticMarks} {routeMarks} onselect={select} onopen={open} ontoggle={toggleExpanded}
        >
          {#snippet search()}
            <Search
              {model} level={session.level} query={session.query} {found} bind:listing
              onquery={setQuery} onselect={select} ondone={focusCanvas}
            />
          {/snippet}
        </Tree>
      {/snippet}
      {#snippet breadcrumb()}
        <Breadcrumb {model} level={session.level} mode={prefs.mode} labels={prefs.labels} order={prefs.order} onopen={open} onfile={openFile} onmode={setMode} onlabels={toggleLabels} onorder={toggleOrder} />
      {/snippet}
      {#snippet canvas()}
        {#if model.tree}
          {#key model}
            <Canvas
              bind:this={canvasView} {model} path={session.level} mode={prefs.mode} labels={prefs.labels} order={prefs.order} selected={drawn} hits={lit && !unlit ? undefined : hits} lit={unlit ? undefined : lit} focus={unlit ? undefined : focus}
              focusKey={unlit ? undefined : focusKey} {legendFocus} {overlay} {routeDrawn}
              view={session.views.get(session.level)} layout={session.layouts.get(session.level)}
              focused={session.focus === "canvas"} onopen={open}
              onselect={(t) => select(t && { level: session.level, target: t })}
              onview={(v) => setView(session.level, v)}
              onlayout={(g, d) => setLayout(session.level, g, d)}
              onlegend={toggleLegendFocus}
              onbadge={badge}
              ontrace={traceFrom}
            />
          {/key}
        {:else}
          <pre class="outcome">{`${model.label}\nno structure to draw`}</pre>
        {/if}
      {/snippet}
      {#snippet detail()}
        <Detail
          {model} level={session.level} selection={session.selection} focused={session.focus === "detail"}
          editor={live.state === "connected"} onselect={select} onopen={open} {onlocation}
          origin={selectionOrigin} tracing={sameFace(selectionOrigin, session.route)} ontrace={traceFrom}
          sections={session.sections} onsection={setSection}
        />
      {/snippet}
      {#snippet drawer()}
        <Drawer
          {model} open={session.drawer.open} tab={session.drawer.tab} focused={session.focus === "drawer"} {diagnostics}
          current={session.diagnosticFocus} editor={live.state === "connected"} ontab={toggleDrawer} ondiagnostic={diagnostic} {onlocation}
          onrow={select} {legendFocus} onlegend={chartSwatch}
        />
      {/snippet}
      {#snippet status()}
        <StatusBar
          {model} mode={prefs.mode} fallback={session.note} notice={session.notice} connection={live.state} received={live.text !== undefined}
          download={pushed ? live.text : undefined} route={traced && routeStatus(traced.origin, traced)} {focusNote} prefix={prefix?.key} onclear={clearRoute}
        />
      {/snippet}
    </Frame>
  {:else}
    <div class="waiting">
      <div class="landing-area"><Landing outcome={refusal} onfile={openFile} /></div>
      {#if live.state === "connected" || live.state === "lost"}
        <StatusBar connection={live.state} received={live.text !== undefined} />
      {/if}
    </div>
  {/if}
  </div>
</main>

<style>
  :global(html, body) { margin: 0; height: 100%; }
  main { position: relative; font-family: system-ui, sans-serif; height: 100vh; box-sizing: border-box; color: var(--text); background: var(--bg); }
  .under { height: 100%; }
  main.dragging { outline: 2px dashed gray; outline-offset: -2px; }
  pre.outcome { white-space: pre-wrap; margin: 1rem; }
  .waiting { display: flex; flex-direction: column; height: 100%; }
  .landing-area { flex: 1; min-height: 0; overflow: auto; }
</style>
