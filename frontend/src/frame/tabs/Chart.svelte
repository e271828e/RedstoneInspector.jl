<script lang="ts">
  // The hyperperiod chart (deployment_overlay.md answers 8 and 11): the hyperperiod, then one row per distinct (D₀, Φ₀),
  // fastest first, with every triple's swatch, its count, whether it splits frames and a mark at each base tick where
  // it is due. The timeline is drawn whole or omitted (`chartFit`): fitted to the tab, else at the minimum pitch with
  // the tab's body scrolling sideways under the labels, which stay. The frame tops are lines where some base tick is
  // not one, else a caption. A swatch toggles the legend's focus; the row takes no click.
  import { stepPair } from "../../canvas/palette";
  import type { Model } from "../../lib/model";
  import {
    anchorLabel, CHART_PAD, chartFit, chartRows, dueTicks, frameLines, frameTopX, hyperperiodLine, jointLine, legendText, tickX, type JointPeriod,
  } from "../../lib/timing";

  let { model, joint, legendFocus, onlegend }: {
    model: Model;
    joint: JointPeriod;
    /** The legend's focused line, rate mode's alone. */
    legendFocus?: string;
    /** A swatch pressed, with its line's key. */
    onlegend: (key: string) => void;
  } = $props();

  /** The gap between the labels and the timeline, in px, the labels' own so their background covers it. */
  const GAP = 10;
  /** A row's height in px, the labels' and the timeline's alike, so the frame tops run unbroken. */
  const ROW = 22;

  const rows = $derived(chartRows(model));
  const lines = $derived(frameLines(model)!);
  const joined = $derived(jointLine(joint));
  let width = $state(0);
  let labels = $state(0);
  const fit = $derived(chartFit(joint, lines, Math.max(0, width - labels - 2 * CHART_PAD)));
  const tops = $derived.by(() => {
    if (fit.kind === "omitted" || !lines.drawn) return [];
    return Array.from({ length: Number(joint.frames) + 1 }, (_, k) => ({ k, x: frameTopX(BigInt(k), joint, fit) }));
  });
  /** The base ticks as one path of 6 px strokes in the lighter text color, so the pitch reads where no row is due (9.1). */
  const grid = $derived(
    fit.kind === "omitted" ? "" : Array.from({ length: Number(joint.baseTicks) }, (_, n) => `M${tickX(BigInt(n), fit)} ${ROW / 2 - 3}v6`).join(""),
  );
</script>

<p class="hyperperiod">{hyperperiodLine(joint)}</p>
{#if joined}<p class="joint">{joined}</p>{/if}
{#if fit.kind === "omitted"}<p class="chart-omitted">{fit.line}</p>{/if}
{#if !lines.drawn}<p class="frame-caption">{lines.caption}</p>{/if}

<div class="chart" bind:clientWidth={width} data-fit={fit.kind} style:--row="{ROW}px">
  <div class="inner">
    <div class="labels" bind:offsetWidth={labels} style:padding-right="{GAP}px">
      {#each rows as r (r.label)}
        <div class="chart-row" data-d={r.D} data-phi={r.phi} data-splits={r.splits}>
          <span class="dphi">{r.label}</span>
          <span class="swatches">
            {#each r.swatches as w (w.key)}
              {@const pair = stepPair(w.step)}
              {@const t = legendText(model, w.triple)}
              {@const [a, D, phi] = w.triple}
              <button
                class="swatch" data-key={w.key} data-step={w.step} aria-pressed={legendFocus === w.key}
                title="{anchorLabel(model.structure!, a)} · Dₐ {D} · Φₐ {phi} · Δt {t.dt}; focus this rate on the canvas" style:background={pair.fill} style:border-color={pair.stroke}
                onclick={() => onlegend(w.key)}
              ></button>
            {/each}
          </span>
          <span class="count">{r.countText}</span>
          <span class="frames">{r.splits ? "splits frames" : "on frame tops"}</span>
        </div>
      {/each}
    </div>
    {#if fit.kind !== "omitted"}
      <div class="lanes">
        {#each rows as r (r.label)}
          <svg class="lane" data-d={r.D} data-phi={r.phi} width={fit.width + 2 * CHART_PAD} height={ROW} aria-hidden="true">
            <path class="grid" d={grid} />
            {#each tops as t (t.k)}<line class="frame-top" data-k={t.k} x1={t.x} x2={t.x} y1="0" y2={ROW} />{/each}
            {#each dueTicks(r, joint) as n (n)}<circle class="due" data-n={n} cx={tickX(n, fit)} cy={ROW / 2} r="2.5" />{/each}
          </svg>
        {/each}
      </div>
    {/if}
  </div>
</div>

<style>
  p { margin: 0 0 4px; color: var(--text); font-size: 12px; }
  .chart { margin: 4px 0 0; }
  .inner { display: flex; width: max-content; }
  /* The labels stay at the left while the tab's body scrolls sideways under a long timeline. */
  .labels {
    position: sticky; left: 0; z-index: 1; background: var(--bg);
    display: grid; grid-template-columns: repeat(4, auto); grid-auto-rows: var(--row); column-gap: 10px; align-items: center;
  }
  /* A row's four cells sit in the labels' grid, so the columns align across rows. */
  .chart-row { display: contents; white-space: nowrap; font-size: 12px; color: var(--text); }
  .chart-row > span { white-space: nowrap; }
  .dphi { font: 12px ui-monospace, monospace; }
  .swatches { display: inline-flex; gap: 2px; }
  button.swatch {
    width: 12px; height: 10px; padding: 0; border: 1px solid; border-radius: 2px; cursor: pointer; --ring-offset: 3px;
  }
  /* The pressed swatch's ring is a shadow, inside the cursor's, so both show on one swatch. */
  button.swatch[aria-pressed="true"] { box-shadow: 0 0 0 1px var(--bg), 0 0 0 3px var(--highlight); }
  .count, .frames { color: var(--text-light); }
  .lanes { display: flex; flex-direction: column; }
  svg.lane { display: block; }
  .grid { stroke: var(--text-light); stroke-width: 1; }
  .frame-top { stroke: var(--highlight); stroke-width: 1; opacity: 0.6; }
  .due { fill: var(--text); }
</style>
