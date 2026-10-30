import { describe, expect, it } from "vitest";
import { fixtureJson, fixtureModel } from "../lib/fixtures";
import { parseDescriptor } from "../lib/loader";
import { loadModel } from "../lib/model";
import { diagnosticCount, load, session } from "./session.svelte";

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
