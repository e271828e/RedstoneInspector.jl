/// <reference types="node" />
// The test helper: the committed fixtures, read by name from frontend/fixtures/.
import { readFileSync, readdirSync } from "node:fs";
import { parseDescriptor } from "./loader";
import { loadModel, type Model } from "./model";

const dir = new URL("../../fixtures/", import.meta.url);

/** Every fixture's base name, sorted. */
export const fixtureNames = (): string[] =>
  readdirSync(dir).filter((f) => f.endsWith(".json")).map((f) => f.slice(0, -5)).sort();

/** The fixture's text. */
export const fixtureText = (name: string): string => readFileSync(new URL(`${name}.json`, dir), "utf8");

/** The fixture parsed, untyped. */
export const fixtureJson = (name: string): unknown => JSON.parse(fixtureText(name));

/** The schema copy, parsed. */
export const schemaJson = (): object => JSON.parse(readFileSync(new URL("../../schema/descriptor.json", import.meta.url), "utf8"));

/** The fixture loaded and built, through the loader and the model. */
export function fixtureModel(name: string): Model {
  const loaded = parseDescriptor(fixtureText(name), `${name}.json`);
  if (!loaded.ok) throw new Error(loaded.reason);
  return loadModel(loaded);
}
