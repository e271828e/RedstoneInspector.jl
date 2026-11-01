// Block sizes and port positions from measured text (visual_grammar.md answers
// 1 to 3 and 10). DOM: text is measured with a 2D canvas context, nothing else.
import type { Block, BlockSize, ChildBlock, Level, PortPosition } from "../lib/level";
import type { Tree } from "../lib/tree";

/** One system sans stack for the whole canvas, no bundled or web font. */
export const FONT_STACK = `system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif`;
export const SEGMENT_FONT = `600 12px ${FONT_STACK}`;
export const FACE_FONT = `11px ${FONT_STACK}`;
export const NAME_FONT = `11px ${FONT_STACK}`;
export const PIN_FONT = `12px ${FONT_STACK}`;
/** A wire's type label. */
export const LABEL_FONT = `10px ${FONT_STACK}`;
/** Rate mode's badge in a block's top-right corner. */
export const BADGE_FONT = `9px ${FONT_STACK}`;

/** The display name's fixed width, past which it is cut with an ellipsis. */
export const DISPLAY_NAME_WIDTH = 120;
/** A wire type label's fixed width, past which it is cut with an ellipsis (visual_grammar.md answer 4). */
export const TYPE_LABEL_WIDTH = 140;
export const PAD = 8;
/** The two header lines: the segment, then the display name. */
export const HEADER = 36;
/** One row per face pair. */
export const ROW = 16;
/** Clear space under the last face row, inside a closed assembly's inner border. */
const FOOT = 6;
export const PORT = 6;
/** A pinned mark's width beside its name, the gap included. */
export const MARK = 8;
export const PIN_HEIGHT = 22;
/** A root tag's point, and the empty slot at its outer end. */
export const POINT = 9;
export const SLOT = POINT;
const MIN_WIDTH = 60;
/** The gap between an input name and the output name on its row. */
const GUTTER = 16;

let ctx: CanvasRenderingContext2D | null = null;
export function textWidth(s: string, font: string): number {
  ctx ??= document.createElement("canvas").getContext("2d");
  if (!ctx) return s.length * 7;
  ctx.font = font;
  return ctx.measureText(s).width;
}

/** A text whole when it fits the width in the font, else cut with an ellipsis; memoized per font and width. */
function cutText(cuts: Map<string, string>, s: string, font: string, width: number): string {
  let cut = cuts.get(s);
  if (cut !== undefined) return cut;
  cut = s;
  if (textWidth(s, font) > width) {
    let n = s.length;
    while (n > 0 && textWidth(s.slice(0, n) + "…", font) > width) n--;
    cut = s.slice(0, n) + "…";
  }
  cuts.set(s, cut);
  return cut;
}
const names = new Map<string, string>(), types = new Map<string, string>();
/** The display name as drawn: whole when it fits the fixed width, else cut with an ellipsis. */
export const cutName = (name: string): string => cutText(names, name, NAME_FONT, DISPLAY_NAME_WIDTH);
/** A wire's type label as drawn, cut at `TYPE_LABEL_WIDTH`. */
export const cutType = (type: string): string => cutText(types, type, LABEL_FONT, TYPE_LABEL_WIDTH);

/** Whether a face of a leaf child is pinned. */
export function isPinned(tree: Tree, b: ChildBlock, side: "in" | "out", name: string): boolean {
  const n = tree.byPath.get(b.path);
  return n?.class === "leaf" && !!(side === "in" ? n.inputs : n.outputs).find((f) => f.name === name)?.pinned;
}

export function sizeBlock(b: Block, tree: Tree): BlockSize {
  if (b.role === "in" || b.role === "out") {
    const tag = b.role === "in" && b.rootInput;
    const width = Math.ceil(textWidth(b.name, PIN_FONT)) + 2 * PAD + (tag ? POINT + SLOT : 0);
    const port: PortPosition = { side: b.role === "in" ? "out" : "in", name: b.name, x: b.role === "in" ? width : 0, y: PIN_HEIGHT / 2 };
    return { width, height: PIN_HEIGHT, ports: [port] };
  }
  const face = (side: "in" | "out", name: string | undefined) =>
    name === undefined ? 0 : textWidth(name, FACE_FONT) + (isPinned(tree, b, side, name) ? MARK : 0);
  const rows = Math.max(b.inputs.length, b.outputs.length, 1);
  let body = 0;
  for (let i = 0; i < rows; i++) body = Math.max(body, face("in", b.inputs[i]) + face("out", b.outputs[i]));
  const head = Math.max(textWidth(b.segment, SEGMENT_FONT), textWidth(cutName(b.displayName), NAME_FONT));
  const width = Math.ceil(Math.max(MIN_WIDTH, head + 2 * PAD, body + 2 * PAD + GUTTER));
  const row = (i: number) => HEADER + i * ROW + ROW / 2;
  return {
    width, height: HEADER + rows * ROW + FOOT,
    ports: [
      ...b.inputs.map((name, i): PortPosition => ({ side: "in", name, x: 0, y: row(i) })),
      ...b.outputs.map((name, i): PortPosition => ({ side: "out", name, x: width, y: row(i) })),
    ],
  };
}

/** Every block's size on a level, by block id. */
export const sizeLevel = (level: Level, tree: Tree): Map<string, BlockSize> =>
  new Map(level.blocks.map((b) => [b.id, sizeBlock(b, tree)]));
