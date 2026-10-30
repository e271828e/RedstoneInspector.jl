<script lang="ts">
  // The open level's path as links (workspace.md answer 3), the root labelled as
  // the tree labels it, the open control at the left end (answer 10).
  import type { Model } from "../lib/model";

  let { model, level, onopen, onfile }: {
    model: Model;
    level: string;
    onopen: (path: string) => void;
    onfile: (file: File | undefined) => void;
  } = $props();

  let input = $state<HTMLInputElement>();
  /** The open level's ancestors, root first, then the level itself. */
  const trail = $derived.by(() => {
    const tree = model.tree;
    if (!tree) return [""];
    const out = [level];
    for (let p = tree.parent.get(level); p !== undefined; p = tree.parent.get(p)) out.unshift(p);
    return out;
  });
  const text = (p: string) => (p === "" ? model.label : model.tree!.segment.get(p)!);
</script>

<nav class="breadcrumb" data-level-path={level} aria-label="the open level">
  <button class="open-file" onclick={() => input?.click()} title="Open a descriptor (.json)">Open…</button>
  <input
    type="file" accept=".json,application/json" hidden bind:this={input}
    onchange={(e) => { onfile(e.currentTarget.files?.[0]); e.currentTarget.value = ""; }}
  />
  <span class="trail">
    {#each trail as p, i (p)}
      {#if i > 0}<span class="sep">/</span>{/if}
      {#if i < trail.length - 1}
        <a href={"#"} data-path={p} title={p || "/"} onclick={(e) => { e.preventDefault(); onopen(p); }}>{text(p)}</a>
      {:else}
        <span class="current" title={p || "/"}>{text(p)}</span>
      {/if}
    {/each}
  </span>
</nav>

<style>
  .breadcrumb {
    flex: none; display: flex; align-items: center; gap: 10px; height: 30px; padding: 0 8px;
    border-bottom: 1px solid var(--border); white-space: nowrap; overflow: hidden;
  }
  .open-file { font: 12px system-ui, sans-serif; }
  .trail { display: flex; align-items: center; gap: 4px; min-width: 0; overflow: hidden; }
  .sep { color: var(--text-light); }
  a { color: var(--highlight); text-decoration: none; }
  a:hover { text-decoration: underline; }
  .current { font-weight: 600; }
</style>
