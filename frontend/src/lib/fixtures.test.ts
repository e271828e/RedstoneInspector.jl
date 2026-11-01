// ajv over every fixture against the schema copy, then descriptor_design.md
// answer 16's content assertions on every structure.
import { describe, expect, it } from "vitest";
import Ajv from "ajv";
import type { RedstoneDescriptor, StructureSection } from "./descriptor";
import { fixtureJson, fixtureNames, schemaJson } from "./fixtures";

const names = fixtureNames();

it("finds the twelve fixtures", () => {
  expect(names).toHaveLength(12);
});

describe("ajv at default strictness", () => {
  // Strict mode refuses the schema: strictRequired trips on the `not` clauses.
  const validate = new Ajv({ allErrors: true }).compile(schemaJson());
  it.each(names)("%s validates", (name) => {
    const ok = validate(fixtureJson(name));
    expect(validate.errors ?? []).toEqual([]);
    expect(ok).toBe(true);
  });
});

function structureIn(d: RedstoneDescriptor): StructureSection | undefined {
  if (d.kind === "build") return d.build.structure;
  if (d.kind === "deployment") return d.deployment.build.structure;
  return d.failure.structure;
}

describe("content assertions", () => {
  const withStructure = names.filter((n) => structureIn(fixtureJson(n) as RedstoneDescriptor));
  it("finds eleven structures", () => expect(withStructure).toHaveLength(11));

  it.each(withStructure)("%s: endpoints resolve, types have rows, consumers are unique", (name) => {
    const s = structureIn(fixtureJson(name) as RedstoneDescriptor)!;
    const byPath = new Map(s.nodes.map((n) => [n.path, n]));
    const rows = new Set(s.types.map((t) => t.name));
    const errors: string[] = [];
    for (const n of s.nodes) {
      if (!rows.has(n.type)) errors.push(`no types row for ${n.type}`);
      if (n.class !== "assembly") continue;
      const consumers = new Set<string>();
      for (const w of n.wires) {
        // A boundary producer is one of the level's inputs, a boundary consumer one of its outputs.
        const from = w.from.path === n.path ? n.inputs : byPath.get(w.from.path)?.outputs;
        const to = w.to.path === n.path ? n.outputs : byPath.get(w.to.path)?.inputs;
        if (!from?.some((f) => f.name === w.from.port)) errors.push(`"${n.path}": no producer ${JSON.stringify(w.from)}`);
        if (!to?.some((f) => f.name === w.to.port)) errors.push(`"${n.path}": no consumer ${JSON.stringify(w.to)}`);
        const key = JSON.stringify(w.to);
        if (consumers.has(key)) errors.push(`"${n.path}": consumer ${key} twice`);
        consumers.add(key);
      }
    }
    expect(errors).toEqual([]);
  });
});
