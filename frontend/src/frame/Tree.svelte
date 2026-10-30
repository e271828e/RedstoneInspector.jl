<script lang="ts">
  // The model tree (workspace.md answer 2): the outline's rows, selection shared
  // with the canvas, the chevron expanding and the double-click opening.
  import { tick } from "svelte";
  import { palette } from "../canvas/palette";
  import type { Selection } from "../lib/detail";
  import type { Model } from "../lib/model";
  import { outlineRows, type Row } from "../lib/outline";

  let { model, level, selection, expanded, onselect, onopen, ontoggle }: {
    model: Model;
    level: string;
    selection: Selection | undefined;
    expanded: ReadonlySet<string>;
    onselect: (s: Selection) => void;
    onopen: (path: string) => void;
    ontoggle: (path: string) => void;
  } = $props();

  let nav = $state<HTMLElement>();
  const rows = $derived(model.tree ? outlineRows(model.tree, model.label, expanded) : []);
  /** The selected row's path: a node's block or a folder. */
  const selectedRow = $derived.by(() => {
    const t = selection?.target;
    if (t?.kind === "folder" || (t?.kind === "block" && model.tree?.byPath.has(t.id))) return t.id;
    return undefined;
  });

  // A selection made outside the tree scrolls its row into view; the tree's own click does not.
  let ownPath: string | undefined;
  $effect(() => {
    const p = selectedRow;
    if (p === ownPath) return;
    ownPath = undefined;
    if (p === undefined) return;
    tick().then(() => nav?.querySelector(`.row[data-path="${CSS.escape(p)}"]`)?.scrollIntoView({ block: "nearest" }));
  });

  function click(r: Row) {
    ownPath = r.path;
    if (r.kind === "folder") onselect({ level: r.parent!, target: { kind: "folder", id: r.path } });
    else onselect({ level: r.parent === undefined ? level : model.tree!.parent.get(r.path)!, target: { kind: "block", id: r.path } });
  }
  const dot = (r: Row) => {
    const n = model.tree!.byPath.get(r.path)!;
    return n.class === "assembly" ? palette.assembly : n.tier === "discrete" ? palette.discrete : palette.continuous;
  };
</script>

<nav class="tree" bind:this={nav} aria-label="the model tree">
  {#each rows as r (r.path)}
    <!-- svelte-ignore a11y_click_events_have_key_events (the keyboard table is increment 5's) -->
    <div
      class={["row", r.kind, r.class, { expanded: r.expandable && expanded.has(r.path), selected: r.path === selectedRow, open: r.kind === "node" && r.path === level }]}
      data-path={r.path} data-depth={r.depth} style:padding-left="{4 + 14 * r.depth}px"
      title={r.kind === "folder" ? `${r.path} (folder)` : r.path || "/"} role="treeitem" aria-selected={r.path === selectedRow} tabindex="-1"
      onclick={() => click(r)} ondblclick={() => r.class === "assembly" && onopen(r.path)}
    >
      {#if r.expandable}
        <button
          class="chevron" tabindex="-1" aria-label={expanded.has(r.path) ? "collapse" : "expand"}
          onclick={(e) => { e.stopPropagation(); ontoggle(r.path); }} ondblclick={(e) => e.stopPropagation()}
        >▸</button>
      {:else}
        <span class="gap"></span>
      {/if}
      {#if r.kind === "folder"}
        <span class="glyph">▤</span>
        <span class="segment">{r.label}</span>
      {:else}
        {@const c = dot(r)}
        <span class="dot" style:background={c.stroke}></span>
        <span class="segment">{r.label}</span>
        {#if r.parent !== undefined}<span class="name">{r.displayName}</span>{/if}
      {/if}
    </div>
  {/each}
</nav>

<style>
  .tree { padding: 2px 0 8px; user-select: none; }
  .row {
    display: flex; align-items: center; gap: 5px; height: 22px; padding-right: 6px; white-space: nowrap;
    cursor: pointer; border-left: 3px solid transparent;
  }
  .row:hover { background: var(--strip); }
  .row.selected { background: var(--row-selected); }
  .row.open { font-weight: 600; border-left-color: var(--open-marker); }
  .chevron {
    width: 14px; height: 14px; padding: 0; border: 0; background: none; cursor: pointer; flex: none;
    font: 12px system-ui, sans-serif; color: var(--text-light); transition: transform 80ms;
  }
  .row.expanded > .chevron { transform: rotate(90deg); }
  .gap { width: 14px; flex: none; }
  .dot { width: 8px; height: 8px; border-radius: 50%; flex: none; }
  .glyph { width: 10px; font-size: 11px; color: var(--text-light); flex: none; text-align: center; }
  .name { color: var(--text-light); font-size: 12px; overflow: hidden; text-overflow: ellipsis; }
</style>
