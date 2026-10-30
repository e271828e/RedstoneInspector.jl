import { describe, expect, it } from "vitest";
import { feedthroughEdges } from "./feedthrough";
import { fixtureModel } from "./fixtures";

const named = (name: string) =>
  fixtureModel(name).feedthrough!.map((e) => `${e.from.path}/${e.from.port} → ${e.to.path}/${e.to.port}`);

describe("feedthrough edges", () => {
  it.each([
    ["aircraft", 0], ["descent", 0], ["closed_loop", 16], ["closed_loop_deployment", 16], ["containers", 5],
    ["primitive", 0], ["kinds", 0], ["rates", 0], ["large", 0], ["failure_cycle", 0],
  ] as const)("%s: %i edges", (name, n) => {
    expect(fixtureModel(name).feedthrough).toHaveLength(n);
  });

  it("closed_loop: stage-2 producers into stage-2 consumers, no root input", () => {
    const edges = named("closed_loop");
    expect(edges).toContain("sensing/altimeter/y → pid_controller/h_ctl/y");
    expect(edges).toContain("selection/select_δt/y → actuators/δt_limiter/u");
    const m = fixtureModel("closed_loop");
    for (const e of m.feedthrough!) {
      expect(e.from.path).not.toBe("");
      expect(m.outputs!.components.find((c) => c.path === e.from.path)!.stage2).toContain(e.from.port);
    }
  });

  it("containers: the chain of gains, its root input adding none", () => {
    expect(named("containers")).toEqual([
      "gains/a/out → gains/b/e", "gains/b/out → pair/1/e", "pair/1/out → s1/e", "s1/out → s2/e", "s2/out → scale/e",
    ]);
  });

  it("gives none without outputs", () => {
    const m = fixtureModel("failure_cycle");
    expect(m.outputs).toBeUndefined();
    expect(feedthroughEdges(m.tree!, m.resolution!, undefined)).toEqual([]);
  });
});
