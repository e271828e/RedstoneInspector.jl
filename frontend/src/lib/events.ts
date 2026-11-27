// The state events (visual_grammar.md answer 11, workspace.md answers 4 and 6, deployment_overlay.md answer 7):
// everything the page derives from a build body's `events` section, a row per primitive in walk order, its events
// in priority order. A failure carries no section, so every function here reads none on one.
import { count } from "./detail";
import type { ComponentEvents, EventsSection } from "./descriptor";
import type { Model } from "./model";
import type { HeadItem } from "./timing";

/** The build body's `events` section; undefined on a failure, whose build never ran the nominal probe. */
export function eventsSection(model: Model): EventsSection | undefined {
  const d = model.descriptor;
  if (d.kind === "build") return d.build.events;
  if (d.kind === "deployment") return d.deployment.build.events;
  return undefined;
}

/** One event as the pane and the tab show it: its priority number, from 1 within its component, its name and policy. */
export interface EventRow {
  position: number;
  name: string;
  localized: boolean;
}
/** A declaring primitive's events in priority order and its bundle's field names. */
export interface EventGroup {
  path: string;
  events: EventRow[];
  bundle: string[];
}

const groupOf = (c: ComponentEvents): EventGroup => ({
  path: c.path,
  events: c.events.map((e, i) => ({ position: i + 1, name: e.name, localized: e.policy === "localized" })),
  bundle: c.bundle,
});

/** The tab's groups: one per declaring primitive, in walk order; undefined on a failure. */
export function eventGroups(model: Model): EventGroup[] | undefined {
  return eventsSection(model)?.components.filter((c) => c.events.length).map(groupOf);
}

/** A primitive's events, the pane's section; undefined when it declares none or on a failure. */
export function eventsOf(model: Model, path: string): EventGroup | undefined {
  const c = eventsSection(model)?.components.find((x) => x.path === path);
  return c?.events.length ? groupOf(c) : undefined;
}

/** The events the primitives at or beneath a path declare and how many primitives declare them; the root's are the model's. */
export interface Beneath {
  events: number;
  primitives: number;
}
export function eventsBeneath(model: Model, path: string): Beneath {
  const under = (eventGroups(model) ?? []).filter((g) => path === "" || g.path === path || g.path.startsWith(path + "/"));
  return { events: under.reduce((n, g) => n + g.events.length, 0), primitives: under.length };
}

/** The tab's count: the model's events, undefined on a failure. */
export const eventCount = (model: Model): number | undefined => (eventsSection(model) ? eventsBeneath(model, "").events : undefined);

/** An event's `localized` cell. */
export const localizedWord = (localized: boolean): string => (localized ? "yes" : "no");

/** The `localized` head's title, the tab's and the pane's (the notes' R6). */
export const LOCALIZED_TITLE = "yes: the event is located in time inside a step; no: its guard is checked at step boundaries only";

/**
 * The events pill of a block (visual_grammar.md answer 11, the notes' C4): on a primitive its count, titled with a
 * line per event in priority order; on a closed assembly the count beneath it, titled with the declaring primitives'
 * number. Undefined with none.
 */
export function eventsPill(model: Model, path: string): { text: string; title: string } | undefined {
  const primitive = model.tree?.byPath.get(path)?.class === "primitive";
  if (primitive) {
    const g = eventsOf(model, path);
    if (!g) return undefined;
    return {
      text: count(g.events.length, "event", "events"),
      title: g.events.map((e) => `${e.position} ${e.name}, ${e.localized ? "localized" : "not localized"}`).join("\n"),
    };
  }
  const b = eventsBeneath(model, path);
  if (!b.events) return undefined;
  const text = count(b.events, "event", "events");
  return { text, title: `${text} on ${count(b.primitives, "primitive", "primitives")} inside` };
}

/**
 * The events tab's head on a deployment (workspace.md answer 6, ruling 9): `firing_budget` when the model declares an
 * event, `localization_tol` as a fraction of `Δt_frame` and `localization_budget` when it declares a localized one.
 * The tolerance prints in JavaScript's shortest exponent form (the notes' C3). Undefined on a build and a failure.
 */
export function eventHead(model: Model): HeadItem[] | undefined {
  const d = model.descriptor;
  if (d.kind !== "deployment") return undefined;
  const groups = eventGroups(model)!;
  const { firing_budget, localization_tol, localization_budget } = d.deployment;
  const item = (label: string, value: string): HeadItem => ({ label, values: [value] });
  return [
    ...(groups.length ? [item("firing_budget", `${firing_budget}`)] : []),
    ...(groups.some((g) => g.events.some((e) => e.localized))
      ? [item("localization_tol", `${localization_tol.toExponential()} of Δt_frame`), item("localization_budget", `${localization_budget}`)]
      : []),
  ];
}
