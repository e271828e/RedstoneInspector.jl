<script lang="ts">
  // The shell: a file picked or dropped anywhere on the page, the landing panel
  // before a model, the frame over the session once one loads; the window's
  // title, the hash and back and forward, and the keyboard table outside text
  // fields (workspace.md answer 11).
  import Canvas, { type Target } from "./canvas/Canvas.svelte";
  import { palette } from "./canvas/palette";
  import Breadcrumb from "./frame/Breadcrumb.svelte";
  import Detail from "./frame/Detail.svelte";
  import Drawer from "./frame/Drawer.svelte";
  import Frame from "./frame/Frame.svelte";
  import Landing from "./frame/Landing.svelte";
  import StatusBar from "./frame/StatusBar.svelte";
  import Tree from "./frame/Tree.svelte";
  import { parsePortId } from "./lib/level";
  import { fromFile } from "./lib/loader";
  import { loadModel } from "./lib/model";
  import { nearest, type Direction } from "./lib/navigate";
  import {
    climb, escape, levelOfHash, load, open, openFromHistory, select, session, setFocus, setLayout, setView, toggleDrawer,
    toggleExpanded, type Region,
  } from "./state/session.svelte";

  let refusal = $state<string | undefined>();
  let dragging = $state(false);
  let canvasView = $state<ReturnType<typeof Canvas>>();

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

  $effect(() => {
    document.title = model ? `${model.label} – Redstone inspector` : "Redstone inspector";
  });

  async function openFile(file: File | undefined) {
    if (!file) return;
    const r = await fromFile(file);
    if (!r.ok) {
      load(undefined);
      refusal = r.reason;
      return;
    }
    refusal = undefined;
    load(loadModel(r));
  }

  const typing = (t: EventTarget | null) =>
    t instanceof HTMLInputElement || t instanceof HTMLTextAreaElement || t instanceof HTMLSelectElement
    || (t instanceof HTMLElement && t.isContentEditable);

  /** Tab and Shift-Tab: the next or previous region root present, wrapping; false when there is none. */
  function cycle(back: boolean): boolean {
    const roots = REGIONS.map(([, sel]) => document.querySelector<HTMLElement>(sel)).filter((r) => r !== null);
    if (!roots.length) return false;
    const i = roots.findIndex((r) => r.contains(document.activeElement));
    const next = i < 0 ? (back ? roots.length - 1 : 0) : (i + (back ? -1 : 1) + roots.length) % roots.length;
    roots[next].focus();
    return true;
  }

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

  function onkeydown(e: KeyboardEvent) {
    const tree = session.model?.tree;
    if (e.key === "Tab" && !e.ctrlKey && !e.metaKey && !e.altKey) {
      if (session.model && cycle(e.shiftKey)) e.preventDefault();
      return;
    }
    if (!session.model || typing(e.target) || e.ctrlKey || e.metaKey) return;
    const s = session.selection;
    const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    const arrows: Record<string, [number, number]> = {
      ArrowLeft: [-1, 0], ArrowDown: [0, 1], ArrowUp: [0, -1], ArrowRight: [1, 0],
    };
    const vim: Record<string, [number, number]> = { h: [-1, 0], j: [0, 1], k: [0, -1], l: [1, 0] };
    let handled = true;
    if (e.key === "Backspace" || (e.key === "ArrowUp" && e.altKey)) climb();
    else if (e.altKey) handled = false;
    else if (e.key === "Enter" && s?.target.kind === "block" && tree?.byPath.get(s.target.id)?.class === "assembly") open(s.target.id);
    else if (e.key === "Escape") escape();
    else if (key in vim && e.shiftKey) canvasView?.panBy(vim[key][0] * PAN_STEP, vim[key][1] * PAN_STEP);
    else if (key in vim) move(key as Direction);
    else if (e.key in arrows) canvasView?.panBy(arrows[e.key][0] * PAN_STEP, arrows[e.key][1] * PAN_STEP);
    else if (e.key === "0") canvasView?.fit();
    else if (e.key === "+" || e.key === "=") canvasView?.zoomBy(ZOOM_STEP);
    else if (e.key === "-") canvasView?.zoomBy(1 / ZOOM_STEP);
    else if (key === "d" && !e.shiftKey) toggleDrawer(session.drawer.tab);
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
  onpopstate={() => openFromHistory(levelOfHash(location.hash))}
/>

<main class:dragging style="--text:{palette.text};--text-light:{palette.textLight};--bg:{palette.background}">
  {#if model}
    <Frame drawerOpen={session.drawer.open}>
      {#snippet tree()}
        <Tree
          {model} level={session.level} selection={session.selection} expanded={session.expanded}
          focused={session.focus === "tree"} onselect={select} onopen={open} ontoggle={toggleExpanded}
        />
      {/snippet}
      {#snippet breadcrumb()}
        <Breadcrumb {model} level={session.level} onopen={open} onfile={openFile} />
      {/snippet}
      {#snippet canvas()}
        {#if model.tree}
          {#key model}
            <Canvas
              bind:this={canvasView} {model} path={session.level} selected={drawn}
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
          onselect={select} onopen={open}
        />
      {/snippet}
      {#snippet drawer()}
        <Drawer {model} open={session.drawer.open} tab={session.drawer.tab} focused={session.focus === "drawer"} ontab={toggleDrawer} />
      {/snippet}
      {#snippet status()}
        <StatusBar {model} fallback={session.note} />
      {/snippet}
    </Frame>
  {:else}
    <Landing outcome={refusal} onfile={openFile} />
  {/if}
</main>

<style>
  :global(html, body) { margin: 0; height: 100%; }
  main { font-family: system-ui, sans-serif; height: 100vh; box-sizing: border-box; color: var(--text); background: var(--bg); }
  main.dragging { outline: 2px dashed gray; outline-offset: -2px; }
  pre.outcome { white-space: pre-wrap; margin: 1rem; }
</style>
