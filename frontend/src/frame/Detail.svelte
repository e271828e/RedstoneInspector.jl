<script lang="ts">
  // The detail pane (workspace.md answer 4): one layout per element kind over
  // detail.ts's facts, the open level's when nothing is selected. Links select
  // through the session; nothing here is truncated, the pane scrolls.
  import { detailOf, faceSelection, type FaceFacts, type Facts, type NodeFacts, type Selection } from "../lib/detail";
  import type { Model } from "../lib/model";
  import { inPinId, outPinId, portId } from "../lib/level";
  import type { Face } from "../lib/resolve";

  let { model, level, selection, onselect, onopen }: {
    model: Model;
    level: string;
    selection: Selection | undefined;
    onselect: (s: Selection) => void;
    onopen: (path: string) => void;
  } = $props();

  const facts = $derived<Facts | undefined>(model.tree ? detailOf(model, level, selection) : undefined);
  const dataId = $derived(!facts ? "" : "id" in facts ? facts.id : facts.path);

  let copied = $state<string | undefined>();
  async function copy(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      copied = text;
      setTimeout(() => copied === text && (copied = undefined), 1200);
    } catch {
      // the clipboard refused: nothing to report beyond the button's title
    }
  }
  const pick = (f: Face) => onselect(faceSelection(model.tree!, f));
  const faceText = (f: Face) => (f.path === "" ? `${f.port} (root ${f.side === "in" ? "input" : "output"})` : `${f.path}/${f.port}`);
  const fileLabel = (file: string, line: number) => `${file}:${line}`;
  /** The facts line: class, tier, timing, child count, membership. */
  const nodeLine = (f: NodeFacts) => [
    f.kind, f.tier, f.timing, f.children === undefined ? undefined : `${f.children} children`,
    f.membership && `${f.membership.how ?? "member"} in field ${f.membership.field}, key ${f.membership.key}`,
  ].filter((x) => x !== undefined).join(" · ");
  /** A face row selects its port, or on the level's layout the level's pin. */
  const rowSelection = (f: Face): Selection => facts?.kind === "level"
    ? { level, target: { kind: "block", id: f.side === "in" ? inPinId(f.port) : outPinId(f.port) } }
    : faceSelection(model.tree!, f);
</script>

{#snippet header(segment: string, name: string, path: string)}
  <h2><span class="segment">{segment}</span> <span class="name">{name}</span></h2>
  <div class="path-line">
    <code class="path" title={path || "/"}>{path || "/"}</code>
    <button class="copy" title="Copy the path" onclick={() => copy(path)}>{copied === path ? "Copied" : "Copy"}</button>
  </div>
{/snippet}

{#snippet faceLink(cls: "producer" | "consumer", f: Face)}
  <a
    class={cls} href={"#"} data-path={f.path} data-port={f.port} title={`Select ${faceText(f)}`}
    onclick={(e) => { e.preventDefault(); e.stopPropagation(); pick(f); }}
  >{faceText(f)}</a>
{/snippet}

{#snippet faceRows(faces: FaceFacts[], side: "in" | "out", stage: boolean, links_: boolean)}
  {#each faces as f (f.name)}
    {@const sel = rowSelection(f.face)}
    <!-- svelte-ignore a11y_click_events_have_key_events (the keyboard table is increment 5's) -->
    <tr class={side} data-port={portId(f.face.path, side, f.name)} title={`Select ${f.name}`} onclick={() => onselect(sel)}>
      <td class="side">{side}</td>
      <td class="face-name">{f.name}</td>
      <td class="face-type">{f.type ?? "?"}</td>
      <td class="face-kind">{f.phrase ?? ""}</td>
      <td class="pinned" title={f.pinned ? "pinned" : undefined}>{f.pinned ? "◆" : ""}</td>
      {#if stage}<td class="stage" title={f.stage ? `stage ${f.stage}` : undefined}>{f.stage ?? ""}</td>{/if}
      {#if links_}
        <td class="links">{#if side === "in"}{#if f.producer}{@render faceLink("producer", f.producer)}{/if}{:else}{#each f.consumers ?? [] as c, i (i)}{#if i > 0}<br />{/if}{@render faceLink("consumer", c)}{/each}{/if}</td>
      {/if}
    </tr>
  {/each}
{/snippet}

{#snippet faces(inputs: FaceFacts[], outputs: FaceFacts[], stage: boolean, links_: boolean)}
  {#if inputs.length + outputs.length}
    <table class="faces">
      <thead><tr><th></th><th>face</th><th>type</th><th>kind</th><th></th>{#if stage}<th title="the output's stage">st.</th>{/if}{#if links_}<th>from / to</th>{/if}</tr></thead>
      <tbody>
        {@render faceRows(inputs, "in", stage, links_)}
        {@render faceRows(outputs, "out", stage, links_)}
      </tbody>
    </table>
  {/if}
{/snippet}

{#if !facts}
  <aside class="detail" data-kind="level" data-id="">
    <h2><span class="segment">{model.label}</span> <span class="name">{model.kind}</span></h2>
    <p class="facts">{model.kind} descriptor, no structure</p>
  </aside>
{:else}
  <aside class="detail" data-kind={facts.kind} data-id={dataId}>
    {#if facts.kind === "level"}
      {@render header(facts.label ?? model.tree!.segment.get(facts.path)!, facts.displayName, facts.path)}
      <p class="facts">open level · {facts.children} children · {facts.wires} wires</p>
      {#if facts.scopes.length}
        <h3>Rate scopes</h3>
        <ul class="scopes">{#each facts.scopes as s (s.key)}<li><code>{s.key}</code>: {s.timing}</li>{/each}</ul>
      {/if}
      {@render faces(facts.inputs, facts.outputs, false, false)}
    {:else if "signature" in facts}
      {@render header(facts.segment, facts.displayName, facts.path)}
      <p class="facts">{nodeLine(facts)}</p>
      {#if facts.alias}<p class="alias" title="the alias"><code>{facts.alias}</code></p>{/if}
      <p class="type" title="the qualified type"><code>{facts.type}</code></p>
      <details class="signature"><summary>signature</summary><code>{facts.signature}</code></details>
      {#if facts.kind === "assembly"}<p><button class="open-level" onclick={() => onopen(facts.path)}>Open {facts.segment}</button></p>{/if}
      {#if facts.docstring}<pre class="docstring">{facts.docstring}</pre>{/if}
      {#if facts.locations.length}
        <h3>Locations</h3>
        <ul class="locations">
          {#each facts.locations as l, i (i)}
            <li>
              <button class="location" title="Copy the file label" onclick={() => copy(fileLabel(l.file, l.line))}>
                <code class="function">{l.function}</code> <code class="file">{fileLabel(l.file, l.line)}</code>
              </button>{#if copied === fileLabel(l.file, l.line)} <span class="copied">copied</span>{/if}
            </li>
          {/each}
        </ul>
      {/if}
      {#if facts.parameters.length}
        <h3>Parameters</h3>
        <table class="parameters"><tbody>{#each facts.parameters as p (p.name)}<tr><td><code>{p.name}</code></td><td><code>{p.value}</code></td></tr>{/each}</tbody></table>
      {/if}
      {#if facts.inputs.length + facts.outputs.length}<h3>Faces</h3>{/if}
      {@render faces(facts.inputs, facts.outputs, facts.kind === "leaf", true)}
    {:else if facts.kind === "folder"}
      {@render header(facts.field, "folder", facts.path)}
      <p class="facts">folder of <code>{facts.parent || model.label}</code> · field <code>{facts.field}</code> · {facts.keys.length} keys</p>
      <ul class="keys">
        {#each facts.keys as k (k.path)}
          <li><a href={"#"} data-path={k.path} title={`Select ${k.path}`} onclick={(e) => { e.preventDefault(); onselect({ level: facts.parent, target: { kind: "block", id: k.path } }); }}>{k.key}</a></li>
        {/each}
      </ul>
    {:else if facts.kind === "wire"}
      <h2><span class="segment">wire</span> <span class="name">at {facts.level || "/"}</span></h2>
      <p class="endpoints"><code>{facts.from.path || "/"}{facts.from.path ? "/" : ""}{facts.from.port}</code> → <code>{facts.to.path || "/"}{facts.to.path ? "/" : ""}{facts.to.port}</code></p>
      <p class="facts">level <code>{facts.level || "/"}</code></p>
      <p class="type"><code>{facts.type ?? "?"}</code> <span class="face-kind">{facts.phrase ?? ""}</span></p>
      <h3>Terminal producer</h3>
      <p>{#if facts.producer}{@render faceLink("producer", facts.producer)}{:else}none{/if}</p>
      <h3>Terminal consumers</h3>
      <ul class="consumers">{#each facts.consumers as c, i (i)}<li>{@render faceLink("consumer", c)}</li>{:else}<li>none</li>{/each}</ul>
    {:else}
      {@const pinned = facts.pinned ? " · pinned" : " · not pinned"}
      {@render header(facts.name, facts.kind === "pin" ? `${facts.face.side === "in" ? "input" : "output"} pin of ${facts.level || model.label}` : `${facts.face.side === "in" ? "input" : "output"} of ${facts.face.path || model.label}`, facts.face.path)}
      <p class="facts">{facts.kind}{#if facts.stage} · stage {facts.stage}{/if}{pinned}</p>
      <p class="type"><code>{facts.type ?? "?"}</code> <span class="face-kind">{facts.phrase ?? ""}</span></p>
      {#if facts.rootInput}
        <p class="root-input">root input: <code>{facts.rootInput.name}</code> <code>{facts.rootInput.type}</code>{facts.rootInput.pinned ? " · pinned" : " · not pinned"}</p>
      {/if}
      <h3>Fed by</h3>
      <p>{#if facts.producer}{@render faceLink("producer", facts.producer)}{:else if facts.rootInput}the model's input{:else}itself{/if}</p>
      {#if facts.consumers}
        <h3>Feeds</h3>
        <ul class="consumers">{#each facts.consumers as c, i (i)}<li>{@render faceLink("consumer", c)}</li>{:else}<li>nothing</li>{/each}</ul>
      {/if}
    {/if}
  </aside>
{/if}

<style>
  .detail { padding: 2px 10px 16px; font-size: 13px; overflow-wrap: break-word; }
  h2 { font-size: 15px; margin: 4px 0 2px; font-weight: 400; }
  h2 .segment { font-weight: 600; }
  h2 .name { color: var(--text-light); }
  h3 { font-size: 11px; text-transform: uppercase; letter-spacing: 0.04em; color: var(--text-light); margin: 14px 0 4px; font-weight: 600; }
  .path-line { display: flex; gap: 6px; align-items: center; }
  .path { color: var(--text-light); }
  .copy { font: 11px system-ui, sans-serif; padding: 0 6px; }
  .facts { margin: 8px 0; }
  p { margin: 6px 0; }
  code, pre, .signature { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 12px; }
  .signature summary { font-family: system-ui, sans-serif; cursor: pointer; color: var(--text-light); }
  .signature code { display: block; white-space: pre-wrap; margin-top: 4px; }
  pre.docstring { white-space: pre-wrap; background: var(--strip); padding: 6px 8px; margin: 8px 0; border-radius: 3px; }
  ul { margin: 0; padding-left: 16px; }
  .locations { list-style: none; padding: 0; }
  .locations li { margin: 2px 0; }
  .location { all: unset; display: block; cursor: copy; overflow-wrap: anywhere; }
  .location:hover .file { text-decoration: underline; }
  .locations .file, .copied { color: var(--text-light); }
  table { border-collapse: collapse; width: 100%; }
  td, th { padding: 2px 6px 2px 0; vertical-align: top; text-align: left; }
  th { font-weight: 400; color: var(--text-light); font-size: 11px; }
  .parameters td:first-child { white-space: nowrap; }
  .faces tbody tr { cursor: pointer; }
  .faces tbody tr:hover { background: var(--strip); }
  .faces td:not(.links) { white-space: nowrap; }
  .faces .links { overflow-wrap: anywhere; }
  .faces .side { color: var(--text-light); font-size: 11px; }
  .faces .face-name { font-weight: 600; }
  .faces .face-type { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 12px; }
  .face-kind { color: var(--text-light); }
  a { color: var(--highlight); text-decoration: none; }
  a:hover { text-decoration: underline; }
</style>
