<script lang="ts">
  // The root inputs tab (workspace.md answer 6): name, type, kind phrase, the pinned mark and terminal consumers one to
  // a line, those that pin it marked with the cause (deployment_overlay.md answer 14), a row's click selecting the root
  // tag (reading 11). The mark is this tab's alone. The whole row takes the click; its button is there for the keyboard
  // (look pass 1.1 and 1.2). Stage 2's claim column and stage 3's widgets join here.
  import { pinCause, rootInputRows, rowTarget, type PinCause, type RootInputRow } from "../../lib/analysis";
  import type { Selection } from "../../lib/detail";
  import type { Model } from "../../lib/model";
  import type { Face } from "../../lib/resolve";
  import { rowClick } from "./rowClick";

  let { model, onrow }: { model: Model; onrow: (s: Selection) => void } = $props();

  const rows = $derived(rootInputRows(model));
  /** A consumer as `path/port`, a root output `/port`. */
  const consumerText = (f: Face) => `${f.path}/${f.port}`;
  const causeText = (c: PinCause) => `pinned by ${c}`;
  /** The mark's title: every cause among the pinning consumers, a primitive root's own input included. */
  const pinTitle = (r: RootInputRow) => `pinned: ${[...new Set(r.pins.map((p) => p.cause))].map((c) => `by ${c}`).join(" and ")}`;
</script>

{#if rows.length}
  <table class="root-inputs">
    <thead>
      <tr><th>name</th><th>type</th><th>kind</th><th>pinned</th><th>terminal consumers</th></tr>
    </thead>
    <tbody>
      {#each rows as r (r.name)}
        {@const s = rowTarget(model, r)}
        <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_noninteractive_element_interactions -->
        <tr class="root-input" data-name={r.name} onclick={s && rowClick(() => onrow(s))}>
          <td class="name"><button class="row" title="Select the root input"><code>{r.name}</code></button></td>
          <td class="type"><code>{r.type}</code></td>
          <td class="kind">{r.phrase}</td>
          <td class="pinned" title={r.pinned ? pinTitle(r) : undefined}>{r.pinned ? "◆" : ""}</td>
          <td class="consumers">
            {#each r.consumers as c, i (i)}
              {@const cause = pinCause(r, c)}
              <span class="consumer" data-cause={cause}><code>{consumerText(c)}</code>{#if cause}<span class="cause">{causeText(cause)}</span>{/if}</span>
            {:else}none{/each}
          </td>
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
  .consumer { display: block; white-space: nowrap; }
  .cause { margin-left: 8px; color: var(--text-light); }
  tr.root-input { cursor: pointer; }
  .row { padding: 0; border: 0; background: none; font: inherit; color: inherit; cursor: pointer; text-align: left; }
  tr:hover .row code { text-decoration: underline; }
  .empty { margin: 0; color: var(--text-light); }
</style>
