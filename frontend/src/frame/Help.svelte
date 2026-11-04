<script lang="ts">
  // The help page at `#help` (workspace.md answer 11), in place of the frame or
  // the landing: the legend of the diagram's terms with small static drawings in
  // the canvas's shapes and colors, the Simulink vocabulary, the refusals and what
  // is not here yet, the keyboard, and the about section. It scrolls on its own,
  // focused on mount so the browser's keys scroll it.
  import { palette, stepPair } from "../canvas/palette";
  import { BADGE_FONT, FACE_FONT, LABEL_FONT, NAME_FONT, PIN_FONT, PIN_HEIGHT, POINT, PORT, SEGMENT_FONT, SLOT, textWidth } from "../canvas/size";
  import {
    KEYS, KEYS_NOTE, LINKS, NOT_YET, NOT_YET_WHEN, PRIVACY, REFUSALS, TERMS, VIMIUM, VIMIUM_PATTERNS, VOCABULARY,
  } from "../lib/help";
  import { onMount } from "svelte";

  let { onclose }: { onclose: () => void } = $props();
  let article = $state<HTMLElement>();
  onMount(() => article?.focus({ preventScroll: true }));

  const SECTIONS: [string, string][] = [
    ["reading", "Reading the diagram"], ["simulink", "Coming from Simulink"], ["refusals", "What the page does not do"],
    ["keyboard", "The keyboard"], ["about", "About"],
  ];
  /** A section's link scrolls to it, the hash left as `#help`. */
  function jump(e: MouseEvent, id: string) {
    e.preventDefault();
    article?.querySelector(`section[data-section="${id}"]`)?.scrollIntoView();
  }

  /** The samples' frame, in CSS pixels. */
  const W = 120, H = 48;
  /** A port square centered on a point. */
  const sq = (x: number, y: number) => ({ x: x - PORT / 2, y: y - PORT / 2, width: PORT, height: PORT });
  /** An arrowhead ending at a point, pointing right. */
  const head = (x: number, y: number) => `M${x - 7},${y - 3.5} L${x},${y} L${x - 7},${y + 3.5} z`;
  /** The canvas's root tag, rounded at its outer end past the slot, pointed at its inner end. */
  const tagD = (w: number) => {
    const r = PIN_HEIGHT / 2, x0 = SLOT + r;
    return `M${x0},0 L${w - POINT},0 L${w},${r} L${w - POINT},${PIN_HEIGHT} L${x0},${PIN_HEIGHT} A${r},${r} 0 0 1 ${x0},0 Z`;
  };
  const pillText = "2 clocks";
  const pillWidth = Math.ceil(textWidth(pillText, BADGE_FONT)) + 8;
  const wires = [["number", ""], ["flag", "flag"], ["vector", "vector"], ["struct", "struct"]];
</script>

{#snippet text(s: string)}{#each s.split("`") as p, i}{#if i % 2}<code>{p}</code>{:else}{p}{/if}{/each}{/snippet}

{#snippet sample(key: string)}
  <svg class="sample" data-sample={key} width={W} height={H} viewBox="0 0 {W} {H}" aria-hidden="true">
    {#if key === "block"}
      <rect x="12" y="4" width="96" height="40" rx="4" fill={palette.continuous.fill} stroke={palette.continuous.stroke} />
      <text x="20" y="19" style="font:{SEGMENT_FONT}">plant</text>
      <text class="display" x="20" y="33" style="font:{NAME_FONT}">Longitudinal</text>
      <rect class="port" {...sq(12, 24)} />
      <rect class="port" {...sq(108, 24)} />
    {:else if key === "face"}
      <rect x="12" y="4" width="84" height="40" rx="4" fill={palette.discrete.fill} stroke={palette.discrete.stroke} />
      <text x="20" y="27" style="font:{FACE_FONT}">u</text>
      <text x="88" y="19" text-anchor="end" style="font:{FACE_FONT}">y</text>
      <text x="88" y="35" text-anchor="end" style="font:{FACE_FONT}">x</text>
      <rect class="port" {...sq(12, 24)} />
      <rect class="port" {...sq(96, 16)} />
      <rect class="port stage1" {...sq(96, 32)} />
    {:else if key === "wire"}
      {#each wires as [name, kind], i}
        {@const y = 6 + i * 12}
        <line class="wire" data-kind={kind || undefined} x1="4" y1={y} x2="64" y2={y} />
        {#if kind === "struct"}<line class="wire-core" x1="4" y1={y} x2="64" y2={y} />{/if}
        <path class="head" d={head(72, y)} />
        <text class="display" x="78" y={y + 3} style="font:{LABEL_FONT}">{name}</text>
      {/each}
    {:else if key === "pin"}
      <rect x="20" y="13" width="64" height={PIN_HEIGHT} rx={PIN_HEIGHT / 2} fill={palette.pin.fill} stroke={palette.pin.stroke} />
      <text x="52" y="28" text-anchor="middle" style="font:{PIN_FONT}">h_ref</text>
      <rect class="port" {...sq(84, 24)} />
    {:else if key === "tag"}
      <g transform="translate(16,13)">
        <path d={tagD(80)} fill={palette.rootTag.fill} stroke={palette.rootTag.stroke} />
        <text x={SLOT + (80 - SLOT - POINT) / 2} y="15" text-anchor="middle" style="font:{PIN_FONT}">mode</text>
        <rect class="port" {...sq(80, PIN_HEIGHT / 2)} />
      </g>
    {:else if key === "region"}
      <rect class="region" x="4" y="2" width="112" height="44" rx="6" />
      <text class="display" x="12" y="15" style="font:{FACE_FONT}">sensors</text>
      <rect x="24" y="21" width="72" height="20" rx="4" fill={palette.discrete.fill} stroke={palette.discrete.stroke} />
      <text x="32" y="35" style="font:{SEGMENT_FONT}">imu</text>
    {:else if key === "badge"}
      <rect x="8" y="12" width="104" height="32" rx="4" fill={palette.assembly.fill} stroke={palette.assembly.stroke} />
      <rect x="11" y="15" width="98" height="26" rx="2" fill="none" stroke={palette.assembly.stroke} />
      <text x="16" y="33" style="font:{SEGMENT_FONT}">selection</text>
      <rect class="pill" x={108 - pillWidth} y="5" width={pillWidth} height="12" rx="6" stroke={palette.assembly.stroke} />
      <text x={104} y="14" text-anchor="end" style="font:{BADGE_FONT}">{pillText}</text>
    {:else if key === "halo"}
      <rect class="halo" x="11" y="5" width="98" height="38" rx="7" />
      <rect x="14" y="8" width="92" height="32" rx="4" fill={palette.continuous.fill} stroke={palette.continuous.stroke} />
      <text x="22" y="28" style="font:{SEGMENT_FONT}">plant</text>
    {:else if key === "casing"}
      <path class="casing" d="M6,12 H58 V36 H106" />
      <path class="wire" d="M6,12 H58 V36 H106" />
      <path class="head" d={head(114, 36)} />
    {:else if key === "chord"}
      <rect x="12" y="4" width="96" height="40" rx="4" fill={palette.discrete.fill} stroke={palette.discrete.stroke} />
      <path class="chord" d="M12,16 L108,32" />
      <path class="cross" d="M57,21 L63,27 M57,27 L63,21" />
      <rect class="port" {...sq(12, 16)} />
      <rect class="port" {...sq(108, 32)} />
    {:else if key === "dim"}
      <rect x="4" y="8" width="52" height="32" rx="4" fill={palette.discrete.fill} stroke={palette.discrete.stroke} />
      <text x="12" y="28" style="font:{SEGMENT_FONT}">lit</text>
      <g class="dimmed">
        <rect x="64" y="8" width="52" height="32" rx="4" fill={palette.discrete.fill} stroke={palette.discrete.stroke} />
        <text x="72" y="28" style="font:{SEGMENT_FONT}">dim</text>
      </g>
    {:else if key === "hue"}
      {#each [["error", palette.error], ["warning", palette.warning], ["highlight", palette.highlight]] as [name, color], i}
        <rect x={2 + i * 42} y="6" width="30" height="22" rx="3" fill={color} />
        <text class="display" x={17 + i * 42} y="42" text-anchor="middle" style="font:{LABEL_FONT}">{name}</text>
      {/each}
    {:else if key === "modes"}
      <rect x="4" y="8" width="52" height="32" rx="4" fill={palette.discrete.fill} stroke={palette.discrete.stroke} />
      <text x="12" y="28" style="font:{SEGMENT_FONT}">tier</text>
      <rect x="64" y="8" width="52" height="32" rx="4" fill={stepPair(0).fill} stroke={stepPair(0).stroke} />
      <text x="72" y="28" style="font:{SEGMENT_FONT}">rate</text>
    {/if}
  </svg>
{/snippet}

<!-- svelte-ignore a11y_no_noninteractive_tabindex (focused on mount, so Space and the arrows scroll the page) -->
<article
  class="help" tabindex="-1" bind:this={article}
  style="--wire:{palette.wire};--port:{palette.port};--highlight:{palette.highlight};--error:{palette.error};--dim:{palette.dim};--dash:{palette.dash}"
>
  <div class="page">
    <header>
      <h1>Redstone inspector</h1>
      <button class="close" title="Close the help page (Escape or ?)" onclick={onclose}>back</button>
    </header>
    <nav>
      {#each SECTIONS as [id, title] (id)}<a href="#help-{id}" onclick={(e) => jump(e, id)}>{title}</a>{/each}
    </nav>

    <section data-section="reading">
      <h2>Reading the diagram</h2>
      <ul class="terms">
        {#each TERMS as t (t.key)}
          <li data-term={t.key}>
            {#if t.sample}{@render sample(t.sample)}{/if}
            <p><b class="term">{t.term}</b> {@render text(t.line)}</p>
          </li>
        {/each}
      </ul>
    </section>

    <section data-section="simulink">
      <h2>Coming from Simulink</h2>
      <table class="vocabulary">
        <thead><tr><th>Simulink</th><th>Redstone</th><th></th></tr></thead>
        <tbody>
          {#each VOCABULARY as [simulink, redstone, note] (simulink)}
            <tr><td>{@render text(simulink)}</td><td>{@render text(redstone)}</td><td class="note">{@render text(note)}</td></tr>
          {/each}
        </tbody>
      </table>
    </section>

    <section data-section="refusals">
      <h2>What the page does not do</h2>
      <ul class="refusals">
        {#each REFUSALS as r (r.what)}<li><b>{r.what}</b>: {r.why}</li>{/each}
      </ul>
      <h3>Not here yet</h3>
      <ul class="not-yet">
        {#each NOT_YET as line (line)}<li>{line}</li>{/each}
      </ul>
      <p>{NOT_YET_WHEN}</p>
    </section>

    <section data-section="keyboard">
      <h2>The keyboard</h2>
      <p>{KEYS_NOTE}</p>
      <table class="keys">
        <tbody>
          {#each KEYS as [keys, action], i (i)}
            <tr>
              <td class="keys">{#each keys as k, j (j)}{#if j > 0}{" "}{/if}<kbd>{k}</kbd>{/each}</td>
              <td>{action}</td>
            </tr>
          {/each}
        </tbody>
      </table>
      <p class="vimium">
        {VIMIUM.before} <code>{VIMIUM_PATTERNS[0]}</code> {VIMIUM.between} <code>{VIMIUM_PATTERNS[1]}</code> {VIMIUM.after}
      </p>
    </section>

    <section data-section="about">
      <h2>About</h2>
      <p class="privacy">{PRIVACY}</p>
      <dl class="about">
        <dt>inspector</dt><dd>{__INSPECTOR_VERSION__}</dd>
        <dt>format</dt><dd>major {__FORMAT_MAJOR__}</dd>
        {#each LINKS as l (l.href)}
          <dt>{l.label}</dt><dd><a href={l.href} target="_blank" rel="noopener">{l.href}</a></dd>
        {/each}
      </dl>
    </section>
  </div>
</article>

<style>
  .help { height: 100%; overflow: auto; box-sizing: border-box; outline: none; line-height: 1.45; font-size: 14px; }
  .page { max-width: 48rem; margin: 0 auto; padding: 2rem 1rem 4rem; }
  header { display: flex; align-items: baseline; justify-content: space-between; gap: 1rem; }
  h1 { font-size: 1.3rem; margin: 0; }
  .close { font: 13px system-ui, sans-serif; padding: 2px 10px; }
  nav { display: flex; flex-wrap: wrap; gap: 4px 16px; margin: 0.75rem 0 0; padding-bottom: 0.75rem; border-bottom: 1px solid var(--border); }
  nav a, dd a { color: var(--highlight); }
  section { padding-top: 0.5rem; }
  h2 { font-size: 1.1rem; margin: 1.5rem 0 0.75rem; }
  h3 { font-size: 0.95rem; margin: 1rem 0 0.25rem; }
  code, kbd { font-family: ui-monospace, Menlo, Consolas, monospace; font-size: 0.9em; }
  kbd { padding: 0 4px; border: 1px solid var(--border); border-radius: 3px; background: var(--strip); white-space: nowrap; }

  .terms { list-style: none; margin: 0; padding: 0; }
  .terms li { display: grid; grid-template-columns: 120px 1fr; column-gap: 16px; align-items: center; min-height: 48px; margin: 0 0 8px; }
  .terms li p { grid-column: 2; margin: 0; }
  .term { margin-right: 4px; }

  table { border-collapse: collapse; width: 100%; }
  th, td { text-align: left; vertical-align: top; padding: 4px 12px 4px 0; border-bottom: 1px solid var(--border); }
  th { font-weight: 600; }
  td.note { color: var(--text-light); }
  td.keys { white-space: nowrap; width: 1%; }
  .refusals li, .not-yet li { margin: 0 0 4px; }
  dl.about { display: grid; grid-template-columns: max-content 1fr; gap: 4px 16px; }
  dt { color: var(--text-light); }
  dd { margin: 0; }

  /* The samples, in the canvas's shapes and colors (visual_grammar.md answers 1 to 9). */
  .sample { display: block; overflow: visible; }
  .sample text { fill: var(--text); }
  .sample text.display { fill: var(--text-light); }
  .sample .port { fill: var(--port); stroke: var(--port); stroke-width: 1; }
  .sample .port.stage1 { fill: var(--bg); }
  .sample .wire { fill: none; stroke: var(--wire); stroke-width: 1; }
  .sample .wire[data-kind="flag"] { stroke-dasharray: 4 3; }
  .sample .wire[data-kind="vector"] { stroke-width: 3; }
  .sample .wire[data-kind="struct"] { stroke-width: 5; }
  .sample .wire-core { stroke: var(--bg); stroke-width: 1.6; }
  .sample .head { fill: var(--wire); }
  .sample .region { fill: none; stroke: var(--wire); stroke-dasharray: 3 3; }
  .sample .pill { fill: var(--bg); }
  .sample .halo { fill: none; stroke: var(--highlight); stroke-width: 5; opacity: 0.5; }
  .sample .casing { fill: none; stroke: var(--highlight); stroke-width: 7; opacity: 0.4; stroke-linejoin: round; }
  .sample .chord { fill: none; stroke: var(--error); stroke-width: 1.5; stroke-dasharray: var(--dash); }
  .sample .cross { fill: none; stroke: var(--error); stroke-width: 1.5; }
  .sample .dimmed { opacity: var(--dim); }
</style>
