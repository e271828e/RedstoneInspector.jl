<script lang="ts">
  // The drawer (workspace.md answer 6): four tabs with their counts, open on load
  // only when a diagnostic exists; the bodies are placeholders until increments 7 and 8.
  import type { Model } from "../lib/model";
  import { diagnosticCount, type Tab } from "../state/session.svelte";

  let { model, open, tab, ontab }: { model: Model; open: boolean; tab: Tab; ontab: (tab: Tab) => void } = $props();

  const TABS: { tab: Tab; label: string; body: string }[] = [
    { tab: "diagnostics", label: "Diagnostics", body: "The diagnostics and warnings, one row each, linked to the element they name, land with increment 7." },
    { tab: "root-inputs", label: "Root inputs", body: "The root inputs, with their types and terminal consumers, land with increment 8." },
    { tab: "timing", label: "Timing", body: "The anchors, the rate scopes and every discrete leaf's timing land with increment 8." },
    { tab: "order", label: "Execution order", body: "The execution order, numbered, with each leaf's stage 1 and stage 2 ports, lands with increment 8." },
  ];
  const counts = $derived<Partial<Record<Tab, number>>>({
    diagnostics: diagnosticCount(model),
    "root-inputs": model.structure?.root_inputs.length,
    order: model.outputs?.order.length,
  });
</script>

<section class="drawer" data-open={open ? "true" : "false"} data-tab={tab}>
  <div class="strip" role="tablist">
    {#each TABS as t (t.tab)}
      <button
        class="tab" class:current={open && t.tab === tab} data-tab={t.tab} role="tab" aria-selected={open && t.tab === tab}
        title={open && t.tab === tab ? "Close the drawer" : `Open ${t.label.toLowerCase()}`} onclick={() => ontab(t.tab)}
      >{t.label}{#if counts[t.tab] !== undefined} <span class="count">{counts[t.tab]}</span>{/if}</button>
    {/each}
  </div>
  {#if open}
    <div class="tab-body" role="tabpanel">{TABS.find((t) => t.tab === tab)!.body}</div>
  {/if}
</section>

<style>
  .drawer { display: flex; flex-direction: column; min-height: 0; height: 100%; }
  .strip { flex: none; display: flex; gap: 2px; padding: 0 6px; background: var(--strip); border-bottom: 1px solid var(--border); }
  .tab {
    font: 12px system-ui, sans-serif; color: var(--text); background: none; border: 0; border-bottom: 2px solid transparent;
    padding: 4px 8px; cursor: pointer;
  }
  .tab.current { border-bottom-color: var(--highlight); font-weight: 600; }
  .count { color: var(--text-light); font-weight: 400; margin-left: 2px; }
  .tab-body { flex: 1; min-height: 0; overflow: auto; padding: 8px 10px; color: var(--text-light); font-size: 13px; }
</style>
