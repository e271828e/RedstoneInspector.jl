<script lang="ts">
  // One line (workspace.md answers 1, 3 and 10; live_session.md answer 4): the
  // kind word, the model's totals, the loader's note, the push's fallback note,
  // the standing route with its clear control (workspace.md answer 8); in the
  // live tab the connection's state and the descriptor's download; the help
  // link at its right end. Under the landing panel it shows the connection
  // and the link. The one-off notice and the focus note join; each text ends in
  // an ellipsis when long, titled whole, the route's clear control kept beside it.
  import type { Model } from "../lib/model";
  import { downloadName } from "../lib/protocol";
  import type { LiveState } from "../state/live.svelte";
  import type { Mode } from "../state/prefs.svelte";

  let { model, mode = "tier", fallback, notice, route, focusNote, connection, received = false, download, onclear }: {
    model?: Model;
    /** The canvas's color mode, shown after the counts. */
    mode?: Mode;
    fallback?: string;
    /** A one-off message, its face in backquotes: a route a push cleared, nothing to trace. */
    notice?: string;
    /** The standing route's status, its face in backquotes: "tracing `h_ref`: 2 consumers across 3 levels". */
    route?: string;
    /** Why the open level does not dim under the standing focus. */
    focusNote?: string;
    /** The live connection's state; nothing shows in the hosted copy or before the handshake resolves. */
    connection?: LiveState;
    /** A descriptor has arrived over the socket. */
    received?: boolean;
    /** The raw descriptor text the model was pushed as, saved by the download button. */
    download?: string;
    /** The route's clear control. */
    onclear?: () => void;
  } = $props();
  /** A line's text with its backquotes dropped: its hover title. */
  const plain = (text: string) => text.replaceAll("`", "");

  const totals = $derived.by(() => {
    const nodes = model?.structure?.nodes;
    if (!nodes) return undefined;
    let primitives = 0, assemblies = 0, wires = 0;
    for (const n of nodes) {
      if (n.class === "primitive") primitives++;
      else {
        assemblies++;
        wires += n.wires.length;
      }
    }
    return { primitives, assemblies, wires };
  });
  const count = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

  /** Saves the text as `<label>.json` through a Blob URL. */
  function save(text: string, label: string) {
    const url = URL.createObjectURL(new Blob([text], { type: "application/json" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = downloadName(label);
    a.click();
    // revoked late: some browsers read the URL after the click returns
    setTimeout(() => URL.revokeObjectURL(url), 40_000);
  }
</script>

{#snippet coded(text: string)}{#each text.split("`") as part, i (i)}{#if i % 2}<code>{part}</code>{:else}{part}{/if}{/each}{/snippet}

<footer class="status" data-kind={model?.kind}>
  {#if model}
    <span class="kind">{model.kind}</span>
    {@const counts = totals ? `${count(totals.primitives, "primitive", "primitives")}, ${count(totals.assemblies, "assembly", "assemblies")}, ${count(totals.wires, "wire", "wires")}` : "no structure"}
    <span class="counts line" title={totals ? `${counts}, over the whole model` : counts}>{counts}</span>
    <span class="mode" data-mode={mode}>{mode} colors</span>
    {#if model.note}<span class="note line" title={model.note}>{model.note}</span>{/if}
    {#if fallback}<span class="fallback line" title={plain(fallback)}>{@render coded(fallback)}</span>{/if}
    {#if notice}<span class="notice line" title={plain(notice)}>{@render coded(notice)}</span>{/if}
    {#if route}
      <span class="route"><span class="line" title={plain(route)}>{@render coded(route)}</span><button class="clear-route" title="Clear the route" onclick={() => onclear?.()}>clear</button></span>
    {/if}
    {#if focusNote}<span class="focus-note line" title={focusNote}>{focusNote}</span>{/if}
  {/if}
  {#if connection === "connected" || connection === "lost"}
    <span class="connection" data-state={connection}>
      {#if connection === "lost"}disconnected, retrying{:else if received}connected{:else}connected, waiting for <code>inspect</code>{/if}
    </span>
  {/if}
  {#if model && download !== undefined}
    {@const text = download}
    <button class="download" title={`Save the descriptor as ${downloadName(model.label)}`} onclick={() => save(text, model.label)}>Download</button>
  {/if}
  <a class="help" href="#help" title="The help page">?</a>
</footer>

<style>
  .status {
    flex: none; display: flex; gap: 14px; align-items: center; height: 22px; padding: 0 8px;
    border-top: 1px solid var(--border); background: var(--strip); font-size: 12px; white-space: nowrap; overflow: hidden;
  }
  .kind { font-weight: 600; }
  .counts, .note, .mode { color: var(--text-light); }
  .fallback { font-weight: 600; }
  .connection { margin-left: auto; color: var(--text-light); }
  .help { margin-left: auto; color: var(--text-light); text-decoration: none; font-weight: 600; }
  .connection ~ .help { margin-left: 0; }
  .connection[data-state="lost"] { font-weight: 600; }
  .download, .clear-route { font: 11px system-ui, sans-serif; padding: 0 6px; }
  /* The route's line and clear control are the bar's own items, so the line and the other text spans shrink to an
     ellipsis while the control keeps its width. */
  .route { display: contents; color: var(--highlight); }
  .line { min-width: 0; overflow: hidden; text-overflow: ellipsis; }
  .clear-route { flex: none; margin-left: -10px; }
  .notice, .focus-note { color: var(--text-light); }
  .line code { font-size: 11px; }
</style>
