<script lang="ts">
  // One line (workspace.md answers 1, 3 and 10; live_session.md answer 4): the
  // kind word, the model's totals, the loader's note, the push's fallback note;
  // in the live tab the connection's state and the descriptor's download. Under
  // the landing panel it shows the connection alone.
  import type { Model } from "../lib/model";
  import { downloadName } from "../lib/protocol";
  import type { LiveState } from "../state/live.svelte";

  let { model, fallback, connection, received = false, download }: {
    model?: Model;
    fallback?: string;
    /** The live connection's state; nothing shows in the hosted copy or before the handshake resolves. */
    connection?: LiveState;
    /** A descriptor has arrived over the socket. */
    received?: boolean;
    /** The raw descriptor text the model was pushed as, saved by the download button. */
    download?: string;
  } = $props();

  const totals = $derived.by(() => {
    const nodes = model?.structure?.nodes;
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

<footer class="status" data-kind={model?.kind}>
  {#if model}
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
</footer>

<style>
  .status {
    flex: none; display: flex; gap: 14px; align-items: center; height: 22px; padding: 0 8px;
    border-top: 1px solid var(--border); background: var(--strip); font-size: 12px; white-space: nowrap; overflow: hidden;
  }
  .kind { font-weight: 600; }
  .counts, .note { color: var(--text-light); }
  .fallback { font-weight: 600; }
  .connection { margin-left: auto; color: var(--text-light); }
  .connection[data-state="lost"] { font-weight: 600; }
  .download { font: 11px system-ui, sans-serif; padding: 0 6px; }
</style>
