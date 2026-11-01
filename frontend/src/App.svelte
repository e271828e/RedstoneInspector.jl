<script lang="ts">
  // The shell: a file picked or dropped anywhere on the page, the landing panel
  // before a model, the frame over the session once one loads; the window's
  // title, the hash and back and forward, and the keyboard table outside text
  // fields (workspace.md answer 11); the live tab's socket, its descriptors fed
  // to the loader a dropped file goes through (live_session.md answer 5).
  import Canvas, { type Target } from "./canvas/Canvas.svelte";
  import { palette } from "./canvas/palette";
  import Breadcrumb from "./frame/Breadcrumb.svelte";
  import Detail from "./frame/Detail.svelte";
  import Drawer from "./frame/Drawer.svelte";
  import Frame from "./frame/Frame.svelte";
  import Landing from "./frame/Landing.svelte";
  import Search from "./frame/Search.svelte";
  import StatusBar from "./frame/StatusBar.svelte";
  import Tree from "./frame/Tree.svelte";
  import { parsePortId } from "./lib/level";
  import { connect, sendOpenLocation } from "./live/socket";
  import { fromFile, parseDescriptor, type Loaded, type Refusal } from "./lib/loader";
  import { loadModel } from "./lib/model";
  import { nearest, type Direction } from "./lib/navigate";
  import { outlineRows, rowSelection, treeStep } from "./lib/outline";
  import { beneath, levelHits, marked, parseQuery, searchModel, stepHit } from "./lib/search";
  import {
    back, climb, escape, forward, levelOfHash, load, open, openFromHistory, select, session, setFocus, setLayout, setQuery,
    setView, toggleDrawer, toggleExpanded, type Region,
  } from "./state/session.svelte";
  import { live } from "./state/live.svelte";
  import { prefs, toggleCollapsed } from "./state/prefs.svelte";
  import { onMount, tick } from "svelte";

  let refusal = $state<string | undefined>();
  let dragging = $state(false);
  let canvasView = $state<ReturnType<typeof Canvas>>();
  let listing = $state(false);
  /** The model came over the socket, so `live.text` holds its bytes for the download. */
  let pushed = $state(false);

  /** Screen pixels a panning key moves the view by. */
  const PAN_STEP = 48;
  /** The zoom keys' factor, about the viewport's center. */
  const ZOOM_STEP = 1.25;
  /** The four regions in Tab's order, by their roots. */
  const REGIONS: [Region, string][] = [["tree", "nav.tree"], ["canvas", ".viewport"], ["detail", "aside.detail"], ["drawer", "section.drawer"]];
  /** Keys reserved for later increments, swallowed so the browser's defaults do not fire: trace, rate mode, type labels, order badges, help. */
  const RESERVED = new Set(["t", "r", "y", "o", "?"]);

  const model = $derived(session.model);
  /** The selection the canvas draws: one made on the open level, a folder excepted. */
  const drawn = $derived.by((): Target | undefined => {
    const s = session.selection;
    return s && s.level === session.level && s.target.kind !== "folder" ? (s.target as Target) : undefined;
  });

  // The standing query's hits over the whole model, the marks on the tree and the hits on the drawn level.
  const found = $derived.by(() => {
    const terms = parseQuery(session.query);
    return model?.tree && terms.length ? searchModel(model, terms) : undefined;
  });
  const marks = $derived(found && marked(found));
  const counts = $derived(model?.tree && marks ? beneath(model.tree, marks) : undefined);
  const hits = $derived(model?.tree && found ? levelHits(model.tree, session.level, found) : undefined);

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
      return;
    }
    refusal = undefined;
    pushed = fromSocket;
    // A replaced canvas takes the focus with it; the region that held it gets it back.
    const held = session.model ? session.focus : undefined;
    load(loadModel(r));
    if (held) {
      tick().then(() => {
        if (!document.activeElement || document.activeElement === document.body) rootOf(held)?.focus();
      });
    }
  }

  async function openFile(file: File | undefined) {
    if (!file) return;
    accept(await fromFile(file), false);
  }

  onMount(() => connect((text) => accept(parseDescriptor(text), true)));

  /** A location click: sent to the editor while connected, else false and the pane copies it. */
  const onlocation = (file: string, line: number) => sendOpenLocation(file, line);

  const typing = (t: EventTarget | null) =>
    t instanceof HTMLInputElement || t instanceof HTMLTextAreaElement || t instanceof HTMLSelectElement
    || (t instanceof HTMLElement && t.isContentEditable);

  const rootOf = (region: Region) => document.querySelector<HTMLElement>(REGIONS.find(([r]) => r === region)![1]);

  /** Tab and Shift-Tab: the next or previous region root present, wrapping; false when there is none. */
  function cycle(back: boolean): boolean {
    const roots = REGIONS.map(([, sel]) => document.querySelector<HTMLElement>(sel)).filter((r) => r !== null);
    if (!roots.length) return false;
    const i = roots.findIndex((r) => r.contains(document.activeElement));
    const next = i < 0 ? (back ? roots.length - 1 : 0) : (i + (back ? -1 : 1) + roots.length) % roots.length;
    roots[next].focus();
    return true;
  }

  /** `/` and Cmd-K: the search field focused with its text selected, the tree pane expanded first if collapsed. */
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

  /** The block a direction key starts from: the selected block or pin, a port's block, a wire's consumer. */
  function origin(): string | undefined {
    const t = drawn;
    if (!t) return undefined;
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

  /** Enter and Shift-j: the selected closed assembly opened; false when the selection is none. */
  function openSelected(): boolean {
    const t = session.selection?.target;
    if (t?.kind !== "block" || model?.tree?.byPath.get(t.id)?.class !== "assembly") return false;
    open(t.id);
    return true;
  }

  function onkeydown(e: KeyboardEvent) {
    if (e.key === "Tab" && !e.ctrlKey && !e.metaKey && !e.altKey) {
      if (session.model && cycle(e.shiftKey)) e.preventDefault();
      return;
    }
    if (!session.model || typing(e.target)) return;
    if ((e.ctrlKey || e.metaKey) && !e.altKey && !e.shiftKey && e.key.toLowerCase() === "k") {
      e.preventDefault();
      focusSearch();
      return;
    }
    if (e.ctrlKey || e.metaKey) return;
    const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    const inTree = e.target instanceof Element && !!e.target.closest("nav.tree");
    const arrows: Record<string, [number, number]> = {
      ArrowLeft: [-1, 0], ArrowDown: [0, 1], ArrowUp: [0, -1], ArrowRight: [1, 0],
    };
    const vim: Record<string, [number, number]> = { h: [-1, 0], j: [0, 1], k: [0, -1], l: [1, 0] };
    let handled = true;
    if (e.key === "Backspace" || (e.key === "ArrowUp" && e.altKey) || (key === "k" && e.shiftKey && !e.altKey)) climb();
    else if (e.altKey) handled = false;
    else if (e.key === "Enter") handled = openSelected();
    else if (key === "j" && e.shiftKey) openSelected();
    else if (e.key === "Escape") escape();
    else if (key === "h" && e.shiftKey) back();
    else if (key === "l" && e.shiftKey) forward();
    else if (key in vim && inTree) treeMove(key as Direction);
    else if (key in vim) move(key as Direction);
    else if (e.key in arrows) canvasView?.panBy(arrows[e.key][0] * PAN_STEP, arrows[e.key][1] * PAN_STEP);
    else if (e.key === "0") canvasView?.fit();
    else if (key === "z" && !e.shiftKey) { if (drawn) canvasView?.centre(drawn); }
    else if (key === "n") stepSearch(e.key === "N" ? -1 : 1);
    else if (e.key === "+" || e.key === "=") canvasView?.zoomBy(ZOOM_STEP);
    else if (e.key === "-") canvasView?.zoomBy(1 / ZOOM_STEP);
    else if (key === "d" && !e.shiftKey) toggleDrawer(session.drawer.tab);
    else if (e.key === "/") focusSearch();
    else handled = RESERVED.has(e.key); // swallowed until their increments
    if (handled) e.preventDefault();
  }

  /** The region a focus change lands in, from the focused element's nearest region root. */
  function focusin(e: FocusEvent) {
    const t = e.target instanceof Element ? e.target : null;
    setFocus(REGIONS.find(([, sel]) => t?.closest(sel))?.[0]);
  }
  function focusout(e: FocusEvent) {
    if (e.relatedTarget === null) setFocus(undefined);
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
  onfocusin={focusin}
  onfocusout={focusout}
  onpopstate={(e) => openFromHistory(levelOfHash(location.hash), e.state)}
/>

<main
  class:dragging
  style="--text:{palette.text};--text-light:{palette.textLight};--bg:{palette.background};--border:{palette.paneBorder};--strip:{palette.strip}"
>
  {#if model}
    <Frame drawerOpen={session.drawer.open}>
      {#snippet tree()}
        <Tree
          {model} level={session.level} selection={session.selection} expanded={session.expanded}
          focused={session.focus === "tree"} {listing} {marks} {counts} onselect={select} onopen={open} ontoggle={toggleExpanded}
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
        <Breadcrumb {model} level={session.level} onopen={open} onfile={openFile} />
      {/snippet}
      {#snippet canvas()}
        {#if model.tree}
          {#key model}
            <Canvas
              bind:this={canvasView} {model} path={session.level} selected={drawn} {hits}
              view={session.views.get(session.level)} layout={session.layouts.get(session.level)}
              focused={session.focus === "canvas"} onopen={open}
              onselect={(t) => select(t && { level: session.level, target: t })}
              onview={(v) => setView(session.level, v)}
              onlayout={(g, d) => setLayout(session.level, g, d)}
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
        />
      {/snippet}
      {#snippet drawer()}
        <Drawer {model} open={session.drawer.open} tab={session.drawer.tab} focused={session.focus === "drawer"} ontab={toggleDrawer} />
      {/snippet}
      {#snippet status()}
        <StatusBar
          {model} fallback={session.note} connection={live.state} received={live.text !== undefined}
          download={pushed ? live.text : undefined}
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
</main>

<style>
  :global(html, body) { margin: 0; height: 100%; }
  main { font-family: system-ui, sans-serif; height: 100vh; box-sizing: border-box; color: var(--text); background: var(--bg); }
  main.dragging { outline: 2px dashed gray; outline-offset: -2px; }
  pre.outcome { white-space: pre-wrap; margin: 1rem; }
  .waiting { display: flex; flex-direction: column; height: 100%; }
  .landing-area { flex: 1; min-height: 0; overflow: auto; }
</style>
