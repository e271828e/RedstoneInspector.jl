<script lang="ts">
  // The timing tab (workspace.md answer 6): the anchors with the base grid first, the rate scopes, every discrete leaf
  // with its triple and rate swatch, sortable by period, then the schedule note (reading 1). A row's click selects
  // its scope's or leaf's node (reading 12); the whole row takes it, its button there for the keyboard (look pass 1.2).
  import { stepPair } from "../../canvas/palette";
  import { anchorRows, componentRows, rowTarget, scheduleNote, scopeRows } from "../../lib/analysis";
  import type { Selection } from "../../lib/detail";
  import type { Model } from "../../lib/model";
  import { tripleTitle } from "../../lib/rates";

  let { model, onrow, byPeriod = $bindable(false) }: {
    model: Model;
    onrow: (s: Selection) => void;
    /** The components sorted by period; the drawer holds it, so a tab switch keeps it. */
    byPeriod?: boolean;
  } = $props();

  const anchors = $derived(anchorRows(model));
  const scopes = $derived(scopeRows(model));
  const components = $derived(componentRows(model, byPeriod));
  const note = $derived(scheduleNote(model));
</script>

{#snippet button(s: Selection | undefined, text: string, title: string)}
  {#if s}<button class="row" {title}><code>{text}</code></button>{:else}<code>{text}</code>{/if}
{/snippet}

{#if !model.structure}
  <p class="empty">No timing: the descriptor carries no structure.</p>
{:else}
  <h3>Anchors</h3>
  <table class="anchors">
    <thead><tr><th>index</th><th>T</th><th>tau</th><th>declared in</th><th>key</th></tr></thead>
    <tbody>
      {#each anchors as a (a.index)}
        {@const s = rowTarget(model, a)}
        <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_noninteractive_element_interactions -->
        <tr class="anchor" class:base={a.base} data-index={a.index} onclick={s && (() => onrow(s))}>
          {#if a.base}
            <td class="index">0 <span class="base-grid">base grid</span></td>
            <td class="T" title="The deployment's base step, which a build does not know"><code>Δt</code></td>
            <td class="tau">0</td>
            <td class="scope">—</td>
            <td class="key">the deployment's</td>
          {:else}
            <td class="index">{a.index}</td>
            <td class="T">{a.T}</td>
            <td class="tau">{a.tau}</td>
            <td class="scope">{#if a.scope === ""}the root{:else}{@render button(s, a.scope, "Select the declaring scope")}{/if}</td>
            <td class="key"><code>{a.key}</code></td>
          {/if}
        </tr>
      {/each}
    </tbody>
  </table>

  <h3>Rate scopes</h3>
  {#if scopes.length}
    <table class="scopes">
      <thead><tr><th>path</th><th>key</th><th>triple</th></tr></thead>
      <tbody>
        {#each scopes as x (x.path)}
          {@const s = rowTarget(model, x)}
          <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_noninteractive_element_interactions -->
          <tr class="scope" data-path={x.path} data-key={x.key} onclick={s && (() => onrow(s))}>
            <td class="path">{@render button(s, x.path || "/", "Select the scope's assembly")}</td>
            <td class="key"><code>{x.key}</code></td>
            <td class="triple" title={tripleTitle(model, x.triple)}>{x.text}</td>
          </tr>
        {/each}
      </tbody>
    </table>
  {:else}
    <p class="empty">No assembly is keyed in <code>sample_times</code>; every key names a primitive.</p>
  {/if}

  <h3>Components</h3>
  {#if components.length}
    <button class="sort-period" aria-pressed={byPeriod} title="Sort the components by period, the base grid first" onclick={() => (byPeriod = !byPeriod)}>by period</button>
    <table class="components">
      <thead><tr><th></th><th>path</th><th>triple</th><th>period</th></tr></thead>
      <tbody>
        {#each components as c (c.path)}
          {@const pair = stepPair(c.step)}
          {@const s = rowTarget(model, c)}
          <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_noninteractive_element_interactions -->
          <tr class="component" data-path={c.path} onclick={s && (() => onrow(s))}>
            <td class="swatch"><span class="swatch" data-step={c.step} style:background={pair.fill} style:border-color={pair.stroke}></span></td>
            <td class="path">{@render button(s, c.path || "/", "Select the primitive")}</td>
            <td class="triple" title={tripleTitle(model, c.triple)}>{c.text}</td>
            <td class="period">{c.period}</td>
          </tr>
        {/each}
      </tbody>
    </table>
  {:else}
    <p class="empty">No discrete primitives.</p>
  {/if}

  <p class="schedule-note">{note}</p>
{/if}

<style>
  h3 { margin: 10px 0 4px; font-size: 12px; font-weight: 600; color: var(--text); }
  h3:first-child { margin-top: 0; }
  table { border-collapse: collapse; color: var(--text); font-size: 12px; }
  th { text-align: left; font-weight: 600; color: var(--text-light); padding: 2px 10px 4px 0; white-space: nowrap; }
  td { padding: 2px 10px 2px 0; vertical-align: baseline; white-space: nowrap; }
  tbody tr:hover { background: var(--strip); }
  code { font: 12px ui-monospace, monospace; }
  .base-grid { color: var(--text-light); }
  .row { padding: 0; border: 0; background: none; font: inherit; color: inherit; cursor: pointer; text-align: left; }
  tr:has(button.row) { cursor: pointer; }
  tr:hover .row code { text-decoration: underline; }
  span.swatch { display: inline-block; width: 12px; height: 10px; border: 1px solid; border-radius: 2px; vertical-align: middle; }
  td.swatch { padding-right: 6px; }
  .sort-period {
    font: 11px system-ui, sans-serif; color: var(--text); background: var(--bg); border: 1px solid var(--border);
    border-radius: 3px; padding: 1px 6px; margin-bottom: 4px; cursor: pointer;
  }
  .sort-period[aria-pressed="true"] { background: var(--strip); border-color: var(--text-light); font-weight: 600; }
  .schedule-note { margin: 10px 0 0; color: var(--text-light); }
  .empty { margin: 0; color: var(--text-light); }
</style>
