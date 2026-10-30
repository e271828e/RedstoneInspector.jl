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
    const f = loaded(fixtureText("failure_cycle")).descriptor;
    expect(structureOf(f)?.nodes).toHaveLength(3);
    expect(outputsOf(f)).toBeUndefined();
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

  it("refuses text that is not JSON", () => {
    expect(refusal("{ not json")).toMatch(/not JSON/);
  });

  it("refuses an unknown kind, naming it", () => {
    expect(refusal(edit("descent", (d) => (d.kind = "simulation")))).toMatch(/"simulation"/);
  });

  it("refuses a missing body, naming its key", () => {
    expect(refusal(edit("descent", (d) => delete d.build))).toMatch(/no build body/);
  });

  it("refuses a build or a deployment without structure.nodes, naming it", () => {
    expect(refusal(edit("descent", (d) => delete d.build.structure))).toMatch(/build\.structure\.nodes/);
    expect(refusal(edit("descent", (d) => delete d.build.structure.nodes))).toMatch(/build\.structure\.nodes/);
    expect(refusal(edit("closed_loop_deployment", (d) => delete d.deployment.build.structure)))
      .toMatch(/deployment\.build\.structure\.nodes/);
  });

  it("accepts a failure with or without structure", () => {
    expect(loaded(edit("failure_cycle", (d) => delete d.failure.structure)).descriptor.kind).toBe("failure");
  });
});
