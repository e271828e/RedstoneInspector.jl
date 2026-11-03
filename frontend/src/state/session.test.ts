import { describe, expect, it } from "vitest";
import { fixtureJson, fixtureModel } from "../lib/fixtures";
import { parseDescriptor } from "../lib/loader";
import { loadModel } from "../lib/model";
import {
  clearDiagnosticFocus, clearRoute, climb, diagnosticCount, escape, hashOf, levelOfHash, load, open, openFromHistory, select, session, setQuery,
  toggleDiagnosticFocus, toggleLegendFocus, trace,
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
    openFromHistory("fast");
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
