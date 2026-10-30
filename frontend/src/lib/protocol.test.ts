import { describe, expect, it } from "vitest";
import { fixtureText } from "./fixtures";
import { backoff, classifyFrame, downloadName, helloMessage, openLocationMessage } from "./protocol";

describe("helloMessage", () => {
  it("names the tab parameter's channel and the major", () => {
    expect(helloMessage("?tab=loop")).toBe('{"type":"hello","channel":"loop","major":1}');
  });
  it("names the default channel without one", () => {
    expect(helloMessage("")).toBe('{"type":"hello","channel":"","major":1}');
  });
});

describe("openLocationMessage", () => {
  it("carries the file and the line", () => {
    expect(JSON.parse(openLocationMessage("/src/Plant.jl", 12))).toEqual({ type: "open_location", file: "/src/Plant.jl", line: 12 });
  });
});

describe("classifyFrame", () => {
  it("reads a fixture's text as a descriptor", () => {
    expect(classifyFrame(fixtureText("closed_loop"))).toBe("descriptor");
  });
  it("reads a hello as control", () => {
    expect(classifyFrame(helloMessage("?tab=loop"))).toBe("control");
  });
  it("reads an array and non-JSON as other", () => {
    expect(classifyFrame("[]")).toBe("other");
    expect(classifyFrame("nonsense")).toBe("other");
    expect(classifyFrame("null")).toBe("other");
    expect(classifyFrame("{}")).toBe("other");
  });
});

describe("backoff", () => {
  it("doubles from one second and caps at thirty", () => {
    expect([0, 1, 2].map(backoff)).toEqual([1000, 2000, 4000]);
    expect(backoff(10)).toBe(30000);
  });
});

describe("downloadName", () => {
  it("is the label with .json", () => {
    expect(downloadName("closed_loop")).toBe("closed_loop.json");
  });
});
