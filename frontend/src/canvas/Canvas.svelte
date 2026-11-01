<script lang="ts" module>
  /** What a click selects: a block or pin by block id, a wire by wire id, a port square by port id, a region by its folder's path. */
  export type Target = { kind: "block" | "wire" | "port" | "folder"; id: string };
</script>

<script lang="ts">
  // The level's canvas: ELK's layout drawn as SVG (visual_grammar.md answers 1
  // to 4), the view as the SVG's viewBox, opening and selection (workspace.md
  // answers 3 and 4), halos and casings in the one highlight hue (answer 9), the
  // tier or rate colors with the badge and the legend (answer 6), wire styles by
  // kind with the trunks' dots and the type labels (answer 4).
  // The view and the layout are the session's: restored on a revisit, reported
  // on every change. A block or a pin drags, its wires re-routed locally
  // (initial_design.md answer 12).
  import { tick, untrack } from "svelte";
  import type { Block, BlockSize, ChildBlock, Level, LevelEnd, LevelWire } from "../lib/level";
  import { levelOf, parsePortId, portId, REGION_PADDING } from "../lib/level";
  import type { Model } from "../lib/model";
  import { blockTriple, fromRootInput, legend, multiRate, STEPS, stepsOf, tripleKey, wireTriple } from "../lib/rates";
  import { labelledPorts, levelWireClasses } from "../lib/wires";
  import { iconOf } from "../lib/icons";
  import { label, regionsOf } from "../lib/regions";
  import { GLYPHS } from "./glyphs";
  import type { Mode } from "../state/prefs.svelte";
  import type { LevelHits } from "../lib/search";
  import { follow as followView, type Box } from "../lib/navigate";
  import { centreOn, fitView, pan, viewRect, zoomAt, type Point, type Rect, type View } from "../lib/view";
  import { layoutLevel, pathD, type Geometry, type LevelLayout } from "./layout";
  import { palette, tint, type Pair } from "./palette";
  import { rerouteTouching } from "./router";
  import {
    BADGE_FONT, cutConstant, FONT_STACK, cutName, cutType, FACE_FONT, ICON_HEIGHT, ICON_WIDTH, LABEL_FONT, isPinned, MARK, NAME_FONT, PAD, PIN_FONT, PIN_HEIGHT, POINT, PORT, SEGMENT_FONT, SLOT,
    sizeLevel, textWidth,
  } from "./size";

  let { model, path, mode = "tier", labels = false, selected, view: savedView, layout: savedLayout, hits, focused = false, onopen, onselect, onview, onlayout }: {
    model: Model;
    path: string;
    /** The color mode: by tier, or by rate with the badges and the legend. */
    mode?: Mode;
    /** The type labels shown, one per producer port. */
    labels?: boolean;
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
  /**
   * The badge pill: its inset from the block's right edge, its height and its text's side padding. It straddles
   * the top edge, so it never covers the segment, which answer 10 never truncates.
   */
  const BADGE_INSET = 4, BADGE_HEIGHT = 12, BADGE_PAD = 4, BADGE_TOP = -7;
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
  /** A block `follow` was asked for while the level was being laid out, followed once it is drawn. */
  let pending: string | undefined;

  const tree = $derived(model.tree!);
  const stage1 = $derived(new Map((model.outputs?.components ?? []).map((c) => [c.path, new Set(c.stage1)])));
  /** Each rate triple's palette step, over the whole model. */
  const steps = $derived(stepsOf(model));
  const lines = $derived(mode === "rate" && shown ? legend(model, shown.level.path, steps) : []);
  /** Each wire's class by wire id, the drawn level's. */
  const classes = $derived(shown ? levelWireClasses(model, shown.level) : new Map<string, string>());
  /**
   * Each wire's color: in tier mode gray, an opaque wire the lighter gray; in rate mode the tint of its terminal
   * producer's step, the continuous tint with no triple, the neutral gray from a root input.
   */
  const strokes = $derived.by(() => {
    const out = new Map<string, string>();
    if (!shown) return out;
    for (const w of shown.level.wires) {
      if (mode === "tier") out.set(w.id, classes.get(w.id) === "opaque" ? palette.wireLight : palette.wire);
      else if (fromRootInput(model, shown.level.path, w)) out.set(w.id, palette.wire);
      else {
        const t = wireTriple(model, shown.level.path, w);
        const step = t && steps.get(tripleKey(t));
        out.set(w.id, tint(step === undefined ? palette.continuous.stroke : step < STEPS ? palette.rate[step].stroke : palette.extra.stroke));
      }
    }
    return out;
  });
  /** One arrowhead marker per wire color on the level, by color. */
  const arrows = $derived(new Map([...new Set(strokes.values())].map((c, i) => [c, `arrow-${i}`])));
  const arrowOf = (id: string) => `url(#${arrows.get(strokes.get(id)!)})`;
  const typeLabels = $derived(labels && shown ? labelledPorts(model, shown.level) : []);
  /** The drawn level's regions, and each keyed member's region path. */
  const regions = $derived(shown ? regionsOf(tree, shown.level.path) : []);
  const regionOf = $derived(new Map(regions.flatMap((r) => r.members.map((m) => [m, r.path] as const))));
  /**
   * Each region's frame, by path: its members' current boxes' union grown by the padding, so a dragged member
   * carries it; ELK's box until a drag.
   */
  const frames = $derived.by(() => {
    const out = new Map<string, Rect>();
    if (!shown) return out;
    for (const r of regions) {
      const bs = r.members.map((m) => shown!.geometry.boxes.get(m)).filter((b) => b !== undefined);
      if (!bs.length) continue;
      const x = Math.min(...bs.map((b) => b.x)) - REGION_PADDING.left, y = Math.min(...bs.map((b) => b.y)) - REGION_PADDING.top;
      out.set(r.path, {
        x, y,
        width: Math.max(...bs.map((b) => b.x + b.width)) + REGION_PADDING.right - x,
        height: Math.max(...bs.map((b) => b.y + b.height)) + REGION_PADDING.bottom - y,
      });
    }
    return out;
  });
  /** A type label's anchor: 6 px along its wire's first segment from the port, 3 px above it. */
  function labelAt(route: Point[]): Point {
    const [a, b] = route, len = Math.hypot(b.x - a.x, b.y - a.y) || 1;
    return { x: a.x + (6 * (b.x - a.x)) / len, y: a.y + (6 * (b.y - a.y)) / len - 3 };
  }

  /** ELK's fresh output with a stale layout's dragged blocks put back at their dragged places. */
  function replace(laid: Geometry, level: Level, sizes: Map<string, BlockSize>, old: LevelLayout) {
    let g = laid;
    const kept = new Set<string>();
    for (const id of old.dragged) {
      const was = old.geometry.boxes.get(id), now = g.boxes.get(id);
      if (!was || !now) continue;
      g = { ...g, boxes: new Map(g.boxes).set(id, { ...now, x: was.x, y: was.y }) };
      g = { ...g, ...rerouteTouching(g, level, sizes, id) };
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
    if (pending !== undefined) follow(pending);
    pending = undefined;
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
    layoutLevel(level, sizes, regionsOf(tree, path)).then((laid) => {
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
    for (const b of [...g.boxes.values(), ...frames.values()]) {
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

  /** Pans by the least amount that brings a block into view; while a level is laid out, once it is drawn. */
  export function follow(id: string) {
    if (!ready) {
      pending = id;
      return;
    }
    const b = shown?.geometry.boxes.get(id);
    if (b) setView(followView(view, { width, height }, b, FIT_PADDING));
  }

  /** A target's extent in world units: a block's or pin's box, a port's square, a wire's route's bounding box. */
  function extent(t: Target): Rect | undefined {
    const g = shown?.geometry;
    if (!g) return undefined;
    if (t.kind === "block") return g.boxes.get(t.id);
    if (t.kind === "folder") return frames.get(t.id);
    if (t.kind === "port") {
      const { block, side, name } = parsePortId(t.id);
      const box = g.boxes.get(block), p = shown!.sizes.get(block)?.ports.find((q) => q.side === side && q.name === name);
      return box && p ? { x: box.x + p.x - PORT / 2, y: box.y + p.y - PORT / 2, width: PORT, height: PORT } : undefined;
    }
    const route = g.routes.get(t.id);
    if (!route?.length) return undefined;
    const xs = route.map((q) => q.x), ys = route.map((q) => q.y);
    const x = Math.min(...xs), y = Math.min(...ys);
    return { x, y, width: Math.max(...xs) - x, height: Math.max(...ys) - y };
  }

  /** Centres a target at the current zoom. */
  export function centre(t: Target) {
    const r = ready ? extent(t) : undefined;
    if (r) setView(centreOn(view, { width, height }, r));
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
   * A press on a block or a pin, root inputs' tags included, the drag starting past the slop. The pointer is captured on the block's group only
   * then, once the raise has moved the group last: a capture from the press would retarget a port square's click,
   * and moving a captured node releases the capture.
   */
  function blockdown(e: PointerEvent, b: Block) {
    if (e.button !== 0 || !shown) return;
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
    shown = { ...s, geometry: { ...g, ...rerouteTouching(g, s.level, s.sizes, d.block) } };
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
  /** A child's colors in the mode, and in rate mode its step: a palette step's, an extra's, or the continuous pair with no triple. */
  function colorsOf(b: ChildBlock): { c: Pair; step?: number } {
    if (mode === "tier") return { c: tierColors(b) };
    const t = blockTriple(model, b.path);
    const step = t && steps.get(tripleKey(t));
    if (step === undefined) return { c: palette.continuous };
    return { c: step < STEPS ? palette.rate[step] : palette.extra, step };
  }
  /** Rate mode's badge: the legend number of an extra, the clock count of a multi-rate assembly, joined when both. */
  function badgeOf(b: ChildBlock, step: number | undefined): { text: string; title: string } | undefined {
    if (mode !== "rate") return undefined;
    const text: string[] = [], title: string[] = [];
    if (step !== undefined && step >= STEPS) {
      text.push(`#${step + 1}`);
      title.push(`Rate ${step + 1} of the legend, past the palette's ${STEPS} colors.`);
    }
    const k = b.role === "assembly" ? multiRate(model, b.path) : 0;
    if (k > 0) {
      const clocks = `${k} ${k === 1 ? "clock" : "clocks"}`;
      text.push(clocks);
      title.push(`Multi-rate: the discrete leaves inside tick on ${clocks}, not all on this assembly's own.`);
    }
    return text.length ? { text: text.join(" · "), title: title.join(" ") } : undefined;
  }
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
    data-mode={mode} data-labels={labels ? "" : undefined}
    {viewBox} {width} {height} role="application" aria-label="the open level"
    onpointerdown={pointerdown} onpointermove={pointermove} onpointerup={pointerup} onpointercancel={pointerup}
  >
    <defs>
      <!-- in user units, so a thick wire's arrowhead keeps a thin wire's size; one per color, the struct's on its core -->
      {#each arrows as [color, id] (id)}
        <marker {id} viewBox="0 0 8 8" refX="11" refY="4" markerWidth="7" markerHeight="7" markerUnits="userSpaceOnUse" orient="auto">
          <path d="M0,0 L8,4 L0,8 z" fill={color} />
        </marker>
      {/each}
      <!-- the library icons' glyphs, in the text color through `currentColor` -->
      {#each Object.entries(GLYPHS) as [id, gl] (id)}
        <symbol id="icon-{id}" viewBox="0 0 {gl.width} {ICON_HEIGHT}" width={gl.width} height={ICON_HEIGHT}>
          <path d={gl.d} fill="none" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round" stroke-linecap="round" />
          {#if gl.text}
            <text x={gl.text.x} y={gl.text.y} text-anchor="middle" font-size={gl.text.size} fill="currentColor" style="font-family:{FONT_STACK}">{gl.text.s}</text>
          {/if}
        </symbol>
      {/each}
    </defs>
    {#if shown}
      {@const g = shown.geometry}
      <g class="regions">
        {#each regions as r (r.path)}
          {@const f = frames.get(r.path)}
          {#if f}
            <g
              class="region" class:selected={same(selected, "folder", r.path)} data-path={r.path} role="none"
              onclick={() => select({ kind: "folder", id: r.path })}
            >
              <title>{r.path} (folder)</title>
              <rect class="halo" x={f.x - 3} y={f.y - 3} width={f.width + 6} height={f.height + 6} rx="9" />
              <rect class="shape" x={f.x} y={f.y} width={f.width} height={f.height} rx="6" />
              <text class="caption" x={f.x + 8} y={f.y + 15} style="font:{FACE_FONT}">{r.field}</text>
            </g>
          {/if}
        {/each}
      </g>
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
            {@const struct = classes.get(w.id) === "struct"}
            <path
              class="wire" class:selected={same(selected, "wire", w.id)}
              class:hover={same(hovered, "wire", w.id) && !same(selected, "wire", w.id)}
              data-wire={w.id} data-kind={classes.get(w.id)} d={pathD(route)} style:stroke={strokes.get(w.id)}
              marker-end={struct ? undefined : arrowOf(w.id)}
            />
            {#if struct}
              <path class="wire-core" data-wire={w.id} d={pathD(route)} marker-end={arrowOf(w.id)} />
            {/if}
            <path
              class="wire-hit" data-hit={w.id} d={pathD(route)} role="none"
              onclick={() => select({ kind: "wire", id: w.id })}
              onpointerenter={() => (hovered = { kind: "wire", id: w.id })}
              onpointerleave={() => (hovered = undefined)}
            ><title>{endText(w.from)} → {endText(w.to)}</title></path>
          {/if}
        {/each}
      </g>
      <g class="junctions">
        {#each g.junctions as [id, points] (id)}
          {#each points as p, k (k)}
            <circle class="junction" data-wire={id} cx={p.x} cy={p.y} r="2.5" fill={strokes.get(id)} />
          {/each}
        {/each}
      </g>
      {#if labels}
        <g class="type-labels">
          {#each typeLabels as t (t.port)}
            {@const route = g.routes.get(t.wire)}
            {#if route}
              {@const at = labelAt(route)}
              <text class="type-label" data-port={t.port} x={at.x} y={at.y} style="font:{LABEL_FONT}"><title>{t.type}</title>{cutType(t.type)}</text>
            {/if}
          {/each}
        </g>
      {/if}
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
              onpointerdown={(e) => blockdown(e, b)}
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
            {@const { c, step } = colorsOf(b)}
            {@const badge = badgeOf(b, step)}
            {@const icon = iconOf(tree.byPath.get(b.path)!)}
            <g
              class={["block", b.role, { extra: step !== undefined && step >= STEPS }, blockClass(b)]} data-id={b.id} data-region={regionOf.get(b.id)}
              transform="translate({box.x},{box.y})" role="none"
              onpointerdown={(e) => blockdown(e, b)}
              onclick={() => select({ kind: "block", id: b.id })}
              ondblclick={() => dblclick(b)}
              onpointerenter={() => (hovered = { kind: "block", id: b.id })}
              onpointerleave={() => (hovered = undefined)}
            >
              <title>{`${b.path || "/"}\n${qualified(b.path)}`}</title>
              <rect class={["halo", { dashed: dashed(b) }]} x="-3" y="-3" width={box.width + 6} height={box.height + 6} rx="7" />
              <rect class="shape" width={box.width} height={box.height} rx="4" fill={c.fill} stroke={c.stroke} data-step={step} />
              {#if b.role === "assembly"}
                <rect x="3" y="3" width={box.width - 6} height={box.height - 6} rx="2" fill="none" stroke={c.stroke} />
              {/if}
              <text class="segment" x={PAD} y={15} style="font:{SEGMENT_FONT}">{label(tree, b.path)}</text>
              {#if !icon}
                <text class="display" x={PAD} y={29} style="font:{NAME_FONT}">{cutName(b.displayName)}</text>
              {:else if icon.kind === "glyph"}
                <g class="icon" data-icon={icon.id}>
                  <title>{icon.title}</title>
                  <use href="#icon-{icon.id}" x={PAD} y={29 - 10} width={GLYPHS[icon.id].width} height={ICON_HEIGHT} />
                </g>
              {:else}
                {@const text = icon.id === "constant" ? cutConstant(icon.text!) : icon.text!}
                {@const squeeze = icon.id !== "constant" && textWidth(text, NAME_FONT) > ICON_WIDTH}
                <g class="icon" data-icon={icon.id}>
                  <title>{icon.title}</title>
                  <text x={PAD} y={29} style="font:{NAME_FONT}" textLength={squeeze ? ICON_WIDTH : undefined}
                        lengthAdjust={squeeze ? "spacingAndGlyphs" : undefined}>{text}</text>
                </g>
              {/if}
              {#if badge}
                {@const w = Math.ceil(textWidth(badge.text, BADGE_FONT)) + 2 * BADGE_PAD}
                <g class="badge-pill">
                  <title>{badge.title}</title>
                  <rect x={box.width - BADGE_INSET - w} y={BADGE_TOP} width={w} height={BADGE_HEIGHT} rx={BADGE_HEIGHT / 2} stroke={c.stroke} />
                  <text class="badge" x={box.width - BADGE_INSET - BADGE_PAD} y={BADGE_TOP + 9} text-anchor="end" style="font:{BADGE_FONT}">{badge.text}</text>
                </g>
              {/if}
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
  {#if lines.length}
    <div class="legend" aria-label="the rates on this level">
      <ul>
        {#each lines as l (l.step)}
          <li data-step={l.step} title={l.title}>
            {#if l.step < STEPS}
              <span class="swatch" style:background={palette.rate[l.step].fill} style:border-color={palette.rate[l.step].stroke}></span>
            {:else}
              <span class="number" style:background={palette.extra.fill} style:border-color={palette.extra.stroke}>#{l.step + 1}</span>
            {/if}
            <span class="text">{l.text}</span>
          </li>
        {/each}
      </ul>
    </div>
  {/if}
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
  .legend {
    position: absolute; bottom: 8px; left: 8px; padding: 4px 8px; font: 11px system-ui, sans-serif;
    background: color-mix(in srgb, var(--bg) 90%, transparent); border: 1px solid var(--wire); border-radius: 4px; pointer-events: auto;
  }
  .legend ul { list-style: none; margin: 0; padding: 0; }
  .legend li { display: flex; align-items: center; gap: 6px; line-height: 16px; }
  .legend .swatch { width: 12px; height: 10px; border: 1px solid; border-radius: 2px; }
  .legend .number { min-width: 20px; padding: 0 2px; border: 1px solid; border-radius: 6px; font-size: 9px; line-height: 10px; text-align: center; }
  .badge-pill rect { fill: var(--bg); stroke-width: 1; }

  .wire { fill: none; stroke: var(--wire); stroke-width: 1; pointer-events: none; }
  /* The kind as line weight and pattern (visual_grammar.md answer 4); the struct's triple line is a wide stroke under a core in the background color. */
  .wire[data-kind="flag"] { stroke-dasharray: 4 3; }
  .wire[data-kind="vector"] { stroke-width: 3; }
  .wire[data-kind="opaque"] { stroke-dasharray: 1 3; }
  .wire[data-kind="struct"] { stroke-width: 5; }
  .wire-core { fill: none; stroke: var(--bg); stroke-width: 1.6; pointer-events: none; }
  .junction { pointer-events: none; }
  text.type-label { fill: var(--text-light); pointer-events: visiblePainted; }
  .wire-hit { fill: none; stroke: transparent; stroke-width: 8; pointer-events: stroke; cursor: pointer; }
  .casing { fill: none; stroke: var(--highlight); stroke-linejoin: round; pointer-events: none; }
  .casing.selected { stroke-width: 7; opacity: 0.4; }
  .casing.hover { stroke-width: 7; opacity: 0.2; }
  .casing.incident { stroke-width: 5; opacity: 0.22; }
  .casing.incident-hover { stroke-width: 5; opacity: 0.11; }

  /* A region (visual_grammar.md answer 5): a thin dashed frame captioned with the field; its frame and caption select the folder. */
  .region > .shape { fill: none; stroke: var(--wire); stroke-width: 1; stroke-dasharray: 3 3; pointer-events: stroke; cursor: pointer; }
  .region > .halo { fill: none; stroke: var(--highlight); stroke-width: 5; opacity: 0; pointer-events: stroke; cursor: pointer; }
  .region.selected > .halo { opacity: 0.5; }
  .region > text.caption { fill: var(--text-light); pointer-events: visiblePainted; cursor: pointer; }

  .block { cursor: move; }
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
  .searching :is(.wire, .wire-core, .junction, .type-label) { opacity: var(--dim); }
  .searching .block:not(.search-hit):not(.search-under) > :not(.halo):not(.port-halo):not(.port.search-hit) { opacity: var(--dim); }
  text { fill: var(--text); user-select: none; pointer-events: none; }
  text.display { fill: var(--text-light); }
  /* An icon's glyph takes the text color; its title shows on hover. */
  .icon { color: var(--text); pointer-events: bounding-box; }
</style>
