<script lang="ts">
  // The execution-order tab (workspace.md answer 6, the pending bullet): `outputs.order` numbered from 1, each row the
  // leaf's path with its stage 1 and stage 2 ports, and under it the feedthrough edges into the leaf, labelled
  // presumed (reading 10). A row's click selects the leaf; an edge's, the consumer's input port.
  import { orderRows, rowTarget } from "../../lib/analysis";
  import type { Selection } from "../../lib/detail";
  import type { Model } from "../../lib/model";

  let { model, onrow }: { model: Model; onrow: (s: Selection) => void } = $props();

  const rows = $derived(orderRows(model));
  const PRESUMED = "Presumed from the stage lists: a stage-2 port into a block with a stage-2 output. The build's structure, not a traced dependence; it can overstate what the block reads.";
  const click = (s: Selection | undefined) => s && onrow(s);
</script>

{#if rows.length}
  <ol class="order">
    {#each rows as r (r.position)}
      <li class="step" data-position={r.position} data-path={r.path}>
        <button class="row" title="Select the leaf" onclick={() => click(rowTarget(model, r))}>
          <span class="position">{r.position}</span>
          <code class="path">{r.path || "/"}</code>
        </button>
        <ul class="ports">
          {#each r.stage1 as p (p)}<li class="port" data-stage="1" title="published from stage 1">{p}</li>{/each}
          {#each r.stage2 as p (p)}<li class="port" data-stage="2" title="published from stage 2">{p}</li>{/each}
        </ul>
        {#if r.edges.length}
          <ul class="edges">
            {#each r.edges as e (e.to.port)}
              <li class="edge" data-from={`${e.from.path}/${e.from.port}`} data-to={`${e.to.path}/${e.to.port}`} title={PRESUMED}>
                <button class="row" onclick={() => click(rowTarget(model, e))}>
                  <code>{e.from.path}/{e.from.port}</code> → <code>{e.to.port}</code>
                  <span class="presumed">presumed</span>
                </button>
              </li>
            {/each}
          </ul>
        {/if}
      </li>
    {/each}
  </ol>
{:else}
  <p class="empty">No execution order: the build did not reach it.</p>
{/if}

<style>
  ol.order { list-style: none; margin: 0; padding: 0; color: var(--text); font-size: 12px; }
  .step { display: flex; flex-wrap: wrap; align-items: baseline; gap: 2px 10px; padding: 2px 0; }
  .step + .step { border-top: 1px solid var(--strip); }
  .row { padding: 0; border: 0; background: none; font: inherit; color: inherit; cursor: pointer; text-align: left; }
  .row:hover code { text-decoration: underline; }
  .position { display: inline-block; min-width: 2.2em; text-align: right; margin-right: 6px; color: var(--text-light); font-variant-numeric: tabular-nums; }
  code { font: 12px ui-monospace, monospace; }
  ul.ports { display: flex; flex-wrap: wrap; gap: 4px; list-style: none; margin: 0; padding: 0; }
  .port { font: 11px ui-monospace, monospace; padding: 0 4px; border: 1px solid var(--text-light); border-radius: 2px; }
  .port[data-stage="2"] { background: var(--text-light); color: var(--bg); }
  ul.edges { flex-basis: 100%; list-style: none; margin: 0 0 2px; padding: 0 0 0 calc(2.2em + 6px); }
  .edge { color: var(--text-light); }
  .presumed { margin-left: 6px; font-style: italic; color: var(--text-light); }
  .empty { margin: 0; color: var(--text-light); }
</style>
