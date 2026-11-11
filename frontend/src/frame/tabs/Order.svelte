<script lang="ts">
  // The execution-order tab (workspace.md answer 6): two groups, as the core runs a sweep. Stage 1 lists every leaf
  // with a stage 1 port, unnumbered; stage 2 every leaf with a stage 2 port, numbered from 1, and under a row the
  // feedthrough edges into it, labelled presumed (look pass 1.7 and 1.8). A row's click selects the leaf; an edge's,
  // the consumer's input port. The whole row takes the click; its button is there for the keyboard (look pass 1.2).
  import { orderGroups, rowTarget, type Row } from "../../lib/analysis";
  import type { Selection } from "../../lib/detail";
  import type { Model } from "../../lib/model";

  let { model, onrow }: { model: Model; onrow: (s: Selection) => void } = $props();

  const groups = $derived(orderGroups(model));
  const PRESUMED = "A stage 2 output wired into this component. Its own stage 2 output may read it in the same sweep, so the producer runs first. Presumed: the build knows the wiring and the stages, not which inputs each output reads.";
  const click = (r: Row) => {
    const s = rowTarget(model, r);
    if (s) onrow(s);
  };
</script>

{#if groups}
  <section class="order-group" data-stage="1">
    <h3>Stage 1, any order</h3>
    {#if groups.stage1.length}
      <ul class="order">
        {#each groups.stage1 as r (r.path)}
          <li class="step" data-stage="1" data-path={r.path}>
            <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
            <div class="line" onclick={() => click(r)}>
              <button class="row" title="Select the primitive"><code class="path">{r.path || "/"}</code></button>
              <ul class="ports">
                {#each r.ports as p (p)}<li class="port" data-stage="1" title="published from stage 1">{p}</li>{/each}
              </ul>
            </div>
          </li>
        {/each}
      </ul>
    {:else}
      <p class="empty">No stage 1 outputs.</p>
    {/if}
  </section>

  <section class="order-group" data-stage="2">
    <h3>Stage 2, in order</h3>
    {#if groups.stage2.length}
      <ol class="order">
        {#each groups.stage2 as r (r.position)}
          <li class="step" data-stage="2" data-position={r.position} data-path={r.path}>
            <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
            <div class="line" onclick={() => click(r)}>
              <button class="row" title="Select the primitive">
                <span class="position">{r.position}</span>
                <code class="path">{r.path || "/"}</code>
              </button>
              <ul class="ports">
                {#each r.ports as p (p)}<li class="port" data-stage="2" title="published from stage 2">{p}</li>{/each}
              </ul>
            </div>
            {#if r.edges.length}
              <ul class="edges">
                {#each r.edges as e (e.to.port)}
                  <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_noninteractive_element_interactions -->
                  <li class="edge" data-from={`${e.from.path}/${e.from.port}`} data-to={`${e.to.path}/${e.to.port}`} title={PRESUMED} onclick={() => click(e)}>
                    <button class="row">
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
      <p class="empty">No stage 2 outputs, so nothing is ordered.</p>
    {/if}
  </section>
{:else}
  <p class="empty">No execution order: the build did not reach it.</p>
{/if}

<style>
  h3 { margin: 10px 0 4px; font-size: 12px; font-weight: 600; color: var(--text); }
  .order-group:first-child h3 { margin-top: 0; }
  .order { list-style: none; margin: 0; padding: 0; color: var(--text); font-size: 12px; }
  .step { padding: 2px 0; }
  .step + .step { border-top: 1px solid var(--strip); }
  .line { display: flex; flex-wrap: wrap; align-items: baseline; gap: 2px 10px; cursor: pointer; }
  .row { padding: 0; border: 0; background: none; font: inherit; color: inherit; cursor: pointer; text-align: left; }
  .line:hover code, .edge:hover code { text-decoration: underline; }
  .position { display: inline-block; min-width: 2.2em; text-align: right; margin-right: 6px; color: var(--text-light); font-variant-numeric: tabular-nums; }
  code { font: 12px ui-monospace, monospace; }
  ul.ports { display: flex; flex-wrap: wrap; gap: 4px; list-style: none; margin: 0; padding: 0; }
  .port { font: 11px ui-monospace, monospace; padding: 0 4px; border: 1px solid var(--text-light); border-radius: 2px; }
  .port[data-stage="2"] { background: var(--text-light); color: var(--bg); }
  ul.edges { list-style: none; margin: 0 0 2px; padding: 0 0 0 calc(2.2em + 6px); }
  .edge { color: var(--text-light); cursor: pointer; }
  .presumed { margin-left: 6px; font-style: italic; color: var(--text-light); }
  .empty { margin: 0; color: var(--text-light); }
</style>
