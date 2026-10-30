import { describe, expect, it } from "vitest";
import { fixtureModel, fixtureText } from "./fixtures";
import { parseDescriptor, type Loaded } from "./loader";
import { loadModel } from "./model";

describe("the model", () => {
  it("builds the tree, the resolution and the feedthrough edges once", () => {
    const m = fixtureModel("closed_loop_deployment");
    expect(m).toMatchObject({ label: "closed_loop_deployment", kind: "deployment", note: undefined });
    expect(m.structure!.nodes).toHaveLength(30);
    expect(m.outputs!.order.length).toBeGreaterThan(0);
    expect(m.tree!.byPath.size).toBe(30);
    expect(m.resolution!.tree).toBe(m.tree);
    expect(m.feedthrough).toHaveLength(16);
  });

  it("leaves a structureless failure's sections undefined", () => {
    const m = loadModel(parseDescriptor(fixtureText("failure_structure")) as Loaded);
    expect(m.kind).toBe("failure");
    for (const k of ["structure", "outputs", "tree", "resolution", "feedthrough"] as const) expect(m[k]).toBeUndefined();
  });

  it("draws a failure with structure but no outputs", () => {
    const m = fixtureModel("failure_cycle");
    expect(m.tree!.byPath.size).toBe(3);
    expect(m.outputs).toBeUndefined();
    expect(m.feedthrough).toEqual([]);
  });
});
