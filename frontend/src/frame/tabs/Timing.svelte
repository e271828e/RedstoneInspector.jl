<script lang="ts">
  // The timing tab (workspace.md answer 6, deployment_overlay.md answers 3, 6, 8, 9 and 11): a deployment's head list and
  // hyperperiod chart; the anchors; the base grid's section, the grid report; the rate scopes and the components in the
  // same columns, sortable by period, a deployment adding D₀ and Φ₀. A build's tab ends saying what needs a deployment. A row's click selects its scope's
  // or primitive's node (reading 12); the whole row takes it, its button there for the keyboard (look pass 1.2).
  import { stepPair } from "../../canvas/palette";
  import { rowTarget } from "../../lib/analysis";
  import type { Selection } from "../../lib/detail";
  import type { Model } from "../../lib/model";
  import { stepsOf, tripleKey } from "../../lib/rates";
  import {
    anchorTable, anchorTitle, coarsestLine, componentTable, gridReport, headList, jointPeriod, sampleTimesKeyed, scopeTable,
    type TimingRow,
  } from "../../lib/timing";
  import Chart from "./Chart.svelte";
  import HeadList from "./HeadList.svelte";
  import { rowClick } from "./rowClick";

  let { model, onrow, byPeriod = $bindable(false), legendFocus, onlegend }: {
    model: Model;
    onrow: (s: Selection) => void;
    /** The components sorted by period; the drawer holds it, so a tab switch keeps it. */
    byPeriod?: boolean;
    /** The legend's focused line, rate mode's alone. */
    legendFocus?: string;
    /** A chart swatch pressed, with its line's key. */
    onlegend: (key: string) => void;
  } = $props();

  const deployed = $derived(model.descriptor.kind === "deployment");
  const head = $derived(headList(model));
  const joint = $derived(jointPeriod(model));
  const anchors = $derived(anchorTable(model));
  const coarsest = $derived(coarsestLine(model));
  const report = $derived(gridReport(model));
  const scopes = $derived(scopeTable(model));
  const components = $derived(componentTable(model, byPeriod));
  const steps = $derived(model.structure ? stepsOf(model) : new Map<string, number>());
</script>

{#snippet button(s: Selection | undefined, text: string, title: string)}
  {#if s}<button class="row" {title}><code>{text}</code></button>{:else}<code>{text}</code>{/if}
{/snippet}

{#snippet anchor(a: number, label: string)}
  <span class="anchor" title={anchorTitle(model.structure!, a)}>{label}</span>
{/snippet}

{#snippet cells(r: TimingRow)}
  <td class="anchor">{@render anchor(r.triple[0], r.anchor)}</td>
  <td class="Da">{r.Da}</td>
  <td class="phia">{r.phia}</td>
  {#if deployed}<td class="D0">{r.D0}</td><td class="phi0">{r.phi0}</td>{/if}
  <td class="dt">{r.dt}</td>
  <td class="tau">{r.tau}</td>
{/snippet}

{#snippet heads()}
  <th>anchor</th><th>Dₐ</th><th>Φₐ</th>{#if deployed}<th>D₀</th><th>Φ₀</th>{/if}<th>Δt</th><th>τ</th>
{/snippet}

{#if !model.structure}
  <p class="empty">No timing: the descriptor carries no structure.</p>
{:else}
  {#if head}<HeadList lines={head} />{/if}
  {#if joint}
    <h3>Hyperperiod</h3>
    <Chart {model} {joint} {legendFocus} {onlegend} />
  {/if}

  <h3>Anchors</h3>
  <table class="anchors">
    <thead><tr><th>anchor</th><th>Δt</th><th>τ</th>{#if deployed}<th>D₀</th><th>Φ₀</th>{/if}<th>declared in</th></tr></thead>
    <tbody>
      {#each anchors as a (a.index)}
        {@const s = rowTarget(model, { kind: "anchor", scope: a.scope })}
        <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_noninteractive_element_interactions -->
        <tr class="anchor" class:base={a.index === 0} data-index={a.index} onclick={s && rowClick(() => onrow(s))}>
          <td class="anchor">{@render anchor(a.index, a.label)}</td>
          <td class="dt">{a.dt}</td>
          <td class="tau">{a.tau}</td>
          {#if deployed}<td class="D0">{a.D}</td><td class="phi0">{a.phi}</td>{/if}
          <td class="scope">{#if a.scope === undefined}—{:else if a.scope === ""}the root{:else}{@render button(s, a.scope, "Select the declaring scope")}{/if}</td>
        </tr>
      {/each}
    </tbody>
  </table>
  {#if report}
    <h3>Base grid</h3>
    <div class="grid-report">
      <p class="coarsest">{coarsest}</p>
      {#each report.entries as line (line)}<p class="entry">{line}</p>{/each}
      {#if report.primes}
        <p class="primes">{report.primes}</p>
        <ul class="powers">
          {#each report.attribution as p (p.power)}
            <li class="power" class:unfactored={p.unfactored} data-power={p.power}>{p.power}: {p.suppliers.map((x) => x.text).join(", ")}</li>
          {/each}
        </ul>
      {/if}
    </div>
  {/if}

  <h3>Rate scopes</h3>
  {#if scopes.length}
    <table class="scopes">
      <thead><tr><th>path</th><th>key</th>{@render heads()}</tr></thead>
      <tbody>
        {#each scopes as x (x.path + "\u0000" + x.key)}
          {@const s = rowTarget(model, { kind: "scope", path: x.path })}
          <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_noninteractive_element_interactions -->
          <tr class="scope" data-path={x.path} data-key={x.key} onclick={s && rowClick(() => onrow(s))}>
            <td class="path">{@render button(s, x.path || "/", "Select the scope's assembly")}</td>
            <td class="key"><code>{x.key}</code></td>
            {@render cells(x)}
          </tr>
        {/each}
      </tbody>
    </table>
  {:else}
    {#if sampleTimesKeyed(model)}
      <p class="empty">No assembly is keyed in <code>sample_times</code>; every key names a primitive.</p>
    {:else}
      <p class="empty">Nothing is keyed in <code>sample_times</code>.</p>
    {/if}
  {/if}

  <h3>Components</h3>
  {#if components.length}
    <button class="sort-period" aria-pressed={byPeriod} title={deployed ? "Sort the components by Δt" : "Sort the components by Δt, A₀ first"} onclick={() => (byPeriod = !byPeriod)}>by Δt</button>
    <table class="components">
      <thead><tr><th></th><th>path</th>{@render heads()}</tr></thead>
      <tbody>
        {#each components as c (c.path)}
          {@const step = steps.get(tripleKey(c.triple))!}
          {@const pair = stepPair(step)}
          {@const s = rowTarget(model, { kind: "component", path: c.path })}
          <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_noninteractive_element_interactions -->
          <tr class="component" data-path={c.path} onclick={s && rowClick(() => onrow(s))}>
            <td class="swatch"><span class="swatch" data-step={step} style:background={pair.fill} style:border-color={pair.stroke}></span></td>
            <td class="path">{@render button(s, c.path || "/", "Select the primitive")}</td>
            {@render cells(c)}
          </tr>
        {/each}
      </tbody>
    </table>
  {:else}
    <p class="empty">No discrete primitives.</p>
  {/if}

  {#if !deployed}<p class="deployment-note">The columns in base ticks and the hyperperiod chart need a deployment.</p>{/if}
{/if}

<style>
  h3 { margin: 10px 0 4px; font-size: 12px; font-weight: 600; color: var(--text); }
  h3:first-child { margin-top: 0; }
  table { border-collapse: collapse; color: var(--text); font-size: 12px; }
  th { text-align: left; font-weight: 600; color: var(--text-light); padding: 2px 10px 4px 0; white-space: nowrap; }
  td { padding: 2px 10px 2px 0; vertical-align: baseline; white-space: nowrap; }
  tbody tr:hover { background: var(--strip); }
  code { font: 12px ui-monospace, monospace; }
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
  .grid-report p { margin: 0 0 4px; color: var(--text); font-size: 12px; }
  .grid-report .primes { margin-top: 8px; }
  ul.powers { list-style: none; margin: 0; padding: 0 0 0 16px; font-size: 12px; color: var(--text); }
  .deployment-note { margin: 10px 0 0; color: var(--text-light); }
  .empty { margin: 0; color: var(--text-light); }
</style>
