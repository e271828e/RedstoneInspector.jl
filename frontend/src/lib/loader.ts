// The header check, the refusal of a file an older core wrote and the label rule
// (workspace.md answer 10, deployment_overlay.md answer 2). The page validates
// nothing else at runtime.
import type { OutputsSection, RedstoneDescriptor, StructureSection } from "./descriptor";
import { MAJOR } from "./protocol";
import { displayName } from "./tree";

export interface Loaded {
  ok: true;
  descriptor: RedstoneDescriptor;
  label: string;
  /** Set when the file's minor version is newer than the page's, or when it holds an integer `JSON.parse` may round. */
  note?: string;
}
export interface Refusal {
  ok: false;
  reason: string;
}

const KINDS = ["build", "deployment", "failure"];

export function parseDescriptor(text: string, fileName?: string): Loaded | Refusal {
  const refuse = (reason: string): Refusal => ({ ok: false, reason });
  let d: any;
  // JSON.parse reads an integer into a float, exact only below 2^53 (Redstone.jl/design/reports/20261113_exact_arithmetic/report.md section 2.8).
  let rounded = false;
  try {
    d = JSON.parse(text, (_key, value) => {
      if (Number.isInteger(value) && !Number.isSafeInteger(value)) rounded = true;
      return value;
    });
  } catch (e) {
    return refuse(`This file is not JSON: ${(e as Error).message}.`);
  }
  const fv = d?.format_version;
  if (typeof fv?.major !== "number") return refuse(`This file carries no format_version; this page reads format ${MAJOR}.0.`);
  const minor = typeof fv.minor === "number" ? fv.minor : 0;
  if (fv.major !== MAJOR) {
    return refuse(`This file is in descriptor format ${fv.major}.${minor}, which this page cannot read; it reads format ${MAJOR}.0.`);
  }
  if (!KINDS.includes(d.kind)) {
    return refuse(`This file's kind is ${JSON.stringify(d.kind)}, none of build, deployment and failure.`);
  }
  if (typeof d[d.kind] !== "object" || d[d.kind] === null) return refuse(`This ${d.kind} descriptor has no ${d.kind} body.`);
  if (d.kind === "build" && !Array.isArray(d.build.structure?.nodes)) {
    return refuse("This build descriptor has no build.structure.nodes.");
  }
  if (d.kind === "deployment" && !Array.isArray(d.deployment.build?.structure?.nodes)) {
    return refuse("This deployment descriptor has no deployment.build.structure.nodes.");
  }
  if (d.kind === "failure" && d.failure.structure !== undefined && !Array.isArray(d.failure.structure?.nodes)) {
    return refuse("This failure descriptor has no failure.structure.nodes.");
  }
  // A file an older core wrote says 1.0 too, so its structure tells it (deployment_overlay.md answer 2).
  const older = (key: string) => refuse(`This ${d.kind} descriptor has no ${key}: an older Redstone wrote it. Write the file again with the current Redstone.`);
  const structure = d.kind === "build" ? d.build.structure : d.kind === "deployment" ? d.deployment.build.structure : d.failure.structure;
  const at = d.kind === "deployment" ? "deployment.build.structure" : `${d.kind}.structure`;
  if (structure !== undefined && (typeof structure.grid !== "object" || structure.grid === null)) return older(`${at}.grid`);
  if (d.kind === "deployment" && (typeof d.deployment.schedule !== "object" || d.deployment.schedule === null)) return older("deployment.schedule");
  // The core renamed a timing's `m` and `c` after it added `grid` and `schedule` (its D-478).
  if (structure?.nodes.some((n: any) => n.class === "primitive" && n.timing?.D === undefined)) return older(`${at}.nodes[].timing.D`);
  const descriptor = d as RedstoneDescriptor;
  const loaded: Loaded = { ok: true, descriptor, label: labelOf(descriptor, fileName) };
  const notes: string[] = [];
  if (minor > 0) notes.push(`format ${MAJOR}.${minor}, newer than this page's ${MAJOR}.0; unknown fields ignored`);
  if (rounded) notes.push("an integer past 2⁵³; timing values may show rounded");
  if (notes.length > 0) loaded.note = notes.join(" · ");
  return loaded;
}

/** The envelope name, else the file's base name, else the root's display name, else the kind word. */
function labelOf(d: RedstoneDescriptor, fileName?: string): string {
  if (typeof d.name === "string") return d.name;
  if (fileName !== undefined) return fileName.replace(/\.json$/, "");
  const root = structureOf(d)?.nodes.find((n) => n.path === "");
  return root ? displayName(root) : d.kind;
}

export async function fromFile(file: File): Promise<Loaded | Refusal> {
  return parseDescriptor(await file.text(), file.name);
}

/** The structure section, undefined for a structureless failure. */
export function structureOf(d: RedstoneDescriptor): StructureSection | undefined {
  if (d.kind === "build") return d.build.structure;
  if (d.kind === "deployment") return d.deployment.build.structure;
  return d.failure.structure;
}

/** The outputs section, undefined for any failure. */
export function outputsOf(d: RedstoneDescriptor): OutputsSection | undefined {
  if (d.kind === "build") return d.build.outputs;
  if (d.kind === "deployment") return d.deployment.build.outputs;
  return undefined;
}
