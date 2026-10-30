<script lang="ts">
  // What the page shows before a model loads (workspace.md answer 10): the
  // privacy statement, the open control, the drop hint; a refusal below them.
  let { outcome, onfile }: { outcome?: string; onfile: (file: File | undefined) => void } = $props();
  let input = $state<HTMLInputElement>();
</script>

<div class="landing">
  <h1>Redstone inspector</h1>
  <p class="privacy">
    The file is read inside your browser and never uploaded.
    This page loads nothing from the network.
  </p>
  <p>
    <button class="open-file" onclick={() => input?.click()} title="Open a descriptor (.json)">Open a descriptor…</button>
    <input
      type="file" accept=".json,application/json" hidden bind:this={input}
      onchange={(e) => { onfile(e.currentTarget.files?.[0]); e.currentTarget.value = ""; }}
    />
  </p>
  <p class="drop-hint">or drop a <code>.json</code> descriptor anywhere on the page.</p>
  {#if outcome}<pre class="outcome">{outcome}</pre>{/if}
</div>

<style>
  .landing { max-width: 34rem; margin: 0 auto; padding: 18vh 1rem 0; }
  h1 { font-size: 1.3rem; margin: 0 0 1rem; }
  .privacy { color: var(--text); line-height: 1.45; }
  .drop-hint { color: var(--text-light); }
  .open-file { font: 14px system-ui, sans-serif; padding: 4px 10px; }
  pre { white-space: pre-wrap; margin: 1rem 0 0; }
</style>
