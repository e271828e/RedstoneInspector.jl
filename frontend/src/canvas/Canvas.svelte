<script lang="ts" module>
  /** What a click selects: a block or pin by block id, a wire by wire id, a port square by port id. */
  export type Target = { kind: "block" | "wire" | "port"; id: string };
</script>

<script lang="ts">
  // The level's canvas: ELK's layout drawn as SVG (visual_grammar.md answers 1
  // to 4), the view as the SVG's viewBox, opening and selection (workspace.md
  // answers 3 and 4), halos and casings in the one highlight hue (answer 9).
  // The view and the layout are the session's: restored on a revisit, reported
  // on every change. A child block drags, its wires re-routed locally
  // (initial_design.md answer 12).
  import { tick, untrack } from "svelte";
  import type { Block, BlockSize, ChildBlock, Level, LevelEnd, LevelWire } from "../lib/level";
  import { levelOf, portId } from "../lib/level";
  import type { Model } from "../lib/model";
  import type { LevelHits } from "../lib/search";
  import { follow as followView, type Box } from "../lib/navigate";
  import { fitView, pan, viewRect, zoomAt, type Point, type Rect, type View } from "../lib/view";
  import { layoutLevel, pathD, type Geometry, type LevelLayout } from "./layout";
  import { palette } from "./palette";
  import { rerouteTouching } from "./router";
  import {
    cutName, FACE_FONT, isPinned, MARK, NAME_FONT, PAD, PIN_FONT, PIN_HEIGHT, POINT, PORT, SEGMENT_FONT, SLOT,
    sizeLevel, textWidth,
  } from "./size";

  let { model, path, selected, view: savedView, layout: savedLayout, hits, focused = false, onopen, onselect, onview, onlayout }: {
    model: Model;
    path: string;
    /** The target drawn as selected; the caller passes it only on the level it was selected on. */
    selected?: Target;
    /** The level's view the session holds, restored instead of fitting; read when the level is drawn. */
    view?: View;
    /** The level's layout the session holds, drawn instead of running ELK unless stale; read when the level is drawn. */
    layout?: LevelLayout;
    /** A standing query's hits on this level: drawn with the dashed halo, the rest dimmed. */
    hits?: LevelHits;
    /** The keyboard's focus is in the canvas region. */
    focused?: boolean;
    onopen?: (path: string) => void;
    /** A click on a target, `undefined` for a background click; the caller decides. */
    onselect?: (target: Target | undefined) => void;
    /** Every change of the view. */
    onview?: (view: View) => void;
    /** A level laid out, or a drag released: the geometry and the dragged block ids in drag order. */
    onlayout?: (geometry: Geometry, dragged: ReadonlySet<string>) => void;
  } = $props();

  const FIT_PADDING = 24;
  /** A fitted small level stops at twice its natural size. */
  const FIT_MAX_SCALE = 2;
  /** The wheel's zoom per pixel of scroll. */
  const WHEEL_RATE = 0.0015;
  /** A pointer travel under this many pixels is a click, not a drag. */
  const CLICK_SLOP = 3;

  let svg = $state<SVGSVGElement>();
  let width = $state(0);
  let height = $state(0);
  let shown = $state.raw<{ level: Level; sizes: Map<string, BlockSize>; geometry: Geometry } | undefined>();
  /** The dragged block ids in drag order; the last is drawn last. */
  let dragged = $state.raw<ReadonlySet<string>>(new Set());
  let ready = $state(false);
  let view = $state<View>({ x: 0, y: 0, scale: 1 });
  let hovered = $state<Target | undefined>();

  const tree = $derived(model.tree!);
  const stage1 = $derived(new Map((model.outputs?.components ?? []).map((c) => [c.path, new Set(c.stage1)])));

  /** ELK's fresh output with a stale layout's dragged blocks put back at their dragged places. */
  function replace(laid: Geometry, level: Level, sizes: Map<string, BlockSize>, old: LevelLayout) {
    let g = laid;
    const kept = new Set<string>();
    for (const id of old.dragged) {
      const was = old.geometry.boxes.get(id), now = g.boxes.get(id);
      if (!was || !now) continue;
      g = { ...g, boxes: new Map(g.boxes).set(id, { ...now, x: was.x, y: was.y }) };
      g = { ...g, routes: rerouteTouching(g, level, sizes, id) };
      kept.add(id);
    }
    return { geometry: g, dragged: kept };
  }

  function draw(level: Level, sizes: Map<string, BlockSize>, geometry: Geometry, d: ReadonlySet<string>, v: View | undefined) {
    shown = { level, sizes, geometry };
    dragged = d;
    if (v) setView(v);
    else fit();
    ready = true;
  }

  $effect(() => {
    const level = levelOf(tree, model.resolution!, path);
    const sizes = sizeLevel(level, tree);
    const [saved, v] = untrack(() => [savedLayout, savedView] as const);
    let stale = false;
    hovered = undefined;
    blockDrag = undefined;
    if (saved && !saved.stale) {
      untrack(() => draw(level, sizes, saved.geometry, saved.dragged, v));
      return;
    }
    ready = false;
    layoutLevel(level, sizes).then((laid) => {
      if (stale) return;
      const r = saved ? replace(laid, level, sizes, saved) : { geometry: laid, dragged: new Set<string>() };
      draw(level, sizes, r.geometry, r.dragged, v);
      onlayout?.(r.geometry, r.dragged);
    });
    return () => { stale = true; };
  });

  function setView(v: View) {
    view = v;
    onview?.(v);
  }

  /** Fits the level, dragged blocks included. */
  export function fit() {
    if (!shown) return;
    const g = shown.geometry;
    let x0 = 0, y0 = 0, x1 = g.width, y1 = g.height;
    for (const b of g.boxes.values()) {
      x0 = Math.min(x0, b.x); y0 = Math.min(y0, b.y);
      x1 = Math.max(x1, b.x + b.width); y1 = Math.max(y1, b.y + b.height);
    }
    setView(fitView({ x: x0, y: y0, width: x1 - x0, height: y1 - y0 }, { width, height }, FIT_PADDING, FIT_MAX_SCALE));
  }

  /** Zooms by a factor about the viewport's center. */
  export function zoomBy(factor: number) {
    setView(zoomAt(view, { x: width / 2, y: height / 2 }, factor));
  }

  /** Moves the view by screen pixels: a positive `dx` shows what lies to the right. */
  export function panBy(dx: number, dy: number) {
    setView(pan(view, -dx, -dy));
  }

  /** The drawn level's blocks and pins in world units, in the level's order; none while a level is laid out. */
  export function boxes(): Box[] {
    if (!ready || !shown) return [];
    const g = shown.geometry;
    return shown.level.blocks.map((b) => ({ id: b.id, ...g.boxes.get(b.id)! }));
  }

  /** Pans by the least amount that brings a block into view. */
  export function follow(id: string) {
    const b = ready ? shown?.geometry.boxes.get(id) : undefined;
    if (b) setView(followView(view, { width, height }, b, FIT_PADDING));
  }

  const viewBox = $derived.by(() => {
    const r = viewRect(view, { width, height });
    return `${r.x} ${r.y} ${r.width} ${r.height}`;
  });

  // Selection and hover.
  const select = (t: Target | undefined) => onselect?.(t);
  const same = (a: Target | undefined, kind: Target["kind"], id: string) => a?.kind === kind && a.id === id;
  const touches = (w: LevelWire, t: Target | undefined) => t?.kind === "block" && (w.from.block === t.id || w.to.block === t.id);
  const endPort = (e: LevelEnd, side: "in" | "out") => portId(e.block, side, e.port);
  /** The two port squares of the selected or hovered wire. */
  const markedPorts = $derived.by(() => {
    const marked = new Map<string, "selected" | "hover">();
    for (const [t, strength] of [[hovered, "hover"], [selected, "selected"]] as const) {
      const w = t?.kind === "wire" ? shown?.level.wires.find((x) => x.id === t.id) : undefined;
      if (w) for (const p of [endPort(w.from, "out"), endPort(w.to, "in")]) marked.set(p, strength);
    }
    return marked;
  });

  // Pan, zoom, the background click and the block drag.
  let drag: { start: Point; view: View; moved: boolean; id: number } | undefined;
  let blockDrag: { block: string; el: Element; start: Point; box: Rect; moved: boolean; id: number } | undefined;
  const local = (e: MouseEvent): Point => {
    const r = svg!.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };
  function pointerdown(e: PointerEvent) {
    if (e.target !== svg || e.button !== 0) return;
    drag = { start: local(e), view, moved: false, id: e.pointerId };
    svg.setPointerCapture(e.pointerId);
  }
  /**
   * A press on a child block, the drag starting past the slop. The pointer is captured on the block's group only
   * then, once the raise has moved the group last: a capture from the press would retarget a port square's click,
   * and moving a captured node releases the capture.
   */
  function blockdown(e: PointerEvent, b: Block) {
    if (e.button !== 0 || !shown || (b.role !== "leaf" && b.role !== "assembly")) return;
    const el = e.currentTarget as Element;
    blockDrag = { block: b.id, el, start: local(e), box: shown.geometry.boxes.get(b.id)!, moved: false, id: e.pointerId };
  }
  function blockmove(e: PointerEvent) {
    const d = blockDrag!;
    const p = local(e);
    const dx = p.x - d.start.x, dy = p.y - d.start.y;
    if (!d.moved && Math.hypot(dx, dy) < CLICK_SLOP) return;
    if (!d.moved) {
      d.moved = true;
      dragged = new Set([...dragged].filter((id) => id !== d.block).concat(d.block));
      tick().then(() => blockDrag === d && d.el.isConnected && d.el.setPointerCapture(d.id));
    }
    const s = shown!;
    const box = { ...d.box, x: d.box.x + dx / view.scale, y: d.box.y + dy / view.scale };
    const g = { ...s.geometry, boxes: new Map(s.geometry.boxes).set(d.block, box) };
    shown = { ...s, geometry: { ...g, routes: rerouteTouching(g, s.level, s.sizes, d.block) } };
  }
  function pointermove(e: PointerEvent) {
    if (blockDrag && e.pointerId === blockDrag.id) return blockmove(e);
    if (!drag || e.pointerId !== drag.id) return;
    const p = local(e);
    const dx = p.x - drag.start.x, dy = p.y - drag.start.y;
    if (!drag.moved && Math.hypot(dx, dy) < CLICK_SLOP) return;
    drag.moved = true;
    setView(pan(drag.view, dx, dy));
  }
  function pointerup(e: PointerEvent) {
    if (blockDrag && e.pointerId === blockDrag.id) {
      // The raise moved the pressed node, so the browser fires no click after the release: select here.
      if (blockDrag.moved && shown) {
        onlayout?.(shown.geometry, dragged);
        select({ kind: "block", id: blockDrag.block });
      }
      blockDrag = undefined;
      return;
    }
    if (!drag || e.pointerId !== drag.id) return;
    if (!drag.moved) select(undefined);
    drag = undefined;
  }
  $effect(() => {
    const el = svg;
    if (!el) return;
    // Added by hand: the wheel must not scroll the page, so the listener cannot be passive.
    const wheel = (e: WheelEvent) => {
      e.preventDefault();
      setView(zoomAt(view, local(e), Math.exp(-e.deltaY * WHEEL_RATE)));
    };
    el.addEventListener("wheel", wheel, { passive: false });
    return () => el.removeEventListener("wheel", wheel);
  });

  /** The blocks in drawing order: the most recently dragged last, above its neighbours. */
  const ordered = $derived.by(() => {
    if (!shown) return [];
    const last = [...dragged].at(-1);
    const top = shown.level.blocks.find((b) => b.id === last);
    return top ? [...shown.level.blocks.filter((b) => b !== top), top] : shown.level.blocks;
  });

  // Opening.
  function dblclick(b: Block) {
    if (b.role === "assembly") onopen?.(b.path);
  }

  // Drawing.
  const isStage1 = (b: ChildBlock, name: string) => b.role === "leaf" && !!stage1.get(b.path)?.has(name);
  const tierColors = (b: ChildBlock) =>
    b.role === "assembly" ? palette.assembly : b.tier === "discrete" ? palette.discrete : palette.continuous;
  /** A root tag: rounded at its outer end past the empty slot, pointed at its inner end. */
  function tagD(w: number, grow = 0): string {
    const r = PIN_HEIGHT / 2 + grow, x0 = SLOT + PIN_HEIGHT / 2, y0 = -grow, y1 = PIN_HEIGHT + grow;
    return `M${x0},${y0} L${w - POINT},${y0} L${w + grow},${PIN_HEIGHT / 2} L${w - POINT},${y1} L${x0},${y1} A${r},${r} 0 0 1 ${x0},${y0} Z`;
  }
  /** A pinned face's mark, a small diamond centered at (x, y). */
  const markD = (x: number, y: number) => `M${x},${y - 3} L${x + 3},${y} L${x},${y + 3} L${x - 3},${y} Z`;
  const qualified = (p: string) => {
    const n = tree.byPath.get(p)!;
    return n.alias ?? n.type;
  };
  /** A wire endpoint as text: a pin by its face name, a block by its path and port. */
  function endText(e: LevelEnd): string {
    const b = shown?.level.blocks.find((x) => x.id === e.block);
    if (b?.role === "in") return `${e.port} (level input)`;
    if (b?.role === "out") return `${e.port} (level output)`;
    return `${e.block || "/"} ${e.port}`;
  }
  const blockClass = (b: Block) => ({
    selected: same(selected, "block", b.id),
    hover: same(hovered, "block", b.id) && !same(selected, "block", b.id),
    "search-hit": !!hits?.blocks.has(b.id),
    "search-under": !!hits?.under.has(b.id),
  });
  /** A hit's halo is dashed, the selected hit's solid. */
  const dashed = (b: Block) => (!!hits?.blocks.has(b.id) || !!hits?.under.has(b.id)) && !same(selected, "block", b.id);
  const portClass = (id: string) => ({
    selected: same(selected, "port", id),
    hover: same(hovered, "port", id) && !same(selected, "port", id),
    marked: markedPorts.get(id) === "selected",
    "marked-hover": markedPorts.get(id) === "hover",
    "search-hit": !!hits?.ports.has(id),
  });
</script>

<!-- svelte-ignore a11y_no_noninteractive_tabindex (a region root, one of Tab's four stops by answer 11) -->
<div
  class="viewport" class:focused tabindex="0" role="region" aria-label="the canvas" bind:clientWidth={width} bind:clientHeight={height}
  style="--wire:{palette.wire};--text:{palette.text};--text-light:{palette.textLight};--port:{palette.port};--bg:{palette.background};--highlight:{palette.highlight};--dim:{palette.dim};--dash:{palette.dash}"
>
  <svg
    bind:this={svg} class="canvas" class:searching={!!hits} data-level={shown?.level.path} data-ready={ready ? "" : undefined}
    {viewBox} {width} {height} role="application" aria-label="the open level"
    onpointerdown={pointerdown} onpointermove={pointermove} onpointerup={pointerup} onpointercancel={pointerup}
  >
    <defs>
      <marker id="arrow" viewBox="0 0 8 8" refX="11" refY="4" markerWidth="7" markerHeight="7" orient="auto">
        <path d="M0,0 L8,4 L0,8 z" fill={palette.wire} />
      </marker>
    </defs>
    {#if shown}
      {@const g = shown.geometry}
      <g class="casings">
        {#each shown.level.wires as w (w.id)}
          {@const route = g.routes.get(w.id)}
          {#if route}
            {#if same(selected, "wire", w.id)}
              <path class="casing selected" data-wire={w.id} d={pathD(route)} />
            {:else if touches(w, selected)}
              <path class="casing incident" data-wire={w.id} d={pathD(route)} />
            {:else if same(hovered, "wire", w.id)}
              <path class="casing hover" data-wire={w.id} d={pathD(route)} />
            {:else if touches(w, hovered)}
              <path class="casing incident-hover" data-wire={w.id} d={pathD(route)} />
            {/if}
          {/if}
        {/each}
      </g>
      <g class="wires">
        {#each shown.level.wires as w (w.id)}
          {@const route = g.routes.get(w.id)}
          {#if route}
            <path
              class="wire" class:selected={same(selected, "wire", w.id)}
              class:hover={same(hovered, "wire", w.id) && !same(selected, "wire", w.id)}
              data-wire={w.id} d={pathD(route)} marker-end="url(#arrow)"
            />
            <path
              class="wire-hit" data-hit={w.id} d={pathD(route)} role="none"
              onclick={() => select({ kind: "wire", id: w.id })}
              onpointerenter={() => (hovered = { kind: "wire", id: w.id })}
              onpointerleave={() => (hovered = undefined)}
            ><title>{endText(w.from)} → {endText(w.to)}</title></path>
          {/if}
        {/each}
      </g>
      <g class="blocks">
        {#each ordered as b (b.id)}
          {@const box = g.boxes.get(b.id)!}
          {@const size = shown.sizes.get(b.id)!}
          {#if b.role === "in" || b.role === "out"}
            {@const tag = b.role === "in" && b.rootInput}
            {@const p = size.ports[0]}
            {@const pid = portId(b.id, p.side, p.name)}
            <g
              class={["block pin", b.role, { "root-input": tag }, blockClass(b)]} data-id={b.id}
              transform="translate({box.x},{box.y})" role="none"
              onclick={() => select({ kind: "block", id: b.id })}
              onpointerenter={() => (hovered = { kind: "block", id: b.id })}
              onpointerleave={() => (hovered = undefined)}
            >
              <title>{b.name}</title>
              {#if tag}
                <path class={["halo", { dashed: dashed(b) }]} d={tagD(box.width, 3)} />
                <path class="shape" d={tagD(box.width)} fill={palette.rootTag.fill} stroke={palette.rootTag.stroke} />
                <text x={SLOT + (box.width - SLOT - POINT) / 2} y={15} text-anchor="middle" style="font:{PIN_FONT}">{b.name}</text>
              {:else}
                <rect class={["halo", { dashed: dashed(b) }]} x="-3" y="-3" width={box.width + 6} height={box.height + 6} rx={PIN_HEIGHT / 2 + 3} />
                <rect class="shape" width={box.width} height={box.height} rx={PIN_HEIGHT / 2}
                      fill={palette.pin.fill} stroke={palette.pin.stroke} />
                <text x={box.width / 2} y={15} text-anchor="middle" style="font:{PIN_FONT}">{b.name}</text>
              {/if}
              {@render port(b.id, pid, p.x, p.y, p.name, false)}
            </g>
          {:else}
            {@const c = tierColors(b)}
            <g
              class={["block", b.role, blockClass(b)]} data-id={b.id} transform="translate({box.x},{box.y})" role="none"
              onpointerdown={(e) => blockdown(e, b)}
              onclick={() => select({ kind: "block", id: b.id })}
              ondblclick={() => dblclick(b)}
              onpointerenter={() => (hovered = { kind: "block", id: b.id })}
              onpointerleave={() => (hovered = undefined)}
            >
              <title>{`${b.path || "/"}\n${qualified(b.path)}`}</title>
              <rect class={["halo", { dashed: dashed(b) }]} x="-3" y="-3" width={box.width + 6} height={box.height + 6} rx="7" />
              <rect class="shape" width={box.width} height={box.height} rx="4" fill={c.fill} stroke={c.stroke} />
              {#if b.role === "assembly"}
                <rect x="3" y="3" width={box.width - 6} height={box.height - 6} rx="2" fill="none" stroke={c.stroke} />
              {/if}
              <text class="segment" x={PAD} y={15} style="font:{SEGMENT_FONT}">{b.segment}</text>
              <text class="display" x={PAD} y={29} style="font:{NAME_FONT}">{cutName(b.displayName)}</text>
              {#each size.ports as p (p.side + p.name)}
                {@const id = portId(b.id, p.side, p.name)}
                {@const west = p.side === "in"}
                {@const nameX = west ? PAD : box.width - PAD}
                {@render port(b.id, id, p.x, p.y, p.name, !west && isStage1(b, p.name))}
                <text x={nameX} y={p.y + 4} text-anchor={west ? "start" : "end"} style="font:{FACE_FONT}">{p.name}</text>
                {#if isPinned(tree, b, p.side, p.name)}
                  {@const w = textWidth(p.name, FACE_FONT)}
                  <path class="pinned" data-port={id} d={markD(west ? nameX + w + MARK / 2 : nameX - w - MARK / 2, p.y)}>
                    <title>{p.name} pinned</title>
                  </path>
                {/if}
              {/each}
            </g>
          {/if}
        {/each}
      </g>
    {/if}
  </svg>
  <button class="fit" onclick={fit} title="Fit the level to the view">Fit</button>
</div>

{#snippet port(block: string, id: string, x: number, y: number, name: string, open: boolean)}
  {@const c = portClass(id)}
  <rect class="port-halo" class:on={c.selected || c.marked} class:half={c.hover || c["marked-hover"]}
        class:dashed={c["search-hit"] && !c.selected && !c.marked}
        x={x - PORT} y={y - PORT} width={2 * PORT} height={2 * PORT} rx="2" />
  <rect
    class={["port", { stage1: open }, portClass(id)]} data-port={id} role="none"
    x={x - PORT / 2} y={y - PORT / 2} width={PORT} height={PORT}
    onclick={(e) => { e.stopPropagation(); select({ kind: "port", id }); }}
    onpointerenter={() => (hovered = { kind: "port", id })}
    onpointerleave={() => (hovered = { kind: "block", id: block })}
  ><title>{name}</title></rect>
{/snippet}

<style>
  /* A double-click on the canvas must not select the page's text. */
  .viewport { position: relative; width: 100%; height: 100%; overflow: hidden; background: var(--bg); user-select: none; }
  svg { display: block; touch-action: none; cursor: grab; }
  .fit { position: absolute; top: 8px; right: 8px; font: 12px system-ui, sans-serif; }

  .wire { fill: none; stroke: var(--wire); stroke-width: 1; pointer-events: none; }
  .wire-hit { fill: none; stroke: transparent; stroke-width: 8; pointer-events: stroke; cursor: pointer; }
  .casing { fill: none; stroke: var(--highlight); stroke-linejoin: round; pointer-events: none; }
  .casing.selected { stroke-width: 7; opacity: 0.4; }
  .casing.hover { stroke-width: 7; opacity: 0.2; }
  .casing.incident { stroke-width: 5; opacity: 0.22; }
  .casing.incident-hover { stroke-width: 5; opacity: 0.11; }

  .block { cursor: pointer; }
  .block.leaf, .block.assembly { cursor: move; }
  .shape { pointer-events: visible; }
  .halo { fill: none; stroke: var(--highlight); stroke-width: 5; opacity: 0; pointer-events: none; }
  .block.selected > .halo { opacity: 0.5; }
  .block.hover > .halo { opacity: 0.25; }

  .port { fill: var(--port); stroke: var(--port); stroke-width: 1; cursor: pointer; }
  .port.stage1 { fill: var(--bg); }
  .port.selected, .port.marked { stroke: var(--highlight); }
  .port.marked-hover { stroke: color-mix(in srgb, var(--highlight) 50%, var(--port)); }
  .port-halo { fill: var(--highlight); opacity: 0; pointer-events: none; }
  .port-halo.half { opacity: 0.25; }
  .port-halo.on { opacity: 0.5; }
  .pinned { fill: var(--port); }

  /* Search (visual_grammar.md answer 9): hits take a dashed halo, everything else dims by opacity. */
  .block > .halo.dashed { opacity: 0.9; stroke-width: 2; stroke-dasharray: var(--dash); }
  .port-halo.dashed { fill: none; stroke: var(--highlight); stroke-width: 1.5; stroke-dasharray: var(--dash); opacity: 1; }
  .searching .wire { opacity: var(--dim); }
  .searching .block:not(.search-hit):not(.search-under) > :not(.halo):not(.port-halo):not(.port.search-hit) { opacity: var(--dim); }
  text { fill: var(--text); user-select: none; pointer-events: none; }
  text.display { fill: var(--text-light); }
</style>
