<script lang="ts">
  // The open level's path as links (workspace.md answer 3), the root labelled as
  // the tree labels it, the open control at the left end (answer 10), the
  // color mode's segmented switch and the type labels' toggle at the right end
  // (answer 7).
  import type { Model } from "../lib/model";
  import type { Mode } from "../state/prefs.svelte";

  let { model, level, mode = "tier", labels = false, onopen, onfile, onmode, onlabels }: {
    model: Model;
    level: string;
    mode?: Mode;
    labels?: boolean;
    onopen: (path: string) => void;
    onfile: (file: File | undefined) => void;
    onmode?: (mode: Mode) => void;
    onlabels?: () => void;
  } = $props();
  const MODES: [Mode, string, string][] = [["tier", "tier", "Color by tier"], ["rate", "rate", "Color by rate"]];

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
  <div class="controls">
    <div class="mode" role="group" aria-label="the color mode">
      {#each MODES as [m, text, title] (m)}
        <button data-mode={m} aria-pressed={mode === m} {title} onclick={() => onmode?.(m)}>{text}</button>
      {/each}
    </div>
    <button class="type-labels" aria-pressed={labels} title="Show the type of every wire" onclick={() => onlabels?.()}>types</button>
  </div>
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
  .controls { margin-left: auto; display: flex; align-items: center; gap: 8px; flex: none; }
  .controls button { font: 11px system-ui, sans-serif; padding: 1px 8px; }
  .mode { display: flex; }
  .mode button { border-radius: 0; margin: 0; }
  .mode button:first-child { border-radius: 4px 0 0 4px; }
  .mode button:last-child { border-radius: 0 4px 4px 0; border-left: none; }
  .controls button { border: 1px solid var(--border); background: var(--bg); color: var(--text); }
  .controls button[aria-pressed="true"] { background: var(--strip); font-weight: 600; }
</style>
