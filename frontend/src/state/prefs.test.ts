import { describe, expect, it } from "vitest";
import { BOUNDS, parsePrefs } from "./prefs.svelte";

const DEFAULTS = parsePrefs(null);

describe("parsePrefs", () => {
  it("yields the defaults on a missing entry, garbage and another version", () => {
    expect(DEFAULTS.version).toBe(1);
    expect(DEFAULTS.collapsed).toEqual({ tree: false, detail: false });
    for (const text of ["not json", "[]", "null", '{"version": 2, "sizes": {"tree": 300}}', '{"sizes": {"tree": 300}}']) {
      expect(parsePrefs(text), text).toEqual(DEFAULTS);
    }
  });

  it("reads a stored object's fields back", () => {
    const stored = { version: 1, sizes: { tree: 300, detail: 420, drawer: 150 }, collapsed: { tree: false, detail: true } };
    expect(parsePrefs(JSON.stringify(stored))).toEqual(stored);
  });

  it("keeps the defaults for a field missing or mistyped", () => {
    const p = parsePrefs(JSON.stringify({ version: 1, sizes: { tree: "wide" }, collapsed: { detail: 1 } }));
    expect(p).toEqual(DEFAULTS);
  });

  it("clamps a width out of range to the pane's bounds", () => {
    const p = parsePrefs(JSON.stringify({ version: 1, sizes: { tree: 5, detail: 99999, drawer: 120 } }));
    expect(p.sizes).toEqual({ tree: BOUNDS.tree[0], detail: BOUNDS.detail[1], drawer: 120 });
  });
});
