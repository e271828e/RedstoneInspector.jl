<script lang="ts">
  // The grid (workspace.md answer 1), the one component that knows where the
  // panes sit: the tree and the detail pane run the full height at the sides;
  // between them the breadcrumb, the canvas, the drawer and the status bar.
  // Three splitters and two collapse buttons write the per-browser prefs.
  import type { Snippet } from "svelte";
  import { palette } from "../canvas/palette";
  import { prefs, setSize, toggleCollapsed, type Side, type Splitter } from "../state/prefs.svelte";

  let { tree, breadcrumb, canvas, detail, drawer, status, drawerOpen }: {
    tree: Snippet;
    breadcrumb: Snippet;
    canvas: Snippet;
    detail: Snippet;
    drawer?: Snippet;
    status: Snippet;
    drawerOpen: boolean;
  } = $props();

  const ICONS: Record<Side, string> = { tree: "☰", detail: "ⓘ" };
  const TITLES: Record<Side, string> = { tree: "the model tree", detail: "the detail pane" };
  const HEADS: Record<Side, string> = { tree: "Model", detail: "Detail" };

  // A splitter drag: the pointer captured on the splitter, the size from the drag's start plus its travel.
  let drag: { pane: Splitter; id: number; start: number; size: number } | undefined;
  function down(pane: Splitter, e: PointerEvent) {
    if (e.button !== 0) return;
    e.preventDefault();
    drag = { pane, id: e.pointerId, start: pane === "drawer" ? e.clientY : e.clientX, size: prefs.sizes[pane] };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  }
  function move(e: PointerEvent) {
    if (!drag || e.pointerId !== drag.id) return;
    const travel = (drag.pane === "drawer" ? e.clientY : e.clientX) - drag.start;
    // The tree grows rightward; the detail pane leftward and the drawer upward.
    setSize(drag.pane, drag.size + (drag.pane === "tree" ? travel : -travel));
  }
  function up(e: PointerEvent) {
    if (drag && e.pointerId === drag.id) drag = undefined;
  }
</script>

{#snippet splitter(pane: Splitter, active: boolean)}
  <div
    class="splitter" class:active data-pane={pane} role="separator"
    aria-orientation={pane === "drawer" ? "horizontal" : "vertical"}
    title={active ? `Drag to resize ${pane === "drawer" ? "the drawer" : TITLES[pane]}` : undefined}
    onpointerdown={(e) => active && down(pane, e)} onpointermove={move} onpointerup={up} onpointercancel={up}
  ></div>
{/snippet}

{#snippet side(pane: Side, body: Snippet)}
  {@const collapsed = prefs.collapsed[pane]}
  <section
    class="pane side {pane}" class:collapsed data-pane={pane}
    style:width={collapsed ? undefined : `${prefs.sizes[pane]}px`}
  >
    <div class="head">
      <button
        class="collapse" data-pane={pane} onclick={() => toggleCollapsed(pane)}
        title={`${collapsed ? "Expand" : "Collapse"} ${TITLES[pane]}`}
      >{(pane === "tree") === collapsed ? "›" : "‹"}</button>
      {#if !collapsed}<span class="title">{HEADS[pane]}</span>{/if}
    </div>
    {#if collapsed}
      <span class="icon" title={TITLES[pane]}>{ICONS[pane]}</span>
    {:else}
      <div class="body">{@render body()}</div>
    {/if}
  </section>
{/snippet}

<div
  class="frame"
  style="--border:{palette.paneBorder};--strip:{palette.strip};--text:{palette.text};--text-light:{palette.textLight};--bg:{palette.background};--highlight:{palette.highlight};--row-selected:{palette.rowSelected};--open-marker:{palette.openMarker}"
>
  {@render side("tree", tree)}
  {@render splitter("tree", !prefs.collapsed.tree)}
  <div class="center">
    {@render breadcrumb()}
    <div class="canvas-area">{@render canvas()}</div>
    {@render splitter("drawer", drawerOpen)}
    <section class="pane drawer" class:collapsed={!drawerOpen} data-pane="drawer" style:height={drawerOpen ? `${prefs.sizes.drawer}px` : undefined}>
      {@render drawer?.()}
    </section>
    {@render status()}
  </div>
  {@render splitter("detail", !prefs.collapsed.detail)}
  {@render side("detail", detail)}
</div>

<style>
  .frame {
    display: flex; height: 100vh; width: 100vw; overflow: hidden; box-sizing: border-box;
    font: 13px system-ui, sans-serif; color: var(--text); background: var(--bg);
  }
  .center { flex: 1; min-width: 0; display: flex; flex-direction: column; }
  .canvas-area { flex: 1; min-height: 0; position: relative; }
  .pane.side { flex: none; display: flex; flex-direction: column; min-height: 0; background: var(--bg); }
  .pane.side.tree { border-right: 1px solid var(--border); }
  .pane.side.detail { border-left: 1px solid var(--border); }
  .pane.side .body { flex: 1; min-height: 0; overflow: auto; }
  .pane.side.collapsed { width: 24px; background: var(--strip); align-items: center; }
  .head {
    flex: none; display: flex; align-items: center; gap: 6px; height: 26px; padding: 0 4px;
    color: var(--text-light); font-size: 11px; text-transform: uppercase; letter-spacing: 0.04em;
  }
  .pane.tree .head { flex-direction: row-reverse; justify-content: space-between; }
  .collapse {
    width: 18px; height: 18px; padding: 0; line-height: 16px; color: var(--text);
    font: 13px system-ui, sans-serif; border: 1px solid var(--border); border-radius: 3px; background: var(--strip); cursor: pointer;
  }
  .icon { margin-top: 6px; color: var(--text-light); }
  .pane.collapsed .head { padding: 0; }
  .pane.drawer { flex: none; min-height: 0; border-top: 1px solid var(--border); display: flex; flex-direction: column; }
  .splitter { flex: none; background: transparent; }
  .splitter[data-pane="tree"], .splitter[data-pane="detail"] { width: 5px; margin: 0 -2px; z-index: 2; }
  .splitter[data-pane="drawer"] { height: 5px; margin: -2px 0; z-index: 2; }
  .splitter.active[data-pane="tree"], .splitter.active[data-pane="detail"] { cursor: col-resize; }
  .splitter.active[data-pane="drawer"] { cursor: row-resize; }
  .splitter.active:hover { background: var(--border); }
  .splitter:not(.active) { pointer-events: none; }
</style>
