// The feedthrough edges the execution order was computed over, derived as the
// core's `_feedthrough` derives them (descriptor_design.md answer 8).
import type { OutputsSection } from "./descriptor";
import { terminalProducer, type Face, type Resolution } from "./resolve";
import type { Tree } from "./tree";

export interface FeedthroughEdge {
  from: Face;
  to: Face;
}

/** For each leaf with a stage 2, in execution order, each input whose terminal producer is a stage-2 leaf output. */
export function feedthroughEdges(tree: Tree, res: Resolution, outputs: OutputsSection | undefined): FeedthroughEdge[] {
  if (!outputs) return [];
  const stage2 = new Map(outputs.components.map((c) => [c.path, c.stage2]));
  const edges: FeedthroughEdge[] = [];
  for (const path of outputs.order) {
    const node = tree.byPath.get(path);
    if (node?.class !== "leaf" || !stage2.get(path)?.length) continue;
    for (const f of node.inputs) {
      const to: Face = { path, side: "in", port: f.name };
      const t = terminalProducer(res, to);
      if (t?.end === "leaf-output" && stage2.get(t.face.path)?.includes(t.face.port)) edges.push({ from: t.face, to });
    }
  }
  return edges;
}
