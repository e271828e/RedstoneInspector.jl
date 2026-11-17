import { describe, expect, it } from "vitest";
import { fixtureJson, fixtureModel } from "../lib/fixtures";
import { parseDescriptor } from "../lib/loader";
import { loadModel } from "../lib/model";
import {
  clearDiagnosticFocus, clearRoute, climb, closeHelp, diagnosticCount, escape, hashOf, isHelpHash, levelOfHash, load, open, openFromHistory, openHelp,
  select, session, setQuery, toggleDiagnosticFocus, toggleExpanded, toggleHelp, toggleLegendFocus, trace,
} from "./session.svelte";

describe("the drawer's open rule on load", () => {
  it("a build carrying one warning and no diagnostic loads with the drawer closed, the warning counted", () => {
    const d = fixtureJson("descent") as any;
    const cycle = fixtureJson("failure_cycle") as any;
    d.build.warnings = [{ ...cycle.failure.diagnostics[0], severity: "warning" }];
    const loaded = parseDescriptor(JSON.stringify(d), "descent.json");
    if (!loaded.ok) throw new Error(loaded.reason);
    const m = loadModel(loaded);
    load(m);
    expect(session.drawer).toEqual({ open: false, tab: "diagnostics" });
    expect(diagnosticCount(m)).toBe(1);
  });

  it("a failure carrying one diagnostic loads with the drawer open on diagnostics", () => {
    load(fixtureModel("failure_cycle"));
    expect(session.drawer).toEqual({ open: true, tab: "diagnostics" });
  });
});

describe("load: a replacement rekeys, a refusal unloads", () => {
  it("rekeys a second model, notes a fallen level and starts fresh after a refusal", () => {
    load(fixtureModel("closed_loop"));
    open("sensing");
    select({ level: "sensing", target: { kind: "block", id: "sensing/noise" } });
    setQuery("h");
    load(fixtureModel("closed_loop_deployment"));
    expect(session.level).toBe("sensing");
    expect(session.selection?.target.id).toBe("sensing/noise");
    expect(session.note).toBeUndefined();
    load(fixtureModel("rates"));
    expect(session.level).toBe("");
    expect(session.note).toBe("`sensing` is not in this model; showing the root");
    expect(session.query).toBe("h");
    open("fast");
    expect(session.note).toBeUndefined();
    load(undefined);
    load(fixtureModel("closed_loop"));
    expect([session.level, session.query, session.note]).toEqual(["", "", undefined]);
    climb();
    expect(session.level).toBe("");
  });

  it("Escape clears a standing query first, then the selection", () => {
    load(fixtureModel("closed_loop"));
    select({ level: "", target: { kind: "block", id: "plant" } });
    setQuery("h");
    escape();
    expect([session.query, session.selection?.target.id]).toEqual(["", "plant"]);
    escape();
    expect(session.selection).toBeUndefined();
  });

  it("Escape clears the legend's focus before the query and the selection; a second click on the line clears it too", () => {
    load(fixtureModel("closed_loop"));
    select({ level: "", target: { kind: "block", id: "plant" } });
    setQuery("h");
    toggleLegendFocus("0,1,0");
    expect(session.legendFocus).toBe("0,1,0");
    escape();
    expect([session.legendFocus, session.query, session.selection?.target.id]).toEqual([undefined, "h", "plant"]);
    toggleLegendFocus("continuous");
    toggleLegendFocus("4,1,0");
    expect(session.legendFocus).toBe("4,1,0");
    toggleLegendFocus("4,1,0");
    expect(session.legendFocus).toBeUndefined();
  });

  it("the legend's focus holds across levels and a push that keeps the triple, and goes with one that does not or a fresh load", () => {
    load(fixtureModel("closed_loop"));
    toggleLegendFocus("4,1,0");
    open("pid_controller");
    expect(session.legendFocus).toBe("4,1,0");
    load(fixtureModel("closed_loop_deployment"));
    expect(session.legendFocus).toBe("4,1,0");
    load(fixtureModel("rates"));
    expect(session.legendFocus).toBeUndefined();
    toggleLegendFocus("continuous");
    load(undefined);
    load(fixtureModel("rates"));
    expect(session.legendFocus).toBeUndefined();
  });
});

describe("the focused diagnostic", () => {
  it("is set, toggled off by a second click, replaced by another and cleared", () => {
    load(fixtureModel("failure_probe"));
    expect(session.diagnosticFocus).toBeUndefined();
    toggleDiagnosticFocus(0);
    expect(session.diagnosticFocus).toBe(0);
    toggleDiagnosticFocus(0);
    expect(session.diagnosticFocus).toBeUndefined();
    toggleDiagnosticFocus(0);
    toggleDiagnosticFocus(1);
    expect(session.diagnosticFocus).toBe(1);
    clearDiagnosticFocus();
    expect(session.diagnosticFocus).toBeUndefined();
  });

  it("is cleared by a push and by a fresh load, and holds across a level change", () => {
    load(fixtureModel("failure_probe"));
    toggleDiagnosticFocus(1);
    open("s");
    expect(session.diagnosticFocus).toBe(1);
    load(fixtureModel("failure_probe"));
    expect(session.diagnosticFocus).toBeUndefined();
    toggleDiagnosticFocus(0);
    load(undefined);
    load(fixtureModel("failure_probe"));
    expect(session.diagnosticFocus).toBeUndefined();
  });

  it("Escape clears it ahead of the legend's focus, the query and the selection", () => {
    load(fixtureModel("failure_probe"));
    select({ level: "", target: { kind: "block", id: "t" } });
    setQuery("s");
    toggleLegendFocus("continuous");
    toggleDiagnosticFocus(0);
    escape();
    expect([session.diagnosticFocus, session.legendFocus, session.query, session.selection?.target.id]).toEqual([undefined, "continuous", "s", "t"]);
    escape();
    expect([session.legendFocus, session.query]).toEqual([undefined, "s"]);
  });
});

describe("the standing route", () => {
  const hRef = { path: "", side: "in" as const, port: "h_ref" };
  const plantV = { path: "plant", side: "out" as const, port: "V" };

  it("is set, cleared by the same trace, replaced by another and cleared", () => {
    load(fixtureModel("closed_loop"));
    expect(session.route).toBeUndefined();
    trace(hRef);
    expect(session.route).toEqual(hRef);
    trace({ ...hRef });
    expect(session.route).toBeUndefined();
    trace(hRef);
    trace(plantV);
    expect(session.route).toEqual(plantV);
    clearRoute();
    expect(session.route).toBeUndefined();
  });

  it("holds across a level change, a climb and a selection", () => {
    load(fixtureModel("closed_loop"));
    trace(hRef);
    open("pid_controller");
    climb();
    select({ level: "", target: { kind: "block", id: "plant" } });
    expect(session.route).toEqual(hRef);
  });

  it("is kept across the deployment, dropped by rates and by a fresh load", () => {
    load(undefined);
    load(fixtureModel("closed_loop"));
    trace(hRef);
    load(fixtureModel("closed_loop_deployment"));
    expect(session.route).toEqual(hRef);
    trace(hRef);
    trace(plantV);
    load(fixtureModel("closed_loop_deployment"));
    expect(session.route).toEqual(plantV);
    trace(hRef);
    load(fixtureModel("rates"));
    expect(session.route).toBeUndefined();
    load(fixtureModel("closed_loop"));
    trace(hRef);
    load(undefined);
    load(fixtureModel("closed_loop"));
    expect(session.route).toBeUndefined();
  });

  it("is cleared by a push whose model still declares its origin but no longer feeds it, with a notice a selection clears", () => {
    const δe = { path: "plant", side: "in" as const, port: "δe" };
    const d = fixtureJson("closed_loop") as any;
    const root = d.build.structure.nodes[0];
    root.wires = root.wires.filter((w: any) => !(w.to.path === "plant" && w.to.port === "δe"));
    const loaded = parseDescriptor(JSON.stringify(d), "closed_loop.json");
    if (!loaded.ok) throw new Error(loaded.reason);
    load(undefined);
    load(fixtureModel("closed_loop"));
    trace(δe);
    load(loadModel(loaded));
    expect(session.route).toBeUndefined();
    expect(session.notice).toBe("the route from `plant/δe` no longer resolves in this model; cleared");
    select({ level: "", target: { kind: "block", id: "plant" } });
    expect(session.notice).toBeUndefined();
    trace(hRef);
    load(loadModel(loaded));
    expect([session.route, session.notice]).toEqual([hRef, undefined]);
  });

  it("is cleared by a push whose model no longer declares its origin, with the same notice", () => {
    load(undefined);
    load(fixtureModel("closed_loop"));
    trace(hRef);
    load(fixtureModel("rates"));
    expect([session.route, session.notice]).toEqual([undefined, "the route from `h_ref` no longer resolves in this model; cleared"]);
  });

  it("Escape clears it ahead of the focused diagnostic", () => {
    load(fixtureModel("failure_cycle"));
    select({ level: "", target: { kind: "block", id: "plant" } });
    toggleDiagnosticFocus(0);
    trace({ path: "", side: "in", port: "ref" });
    escape();
    expect([session.route, session.diagnosticFocus, session.selection?.target.id]).toEqual([undefined, 0, "plant"]);
    escape();
    expect(session.diagnosticFocus).toBeUndefined();
  });
});

describe("a folder under a non-root node (workspace.md answer 2 as amended by the polish batch)", () => {
  it("expands with its node, by the chevron, by opening and by a selection beneath; a node already expanded leaves a collapsed folder alone", () => {
    load(undefined);
    load(fixtureModel("containers"));
    expect(session.expanded).toEqual(new Set(["", "gains", "pair"]));
    toggleExpanded("scale");
    expect(session.expanded).toEqual(new Set(["", "gains", "pair", "scale", "scale/taps"]));
    toggleExpanded("scale/taps");
    select({ level: "", target: { kind: "block", id: "scale" } });
    expect(session.expanded.has("scale/taps")).toBe(false);
    toggleExpanded("scale");
    expect(session.expanded.has("scale")).toBe(false);
    toggleExpanded("scale");
    expect(session.expanded.has("scale/taps")).toBe(true);
    load(undefined);
    load(fixtureModel("containers"));
    open("scale");
    expect(session.expanded.has("scale/taps")).toBe(true);
    load(undefined);
    load(fixtureModel("containers"));
    select({ level: "scale", target: { kind: "folder", id: "scale/taps" } });
    expect(session.expanded).toEqual(new Set(["", "gains", "pair", "scale", "scale/taps"]));
  });
});

describe("climbing", () => {
  it("a move to an ancestor of the level left selects the ancestor's child on the path, by climb, open and back", () => {
    load(fixtureModel("closed_loop"));
    open("sensing");
    expect(session.selection).toBeUndefined();
    climb();
    expect([session.level, session.selection]).toEqual(["", { level: "", target: { kind: "block", id: "sensing" } }]);
    load(fixtureModel("rates"));
    open("fast");
    open("fast/outer");
    open("");
    expect(session.selection).toEqual({ level: "", target: { kind: "block", id: "fast" } });
    open("fast/outer");
    openFromHistory(hashOf("fast"));
    expect(session.selection).toEqual({ level: "fast", target: { kind: "block", id: "fast/outer" } });
  });

  it("a move down or across selects nothing", () => {
    load(fixtureModel("rates"));
    open("fast");
    expect(session.selection).toBeUndefined();
    open("slow");
    expect(session.selection).toBeUndefined();
  });
});

describe("the hash", () => {
  it("is empty for the root and names any other level, read back", () => {
    expect(hashOf("")).toBe("");
    expect(hashOf("fast/outer")).toBe("#level=fast/outer");
    expect(levelOfHash(hashOf("selection/select_δe"))).toBe("selection/select_δe");
    expect(levelOfHash("")).toBeUndefined();
    expect(levelOfHash("#level=")).toBeUndefined();
    expect(levelOfHash("#other")).toBeUndefined();
  });
});

describe("the help page", () => {
  it("opens, closes and toggles, the model and the level kept", () => {
    load(fixtureModel("closed_loop"));
    open("sensing");
    select({ level: "sensing", target: { kind: "block", id: "sensing/noise" } });
    openHelp();
    expect(session.help).toBe(true);
    openHelp();
    expect(session.help).toBe(true);
    closeHelp();
    expect([session.help, session.level, session.selection?.target.id]).toEqual([false, "sensing", "sensing/noise"]);
    toggleHelp();
    expect(session.help).toBe(true);
    toggleHelp();
    expect(session.help).toBe(false);
    expect(session.model).toBeDefined();
  });

  it("is Escape's first step, before the route and the selection", () => {
    load(fixtureModel("closed_loop"));
    select({ level: "", target: { kind: "block", id: "plant" } });
    trace({ path: "", side: "in", port: "h_ref" });
    openHelp();
    escape();
    expect([session.help, session.route?.port, session.selection?.target.id]).toEqual([false, "h_ref", "plant"]);
    escape();
    expect(session.route).toBeUndefined();
  });

  it("is the hash `#help` through openFromHistory, any other hash hiding it and naming the level", () => {
    expect([isHelpHash("#help"), isHelpHash(""), isHelpHash("#level=help"), isHelpHash("#helpx")]).toEqual([true, false, false, false]);
    load(fixtureModel("rates"));
    open("fast");
    select({ level: "fast", target: { kind: "block", id: "fast/outer" } });
    openFromHistory("#help");
    expect([session.help, session.level]).toEqual([true, "fast"]);
    openFromHistory(hashOf("fast"));
    expect([session.help, session.level, session.selection?.target.id]).toEqual([false, "fast", "fast/outer"]);
    openFromHistory("#help");
    openFromHistory(hashOf("slow"));
    expect([session.help, session.level]).toEqual([false, "slow"]);
    openFromHistory("#help");
    openFromHistory("");
    expect([session.help, session.level]).toEqual([false, ""]);
  });

  it("stands across a load under it, which rekeys the level as without it", () => {
    load(undefined);
    openHelp();
    load(fixtureModel("closed_loop"));
    expect([session.help, session.level]).toEqual([true, ""]);
    open("sensing");
    load(fixtureModel("closed_loop_deployment"));
    expect([session.help, session.level]).toEqual([true, "sensing"]);
    closeHelp();
    expect([session.help, session.level, session.model?.kind]).toEqual([false, "sensing", "deployment"]);
  });
});
