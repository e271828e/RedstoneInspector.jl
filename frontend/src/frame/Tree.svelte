<script lang="ts">
  // The model tree (workspace.md answers 2 and 5): the outline's rows, selection
  // shared with the canvas, the chevron expanding and the double-click opening;
  // the search field on top, its results in the outline's place while listing,
  // the hits' dashed markers on the rows otherwise; a red or amber dot on a row
  // whose subtree holds a diagnostic or a warning, a blue one on a level the
  // standing route crosses. The tree never filters.
  import { tick, type Snippet } from "svelte";
  import { palette, stepPair } from "../canvas/palette";
  import { count, type Selection } from "../lib/detail";
  import type { TreeMark } from "../lib/diagnostics";
  import type { Model } from "../lib/model";
  import { blockTriple, stepsOf, tripleKey } from "../lib/rates";
  import type { Mode } from "../state/prefs.svelte";
  import { folderOf, outlineRows, rowSelection, type Row } from "../lib/outline";

  let {
    model, level, mode = "tier", selection, expanded, focused = false, search, listing = false, marks, counts, diagnosticMarks, routeMarks, onselect, onopen,
    ontoggle,
  }: {
    model: Model;
    level: string;
    /** The canvas's color mode, which the dots follow. */
    mode?: Mode;
    selection: Selection | undefined;
    expanded: ReadonlySet<string>;
    /** The keyboard's focus is in the tree region. */
    focused?: boolean;
    /** The search field, drawn at the top of the region. */
    search?: Snippet;
    /** The search results stand in the outline's place. */
    listing?: boolean;
    /** The node paths a standing query marks, else those the legend's focus marks. */
    marks?: ReadonlySet<string>;
    /** Each assembly's count of marked nodes beneath it. */
    counts?: ReadonlyMap<string, number>;
    /** Each node's diagnostics and warnings, at it or beneath it. */
    diagnosticMarks?: ReadonlyMap<string, TreeMark>;
    /** The levels the standing route crosses. */
    routeMarks?: ReadonlySet<string>;
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

  // A selection made outside the tree, or by the tree's keys, scrolls its row into view; the tree's own click does not.
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
    onselect(rowSelection(model.tree!, level, r));
  }
  /** A collapsed row's count of marked nodes beneath it; a folder's sums its members. */
  function hitsBeneath(r: Row): number {
    if (!marks || !counts || !r.expandable || expanded.has(r.path)) return 0;
    if (r.kind === "node") return counts.get(r.path) ?? 0;
    return (folderOf(model.tree!, r.path)?.members ?? []).reduce((n, m) => n + (marks.has(m) ? 1 : 0) + (counts.get(m) ?? 0), 0);
  }
  const steps = $derived(stepsOf(model));
  /** A row's dot: the tier's color, or in rate mode the triple's step, a colored extra or the shared neutral past them, the continuous color, an assembly with no discrete leaf gray. */
  const dot = (r: Row) => {
    const n = model.tree!.byPath.get(r.path)!;
    if (mode === "tier") return n.class === "assembly" ? palette.assembly : n.tier === "discrete" ? palette.discrete : palette.continuous;
    const t = blockTriple(model, r.path);
    const step = t && steps.get(tripleKey(t));
    if (step !== undefined) return stepPair(step);
    return n.class === "assembly" ? palette.assembly : palette.continuous;
  };
  /** A diagnostic mark's title: the counts in words, ", beneath" when the row's own node carries none. */
  const markTitle = (m: TreeMark) =>
    [m.errors && count(m.errors, "error", "errors"), m.warnings && count(m.warnings, "warning", "warnings")].filter(Boolean).join(", ")
    + (m.own ? "" : ", beneath");
</script>

<!-- svelte-ignore a11y_no_noninteractive_tabindex (a region root, one of Tab's four stops by answer 11) -->
<nav class="tree" class:focused bind:this={nav} aria-label="the model tree" tabindex="0">
  {@render search?.()}
  {#each listing ? [] : rows as r (r.path)}
    {@const under = hitsBeneath(r)}
    <!-- svelte-ignore a11y_click_events_have_key_events (the keyboard table is increment 5's) -->
    <div
      class={["row", r.kind, r.class, {
        expanded: r.expandable && expanded.has(r.path), selected: r.path === selectedRow, open: r.kind === "node" && r.path === level,
        hit: r.kind === "node" && !!marks?.has(r.path),
      }]}
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
        {@const dm = diagnosticMarks?.get(r.path)}
        <span class="dot" style:background={c.stroke}></span>
        <span class="segment">{r.label}</span>
        {#if r.parent !== undefined}<span class="name">{r.displayName}</span>{/if}
        {#if dm}
          <span
            class="mark" data-mark={dm.errors ? "error" : "warning"} title={markTitle(dm)}
            style:background={dm.errors ? palette.error : palette.warning}
          ></span>
        {/if}
        {#if routeMarks?.has(r.path)}
          <span class="mark" data-mark="route" title="on the route" style:background={palette.highlight}></span>
        {/if}
      {/if}
      {#if under > 0}<span class="hits" title={`${under} marked beneath`}>{under}</span>{/if}
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
  .mark { width: 7px; height: 7px; border-radius: 50%; flex: none; }
  .glyph { width: 10px; font-size: 11px; color: var(--text-light); flex: none; text-align: center; }
  .name { color: var(--text-light); font-size: 12px; overflow: hidden; text-overflow: ellipsis; }
  .row.hit .dot { outline: 1.5px dashed var(--highlight); outline-offset: 1.5px; }
  .hits {
    margin-left: auto; flex: none; padding: 0 5px; font-size: 11px; line-height: 14px; color: var(--highlight);
    border: 1px dashed var(--highlight); border-radius: 7px;
  }
</style>
