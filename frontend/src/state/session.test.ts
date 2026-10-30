import { describe, expect, it } from "vitest";
import { fixtureJson, fixtureModel } from "../lib/fixtures";
import { parseDescriptor } from "../lib/loader";
import { loadModel } from "../lib/model";
import { climb, diagnosticCount, escape, hashOf, levelOfHash, load, open, select, session, setQuery } from "./session.svelte";

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
