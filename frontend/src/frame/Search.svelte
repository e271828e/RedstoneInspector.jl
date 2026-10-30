<script lang="ts">
  // The search field at the top of the tree pane and its results (workspace.md
  // answer 5): the list stands in the outline's place while the field has focus
  // and a query stands; arrows move, Enter selects as a tree click does, Escape
  // clears.
  import { tick } from "svelte";
  import type { Selection } from "../lib/detail";
  import { faceSelection } from "../lib/detail";
  import type { Model } from "../lib/model";
  import { CAP, type FaceHit, type Found, type NodeHit, type Range } from "../lib/search";

  let { model, level, query, found, listing = $bindable(false), onquery, onselect, ondone }: {
    model: Model;
    level: string;
    query: string;
    /** The hits of the standing query, undefined without one. */
    found: Found | undefined;
    /** The results list is showing, in the outline's place. */
    listing?: boolean;
    onquery: (text: string) => void;
    onselect: (s: Selection) => void;
    /** A hit picked or the query cleared: focus goes to the canvas. */
    ondone: () => void;
  } = $props();

  let focused = $state(false);
  let active = $state(0);
  let list = $state<HTMLElement>();
  $effect(() => {
    listing = focused && query.trim() !== "";
  });

  const isFace = (h: NodeHit | FaceHit): h is FaceHit => "side" in h;
  const groups = $derived.by(() => {
    if (!found) return [];
    const faces: (NodeHit | FaceHit)[] = found.rows.filter(isFace);
    const nodes = found.rows.filter((h) => !isFace(h));
    return [
      { group: "faces" as const, title: "Faces", count: found.faces.length, rows: faces, start: 0 },
      { group: "nodes" as const, title: "Nodes", count: found.nodes.length, rows: nodes, start: faces.length },
    ].filter((g) => g.count > 0);
  });

  /** The text cut into plain and matched pieces. */
  function pieces(text: string, rs: Range[]): { text: string; mark: boolean }[] {
    const out: { text: string; mark: boolean }[] = [];
    let at = 0;
    for (const [a, b] of rs) {
      if (a > at) out.push({ text: text.slice(at, a), mark: false });
      out.push({ text: text.slice(a, b), mark: true });
      at = b;
    }
    if (at < text.length) out.push({ text: text.slice(at), mark: false });
    return out;
  }

  /** A hit selected as a tree click selects its node, a face through `faceSelection`. */
  function pick(h: NodeHit | FaceHit) {
    const tree = model.tree!;
    if (isFace(h)) onselect(faceSelection(tree, { path: h.path, side: h.side, port: h.name }));
    else onselect({ level: h.path === "" ? level : tree.parent.get(h.path)!, target: { kind: "block", id: h.path } });
    ondone();
  }

  function keydown(e: KeyboardEvent) {
    const rows = found?.rows ?? [];
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      if (!rows.length) return;
      active = Math.max(0, Math.min(rows.length - 1, active + (e.key === "ArrowDown" ? 1 : -1)));
      tick().then(() => list?.querySelector(".hit.active")?.scrollIntoView({ block: "nearest" }));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const ordered = groups.flatMap((g) => g.rows);
      if (ordered[active]) pick(ordered[active]);
    } else if (e.key === "Escape") {
      e.preventDefault();
      clear();
    }
  }
  function clear() {
    onquery("");
    ondone();
  }
</script>

<div class="search">
  <input
    class="query" type="text" placeholder="Search  /" aria-label="Search the model" spellcheck="false" autocomplete="off"
    value={query}
    oninput={(e) => { active = 0; onquery(e.currentTarget.value); }}
    onfocus={() => (focused = true)} onblur={() => (focused = false)} onkeydown={keydown}
  />
  <button class="clear" title="Clear the search" aria-label="Clear the search" disabled={query === ""} onclick={clear}>×</button>
</div>
{#if listing && found}
  <div class="results" bind:this={list} role="listbox" aria-label="the search results">
    {#each groups as g (g.group)}
      <div class="group" data-group={g.group}>
        <div class="group-head">{g.title} <span class="count">{g.count}</span></div>
        {#each g.rows as h, i (isFace(h) ? `${h.path}|${h.side}|${h.name}` : h.path)}
          {@const n = g.start + i}
          <!-- A press keeps the field's focus, so the list stays until the click lands. -->
          <div
            class="hit" class:active={n === active} data-path={h.path}
            data-side={isFace(h) ? h.side : undefined} data-face={isFace(h) ? h.name : undefined}
            role="option" aria-selected={n === active} tabindex="-1"
            onmousedown={(e) => e.preventDefault()} onclick={() => pick(h)} onkeydown={() => {}}
          >
            {#if isFace(h)}
              <span class="where">{#each pieces(h.path || "/", h.path ? h.match.path : []) as p, k (k)}{#if p.mark}<mark>{p.text}</mark>{:else}{p.text}{/if}{/each}</span>
              <span class="side">{h.side}</span>
              <span class="face">{#each pieces(h.name, h.match.name) as p, k (k)}{#if p.mark}<mark>{p.text}</mark>{:else}{p.text}{/if}{/each}</span>
            {:else}
              <span class="where">{#each pieces(h.path || model.label, h.path ? h.match.path : []) as p, k (k)}{#if p.mark}<mark>{p.text}</mark>{:else}{p.text}{/if}{/each}</span>
              <span class="label">{#each pieces(h.label, h.match.label) as p, k (k)}{#if p.mark}<mark>{p.text}</mark>{:else}{p.text}{/if}{/each}</span>
            {/if}
          </div>
        {/each}
      </div>
    {/each}
    {#if found.total > CAP}
      <p class="refine">{found.total} hits; showing {CAP}, refine the query</p>
    {:else if found.total === 0}
      <p class="none">no hits</p>
    {/if}
  </div>
{/if}

<style>
  .search { position: sticky; top: 0; z-index: 1; display: flex; gap: 4px; padding: 4px 6px; background: var(--bg); }
  .query {
    flex: 1; min-width: 0; font: 12px system-ui, sans-serif; padding: 3px 6px; color: var(--text);
    border: 1px solid var(--border); border-radius: 3px; background: var(--bg);
  }
  .query { user-select: text; }
  .query:focus { outline: 1px solid var(--highlight); border-color: var(--highlight); }
  .clear {
    flex: none; width: 22px; padding: 0; font: 13px system-ui, sans-serif; color: var(--text-light);
    border: 1px solid var(--border); border-radius: 3px; background: var(--strip); cursor: pointer;
  }
  .clear:disabled { cursor: default; opacity: 0.5; }
  .results { padding: 2px 0 8px; font-size: 12px; }
  .group-head {
    padding: 6px 8px 2px; color: var(--text-light); font-size: 11px; text-transform: uppercase; letter-spacing: 0.04em;
  }
  .count { margin-left: 2px; font-weight: 600; }
  .hit {
    display: flex; gap: 6px; align-items: baseline; padding: 2px 8px; white-space: nowrap; cursor: pointer;
    border-left: 3px solid transparent;
  }
  .hit:hover { background: var(--strip); }
  .hit.active { background: var(--row-selected); border-left-color: var(--highlight); }
  .where { overflow: hidden; text-overflow: ellipsis; }
  .side, .label { color: var(--text-light); }
  .side { font-size: 11px; }
  .face { font-weight: 600; }
  mark { background: none; color: var(--highlight); font-weight: 700; }
  .refine, .none { margin: 6px 8px; color: var(--text-light); }
</style>
