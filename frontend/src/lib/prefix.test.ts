import { describe, expect, it } from "vitest";
import { keyName, pressPrefix, releasePrefix, type Prefix } from "./prefix";

const z: Prefix = { key: "z", held: true, used: false };
const tapped: Prefix = { key: "z", held: false, used: false };
const g: Prefix = { key: "g", held: false, used: false };

describe("keyName", () => {
  it("names a letter in lower case, in upper case with Shift, whatever Caps Lock says; a longer name as it is", () => {
    expect(keyName({ key: "g", shiftKey: false })).toBe("g");
    expect(keyName({ key: "G", shiftKey: true })).toBe("G");
    expect(keyName({ key: "G", shiftKey: false })).toBe("g");
    expect(keyName({ key: "g", shiftKey: true })).toBe("G");
    expect(keyName({ key: "Escape", shiftKey: true })).toBe("Escape");
  });
});

describe("pressPrefix", () => {
  it("starts on z, held, and on g, and on no other key", () => {
    expect(pressPrefix(undefined, "z")).toEqual({ next: z });
    expect(pressPrefix(undefined, "g")).toEqual({ next: g });
    for (const k of ["Z", "G", "j", "Escape", "Enter"]) expect(pressPrefix(undefined, k), k).toBeUndefined();
  });

  it("completes each prefix with the keys it knows and drops any other, the prefix gone either way", () => {
    for (const k of ["z", "h", "j", "k", "l", "i", "o"]) expect(pressPrefix(tapped, k), k).toEqual({ next: undefined, command: `z${k}` });
    for (const k of ["g", "t", "T"]) expect(pressPrefix(g, k), k).toEqual({ next: undefined, command: `g${k}` });
    for (const k of ["J", "ArrowDown", "Enter", "Tab", "g", "Escape"]) expect(pressPrefix(tapped, k), k).toEqual({ next: undefined });
    for (const k of ["G", "z", "j", "Escape"]) expect(pressPrefix(g, k), k).toEqual({ next: undefined });
  });

  it("goes on under a held z, dropping what it does not know, until Escape", () => {
    const used = { ...z, used: true };
    expect(pressPrefix(z, "j")).toEqual({ next: used, command: "zj" });
    expect(pressPrefix(used, "j")).toEqual({ next: used, command: "zj" });
    expect(pressPrefix(used, "y")).toEqual({ next: used });
    expect(pressPrefix(used, "Escape")).toEqual({ next: undefined });
  });

  it("ignores a repeat of z, with no prefix too, so the second z of zz held starts nothing", () => {
    expect(pressPrefix(z, "z", true)).toEqual({ next: z });
    expect(pressPrefix(undefined, "z", true)).toEqual({ next: undefined });
    expect(pressPrefix(tapped, "z")).toEqual({ next: undefined, command: "zz" });
  });

  it("leaves a modifier alone, so Shift reaches the T of gT", () => {
    for (const k of ["Shift", "Alt", "AltGraph", "CapsLock"]) expect(pressPrefix(g, k), k).toBeUndefined();
  });
});

describe("releasePrefix", () => {
  it("a z's release ends a hold a key came under, Shift down or not, and leaves one press waiting otherwise", () => {
    for (const k of ["z", "Z"]) {
      expect(releasePrefix({ ...z, used: true }, k), k).toBeUndefined();
      expect(releasePrefix(z, k), k).toEqual(tapped);
    }
    expect(releasePrefix(z, "j")).toEqual(z);
    expect(releasePrefix(tapped, "z")).toEqual(tapped);
    expect(releasePrefix(g, "z")).toEqual(g);
    expect(releasePrefix(undefined, "z")).toBeUndefined();
  });
});
