import { describe, expect, it } from "vitest";
import { outputsOf, parseDescriptor, structureOf, type Loaded } from "./loader";
import { fixtureJson, fixtureNames, fixtureText } from "./fixtures";

const edit = (name: string, change: (d: any) => void): string => {
  const d = fixtureJson(name) as any;
  change(d);
  return JSON.stringify(d);
};
const loaded = (text: string, fileName?: string): Loaded => {
  const r = parseDescriptor(text, fileName);
  if (!r.ok) throw new Error(r.reason);
  return r;
};
const refusal = (text: string): string => {
  const r = parseDescriptor(text);
  if (r.ok) throw new Error("loaded");
  return r.reason;
};

describe("the fixtures", () => {
  it.each(fixtureNames())("%s loads with no note", (name) => {
    const r = loaded(fixtureText(name), `${name}.json`);
    expect(r.note).toBeUndefined();
    expect(r.descriptor.format_version).toEqual({ major: 1, minor: 0 });
  });

  it("labels aircraft by its file name, else by the root's display name", () => {
    expect(loaded(fixtureText("aircraft"), "aircraft.json").label).toBe("aircraft");
    expect(loaded(fixtureText("aircraft")).label).toBe("Group");
  });

  it.each(fixtureNames().filter((n) => n !== "aircraft"))("labels %s by its envelope name ahead of the file name", (name) => {
    expect(loaded(fixtureText(name), "renamed.json").label).toBe(name);
    expect(loaded(fixtureText(name)).label).toBe(name);
  });

  it("labels a nameless structureless failure by its kind with no file name", () => {
    const text = edit("failure_structure", (d) => delete d.name);
    expect(loaded(text).label).toBe("failure");
    expect(loaded(text, "f.json").label).toBe("f");
  });

  it("loads failure_structure with no structure and no outputs", () => {
    const d = loaded(fixtureText("failure_structure")).descriptor;
    expect(d.kind).toBe("failure");
    expect(structureOf(d)).toBeUndefined();
    expect(outputsOf(d)).toBeUndefined();
  });

  it("reads the sections of a build, a deployment and a failure", () => {
    for (const name of ["closed_loop", "closed_loop_deployment"]) {
      const d = loaded(fixtureText(name)).descriptor;
      expect(structureOf(d)?.nodes).toHaveLength(30);
      expect(outputsOf(d)?.order.length).toBeGreaterThan(0);
    }
    for (const [name, n] of [["failure_cycle", 3], ["failure_nested", 4], ["failure_dead", 4], ["failure_probe", 5]] as const) {
      const f = loaded(fixtureText(name)).descriptor;
      expect(structureOf(f)?.nodes).toHaveLength(n);
      expect(outputsOf(f)).toBeUndefined();
    }
  });
});

describe("the header check", () => {
  it("refuses another major version, naming both", () => {
    const reason = refusal(edit("descent", (d) => (d.format_version.major = 2)));
    expect(reason).toMatch(/format 2\.0\b/);
    expect(reason).toMatch(/format 1\.0\b/);
  });

  it("refuses a file with no format_version", () => {
    expect(refusal(edit("descent", (d) => delete d.format_version))).toMatch(/format_version/);
  });

  it("loads a newer minor version with a note", () => {
    const r = loaded(edit("descent", (d) => (d.format_version.minor = 1)));
    expect(r.note).toBe("format 1.1, newer than this page's 1.0; unknown fields ignored");
  });

  // the core's exact-arithmetic report, section 2.8: JSON.parse reads an integer into a float
  const ROUNDED = "an integer past 2⁵³; timing values may show rounded";
  // the digits go in as text, since JSON.stringify would write the float's
  const period = (den: string, minor = 0): string =>
    edit("rates", (d) => {
      d.format_version.minor = minor;
      d.build.structure.anchors[0].dt.den = "DEN";
    }).replace('"DEN"', den);
  it("loads an integer JSON.parse may round, 2^53 and up or its negative, with a note", () => {
    expect(period("2305843009213693951")).toContain('"den":2305843009213693951}');
    expect(loaded(period("2305843009213693951")).note).toBe(ROUNDED);
    expect(loaded(period("9007199254740992")).note).toBe(ROUNDED);
    expect(loaded(period("-9007199254740992")).note).toBe(ROUNDED);
  });

  it("loads 2^53 - 1, the last integer every neighbor of which is exact, with no note", () => {
    expect(loaded(period("9007199254740991")).note).toBeUndefined();
    expect(loaded(period("-9007199254740991")).note).toBeUndefined();
  });

  it("joins the newer minor version's note and the rounded integer's", () => {
    expect(loaded(period("2305843009213693951", 1)).note).toBe(`format 1.1, newer than this page's 1.0; unknown fields ignored · ${ROUNDED}`);
  });

  it("refuses text that is not JSON", () => {
    expect(refusal("{ not json")).toMatch(/not JSON/);
  });

  it("refuses an unknown kind, naming it", () => {
    expect(refusal(edit("descent", (d) => (d.kind = "simulation")))).toMatch(/"simulation"/);
  });

  it("refuses a missing body, naming its key", () => {
    expect(refusal(edit("descent", (d) => delete d.build))).toMatch(/no build body/);
  });

  it("refuses a null body as a missing one", () => {
    expect(refusal(edit("descent", (d) => (d.build = null)))).toMatch(/no build body/);
    expect(refusal(edit("closed_loop_deployment", (d) => (d.deployment = null)))).toMatch(/no deployment body/);
    expect(refusal(edit("failure_cycle", (d) => (d.failure = null)))).toMatch(/no failure body/);
  });

  it("refuses a build or a deployment without structure.nodes, and a failure whose structure lacks it, naming it", () => {
    expect(refusal(edit("descent", (d) => delete d.build.structure))).toMatch(/build\.structure\.nodes/);
    expect(refusal(edit("descent", (d) => delete d.build.structure.nodes))).toMatch(/build\.structure\.nodes/);
    expect(refusal(edit("closed_loop_deployment", (d) => delete d.deployment.build.structure)))
      .toMatch(/deployment\.build\.structure\.nodes/);
    expect(refusal(edit("failure_cycle", (d) => (d.failure.structure = {})))).toMatch(/failure\.structure\.nodes/);
  });

  it("accepts a failure with or without structure", () => {
    expect(loaded(edit("failure_cycle", (d) => delete d.failure.structure)).descriptor.kind).toBe("failure");
  });

  // deployment_overlay.md answer 2: a file an older core wrote, told by its structure
  const OLDER = ": an older Redstone wrote it. Write the file again with the current Redstone.";
  it("refuses a structure without grid, whatever the kind, naming the key and the older Redstone", () => {
    expect(refusal(edit("descent", (d) => delete d.build.structure.grid))).toBe(`This build descriptor has no build.structure.grid${OLDER}`);
    expect(refusal(edit("closed_loop_deployment", (d) => delete d.deployment.build.structure.grid)))
      .toBe(`This deployment descriptor has no deployment.build.structure.grid${OLDER}`);
    expect(refusal(edit("failure_cycle", (d) => delete d.failure.structure.grid))).toBe(`This failure descriptor has no failure.structure.grid${OLDER}`);
  });

  it("refuses a deployment without schedule, after the grid", () => {
    expect(refusal(edit("timing_deployment", (d) => delete d.deployment.schedule))).toBe(`This deployment descriptor has no deployment.schedule${OLDER}`);
    expect(refusal(edit("timing_deployment", (d) => {
      delete d.deployment.schedule;
      delete d.deployment.build.structure.grid;
    }))).toMatch(/no deployment\.build\.structure\.grid:/);
  });

  it("refuses a timing under the keys m and c, whatever the kind, after the grid and the schedule", () => {
    const rekeyed = (s: any) => {
      for (const n of s.nodes) if (n.timing) n.timing = { anchor: n.timing.anchor, m: n.timing.D, c: n.timing.phi };
    };
    expect(refusal(edit("rates", (d) => rekeyed(d.build.structure)))).toBe(`This build descriptor has no build.structure.nodes[].timing.D${OLDER}`);
    expect(refusal(edit("rates_deployment", (d) => rekeyed(d.deployment.build.structure))))
      .toBe(`This deployment descriptor has no deployment.build.structure.nodes[].timing.D${OLDER}`);
    expect(refusal(edit("failure_cycle", (d) => rekeyed(d.failure.structure)))).toBe(`This failure descriptor has no failure.structure.nodes[].timing.D${OLDER}`);
    expect(refusal(edit("rates_deployment", (d) => {
      rekeyed(d.deployment.build.structure);
      delete d.deployment.schedule;
    }))).toMatch(/no deployment\.schedule:/);
  });

  it("keeps the nodes refusal's words ahead of the grid's", () => {
    expect(refusal(edit("descent", (d) => {
      delete d.build.structure.nodes;
      delete d.build.structure.grid;
    }))).toBe("This build descriptor has no build.structure.nodes.");
  });

  it("loads a failure with no structure, which has nothing to check", () => {
    expect(loaded(fixtureText("failure_structure")).descriptor.kind).toBe("failure");
  });
});
