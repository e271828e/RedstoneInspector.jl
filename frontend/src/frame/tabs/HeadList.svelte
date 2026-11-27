<script lang="ts">
  // A tab's head list (deployment_overlay.md answer 9, workspace.md answer 6): a line each of label and value pairs,
  // a colon after each name, the value in code unless it is prose. The timing tab's three lines and the events tab's one.
  import type { HeadItem } from "../../lib/timing";

  let { lines }: { lines: HeadItem[][] } = $props();
</script>

{#each lines as line, i (i)}
  <dl class="head">
    {#each line as h (h.label)}
      <div class="item" data-item={h.label}><dt>{h.label}:</dt><dd>{#each h.values as v, j (v)}{#if j}{", "}{/if}{#if h.prose}{v}{:else}<code>{v}</code>{/if}{/each}</dd></div>
    {/each}
  </dl>
{/each}

<style>
  /* A line of label and value pairs each, wrapping; a value wraps under itself. */
  dl.head { display: flex; flex-wrap: wrap; gap: 2px 16px; margin: 0 0 2px; font-size: 12px; color: var(--text); }
  dl.head .item { display: flex; gap: 6px; }
  dl.head dt { color: var(--text-light); white-space: nowrap; }
  dl.head dd { margin: 0; }
  code { font: 12px ui-monospace, monospace; }
</style>
