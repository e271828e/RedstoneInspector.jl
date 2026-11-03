// The overlay's data from the oracle (`overlay.py`, brief 7's scratchpad, over the committed fixtures).
import { describe, expect, it } from "vitest";
import type { Diagnostic } from "./descriptor";
import { chainOf, diagnosticsOf, diagnosticTarget, litBy, overlayOf, treeMarks } from "./diagnostics";
import { fixtureJson, fixtureModel, fixtureNames } from "./fixtures";
import { parseDescriptor } from "./loader";
import { loadModel, type Model } from "./model";

const sorted = (s: Iterable<string>) => [...s].sort();
const marks = (m: Model) => Object.fromEntries([...treeMarks(m)].sort(([a], [b]) => a.localeCompare(b)));
const cycleOf = (m: Model) => diagnosticsOf(m)[0].cycle!;

/** `failure_cycle` with its diagnostics replaced by an unfed input at `ctl` and a warning at `plant`. */
function synthetic(): Model {
  const d = fixtureJson("failure_cycle") as any;
  d.failure.diagnostics = [{
    kind: "UnconnectedInput", severity: "error", path: "ctl", message: "`ctl/ref` is fed by nothing",
    marks: { ports: [{ path: "ctl", port: "ref" }], wires: [{ from: { path: "", port: "ref" }, to: { path: "ctl", port: "ref" } }] },
  }];
  d.failure.warnings = [{ kind: "EmptyFaceSelection", severity: "warning", path: "plant", message: "nothing passes through" }];
  const loaded = parseDescriptor(JSON.stringify(d), "failure_cycle.json");
  if (!loaded.ok) throw new Error(loaded.reason);
  return loadModel(loaded);
}

describe("diagnosticsOf", () => {
  it("lists the diagnostics then the warnings, each with its index", () => {
    const rows = diagnosticsOf(fixtureModel("failure_probe"));
    expect(rows.map((d) => [d.index, d.severity, d.kind, d.path])).toEqual([
      [0, "error", "UserCodeFraming", "t"], [1, "warning", "EmptyFaceSelection", "s/g"],
    ]);
    expect(diagnosticsOf(fixtureModel("warning")).map((d) => [d.severity, d.path])).toEqual([["warning", "g"]]);
    expect(diagnosticsOf(fixtureModel("failure_structure"))).toHaveLength(2);
    expect(diagnosticsOf(fixtureModel("closed_loop"))).toEqual([]);
  });
});

describe("chainOf", () => {
  it("maps failure_cycle's two terminal pairs onto the two root wires", () => {
    const m = fixtureModel("failure_cycle");
    expect(chainOf(m, cycleOf(m)).map((h) => [h.level, h.wire])).toEqual([["", "ctl|in|y"], ["", "plant|in|u"]]);
  });

  it("follows failure_nested's chain across ctl's boundary, two wires at the root and two inside", () => {
    const m = fixtureModel("failure_nested");
    expect(chainOf(m, cycleOf(m)).map((h) => [h.level, h.wire])).toEqual([
      ["ctl", "ctl/pi|in|y"], ["", "ctl|in|y"], ["", "plant|in|u"], ["ctl", "⟨out⟩u|in|u"],
    ]);
  });

  it("maps failure_dead's artificial loop onto its two wires", () => {
    const m = fixtureModel("failure_dead");
    expect(cycleOf(m).classification).toBe("artificial");
    expect(chainOf(m, cycleOf(m)).map((h) => [h.level, h.wire])).toEqual([["", "g2|in|e"], ["", "m|in|g"]]);
  });

  it("leaves out a pair whose walk ends at another producer, without throwing", () => {
    const m = fixtureModel("failure_cycle");
    const c = cycleOf(m);
    const wrong = { ...c, wires: [{ from: { path: "plant", port: "y" }, to: { path: "ctl", port: "y" } }, c.wires[1]] };
    expect(chainOf(m, wrong).map((h) => h.wire)).toEqual(["plant|in|u"]);
  });
});

describe("overlayOf", () => {
  it("failure_cycle: both members haloed in the error hue without a badge, the chain's two wires", () => {
    const o = overlayOf(fixtureModel("failure_cycle"), "");
    expect(Object.fromEntries(o.blocks)).toEqual({ plant: { severity: "error", badge: undefined }, ctl: { severity: "error", badge: undefined } });
    expect(sorted(o.wires.keys())).toEqual(["ctl|in|y", "plant|in|u"]);
    expect([o.ports.size, o.chords, o.continues.size]).toEqual([0, [], 0]);
  });

  it("failure_nested: plant and the root's two wires with ctl continuing; inside ctl, pi and the two inner wires", () => {
    const m = fixtureModel("failure_nested");
    const root = overlayOf(m, "");
    expect(sorted(root.blocks.keys())).toEqual(["plant"]);
    expect(sorted(root.wires.keys())).toEqual(["ctl|in|y", "plant|in|u"]);
    expect(Object.fromEntries(root.continues)).toEqual({ ctl: { severity: "error", index: 0 } });
    const ctl = overlayOf(m, "ctl");
    expect(sorted(ctl.blocks.keys())).toEqual(["ctl/pi"]);
    expect(ctl.blocks.get("ctl/pi")!.badge).toBeUndefined();
    expect(sorted(ctl.wires.keys())).toEqual(["ctl/pi|in|y", "⟨out⟩u|in|u"]);
    expect(ctl.continues.size).toBe(0);
  });

  it("failure_dead: one chord across m from its input g to its output F, m and g2 haloed", () => {
    const o = overlayOf(fixtureModel("failure_dead"), "");
    expect(o.chords).toEqual([{ block: "m", from: "m|in|g", to: "m|out|F", severity: "error" }]);
    expect(sorted(o.blocks.keys())).toEqual(["g2", "m"]);
    expect(sorted(o.wires.keys())).toEqual(["g2|in|e", "m|in|g"]);
  });

  it("failure_probe: t's badge reads the function, titled with the message's first line; s/g amber at s", () => {
    const m = fixtureModel("failure_probe");
    const root = overlayOf(m, "");
    expect(root.blocks.get("t")).toEqual({
      severity: "error",
      badge: { text: "y_state", title: "`t`: `y_state` threw during the build's probe — bundle {x, t} (§13.2)", index: 0, severity: "error" },
    });
    expect(sorted(root.blocks.keys())).toEqual(["t"]);
    const s = overlayOf(m, "s");
    expect(s.blocks.get("s/g")?.severity).toBe("warning");
    expect(s.blocks.get("s/g")?.badge?.text).toBe("EmptyFaceSelection");
    expect(s.blocks.get("s/g")?.badge?.index).toBe(1);
  });

  it("warning: g amber at the root, its badge the kind", () => {
    const o = overlayOf(fixtureModel("warning"), "");
    expect(o.blocks.get("g")?.severity).toBe("warning");
    expect(o.blocks.get("g")?.badge?.text).toBe("EmptyFaceSelection");
  });

  it("the synthetic marks: ctl's port and its wire from the root input, ctl red and plant amber", () => {
    const o = overlayOf(synthetic(), "");
    expect(Object.fromEntries(o.ports)).toEqual({ "ctl|in|ref": "error" });
    expect(Object.fromEntries(o.wires)).toEqual({ "ctl|in|ref": "error" });
    expect(o.blocks.get("ctl")?.severity).toBe("error");
    expect(o.blocks.get("plant")?.severity).toBe("warning");
  });

  it("the error wins where an error and a warning land on one block, its badge the error's", () => {
    const d = fixtureJson("failure_probe") as any;
    d.failure.warnings[0].path = "t";
    const loaded = parseDescriptor(JSON.stringify(d), "failure_probe.json");
    if (!loaded.ok) throw new Error(loaded.reason);
    const t = overlayOf(loadModel(loaded), "").blocks.get("t")!;
    expect([t.severity, t.badge?.text, t.badge?.severity]).toEqual(["error", "y_state", "error"]);
  });

  it("a diagnostic at the root marks nothing, nor one on the level's own node; a structureless model draws nothing", () => {
    const d = fixtureJson("failure_probe") as any;
    d.failure.diagnostics[0].path = "";
    d.failure.warnings[0].path = "s";
    const loaded = parseDescriptor(JSON.stringify(d), "failure_probe.json");
    if (!loaded.ok) throw new Error(loaded.reason);
    const m = loadModel(loaded);
    expect(overlayOf(m, "").blocks.has("")).toBe(false);
    expect(overlayOf(m, "s").blocks.size).toBe(0);
    expect(overlayOf(m, "").blocks.has("s")).toBe(true);
    expect(treeMarks(m).get("")).toEqual({ errors: 0, warnings: 1, own: false });
    expect(diagnosticTarget(m, diagnosticsOf(m)[0])).toBeUndefined();
    expect(overlayOf(fixtureModel("failure_structure"), "").blocks.size).toBe(0);
  });
});

describe("treeMarks", () => {
  it("failure_cycle: the root, plant and ctl, one error each, counted once on the root", () => {
    expect(marks(fixtureModel("failure_cycle"))).toEqual({
      "": { errors: 1, warnings: 0, own: false }, ctl: { errors: 1, warnings: 0, own: true }, plant: { errors: 1, warnings: 0, own: true },
    });
  });

  it("failure_nested: ctl marked as a level the chain touches, beside the members", () => {
    expect(marks(fixtureModel("failure_nested"))).toEqual({
      "": { errors: 1, warnings: 0, own: false }, ctl: { errors: 1, warnings: 0, own: true },
      "ctl/pi": { errors: 1, warnings: 0, own: true }, plant: { errors: 1, warnings: 0, own: true },
    });
  });

  it("failure_dead, failure_probe and warning as the oracle counts them", () => {
    expect(marks(fixtureModel("failure_dead"))).toEqual({
      "": { errors: 1, warnings: 0, own: false }, g2: { errors: 1, warnings: 0, own: true }, m: { errors: 1, warnings: 0, own: true },
    });
    expect(marks(fixtureModel("failure_probe"))).toEqual({
      "": { errors: 1, warnings: 1, own: false }, s: { errors: 0, warnings: 1, own: false },
      "s/g": { errors: 0, warnings: 1, own: true }, t: { errors: 1, warnings: 0, own: true },
    });
    expect(marks(fixtureModel("warning"))).toEqual({ "": { errors: 0, warnings: 1, own: false }, g: { errors: 0, warnings: 1, own: true } });
  });

  it("the synthetic: ctl red, plant amber", () => {
    expect(marks(synthetic())).toEqual({
      "": { errors: 1, warnings: 1, own: false }, ctl: { errors: 1, warnings: 0, own: true }, plant: { errors: 0, warnings: 1, own: true },
    });
  });

  it("nothing on a structureless failure or a clean build", () => {
    expect(treeMarks(fixtureModel("failure_structure")).size).toBe(0);
    expect(treeMarks(fixtureModel("closed_loop")).size).toBe(0);
  });
});

describe("diagnosticTarget", () => {
  const targets = (name: string) => {
    const m = fixtureModel(name);
    return diagnosticsOf(m).map((d) => diagnosticTarget(m, d));
  };

  it("a loop's first member on its parent's level; a node diagnostic its block on its parent's level", () => {
    expect(targets("failure_cycle")).toEqual([{ level: "", target: { kind: "block", id: "plant" } }]);
    expect(targets("failure_nested")).toEqual([{ level: "", target: { kind: "block", id: "plant" } }]);
    expect(targets("failure_dead")).toEqual([{ level: "", target: { kind: "block", id: "m" } }]);
    expect(targets("failure_probe")).toEqual([
      { level: "", target: { kind: "block", id: "t" } }, { level: "s", target: { kind: "block", id: "s/g" } },
    ]);
    expect(targets("warning")).toEqual([{ level: "", target: { kind: "block", id: "g" } }]);
  });

  it("none on a structureless failure", () => {
    expect(targets("failure_structure")).toEqual([undefined, undefined]);
  });

  it("a port mark before a wire mark; a pin's port for an endpoint on the root's path; a wire mark alone its wire", () => {
    const m = synthetic();
    const [first, second] = diagnosticsOf(m);
    expect(diagnosticTarget(m, first)).toEqual({ level: "", target: { kind: "port", id: "ctl|in|ref" } });
    expect(diagnosticTarget(m, second)).toEqual({ level: "", target: { kind: "block", id: "plant" } });
    const root: Diagnostic = { ...first, marks: { ports: [{ path: "", port: "ref" }], wires: [] } };
    expect(diagnosticTarget(m, root)).toEqual({ level: "", target: { kind: "port", id: "⟨in⟩ref|out|ref" } });
    const wire: Diagnostic = { ...first, marks: { ports: [], wires: first.marks!.wires } };
    expect(diagnosticTarget(m, wire)).toEqual({ level: "", target: { kind: "wire", id: "ctl|in|ref" } });
  });

  it("every fixture row has a target exactly when the model has a structure and the row a node", () => {
    for (const name of fixtureNames()) {
      const m = fixtureModel(name);
      for (const d of diagnosticsOf(m)) expect(diagnosticTarget(m, d) !== undefined).toBe(!!m.tree && d.path !== "");
    }
  });
});

describe("litBy", () => {
  it("failure_nested: plant, the continuing ctl and the root's two wires; inside ctl, pi, the two pins and the inner wires", () => {
    const m = fixtureModel("failure_nested");
    const d = diagnosticsOf(m)[0];
    const root = litBy(m, "", d);
    expect([sorted(root.blocks), sorted(root.wires), sorted(root.ports)]).toEqual([["ctl", "plant"], ["ctl|in|y", "plant|in|u"], []]);
    const ctl = litBy(m, "ctl", d);
    expect([sorted(ctl.blocks), sorted(ctl.wires)]).toEqual([["ctl/pi", "⟨in⟩y", "⟨out⟩u"], ["ctl/pi|in|y", "⟨out⟩u|in|u"]]);
  });

  it("the synthetic's first row lights ctl, its port and its wire", () => {
    const m = synthetic();
    const l = litBy(m, "", diagnosticsOf(m)[0]);
    expect([sorted(l.blocks), sorted(l.wires), sorted(l.ports)]).toEqual([["ctl"], ["ctl|in|ref"], ["ctl|in|ref"]]);
  });

  it("a probe failure lights its node alone; nothing on another level", () => {
    const m = fixtureModel("failure_probe");
    const d = diagnosticsOf(m)[0];
    expect(sorted(litBy(m, "", d).blocks)).toEqual(["t"]);
    expect(litBy(m, "s", d).blocks.size).toBe(0);
  });
});
