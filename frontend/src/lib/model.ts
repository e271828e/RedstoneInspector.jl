// Everything built once on load, from one loaded descriptor.
import type { OutputsSection, RedstoneDescriptor, StructureSection } from "./descriptor";
import { feedthroughEdges, type FeedthroughEdge } from "./feedthrough";
import { outputsOf, structureOf, type Loaded } from "./loader";
import { buildResolution, type Resolution } from "./resolve";
import { buildTree, type Tree } from "./tree";

export interface Model {
  descriptor: RedstoneDescriptor;
  label: string;
  kind: RedstoneDescriptor["kind"];
  note?: string;
  /** Undefined for a structureless failure, as are the tree, the resolution and the feedthrough edges. */
  structure?: StructureSection;
  /** Undefined for any failure. */
  outputs?: OutputsSection;
  tree?: Tree;
  resolution?: Resolution;
  feedthrough?: FeedthroughEdge[];
}

export function loadModel(loaded: Loaded): Model {
  const d = loaded.descriptor;
  const model: Model = { descriptor: d, label: loaded.label, kind: d.kind, note: loaded.note };
  const structure = structureOf(d);
  if (!structure) return model;
  const tree = buildTree(structure);
  const resolution = buildResolution(tree, structure);
  const outputs = outputsOf(d);
  return { ...model, structure, outputs, tree, resolution, feedthrough: feedthroughEdges(tree, resolution, outputs) };
}
