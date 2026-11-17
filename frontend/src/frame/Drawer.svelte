<script lang="ts">
  // The drawer (workspace.md answer 6): four tabs with their counts, open on load
  // only when a diagnostic exists. The diagnostics tab lists every diagnostic and
  // warning with a text filter, a row's click focusing it and selecting what it
  // names, its location link under its message; a loop's row lists its wires,
  // each linked to the declaration of the assembly holding it, and its members,
  // one traced structurally presumed. The other three tabs are components of
  // their own, a row's click selecting what it names.
  import { tick } from "svelte";
  import { palette } from "../canvas/palette";
  import type { Selection } from "../lib/detail";
  import { loopFacts, type Indexed } from "../lib/diagnostics";
  import type { Face } from "../lib/resolve";
  import type { Model } from "../lib/model";
  import { diagnosticCount, type Tab } from "../state/session.svelte";
  import Order from "./tabs/Order.svelte";
  import RootInputs from "./tabs/RootInputs.svelte";
  import Timing from "./tabs/Timing.svelte";

  let { model, open, tab, focused = false, diagnostics, current, editor = false, ontab, ondiagnostic, onlocation, onrow }: {
    model: Model;
    open: boolean;
    tab: Tab;
    /** The keyboard's focus is in the drawer region. */
    focused?: boolean;
    /** The diagnostics then the warnings, in the tab's order. */
    diagnostics: Indexed[];
    /** The focused diagnostic's index. */
    current?: number;
    /** A location click opens the editor; otherwise it copies the file label. */
    editor?: boolean;
    ontab: (tab: Tab) => void;
    /** A click on a row's body, with its index. */
    ondiagnostic: (index: number) => void;
    /** A location clicked: true when the shell sent it to the editor, false to copy it here. */
    onlocation: (file: string, line: number) => boolean;
    /** A row of the root inputs, timing or order tab clicked, with the selection it makes. */
    onrow: (s: Selection) => void;
  } = $props();

  const TABS: { tab: Tab; label: string }[] = [
    { tab: "diagnostics", label: "Diagnostics" },
    { tab: "root-inputs", label: "Root inputs" },
    { tab: "timing", label: "Timing" },
    { tab: "order", label: "Execution order" },
  ];
  const counts = $derived<Partial<Record<Tab, number>>>({
    diagnostics: diagnosticCount(model),
    "root-inputs": model.structure?.root_inputs.length,
    order: model.outputs?.order.length,
  });

  let filter = $state("");
  /** The timing tab's sort, held here so a tab switch keeps it. */
  let byPeriod = $state(false);
  /** The rows the filter keeps: a case-insensitive substring of the kind, the path or the message. */
  const shown = $derived.by(() => {
    const q = filter.toLowerCase();
    return diagnostics.filter((d) => [d.kind, d.path, d.message].some((s) => s.toLowerCase().includes(q)));
  });
  /** The attributed node's type's first location; none for a loop, whose members' `y_direct` the format does not locate. */
  const locationOf = (d: Indexed) => {
    if (d.cycle) return undefined;
    const n = model.tree?.byPath.get(d.path);
    return n && model.structure!.types.find((t) => t.name === n.type)?.locations[0];
  };

  let body = $state<HTMLElement>();
  // The tabs share one scrolling body: a tab opens at its top. A push keeps the place, a live rebuild's rows mostly standing.
  $effect(() => {
    void tab;
    if (body) body.scrollTop = 0;
  });
  // The focused row scrolls into view, a badge's included.
  $effect(() => {
    const i = current;
    if (i === undefined || !open) return;
    tick().then(() => body?.querySelector(`li.diagnostic[data-index="${i}"]`)?.scrollIntoView({ block: "nearest" }));
  });

  let copied = $state<string | undefined>();
  async function copy(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      copied = text;
      setTimeout(() => copied === text && (copied = undefined), 1200);
    } catch {
      // the clipboard refused: nothing to report beyond the link's title
    }
  }
  const fileLabel = (file: string, line: number) => `${file}:${line}`;
  /** A face as a loop's wire spells it, `path/port`. */
  const faceText = (f: { path: string; port: string }) => `${f.path}/${f.port}`;
  const hopText = (from: Face, to: Face) => `${faceText(from)} → ${faceText(to)}`;
  const PRESUMED = "Traced structurally: no tracer value reaches this member, so every input is presumed to reach every output.";
</script>

{#snippet locationLink(file: string, line: number, title: string, cls = "location")}
  <a
    class={cls} class:editor href={"#"} title={title}
    onclick={(e) => { e.preventDefault(); e.stopPropagation(); if (!onlocation(file, line)) copy(fileLabel(file, line)); }}
  >{fileLabel(file, line)}</a>{#if copied === fileLabel(file, line)} <span class="copied">copied</span>{/if}
{/snippet}

<!-- svelte-ignore a11y_no_noninteractive_tabindex (a region root, one of Tab's four stops by answer 11) -->
<section
  class="drawer" class:focused data-open={open ? "true" : "false"} data-tab={tab} tabindex="0" aria-label="the drawer"
  style="--error:{palette.error};--warning:{palette.warning}"
>
  <div class="strip" role="tablist">
    {#each TABS as t (t.tab)}
      <button
        class="tab" class:current={open && t.tab === tab} data-tab={t.tab} role="tab" aria-selected={open && t.tab === tab}
        title={open && t.tab === tab ? "Close the drawer" : `Open ${t.label.toLowerCase()}`} onclick={() => ontab(t.tab)}
      >{t.label}{#if counts[t.tab] !== undefined} <span class="count">{counts[t.tab]}</span>{/if}</button>
    {/each}
  </div>
  {#if open}
    <div class="tab-body" role="tabpanel" bind:this={body}>
      {#if tab === "diagnostics"}
        <div class="diagnostics">
          {#if diagnostics.length}
            <input class="filter" type="search" placeholder="Filter by kind, path or message" aria-label="filter the diagnostics" bind:value={filter} />
            <ul class="diagnostics">
              {#each shown as d (d.index)}
                {@const loc = locationOf(d)}
                <li class="diagnostic" class:current={d.index === current} data-index={d.index} data-severity={d.severity}>
                  <button class="row" onclick={() => ondiagnostic(d.index)}>
                    <span class="head">
                      <span class="kind">{d.kind}</span>
                      <span class="path">{d.path || "/"}</span>
                    </span>
                    <span class="message">{d.message}</span>
                  </button>
                  {#if loc}
                    <div class="under">{@render locationLink(loc.file, loc.line, editor ? "Open in the editor" : "Copy the file label")}</div>
                  {:else if d.cycle && model.tree}
                    {@const loop = loopFacts(model, d.cycle)}
                    <div class="under loop">
                      <ul class="loop-wires">
                        {#each loop.wires as w (faceText(w.from) + faceText(w.to))}
                          <li class="loop-wire" data-from={faceText(w.from)} data-to={faceText(w.to)}>
                            <code class="pair">{hopText({ ...w.from, side: "out" }, { ...w.to, side: "in" })}</code>
                            <ul class="hops">
                              {#each w.hops as h (h.level + h.wire)}
                                <li class="hop" data-level={h.level} data-wire={h.wire} data-declaration={h.declaration}>
                                  <code>{h.declaration}</code> of <code>{h.level || "/"}</code>{#if h.from.path !== w.from.path || h.to.path !== w.to.path}, <code>{hopText(h.from, h.to)}</code>{/if}
                                  {#if h.location}{@render locationLink(h.location.file, h.location.line, `${editor ? "Open" : "Copy the file label of"} the wire's declaration, ${h.declaration} of ${h.level || "the root"}`, "declaration")}{/if}
                                </li>
                              {/each}
                            </ul>
                          </li>
                        {/each}
                      </ul>
                      <p class="members">
                        members{#each loop.members as m (m.path)}{" "}<span class="member" data-path={m.path} data-mode={m.mode}><code>{m.path}</code>{#if m.presumed}{" "}<span class="presumed" title={PRESUMED}>presumed</span>{/if}</span>{/each}
                      </p>
                    </div>
                  {/if}
                </li>
              {/each}
            </ul>
            {#if !shown.length}<p class="empty">No row matches the filter.</p>{/if}
          {:else}
            <p class="empty">No diagnostics or warnings.</p>
          {/if}
        </div>
      {:else if tab === "root-inputs"}
        <RootInputs {model} {onrow} />
      {:else if tab === "timing"}
        <Timing {model} {onrow} bind:byPeriod />
      {:else}
        <Order {model} {onrow} />
      {/if}
    </div>
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

  /* The diagnostics tab: one row per diagnostic, its severity's hue on the row's left edge and on the kind. */
  .diagnostics { color: var(--text); }
  .filter { box-sizing: border-box; width: 100%; max-width: 360px; margin-bottom: 6px; font: 12px system-ui, sans-serif; }
  ul.diagnostics { list-style: none; margin: 0; padding: 0; }
  .diagnostic { padding-right: 8px; border-left: 3px solid var(--hue); }
  .row {
    display: block; width: 100%; padding: 4px 8px; border: 0; background: none; font: inherit; color: inherit;
    text-align: left; cursor: pointer;
  }
  /* Under the message: the location, or a loop's wires and members. */
  .under { padding: 0 8px 4px; font-size: 12px; overflow-wrap: anywhere; }
  .loop-wires, .hops { list-style: none; margin: 0; padding: 0; }
  .hops { padding-left: 16px; color: var(--text-light); }
  .loop code { font-size: 11px; }
  .pair { color: var(--text); }
  .declaration { margin-left: 6px; }
  .members { margin: 2px 0 0; color: var(--text-light); }
  .member { margin-left: 6px; }
  .presumed { font-style: italic; }
  .diagnostic + .diagnostic { margin-top: 4px; }
  .diagnostic[data-severity="error"] { --hue: var(--error); }
  .diagnostic[data-severity="warning"] { --hue: var(--warning); }
  .diagnostic:hover { background: var(--strip); }
  .diagnostic.current { background: color-mix(in srgb, var(--highlight) 14%, transparent); }
  .head { display: flex; gap: 10px; align-items: baseline; flex-wrap: wrap; }
  .kind { font-weight: 600; color: var(--hue); }
  .path { font-family: ui-monospace, monospace; font-size: 12px; }
  .location, .declaration { font-family: ui-monospace, monospace; font-size: 11px; color: var(--text-light); text-decoration: none; cursor: copy; }
  .location.editor, .declaration.editor { cursor: pointer; }
  .location:hover, .declaration:hover { text-decoration: underline; }
  .copied { font-size: 11px; color: var(--text-light); }
  .message { display: block; margin: 2px 0 0; font: 12px ui-monospace, monospace; white-space: pre-wrap; overflow-wrap: anywhere; }
  .empty { margin: 0; color: var(--text-light); }
</style>
