<script lang="ts">
  // The detail pane (workspace.md answer 4): one layout per element kind over
  // detail.ts's facts, the open level's when nothing is selected. Links select
  // through the session; nothing here is truncated, the pane scrolls. A node's
  // pane has seven collapsible sections, their state the session's. A pin, a port
  // and a wire carry the trace button.
  import {
    classPhrase, count, detailOf, FACT_TITLES, faceSelection, memberKind, memberTitle, signatureAdds, TIMING_TITLE, type FaceFacts, type Facts, type LevelFacts, type NodeFacts,
    type Section, type Selection,
  } from "../lib/detail";
  import { renderDocstring } from "../lib/docstring";
  import { LOCALIZED_TITLE, localizedWord } from "../lib/events";
  import type { Model } from "../lib/model";
  import type { Snippet } from "svelte";
  import { inPinId, outPinId, portId } from "../lib/level";
  import type { Face } from "../lib/resolve";
  import { FRAME_TITLES, type FramesTable } from "../lib/timing";

  let { model, level, selection, focused = false, editor = false, origin, tracing = false, sections, onselect, onopen, onlocation, ontrace, onsection }: {
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
    /** The face the selection traces, when it has a route: the trace button shows. */
    origin?: Face;
    /** The origin's route stands: the button clears it. */
    tracing?: boolean;
    ontrace?: (face: Face) => void;
    /** The open sections, one state for every node. */
    sections: ReadonlySet<Section>;
    onsection: (section: Section, open: boolean) => void;
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
  /** A file's directories, each with its slash, and its name: a label breaks after a slash, never inside the name. */
  const fileParts = (file: string) => {
    const i = file.lastIndexOf("/") + 1;
    return { dirs: file.slice(0, i).split(/(?<=\/)/).filter(Boolean), name: file.slice(i) };
  };
  /** A face row selects its port, or on the level's layout the level's pin. */
  const rowSelection = (f: Face): Selection => facts?.kind === "level"
    ? { level, target: { kind: "block", id: f.side === "in" ? inPinId(f.port) : outPinId(f.port) } }
    : faceSelection(model.tree!, f);
</script>

{#snippet header(segment: string, name: string, path: string, opens = false, traces = false, mark = false)}
  <h2><span class="segment">{segment}</span> <span class="name">{name}</span></h2>
  <div class="path-line">
    <code class="path" title={path || "/"}>{@render slashed(path || "/")}</code>
    <button class="copy" title="Copy the path" onclick={() => copy(path)}>{copied === path ? "Copied" : "Copy"}</button>
    {#if opens}<button class="open-level" title={`Open ${segment} as the level`} onclick={() => onopen(path)}>Open</button>{/if}
    {#if mark}<span class="level-mark">open level</span>{/if}
    {#if traces}{@render traceButton()}{/if}
  </div>
{/snippet}

{#snippet traceButton()}
  {#if origin}
    {@const face = origin}
    <button class="trace" aria-pressed={tracing} title={tracing ? "Clear the route" : "Trace this value's route"} onclick={() => ontrace?.(face)}>Trace</button>
  {/if}
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
    <!-- svelte-ignore a11y_click_events_have_key_events (the face's name is a button, its click the row's) -->
    <tr class={side} data-port={portId(f.face.path, side, f.name)} title={`Select ${f.name}`} onclick={() => onselect(sel)}>
      <td class="side">{side}</td>
      <td class="face-name"><button class="row">{f.name}</button></td>
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
      <thead><tr><th></th><th>face</th><th>type</th><th>kind</th><th></th>{#if stage}<th title="the output's stage">stage</th>{/if}{#if links_}<th>from / to</th>{/if}</tr></thead>
      <tbody>
        {@render faceRows(inputs, "in", stage, links_)}
        {@render faceRows(outputs, "out", stage, links_)}
      </tbody>
    </table>
  {/if}
{/snippet}

{#snippet slashed(s: string)}{#each s.split("/") as part, i (i)}{#if i}/<wbr />{/if}{part}{/each}{/snippet}
<!-- A frames table's value, `Δt = 1/10 s`: it breaks after the equals sign alone. -->
{#snippet value(v: string)}{@const at = v.indexOf(" = ")}<span>{v.slice(0, at)} =</span> <span>{v.slice(at + 3)}</span>{/snippet}

{#snippet frames(t: FramesTable)}
  <table class="frames">
    <thead><tr><th></th><th>period</th><th>phase</th><th></th></tr></thead>
    <tbody>
      {#each t.rows as r (r.frame)}
        <tr data-frame={r.frame}>
          <th class="frame" scope="row" title={FRAME_TITLES[r.frame]}><span class="word">{r.frame}</span>{#if r.name}{" "}<span class="name" title={r.nameTitle}>{@render slashed(r.name)}</span>{/if}</th>
          <td class="period">{@render value(r.period)}</td><td class="phase">{@render value(r.phase)}</td><td class="unit">{@render slashed(r.unit)}</td>
        </tr>
      {/each}
    </tbody>
  </table>
{/snippet}

<!-- A collapsible section: the heading's `toggle`, from a click, a key or the browser's own search, is the session's. -->
{#snippet section(name: Section, body: Snippet, title?: string)}
  <details class="section" data-section={name} open={sections.has(name)} ontoggle={(e) => onsection(name, e.currentTarget.open)}>
    <summary {title}><h3>{name}</h3></summary>
    {@render body()}
  </details>
{/snippet}

{#snippet node(f: NodeFacts | LevelFacts)}
  <dl class="facts">
    <dt title={FACT_TITLES.type}>type</dt>
    <dd data-fact="type">
      <code class="type">{f.type}</code>{#if f.alias}<span class="aside">alias</span><code class="alias">{f.alias}</code>{/if}
    </dd>
    <dt title={FACT_TITLES.class}>class</dt>
    <dd data-fact="class">{classPhrase(f.kind === "primitive" ? "primitive" : "assembly", f.tier)}</dd>
    {#if f.children !== undefined}
      <dt title={FACT_TITLES.children}>children</dt>
      <dd data-fact="children">{f.children}</dd>
    {/if}
    {#if f.wires !== undefined}
      <dt title={FACT_TITLES.wires}>wires</dt>
      <dd data-fact="wires">{f.wires}</dd>
    {/if}
    {#if f.events !== undefined}
      <dt title={FACT_TITLES.events}>events</dt>
      <dd data-fact="events">{f.events}</dd>
    {/if}
    {#if f.membership}
      <dt title={FACT_TITLES.member}>member</dt>
      <dd data-fact="member" title={memberTitle(f.membership)}>
        {memberKind(f.membership.how)} <code>{f.membership.field}</code>, key <code>{f.membership.key}</code>
      </dd>
    {/if}
  </dl>
  {#snippet signature()}<code class="signature">{f.signature}</code>{/snippet}
  <!-- renderDocstring escapes raw HTML and keeps only http links, so the HTML is safe to insert -->
  {#snippet docstring()}<div class="docstring">{@html renderDocstring(f.docstring!, f.type)}</div>{/snippet}
  {#snippet locations()}
    <ul class="locations">
      {#each f.locations as l, i (i)}
        {@const parts = fileParts(l.file)}
        <li>
          <button
            class="location" class:editor title={editor ? "Open in the editor" : "Copy the file label"}
            onclick={() => onlocation(l.file, l.line) || copy(fileLabel(l.file, l.line))}
          >
            <code class="function">{l.function}</code> <code class="file">{#each parts.dirs as d, j (j)}{d}<wbr />{/each}<span class="file-name">{parts.name}:{l.line}</span></code>
          </button>{#if copied === fileLabel(l.file, l.line)} <span class="copied">copied</span>{/if}
        </li>
      {/each}
    </ul>
  {/snippet}
  {#snippet timing()}
    {@render frames(f.timing!.table)}
    {#if f.timing!.chain}<p class="chain"><code>{f.timing!.chain}</code></p>{/if}
  {/snippet}
  <!-- The events in priority order, none a stop (workspace.md answer 4), and the bundle's fields as `show` prints them. -->
  {#snippet events()}
    <table class="events">
      <thead><tr><th title="The priority within the component: the first eligible event fires">#</th><th>event</th><th title={LOCALIZED_TITLE}>localized</th></tr></thead>
      <tbody>
        {#each f.eventTable!.events as e (e.position)}
          <tr class="event" data-position={e.position}><td class="position">{e.position}</td><td class="name"><code>{e.name}</code></td><td class="localized">{localizedWord(e.localized)}</td></tr>
        {/each}
      </tbody>
    </table>
    <p class="bundle" title="The fields the guards and the handlers receive">bundle <code>({f.eventTable!.bundle.join(", ")})</code></p>
  {/snippet}
  {#snippet parameters()}
    <table class="parameters"><tbody>{#each f.parameters as p (p.name)}<tr><td class="param-name"><code>{p.name}</code></td><td class="param-value"><code>{p.value}</code></td></tr>{/each}</tbody></table>
  {/snippet}
  {#snippet faceTable()}{@render faces(f.inputs, f.outputs, f.kind === "primitive", true)}{/snippet}

  {#if signatureAdds(f.type, f.signature)}{@render section("signature", signature)}{/if}
  {#if f.docstring}{@render section("docstring", docstring)}{/if}
  {#if f.locations.length}{@render section("locations", locations)}{/if}
  {#if f.timing}{@render section("timing", timing, TIMING_TITLE)}{/if}
  {#if f.eventTable}{@render section("events", events)}{/if}
  {#if f.parameters.length}{@render section("parameters", parameters)}{/if}
  {#if f.inputs.length + f.outputs.length}{@render section("faces", faceTable)}{/if}
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
    {#if "signature" in facts}
      <!-- the open level and a block share the branch, so a stop keeps the cursor between them; a primitive root's level
        is the primitive itself, so its pane carries the open level's mark -->
      {@render header(facts.segment, facts.displayName, facts.path, facts.kind === "assembly", false, facts.path === level)}
      {@render node(facts)}
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
      <div class="path-line">{@render traceButton()}</div>
      <p class="endpoints"><code>{facts.from.path || "/"}{facts.from.path ? "/" : ""}{facts.from.port}</code> → <code>{facts.to.path || "/"}{facts.to.path ? "/" : ""}{facts.to.port}</code></p>
      <p class="facts">level <code>{facts.level || "/"}</code></p>
      <p class="type"><code>{facts.type ?? "?"}</code> <span class="face-kind">{facts.phrase ?? ""}</span></p>
      <h3>Terminal producer</h3>
      <p>{#if facts.producer}{@render faceLink("producer", facts.producer)}{:else}none{/if}</p>
      <h3>Terminal consumers</h3>
      <ul class="consumers">{#each facts.consumers as c, i (i)}<li>{@render faceLink("consumer", c)}</li>{:else}<li>none</li>{/each}</ul>
    {:else}
      {@render header(facts.name, facts.kind === "pin" ? `${facts.face.side === "in" ? "input" : "output"} pin of ${facts.level || model.label}` : `${facts.face.side === "in" ? "input" : "output"} of ${facts.face.path || model.label}`, facts.face.path, false, true)}
      {@const line = [facts.stage && `stage ${facts.stage}`, facts.pinned === undefined ? undefined : facts.pinned ? "pinned" : "not pinned"].filter(Boolean).join(" · ")}
      {#if line}<p class="facts">{line}</p>{/if}
      <p class="type"><code>{facts.type ?? "?"}</code> <span class="face-kind">{facts.phrase ?? ""}</span></p>
      {#if facts.rootInput}
        <p class="root-input">root input: <code>{facts.rootInput.name}</code> <code>{facts.rootInput.type}</code></p>
      {/if}
      <h3>Fed by</h3>
      <p>{#if facts.producer}{@render faceLink("producer", facts.producer)}{:else if facts.rootInput}the model's input{:else if facts.face.side === "out"}itself{:else}nothing{/if}</p>
      {#if facts.consumers}
        <h3>Feeds</h3>
        <ul class="consumers">{#each facts.consumers as c, i (i)}<li>{@render faceLink("consumer", c)}</li>{:else}<li>nothing</li>{/each}</ul>
      {/if}
    {/if}
  </aside>
{/if}

<style>
  /* The region fills the pane's body, so a click below the facts lands in it. */
  .detail { padding: 2px 10px 16px; font-size: 13px; overflow-wrap: break-word; container-type: inline-size; min-height: 100%; box-sizing: border-box; }
  h2 { font-size: 15px; margin: 4px 0 2px; font-weight: 400; }
  h2 .segment { font-weight: 600; }
  h2 .name { color: var(--text-light); }
  h3 { font-size: 11px; text-transform: uppercase; letter-spacing: 0.04em; color: var(--text-light); margin: 14px 0 4px; font-weight: 600; }
  /* A section's heading is the h3 after the summary's marker. */
  summary { margin: 14px 0 4px; color: var(--text-light); font-size: 11px; cursor: pointer; }
  summary h3 { display: inline; margin: 0; }
  .path-line { display: flex; gap: 6px; align-items: center; }
  .path { color: var(--text-light); }
  .copy { font: 11px system-ui, sans-serif; padding: 0 6px; }
  .facts { margin: 8px 0; }
  dl.facts { display: grid; grid-template-columns: max-content minmax(0, 1fr); gap: 3px 10px; }
  dl.facts dt { color: var(--text-light); font-size: 11px; line-height: 17px; cursor: help; }
  dl.facts dd { margin: 0; overflow-wrap: break-word; }
  dl.facts dd[title] { cursor: help; }
  dl.facts .aside { color: var(--text-light); font-size: 11px; margin: 0 4px 0 8px; }
  .open-level, .trace { font: 11px system-ui, sans-serif; padding: 0 6px; }
  .level-mark { font-size: 11px; color: var(--text-light); }
  .trace[aria-pressed="true"] { background: color-mix(in srgb, var(--highlight) 20%, transparent); }
  p { margin: 6px 0; }
  code { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 12px; }
  code.signature { display: block; white-space: pre-wrap; }
  /* The rendered docstring keeps the pane's font; code blocks in monospace on the strip, unwrapped and scrolling sideways, links in the highlight. */
  div.docstring { margin: 4px 0 8px; }
  div.docstring :global(p), div.docstring :global(ul), div.docstring :global(ol) { margin: 6px 0; }
  div.docstring :global(ul), div.docstring :global(ol) { padding-left: 18px; }
  div.docstring :global(:is(h1, h2, h3, h4, h5, h6)) { font-size: 13px; margin: 10px 0 4px; }
  div.docstring :global(pre) { white-space: pre; overflow-x: auto; background: var(--strip); padding: 6px 8px; margin: 6px 0; border-radius: 3px; }
  div.docstring :global(code) { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 12px; }
  div.docstring :global(a) { color: var(--highlight); text-decoration: none; }
  div.docstring :global(a:hover) { text-decoration: underline; }
  ul { margin: 0; padding-left: 16px; }
  .locations { list-style: none; padding: 0; }
  .locations li { margin: 2px 0; }
  .location { all: unset; display: block; cursor: copy; overflow-wrap: anywhere; }
  /* The file's name with its line number moves to a line of its own whole, and breaks only when wider than the pane. */
  .location .file-name { display: inline-block; }
  .location.editor { cursor: pointer; }
  .location:hover :is(.file, .file-name) { text-decoration: underline; }
  .locations .file, .copied { color: var(--text-light); }
  table { border-collapse: collapse; width: 100%; }
  td, th { padding: 2px 6px 2px 0; vertical-align: top; text-align: left; }
  th { font-weight: 400; color: var(--text-light); font-size: 11px; }
  .parameters td { overflow-wrap: anywhere; }
  /* The frames table (deployment_overlay.md answer 10): a row per frame, the frame's word light, the pair in two columns. */
  .frames th.frame { color: var(--text); font-size: 13px; cursor: help; }
  .frames .word { color: var(--text-light); font-size: 11px; }
  .frames :is(th, td) { padding: 1px 4px 1px 0; }
  .frames .period, .frames .phase, .frames :is(.period, .phase) > span { white-space: nowrap; }
  .frames .period { padding-right: 8px; }
  .frames .unit { color: var(--text-light); }
  .chain { margin: 4px 0 0; color: var(--text-light); }
  /* The events table: the priority number light, the bundle under it. */
  .events { width: auto; }
  .events :is(th, td) { padding-right: 12px; }
  .events .position { color: var(--text-light); font-variant-numeric: tabular-nums; }
  .events .name { overflow-wrap: anywhere; min-width: 8ch; }
  .events :is(.position, .localized) { white-space: nowrap; }
  .bundle { margin: 4px 0 0; color: var(--text-light); }
  .faces tbody tr { cursor: pointer; }
  .faces tbody tr:hover { background: var(--strip); }
  .faces .side, .faces .pinned, .faces .stage { white-space: nowrap; }
  .faces .face-name, .faces .face-kind { overflow-wrap: anywhere; }
  .faces .links { overflow-wrap: anywhere; }
  .faces .side { color: var(--text-light); font-size: 11px; }
  .faces .face-name { font-weight: 600; }
  .faces .row { padding: 0; border: 0; background: none; font: inherit; color: inherit; overflow-wrap: anywhere; text-align: left; cursor: pointer; }
  .faces .face-type { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 12px; overflow-wrap: anywhere; min-width: 8ch; }
  .face-kind { color: var(--text-light); }
  /* A narrow pane (workspace.md answer 4 as amended): each parameter's summary under its name, each face a small block. */
  @container (max-width: 420px) {
    .parameters, .parameters tbody, .parameters tr, .parameters td { display: block; }
    .parameters tr { padding: 2px 0; }
    .parameters td { padding: 0; }
    /* stacked, the name in the lighter color reads apart from the value under it (the look pass, 3.2) */
    .parameters .param-name { color: var(--text-light); }
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
  /* The narrowest panes: a frames table's value breaks after its equals sign, or the table would scroll sideways. */
  @container (max-width: 300px) {
    .frames .period, .frames .phase { white-space: normal; }
  }
  a { color: var(--highlight); text-decoration: none; }
  a:hover { text-decoration: underline; }
</style>
