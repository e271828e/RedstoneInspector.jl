import { describe, expect, it } from "vitest";
import { fixtureModel } from "../lib/fixtures";
import { stepsOf, tripleKey, tripleOrder } from "../lib/rates";
import { palette, stepPair } from "./palette";

describe("stepPair", () => {
  it("gives the eight steps, then four colored extras, then the shared neutral from the thirteenth triple on", () => {
    const large = fixtureModel("large");
    const order = tripleOrder(large);
    expect(order).toHaveLength(43);
    const steps = stepsOf(large);
    const pairOf = (i: number) => stepPair(steps.get(tripleKey(order[i]))!);
    expect(order.slice(0, 8).map((_, i) => pairOf(i))).toEqual(palette.rate);
    expect(order.slice(8, 12).map((_, i) => pairOf(i + 8))).toEqual(palette.extras);
    for (let i = 12; i < 43; i++) expect(pairOf(i), `triple ${i + 1}`).toBe(palette.extra);
  });

  it("keeps the four extras' fills and strokes apart from each other, the steps and the shared neutral", () => {
    const fills = [...palette.rate, ...palette.extras, palette.extra].map((p) => p.fill);
    const strokes = [...palette.rate, ...palette.extras, palette.extra].map((p) => p.stroke);
    expect(new Set(fills).size).toBe(13);
    expect(new Set(strokes).size).toBe(13);
  });

  it("keeps rate mode's wire colors apart: the thirteen fills, the continuous wire's and the root inputs' gray", () => {
    const fills = [...palette.rate, ...palette.extras, palette.extra].map((p) => p.fill);
    expect(new Set([...fills, palette.continuousWire, palette.wire]).size).toBe(15);
  });
});
