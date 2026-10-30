<script lang="ts">
  // The level's canvas: ELK's layout drawn as SVG (visual_grammar.md answers 1
  // to 4), the view as the SVG's viewBox (workspace.md answer 3).
  import type { BlockSize, ChildBlock, Level } from "../lib/level";
  import { levelOf, portId } from "../lib/level";
  import type { Model } from "../lib/model";
  import { fitView, viewRect, type View } from "../lib/view";
  import { layoutLevel, pathD, type Geometry } from "./layout";
  import { palette } from "./palette";
  import {
    cutName, FACE_FONT, isPinned, MARK, NAME_FONT, PAD, PIN_FONT, PIN_HEIGHT, POINT, PORT, SEGMENT_FONT, SLOT,
    sizeLevel, textWidth,
  } from "./size";

  let { model, path }: { model: Model; path: string } = $props();

  const FIT_PADDING = 24;
  /** A fitted small level stops at twice its natural size. */
  const FIT_MAX_SCALE = 2;

  let width = $state(0);
  let height = $state(0);
  let shown = $state<{ level: Level; sizes: Map<string, BlockSize>; geometry: Geometry } | undefined>();
  let view = $state<View>({ x: 0, y: 0, scale: 1 });

  const tree = $derived(model.tree!);
  const stage1 = $derived(new Map((model.outputs?.components ?? []).map((c) => [c.path, new Set(c.stage1)])));

  $effect(() => {
    const level = levelOf(tree, model.resolution!, path);
    const sizes = sizeLevel(level, tree);
    let stale = false;
    layoutLevel(level, sizes).then((geometry) => {
      if (stale) return;
      shown = { level, sizes, geometry };
      fit();
    });
    return () => { stale = true; };
  });

  function fit() {
    if (!shown) return;
    const g = shown.geometry;
    view = fitView({ x: 0, y: 0, width: g.width, height: g.height }, { width, height }, FIT_PADDING, FIT_MAX_SCALE);
  }

  const viewBox = $derived.by(() => {
    const r = viewRect(view, { width, height });
    return `${r.x} ${r.y} ${r.width} ${r.height}`;
  });

  const isStage1 = (b: ChildBlock, name: string) => b.role === "leaf" && !!stage1.get(b.path)?.has(name);
  const tierColors = (b: ChildBlock) =>
    b.role === "assembly" ? palette.assembly : b.tier === "discrete" ? palette.discrete : palette.continuous;
  /** A root tag: rounded at its outer end past the empty slot, pointed at its inner end. */
  function tagD(w: number): string {
    const r = PIN_HEIGHT / 2;
    return `M${SLOT + r},0 L${w - POINT},0 L${w},${r} L${w - POINT},${PIN_HEIGHT} L${SLOT + r},${PIN_HEIGHT} A${r},${r} 0 0 1 ${SLOT + r},0 Z`;
  }
  /** A pinned face's mark, a small diamond centered at (x, y). */
  const markD = (x: number, y: number) => `M${x},${y - 3} L${x + 3},${y} L${x},${y + 3} L${x - 3},${y} Z`;
</script>

<div
  class="frame" bind:clientWidth={width} bind:clientHeight={height}
  style="--wire:{palette.wire};--text:{palette.text};--text-light:{palette.textLight};--port:{palette.port};--bg:{palette.background};--highlight:{palette.highlight}"
>
  <svg class="canvas" data-level={shown?.level.path} {viewBox} width={width} height={height}>
    <defs>
      <marker id="arrow" viewBox="0 0 8 8" refX="11" refY="4" markerWidth="7" markerHeight="7" orient="auto">
        <path d="M0,0 L8,4 L0,8 z" fill={palette.wire} />
      </marker>
    </defs>
    {#if shown}
      {@const g = shown.geometry}
      <g class="wires">
        {#each shown.level.wires as w (w.id)}
          {@const route = g.routes.get(w.id)}
          {#if route}
            <path class="wire" data-wire={w.id} d={pathD(route)} marker-end="url(#arrow)" />
          {/if}
        {/each}
      </g>
      <g class="blocks">
        {#each shown.level.blocks as b (b.id)}
          {@const box = g.boxes.get(b.id)!}
          {@const size = shown.sizes.get(b.id)!}
          {#if b.role === "in" || b.role === "out"}
            {@const tag = b.role === "in" && b.rootInput}
            {@const p = size.ports[0]}
            <g class="block pin {b.role}" class:root-input={tag} data-id={b.id} transform="translate({box.x},{box.y})">
              {#if tag}
                <path class="shape" d={tagD(box.width)} fill={palette.rootTag.fill} stroke={palette.rootTag.stroke} />
                <text x={SLOT + (box.width - SLOT - POINT) / 2} y={15} text-anchor="middle" style="font:{PIN_FONT}">{b.name}</text>
              {:else}
                <rect class="shape" width={box.width} height={box.height} rx={PIN_HEIGHT / 2}
                      fill={palette.pin.fill} stroke={palette.pin.stroke} />
                <text x={box.width / 2} y={15} text-anchor="middle" style="font:{PIN_FONT}">{b.name}</text>
              {/if}
              <rect class="port" data-port={portId(b.id, p.side, p.name)}
                    x={p.x - PORT / 2} y={p.y - PORT / 2} width={PORT} height={PORT} />
            </g>
          {:else}
            {@const c = tierColors(b)}
            <g class="block {b.role}" data-id={b.id} transform="translate({box.x},{box.y})">
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
                <rect class="port" class:stage1={!west && isStage1(b, p.name)} data-port={id}
                      x={p.x - PORT / 2} y={p.y - PORT / 2} width={PORT} height={PORT} />
                <text x={nameX} y={p.y + 4} text-anchor={west ? "start" : "end"} style="font:{FACE_FONT}">{p.name}</text>
                {#if isPinned(tree, b, p.side, p.name)}
                  {@const w = textWidth(p.name, FACE_FONT)}
                  <path class="pinned" data-port={id} d={markD(west ? nameX + w + MARK / 2 : nameX - w - MARK / 2, p.y)} />
                {/if}
              {/each}
            </g>
          {/if}
        {/each}
      </g>
    {/if}
  </svg>
</div>

<style>
  .frame { position: relative; width: 100%; height: 100%; overflow: hidden; background: var(--bg); }
  svg { display: block; }
  .wire { fill: none; stroke: var(--wire); stroke-width: 1; }
  .block { cursor: default; }
  .port { fill: var(--port); stroke: var(--port); stroke-width: 1; }
  .port.stage1 { fill: var(--bg); }
  .pinned { fill: var(--port); }
  text { fill: var(--text); user-select: none; pointer-events: none; }
  text.display { fill: var(--text-light); }
</style>
