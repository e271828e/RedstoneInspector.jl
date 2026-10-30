<script lang="ts">
  // The shell: a file picked or dropped anywhere on the page, the landing panel
  // before a model, the frame over the session once one loads; the window's
  // title and the four keys outside text fields.
  import Canvas, { type Target } from "./canvas/Canvas.svelte";
  import { palette } from "./canvas/palette";
  import Breadcrumb from "./frame/Breadcrumb.svelte";
  import Frame from "./frame/Frame.svelte";
  import Landing from "./frame/Landing.svelte";
  import StatusBar from "./frame/StatusBar.svelte";
  import Tree from "./frame/Tree.svelte";
  import { fromFile } from "./lib/loader";
  import { loadModel } from "./lib/model";
  import { climb, load, open, select, session, toggleExpanded } from "./state/session.svelte";

  let refusal = $state<string | undefined>();
  let dragging = $state(false);

  const model = $derived(session.model);
  /** The selection the canvas draws: one made on the open level, a folder excepted. */
  const drawn = $derived.by((): Target | undefined => {
    const s = session.selection;
    return s && s.level === session.level && s.target.kind !== "folder" ? (s.target as Target) : undefined;
  });

  $effect(() => {
    document.title = model ? `${model.label} – Redstone inspector` : "Redstone inspector";
  });

  async function openFile(file: File | undefined) {
    if (!file) return;
    const r = await fromFile(file);
    if (!r.ok) {
      load(undefined);
      refusal = r.reason;
      return;
    }
    refusal = undefined;
    load(loadModel(r));
  }

  const typing = (t: EventTarget | null) =>
    t instanceof HTMLInputElement || t instanceof HTMLTextAreaElement || t instanceof HTMLSelectElement
    || (t instanceof HTMLElement && t.isContentEditable);
  function onkeydown(e: KeyboardEvent) {
    const tree = session.model?.tree;
    if (!tree || typing(e.target)) return;
    const s = session.selection;
    if (e.key === "Backspace" || (e.key === "ArrowUp" && e.altKey)) {
      e.preventDefault();
      climb();
    } else if (e.key === "Enter" && s?.target.kind === "block" && tree.byPath.get(s.target.id)?.class === "assembly") {
      e.preventDefault();
      open(s.target.id);
    } else if (e.key === "Escape") {
      select(undefined);
    }
  }
  function drop(e: DragEvent) {
    e.preventDefault();
    dragging = false;
    openFile(e.dataTransfer?.files[0]);
  }
</script>

<svelte:window
  ondragover={(e) => { e.preventDefault(); dragging = true; }}
  ondragleave={() => (dragging = false)}
  ondrop={drop}
  {onkeydown}
/>

<main class:dragging style="--text:{palette.text};--text-light:{palette.textLight};--bg:{palette.background}">
  {#if model}
    <Frame drawerOpen={session.drawer.open}>
      {#snippet tree()}
        <Tree
          {model} level={session.level} selection={session.selection} expanded={session.expanded}
          onselect={select} onopen={open} ontoggle={toggleExpanded}
        />
      {/snippet}
      {#snippet breadcrumb()}
        <Breadcrumb {model} level={session.level} onopen={open} onfile={openFile} />
      {/snippet}
      {#snippet canvas()}
        {#if model.tree}
          {#key model}
            <Canvas
              {model} path={session.level} selected={drawn} onopen={open}
              onselect={(t) => select(t && { level: session.level, target: t })}
            />
          {/key}
        {:else}
          <pre class="outcome">{`${model.label}\nno structure to draw`}</pre>
        {/if}
      {/snippet}
      {#snippet detail()}
        <aside class="detail" data-kind="placeholder"><p>The selection's detail lands with the next commit.</p></aside>
      {/snippet}
      {#snippet status()}
        <StatusBar {model} />
      {/snippet}
    </Frame>
  {:else}
    <Landing outcome={refusal} onfile={openFile} />
  {/if}
</main>

<style>
  :global(html, body) { margin: 0; height: 100%; }
  main { font-family: system-ui, sans-serif; height: 100vh; box-sizing: border-box; color: var(--text); background: var(--bg); }
  main.dragging { outline: 2px dashed gray; outline-offset: -2px; }
  pre.outcome { white-space: pre-wrap; margin: 1rem; }
</style>
