<script lang="ts">
  // The text shell: a file picked or dropped anywhere on the page, the loader's
  // outcome as text. Increment 3 replaces the body with the canvas.
  import { fromFile, structureOf } from "./lib/loader";

  let outcome = $state("No file open.");
  let dragging = $state(false);

  async function open(file: File | undefined) {
    if (!file) return;
    const r = await fromFile(file);
    if (!r.ok) {
      outcome = r.reason;
      return;
    }
    const nodes = structureOf(r.descriptor)?.nodes.length;
    outcome = [
      `label: ${r.label}`,
      `kind: ${r.descriptor.kind}`,
      `nodes: ${nodes ?? "none, no structure"}`,
      ...(r.note ? [`note: ${r.note}`] : []),
    ].join("\n");
  }
  function pick(e: Event) {
    open((e.currentTarget as HTMLInputElement).files?.[0]);
  }
  function drop(e: DragEvent) {
    e.preventDefault();
    dragging = false;
    open(e.dataTransfer?.files[0]);
  }
</script>

<svelte:window
  ondragover={(e) => { e.preventDefault(); dragging = true; }}
  ondragleave={() => (dragging = false)}
  ondrop={drop}
/>

<main class:dragging>
  <h1>Redstone inspector</h1>
  <p><input type="file" accept=".json,application/json" onchange={pick} /> or drop a descriptor anywhere on the page.</p>
  <pre>{outcome}</pre>
</main>

<style>
  main { font-family: system-ui, sans-serif; padding: 1rem; min-height: 90vh; }
  main.dragging { outline: 2px dashed gray; }
  pre { white-space: pre-wrap; }
</style>
