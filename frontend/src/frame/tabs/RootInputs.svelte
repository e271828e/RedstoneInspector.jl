<script lang="ts">
  // The root inputs tab (workspace.md answer 6): name, type, kind phrase, pinned mark and terminal consumers, a row's
  // click selecting the root tag (reading 11). Stage 2's claim column and stage 3's widgets join here.
  import { rootInputRows, rowTarget } from "../../lib/analysis";
  import type { Selection } from "../../lib/detail";
  import type { Model } from "../../lib/model";
  import type { Face } from "../../lib/resolve";

  let { model, onrow }: { model: Model; onrow: (s: Selection) => void } = $props();

  const rows = $derived(rootInputRows(model));
  const PINNED = "A pinned face: the writer marked it; version 1.0 of the format carries none";
  /** A consumer as `path/port`, a root output `/port`. */
  const consumerText = (f: Face) => `${f.path}/${f.port}`;
  const click = (s: Selection | undefined) => s && onrow(s);
</script>

{#if rows.length}
  <table class="root-inputs">
    <thead>
      <tr><th>name</th><th>type</th><th>kind</th><th title={PINNED}>pinned</th><th>terminal consumers</th></tr>
    </thead>
    <tbody>
      {#each rows as r (r.name)}
        <tr class="root-input" data-name={r.name}>
          <td class="name"><button class="row" title="Select the root input" onclick={() => click(rowTarget(model, r))}><code>{r.name}</code></button></td>
          <td class="type"><code>{r.type}</code></td>
          <td class="kind">{r.phrase}</td>
          <td class="pinned">{r.pinned ? "pinned" : ""}</td>
          <td class="consumers">{#each r.consumers as c, i (i)}{#if i > 0}{", "}{/if}<code>{consumerText(c)}</code>{:else}none{/each}</td>
        </tr>
      {/each}
    </tbody>
  </table>
{:else}
  <p class="empty">No root inputs.</p>
{/if}

<style>
  table { border-collapse: collapse; color: var(--text); font-size: 12px; }
  th { text-align: left; font-weight: 600; color: var(--text-light); padding: 2px 10px 4px 0; white-space: nowrap; }
  td { padding: 2px 10px 2px 0; vertical-align: baseline; }
  tbody tr:hover { background: var(--strip); }
  code { font: 12px ui-monospace, monospace; }
  .consumers code { white-space: nowrap; }
  .row { padding: 0; border: 0; background: none; font: inherit; color: inherit; cursor: pointer; text-align: left; }
  .row:hover code { text-decoration: underline; }
  .empty { margin: 0; color: var(--text-light); }
</style>
