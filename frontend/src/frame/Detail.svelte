<script lang="ts">
  // The detail pane (workspace.md answer 4): one layout per element kind over
  // detail.ts's facts, the open level's when nothing is selected. Links select
  // through the session; nothing here is truncated, the pane scrolls.
  import {
    classPhrase, count, detailOf, FACT_TITLES, faceSelection, levelLine, memberKind, memberTitle, type FaceFacts, type Facts, type Selection,
  } from "../lib/detail";
  import type { Model } from "../lib/model";
  import { inPinId, outPinId, portId } from "../lib/level";
  import type { Face } from "../lib/resolve";

  let { model, level, selection, focused = false, editor = false, onselect, onopen, onlocation }: {
    model: Model;
    level: string;
    selection: Selection | undefined;
    /** The keyboard's focus is in the detail region. */
    focused?: boolean;
    /** A location click opens the editor; otherwise it copies the file label. */
    editor?: boolean;
    onselect: (s: Selection) => void;
    onopen: (path: string) => void;
    /** A location clicked: true when the shell sent it to the editor, false to copy it here. */
    onlocation: (file: string, line: number) => boolean;
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
  /** A face row selects its port, or on the level's layout the level's pin. */
  const rowSelection = (f: Face): Selection => facts?.kind === "level"
    ? { level, target: { kind: "block", id: f.side === "in" ? inPinId(f.port) : outPinId(f.port) } }
    : faceSelection(model.tree!, f);
</script>

{#snippet header(segment: string, name: string, path: string, opens = false)}
  <h2><span class="segment">{segment}</span> <span class="name">{name}</span></h2>
  <div class="path-line">
    <code class="path" title={path || "/"}>{path || "/"}</code>
    <button class="copy" title="Copy the path" onclick={() => copy(path)}>{copied === path ? "Copied" : "Copy"}</button>
    {#if opens}<button class="open-level" title={`Open ${segment} as the level`} onclick={() => onopen(path)}>Open</button>{/if}
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
  <!-- svelte-ignore a11y_no_noninteractive_tabindex (a region root, one of Tab's four stops by answer 11) -->
  <aside class="detail" class:focused data-kind="level" data-id="" tabindex="0">
    <h2><span class="segment">{model.label}</span> <span class="name">{model.kind}</span></h2>
    <p class="facts">{model.kind} descriptor, no structure</p>
  </aside>
{:else}
  <!-- svelte-ignore a11y_no_noninteractive_tabindex (a region root, one of Tab's four stops by answer 11) -->
  <aside class="detail" class:focused data-kind={facts.kind} data-id={dataId} tabindex="0">
    {#if facts.kind === "level"}
      {@render header(facts.label ?? model.tree!.segment.get(facts.path)!, facts.displayName, facts.path)}
      <p class="facts">{levelLine(facts)}</p>
      {#if facts.scopes.length}
        <h3>Rate scopes</h3>
        <ul class="scopes">{#each facts.scopes as s (s.key)}<li><code>{s.key}</code>: {s.timing}</li>{/each}</ul>
      {/if}
      {@render faces(facts.inputs, facts.outputs, false, false)}
    {:else if "signature" in facts}
      {@render header(facts.segment, facts.displayName, facts.path, facts.kind === "assembly")}
      <dl class="facts">
        <dt title={FACT_TITLES.type}>type</dt>
        <dd data-fact="type">
          <code class="type">{facts.type}</code>{#if facts.alias}<span class="aside">alias</span><code class="alias">{facts.alias}</code>{/if}
        </dd>
        <dt title={FACT_TITLES.class}>class</dt>
        <dd data-fact="class">{classPhrase(facts.kind, facts.tier)}</dd>
        {#if facts.rate}
          <dt title={FACT_TITLES.rate}>rate</dt>
          <dd data-fact="rate" title={facts.rate.title}>{facts.rate.phrase}</dd>
        {/if}
        {#if facts.children !== undefined}
          <dt title={FACT_TITLES.children}>children</dt>
          <dd data-fact="children">{facts.children}</dd>
        {/if}
        {#if facts.membership}
          <dt title={FACT_TITLES.member}>member</dt>
          <dd data-fact="member" title={memberTitle(facts.membership)}>
            {memberKind(facts.membership.how)} <code>{facts.membership.field}</code>, key <code>{facts.membership.key}</code>
          </dd>
        {/if}
      </dl>
      {#if facts.signature !== facts.type}{#key facts.path}<details class="signature"><summary>signature</summary><code>{facts.signature}</code></details>{/key}{/if}
      {#if facts.docstring}
        {#key facts.path}
          <details class="docstring">
            <summary><span class="title">docstring</span></summary>
            <pre class="docstring">{facts.docstring}</pre>
          </details>
        {/key}
      {/if}
      {#if facts.locations.length}
        <h3>Locations</h3>
        <ul class="locations">
          {#each facts.locations as l, i (i)}
            <li>
              <button
                class="location" class:editor title={editor ? "Open in the editor" : "Copy the file label"}
                onclick={() => onlocation(l.file, l.line) || copy(fileLabel(l.file, l.line))}
              >
                <code class="function">{l.function}</code> <code class="file">{fileLabel(l.file, l.line)}</code>
              </button>{#if copied === fileLabel(l.file, l.line)} <span class="copied">copied</span>{/if}
            </li>
          {/each}
        </ul>
      {/if}
      {#if facts.parameters.length}
        <h3>Parameters</h3>
        <table class="parameters"><tbody>{#each facts.parameters as p (p.name)}<tr><td class="param-name"><code>{p.name}</code></td><td class="param-value"><code>{p.value}</code></td></tr>{/each}</tbody></table>
      {/if}
      {#if facts.inputs.length + facts.outputs.length}<h3>Faces</h3>{/if}
      {@render faces(facts.inputs, facts.outputs, facts.kind === "leaf", true)}
    {:else if facts.kind === "folder"}
      {@render header(facts.field, "folder", facts.path)}
      <p class="facts">folder of <code>{facts.parent || model.label}</code> · field <code>{facts.field}</code> · {count(facts.keys.length, "key", "keys")}</p>
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
      {@render header(facts.name, facts.kind === "pin" ? `${facts.face.side === "in" ? "input" : "output"} pin of ${facts.level || model.label}` : `${facts.face.side === "in" ? "input" : "output"} of ${facts.face.path || model.label}`, facts.face.path)}
      <p class="facts">{[facts.kind, facts.stage && `stage ${facts.stage}`, facts.pinned ? "pinned" : "not pinned"].filter(Boolean).join(" · ")}</p>
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
  .detail { padding: 2px 10px 16px; font-size: 13px; overflow-wrap: break-word; container-type: inline-size; }
  h2 { font-size: 15px; margin: 4px 0 2px; font-weight: 400; }
  h2 .segment { font-weight: 600; }
  h2 .name { color: var(--text-light); }
  h3 { font-size: 11px; text-transform: uppercase; letter-spacing: 0.04em; color: var(--text-light); margin: 14px 0 4px; font-weight: 600; }
  .path-line { display: flex; gap: 6px; align-items: center; }
  .path { color: var(--text-light); }
  .copy { font: 11px system-ui, sans-serif; padding: 0 6px; }
  .facts { margin: 8px 0; }
  dl.facts { display: grid; grid-template-columns: max-content minmax(0, 1fr); gap: 3px 10px; }
  dl.facts dt { color: var(--text-light); font-size: 11px; line-height: 17px; cursor: help; }
  dl.facts dd { margin: 0; overflow-wrap: break-word; }
  dl.facts dd[title] { cursor: help; }
  dl.facts .aside { color: var(--text-light); font-size: 11px; margin: 0 4px 0 8px; }
  .open-level { font: 11px system-ui, sans-serif; padding: 0 6px; }
  p { margin: 6px 0; }
  code, pre, .signature { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 12px; }
  .signature summary, details.docstring summary { font-family: system-ui, sans-serif; cursor: pointer; color: var(--text-light); }
  .signature code { display: block; white-space: pre-wrap; margin-top: 4px; }
  details.docstring { margin: 8px 0; }
  pre.docstring { white-space: pre-wrap; background: var(--strip); padding: 6px 8px; margin: 8px 0; border-radius: 3px; }
  ul { margin: 0; padding-left: 16px; }
  .locations { list-style: none; padding: 0; }
  .locations li { margin: 2px 0; }
  .location { all: unset; display: block; cursor: copy; overflow-wrap: anywhere; }
  .location.editor { cursor: pointer; }
  .location:hover .file { text-decoration: underline; }
  .locations .file, .copied { color: var(--text-light); }
  table { border-collapse: collapse; width: 100%; }
  td, th { padding: 2px 6px 2px 0; vertical-align: top; text-align: left; }
  th { font-weight: 400; color: var(--text-light); font-size: 11px; }
  .parameters td { overflow-wrap: anywhere; }
  .faces tbody tr { cursor: pointer; }
  .faces tbody tr:hover { background: var(--strip); }
  .faces .side, .faces .pinned, .faces .stage { white-space: nowrap; }
  .faces .face-name, .faces .face-kind { overflow-wrap: anywhere; }
  .faces .links { overflow-wrap: anywhere; }
  .faces .side { color: var(--text-light); font-size: 11px; }
  .faces .face-name { font-weight: 600; }
  .faces .face-type { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 12px; overflow-wrap: anywhere; min-width: 8ch; }
  .face-kind { color: var(--text-light); }
  /* A narrow pane (workspace.md answer 4 as amended): each parameter's summary under its name, each face a small block. */
  @container (max-width: 420px) {
    .parameters, .parameters tbody, .parameters tr, .parameters td { display: block; }
    .parameters tr { padding: 2px 0; }
    .parameters td { padding: 0; }
    .faces, .faces tbody { display: block; }
    .faces thead { display: none; }
    .faces tbody tr {
      display: grid; grid-template-columns: max-content max-content minmax(0, 1fr); column-gap: 6px; padding: 3px 0;
      grid-template-areas: "side name kind" "type type type" "pinned stage links"; border-top: 1px solid var(--strip);
    }
    .faces td { padding: 0; }
    .faces .side { grid-area: side; }
    .faces .face-name { grid-area: name; }
    .faces .face-kind { grid-area: kind; }
    .faces .face-type { grid-area: type; min-width: 0; }
    .faces .pinned { grid-area: pinned; }
    .faces .stage { grid-area: stage; }
    .faces .stage[title]::before { content: "stage "; color: var(--text-light); }
    .faces .links { grid-area: links; }
  }
  a { color: var(--highlight); text-decoration: none; }
  a:hover { text-decoration: underline; }
</style>
