<script lang="ts">
  // The events tab (workspace.md answer 6, increment 10b's rulings 6 to 9): a deployment's head of the event parameters
  // under their conditions, then a row per event, grouped by the primitive declaring it in walk order, the path on a
  // group's first row alone and the priority number restarting at each. A group is one stop: its one button, on the
  // first row, takes the keyboard, and the ring wraps the group's `tbody` (the notes' C8). A click on any of its rows
  // selects the primitive, as a timing component row's does.
  import { rowTarget } from "../../lib/analysis";
  import type { Selection } from "../../lib/detail";
  import { eventGroups, eventHead, LOCALIZED_TITLE, localizedWord } from "../../lib/events";
  import type { Model } from "../../lib/model";
  import HeadList from "./HeadList.svelte";
  import { rowClick } from "./rowClick";

  let { model, onrow }: { model: Model; onrow: (s: Selection) => void } = $props();

  const groups = $derived(eventGroups(model));
  const head = $derived(eventHead(model));
</script>

{#if !groups}
  <p class="empty">No events: the build did not reach them.</p>
{:else}
  {#if head?.length}<HeadList lines={[head]} />{/if}
  {#if groups.length}
    <table class="events">
      <thead><tr><th>path</th><th title="The priority within the component: the first eligible event fires">#</th><th>event</th><th title={LOCALIZED_TITLE}>localized</th></tr></thead>
      {#each groups as g (g.path)}
        {@const s = rowTarget(model, { kind: "component", path: g.path })}
        <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_noninteractive_element_interactions -->
        <tbody class="group" data-path={g.path} onclick={s && rowClick(() => onrow(s))}>
          {#each g.events as e (e.position)}
            <tr class="event" data-position={e.position} data-name={e.name}>
              <td class="path">{#if e.position === 1}<button class="row" title="Select the primitive"><code>{g.path || "/"}</code></button>{/if}</td>
              <td class="position">{e.position}</td>
              <td class="name"><code>{e.name}</code></td>
              <td class="localized">{localizedWord(e.localized)}</td>
            </tr>
          {/each}
        </tbody>
      {/each}
    </table>
  {:else}
    <p class="empty">No state events.</p>
  {/if}
{/if}

<style>
  table { border-collapse: collapse; color: var(--text); font-size: 12px; }
  :global(dl.head) + table { margin-top: 8px; }
  th { text-align: left; font-weight: 600; color: var(--text-light); padding: 2px 12px 4px 0; white-space: nowrap; }
  td { padding: 2px 12px 2px 0; vertical-align: baseline; white-space: nowrap; }
  code { font: 12px ui-monospace, monospace; }
  .position { color: var(--text-light); font-variant-numeric: tabular-nums; text-align: right; }
  tbody.group { cursor: pointer; }
  tbody.group + tbody.group { border-top: 1px solid var(--strip); }
  tbody.group:hover { background: var(--strip); }
  tbody.group:hover .row code { text-decoration: underline; }
  .row { padding: 0; border: 0; background: none; font: inherit; color: inherit; cursor: pointer; text-align: left; }
  /* The stop is the group's button; its ring is drawn around the whole group instead (workspace.md answer 11). */
  table.events tbody.group button.row:focus { outline: none; }
  tbody.group:has(button.row:focus) { outline: 2px solid var(--highlight); outline-offset: 1px; }
  .empty { margin: 0; color: var(--text-light); }
</style>
