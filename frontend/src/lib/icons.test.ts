import { describe, expect, it } from "vitest";
import type { KindMarker, LeafNode, Node } from "./descriptor";
import { fixtureModel } from "./fixtures";
import { iconOf } from "./icons";

/** An inline leaf of a type, its one output of a kind. */
function leaf(type: string, extra: Partial<LeafNode> = {}, kind: KindMarker = { kind: "float" }): Node {
  return {
    path: "x", type, signature: type, parameters: [], class: "leaf", tier: "continuous",
    timing: { anchor: 0, m: 1, c: 0 }, inputs: [], outputs: [{ name: "y", type: "Float64", kind, pinned: false }], ...extra,
  };
}
const B = "Redstone.Blocks.";
const node = (fixture: string, path: string) => fixtureModel(fixture).tree!.byPath.get(path)!;

describe("iconOf", () => {
  it("maps every roster key to its id and kind", () => {
    const roster: [string, string, "text" | "glyph"][] = [
      ["SumJunction", "sum", "glyph"], ["Or", "or", "glyph"], ["And", "and", "glyph"],
      ["Pack", "pack", "glyph"], ["Unpack", "unpack", "glyph"],
      ["Integrator", "integrator", "text"], ["LimitedIntegrator", "limited-integrator", "glyph"],
      ["DiscreteIntegrator", "discrete-integrator", "glyph"],
      ["DiscreteLimitedIntegrator", "discrete-limited-integrator", "glyph"],
      ["UnitDelay", "unit-delay", "text"], ["Delay", "delay", "text"], ["FirstOrderLag", "lag", "text"],
      ["StateSpace", "state-space", "text"], ["DiscreteStateSpace", "state-space", "text"],
      ["DiscretizedStateSpace", "state-space", "text"], ["TransferFunction", "transfer-function", "text"],
      ["DiscreteTransferFunction", "transfer-function-z", "text"],
      ["DiscretizedTransferFunction", "transfer-function-z", "text"],
      ["Constant", "constant", "text"], ["Step", "step", "glyph"], ["Source", "source", "text"],
      ["GaussianWhiteNoise", "noise", "glyph"], ["Switch", "switch", "glyph"], ["Relay", "relay", "glyph"],
      ["RateLimiter", "rate-limiter", "glyph"], ["Freeze", "freeze", "glyph"], ["StopRequest", "stop", "glyph"],
      ["PID", "pid", "text"], ["DiscretePID", "pid", "text"], ["LQRTracker", "lqr", "text"],
      ["DiscreteLQRTracker", "lqr", "text"],
    ];
    expect(roster).toHaveLength(31);
    for (const [key, id, kind] of roster) {
      const i = iconOf(leaf(B + key, { parameters: [{ name: "value", value: "1.0" }] }));
      expect([key, i?.id, i?.kind]).toEqual([key, id, kind]);
    }
    const texts = ["Integrator", "UnitDelay", "FirstOrderLag", "StateSpace", "TransferFunction", "DiscreteTransferFunction", "Source", "PID", "LQRTracker"]
      .map((k) => iconOf(leaf(B + k))!.text);
    expect(texts).toEqual(["1/s", "z⁻¹", "1/(τs+1)", "ẋ=Ax+Bu", "N(s)/D(s)", "N(z)/D(z)", "f(t)", "PID", "LQR"]);
  });

  it("keys on the alias before the type, and gives a user type or an unaliased Junction none", () => {
    expect(iconOf(node("closed_loop", "sensing/altimeter"))?.id).toBe("sum");
    expect(node("closed_loop", "sensing/altimeter").type).toBe(`${B}Junction`);
    expect(iconOf(node("closed_loop", "lqr_controller/engaged"))).toBeUndefined();
    expect(iconOf(node("closed_loop", "lqr_controller/state_pack"))?.id).toBe("pack");
    expect(iconOf(node("closed_loop", "plant"))).toBeUndefined();
    expect(iconOf(leaf(`${B}Group`))).toBeUndefined();
    expect(iconOf(leaf("Main.Synthetic.Pack"))).toBeUndefined();
    expect(iconOf(node("library", "fn"))).toBeUndefined();
  });

  it("writes a Constant's value, its opened entries joined, and a frame glyph for an opaque output", () => {
    expect(iconOf(node("closed_loop", "pid_controller/free"))).toMatchObject({ id: "constant", kind: "text", text: "0" });
    expect(iconOf(node("closed_loop", "lqr_controller/free_pair"))?.text).toBe("Int8[0, 0]");
    expect(iconOf(node("kinds", "nt"))?.text).toBe("a=1.0, b=2.0");
    expect(iconOf(node("kinds", "fn"))).toMatchObject({ id: "constant-opaque", kind: "glyph" });
    expect(iconOf(node("kinds", "fn"))?.text).toBeUndefined();
  });

  it("reads Delay's K from the signature's integer type parameter", () => {
    expect(iconOf(leaf(`${B}Delay`, { signature: `${B}Delay{3, Float64}` }))?.text).toBe("z⁻³");
    expect(iconOf(leaf(`${B}Delay`, { signature: `${B}Delay{Float64, 12}` }))?.text).toBe("z⁻¹²");
    expect(iconOf(leaf(`${B}Delay`, { signature: `${B}Delay{Float64, K}` }))?.text).toBe("z⁻ᴷ");
    expect(iconOf(leaf(`${B}Delay`, { signature: `${B}Delay{StaticArraysCore.SVector{2, Float64}, 4}` }))?.text).toBe("z⁻⁴");
    expect(iconOf(node("library", "delay"))?.text).toBe("z⁻³");
  });

  it("gives descent's stop request its octagon", () => {
    expect(iconOf(node("descent", "stop"))).toMatchObject({ id: "stop", kind: "glyph" });
  });
});
