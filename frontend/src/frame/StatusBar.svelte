<script lang="ts">
  // One line (workspace.md answers 1, 3 and 10): the kind word, the model's
  // totals, the loader's note, the push's fallback note.
  import type { Model } from "../lib/model";

  let { model, fallback }: { model: Model; fallback?: string } = $props();

  const totals = $derived.by(() => {
    const nodes = model.structure?.nodes;
    if (!nodes) return undefined;
    let leaves = 0, assemblies = 0, wires = 0;
    for (const n of nodes) {
      if (n.class === "leaf") leaves++;
      else {
        assemblies++;
        wires += n.wires.length;
      }
    }
    return { leaves, assemblies, wires };
  });
  const count = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;
</script>

<footer class="status" data-kind={model.kind}>
  <span class="kind">{model.kind}</span>
  <span class="counts" title="over the whole model">
    {#if totals}
      {count(totals.leaves, "leaf", "leaves")}, {count(totals.assemblies, "assembly", "assemblies")}, {count(totals.wires, "wire", "wires")}
    {:else}
      no structure
    {/if}
  </span>
  {#if model.note}<span class="note">{model.note}</span>{/if}
  {#if fallback}<span class="fallback">{fallback}</span>{/if}
</footer>

<style>
  .status {
    flex: none; display: flex; gap: 14px; align-items: center; height: 22px; padding: 0 8px;
    border-top: 1px solid var(--border); background: var(--strip); font-size: 12px; white-space: nowrap; overflow: hidden;
  }
  .kind { font-weight: 600; }
  .counts, .note { color: var(--text-light); }
  .fallback { font-weight: 600; }
</style>
