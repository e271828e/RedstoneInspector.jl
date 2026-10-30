<script lang="ts">
  // The shell: a file picked or dropped anywhere on the page; once a model with
  // a structure loads, its label and open level above the canvas. Increment 4
  // replaces the text lines with the frame.
  import Canvas, { type Target } from "./canvas/Canvas.svelte";
  import { fromFile } from "./lib/loader";
  import { loadModel, type Model } from "./lib/model";

  let outcome = $state("No file open.");
  let model = $state.raw<Model | undefined>();
  let path = $state("");
  let dragging = $state(false);
  let selected: Target | undefined;

  async function open(file: File | undefined) {
    if (!file) return;
    const r = await fromFile(file);
    if (!r.ok) {
      model = undefined;
      outcome = r.reason;
      return;
    }
    const m = loadModel(r);
    path = "";
    model = m;
    outcome = m.tree ? "" : `${m.label}\nno structure to draw`;
  }
  function pick(e: Event) {
    open((e.currentTarget as HTMLInputElement).files?.[0]);
  }
  function onkeydown(e: KeyboardEvent) {
    const tree = model?.tree;
    if (!tree || e.target instanceof HTMLInputElement) return;
    if (e.key === "Backspace" && path !== "") {
      e.preventDefault();
      path = tree.parent.get(path) ?? "";
    } else if (e.key === "Enter" && selected?.kind === "block" && tree.byPath.get(selected.id)?.class === "assembly") {
      e.preventDefault();
      path = selected.id;
    }
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
  {onkeydown}
/>

<main class:dragging>
  <header>
    <h1>Redstone inspector</h1>
    <p><input type="file" accept=".json,application/json" onchange={pick} /> or drop a descriptor anywhere on the page.</p>
    {#if model?.tree}
      <p class="level" data-level-path={path}><strong>{model.label}</strong> <span>{path || "/"}</span></p>
      {#if model.note}<p class="note">{model.note}</p>{/if}
    {:else}
      <pre class="outcome">{outcome}</pre>
    {/if}
  </header>
  {#if model?.tree}
    {#key model}
      <div class="stage"><Canvas {model} {path} onopen={(p) => (path = p)} onselect={(t) => (selected = t)} /></div>
    {/key}
  {/if}
</main>

<style>
  :global(html, body) { margin: 0; height: 100%; }
  main { font-family: system-ui, sans-serif; display: flex; flex-direction: column; height: 100vh; box-sizing: border-box; }
  main.dragging { outline: 2px dashed gray; outline-offset: -2px; }
  header { padding: 0.5rem 1rem; }
  h1 { font-size: 1.1rem; margin: 0 0 0.25rem; }
  header p { margin: 0.25rem 0; }
  pre { white-space: pre-wrap; margin: 0.25rem 0; }
  .stage { flex: 1; min-height: 0; border-top: 1px solid #ccc; }
</style>
