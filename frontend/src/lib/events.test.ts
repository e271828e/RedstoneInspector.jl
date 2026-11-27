// The state events' data (visual_grammar.md answer 11, workspace.md answers 4 and 6, deployment_overlay.md answers 7
// and 9; increment 10b's notes, rulings 1 to 9 and C1 to C6), tabled over every fixture where a rule applies to all.
// The counts beneath are recomputed here over the tree's children, not the paths' prefixes the module reads.
import { describe, expect, it } from "vitest";
import { levelFacts, nodeFacts } from "./detail";
import { eventCount, eventGroups, eventHead, eventsBeneath, eventsOf, eventsPill, eventsSection } from "./events";
import { fixtureModel, fixtureNames, fixtureText } from "./fixtures";
import { parseDescriptor } from "./loader";
import { loadModel, type Model } from "./model";

const names = fixtureNames();
const models = new Map(names.map((n) => [n, fixtureModel(n)]));
const withEvents = names.filter((n) => models.get(n)!.descriptor.kind !== "failure");
const fromText = (text: string): Model => {
  const loaded = parseDescriptor(text);
  if (!loaded.ok) throw new Error(loaded.reason);
  return loadModel(loaded);
};
/** A primitive's declared count, 0 with none, read off the section's row. */
const own = (m: Model, path: string) => eventsSection(m)!.components.find((c) => c.path === path)?.events.length ?? 0;
/** The events beneath a node and the declaring primitives, by the tree's children. */
function walk(m: Model, path: string): [number, number] {
  const n = m.tree!.byPath.get(path)!;
  if (n.class === "primitive") return own(m, path) ? [own(m, path), 1] : [0, 0];
  return m.tree!.children.get(path)!.map((c) => walk(m, c)).reduce(([a, b], [c, d]) => [a + c, b + d], [0, 0]);
}

describe("the fixtures' events", () => {
  it("events_deployment, the notes' C1: a keyed assembly with a discrete primitive and an event-declaring one, an assembly with events at two depths, a non-localized event, and one component with both policies", () => {
    const m = models.get("events_deployment")!, tree = m.tree!;
    const pod = tree.byPath.get("pods/a")!;
    expect([pod.class, tree.membership.get("pods/a"), pod.inputs.length + pod.outputs.length]).toEqual(["assembly", "keyed", 1]);
    expect(tree.children.get("pods/a")!.map((c) => { const n = tree.byPath.get(c)!; return [c, n.class === "primitive" ? n.tier : n.class, own(m, c)]; })).toEqual([["pods/a/ball", "continuous", 1], ["pods/a/hold", "discrete", 0]]);
    expect([eventsBeneath(m, "nest"), eventsBeneath(m, "nest/deep")]).toEqual([{ events: 2, primitives: 2 }, { events: 1, primitives: 1 }]);
    expect(own(m, "nest/step")).toBe(1);
    expect(eventsOf(m, "nest/step")!.events.map((e) => e.localized)).toEqual([false]);
    expect(eventsOf(m, "heater")!.events.map((e) => e.localized)).toEqual([true, true, false]);
  });

  it.each(names)("%s: a section exactly when the body is no failure's, a row per primitive in walk order", (name) => {
    const m = models.get(name)!;
    const s = eventsSection(m);
    expect(!!s).toBe(m.descriptor.kind !== "failure");
    if (!s) return expect([eventGroups(m), eventCount(m), eventsBeneath(m, ""), eventHead(m)]).toEqual([undefined, undefined, { events: 0, primitives: 0 }, undefined]);
    const primitives = m.structure!.nodes.filter((n) => n.class === "primitive").map((n) => n.path);
    expect(s.components.map((c) => c.path)).toEqual(primitives);
  });

  it.each(withEvents)("%s: the groups are the declaring rows in walk order, each event numbered from 1 in declaration order with its policy", (name) => {
    const m = models.get(name)!;
    const rows = eventsSection(m)!.components.filter((c) => c.events.length);
    expect(eventGroups(m)).toEqual(rows.map((c) => ({
      path: c.path, bundle: c.bundle, events: c.events.map((e, i) => ({ position: i + 1, name: e.name, localized: e.policy === "localized" })),
    })));
  });

  it.each(withEvents)("%s: the count beneath every assembly, the root's the tab's count, sums its primitives' over depth; a primitive's is its own", (name) => {
    const m = models.get(name)!;
    for (const n of m.structure!.nodes) {
      const [events, primitives] = walk(m, n.path);
      expect(eventsBeneath(m, n.path), n.path || "/").toEqual({ events, primitives });
    }
    expect(eventCount(m)).toBe(walk(m, "")[0]);
  });

  it("the counts the session read: 1 on approach_deployment and descent, 14 over 6 on library and library_deployment, 7 over 5 on events_deployment, none elsewhere", () => {
    const counts = Object.fromEntries(withEvents.map((n) => [n, eventsBeneath(models.get(n)!, "")]).filter(([, b]) => (b as { events: number }).events));
    expect(counts).toEqual({
      approach_deployment: { events: 1, primitives: 1 }, descent: { events: 1, primitives: 1 }, events_deployment: { events: 7, primitives: 5 },
      library: { events: 14, primitives: 6 }, library_deployment: { events: 14, primitives: 6 },
    });
  });
});

describe("eventsBeneath", () => {
  it("counts by whole segments: `a` holds `a/x` and not its sibling `ab`", () => {
    const row = (path: string) => ({ path, events: [{ name: "e", policy: "localized" as const }], bundle: [] });
    const m = { descriptor: { kind: "build", build: { events: { components: [row("a/x"), row("ab")] } } } } as unknown as Model;
    expect([eventsBeneath(m, "a"), eventsBeneath(m, "ab"), eventsBeneath(m, "")]).toEqual([
      { events: 1, primitives: 1 }, { events: 1, primitives: 1 }, { events: 2, primitives: 2 },
    ]);
  });
});

describe("eventsPill", () => {
  it.each(withEvents)("%s: a primitive's pill exactly when it declares, its count and a line per event; an assembly's exactly when events lie beneath, the count and the primitives inside", (name) => {
    const m = models.get(name)!;
    for (const n of m.structure!.nodes) {
      const pill = eventsPill(m, n.path), [events, primitives] = walk(m, n.path);
      if (!events) {
        expect(pill, n.path).toBeUndefined();
        continue;
      }
      const text = `${events} ${events === 1 ? "event" : "events"}`;
      if (n.class === "primitive") {
        const row = eventsSection(m)!.components.find((c) => c.path === n.path)!;
        const lines = row.events.map((e, i) => `${i + 1} ${e.name}, ${e.policy === "localized" ? "localized" : "not localized"}`);
        expect(pill, n.path).toEqual({ text, title: lines.join("\n") });
      } else {
        expect(pill, n.path).toEqual({ text, title: `${text} on ${primitives} ${primitives === 1 ? "primitive" : "primitives"} inside` });
      }
    }
  });

  it.each(names.filter((n) => models.get(n)!.descriptor.kind === "failure" && models.get(n)!.tree))("%s: a failure draws no pill", (name) => {
    const m = models.get(name)!;
    expect(m.structure!.nodes.map((n) => eventsPill(m, n.path)).filter(Boolean)).toEqual([]);
  });

  it("heater's title, its events in priority order with their policies; nest's, over two depths", () => {
    const m = models.get("events_deployment")!;
    expect(eventsPill(m, "heater")).toEqual({ text: "3 events", title: "1 heat_on, localized\n2 heat_off, localized\n3 trip, not localized" });
    expect(eventsPill(m, "nest")).toEqual({ text: "2 events", title: "2 events on 2 primitives inside" });
    expect(eventsPill(m, "")).toEqual({ text: "7 events", title: "7 events on 5 primitives inside" });
  });
});

describe("the root path", () => {
  // primitive's root declares one event in an edited copy: the root is the drawn block and the open level
  const m = fromText(fixtureText("primitive").replace('"path": "",\n          "events": []', '"path": "",\n          "events": [{"name": "kick", "policy": "localized"}]'));

  it("a primitive root that declares an event: its own events, its pill, its count and the open level's EVENTS section", () => {
    expect(eventsOf(m, "")).toEqual({ path: "", events: [{ position: 1, name: "kick", localized: true }], bundle: [] });
    expect(eventsPill(m, "")).toEqual({ text: "1 event", title: "1 kick, localized" });
    expect([eventsBeneath(m, ""), eventCount(m)]).toEqual([{ events: 1, primitives: 1 }, 1]);
    expect(levelFacts(m, "").eventTable?.path).toBe("");
    expect(eventsOf(models.get("primitive")!, "")).toBeUndefined();
  });
});

describe("the pane's facts", () => {
  it.each(withEvents)("%s: a primitive's EVENTS table exactly when it declares; an assembly's events fact, the open level's included, exactly when events lie beneath, and no table", (name) => {
    const m = models.get(name)!;
    for (const n of m.structure!.nodes) {
      const [events] = walk(m, n.path);
      for (const f of [nodeFacts(m, n.path), levelFacts(m, n.path)]) {
        if (n.class === "primitive") {
          expect(f.eventTable, n.path).toEqual(eventsOf(m, n.path));
          expect(!!f.eventTable).toBe(events > 0);
          expect(f.events).toBeUndefined();
        } else {
          expect(f.events, n.path || "/").toBe(events || undefined);
          expect(f.eventTable).toBeUndefined();
        }
      }
    }
  });
});

describe("eventHead", () => {
  it.each(names)("%s: on a deployment firing_budget when an event is declared, the tolerance and the localization budget when a localized one is; nothing on a build or a failure", (name) => {
    const m = models.get(name)!, d = m.descriptor;
    if (d.kind !== "deployment") return expect(eventHead(m)).toBeUndefined();
    const groups = eventGroups(m)!;
    const localized = groups.some((g) => g.events.some((e) => e.localized));
    expect(eventHead(m)!.map((h) => h.label)).toEqual([
      ...(groups.length ? ["firing_budget"] : []), ...(localized ? ["localization_tol", "localization_budget"] : []),
    ]);
  });

  it("the values: approach_deployment's defaults and events_deployment's own, the tolerance in the shortest exponent form, a fraction of Δt_frame", () => {
    const values = (n: string) => eventHead(models.get(n)!)!.map((h) => `${h.label}=${h.values.join()}`);
    expect(values("approach_deployment")).toEqual(["firing_budget=4", "localization_tol=1e-6 of Δt_frame", "localization_budget=8"]);
    expect(values("events_deployment")).toEqual(["firing_budget=2", "localization_tol=2.5e-5 of Δt_frame", "localization_budget=16"]);
    expect(eventHead(models.get("closed_loop_deployment")!)).toEqual([]);
  });

  it("events_deployment with every policy non_localized: firing_budget alone", () => {
    const m = fromText(fixtureText("events_deployment").replaceAll('"policy": "localized"', '"policy": "non_localized"'));
    expect(eventHead(m)!.map((h) => h.label)).toEqual(["firing_budget"]);
  });
});
