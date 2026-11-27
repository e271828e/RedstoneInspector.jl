// Block sizes and port positions from measured text (visual_grammar.md answers
// 1 to 3 and 10). DOM: text is measured with a 2D canvas context, nothing else.
import type { Block, BlockSize, ChildBlock, EdgeLabel, Level, PortPosition } from "../lib/level";
import { eventsPill } from "../lib/events";
import { iconOf, type Icon } from "../lib/icons";
import type { Model } from "../lib/model";
import { ratePill } from "../lib/rates";
import { label } from "../lib/regions";
import type { Tree } from "../lib/tree";
import { labelledPorts, shortType } from "../lib/wires";

/** One system sans stack for the whole canvas, no bundled or web font. */
export const FONT_STACK = `system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif`;
export const SEGMENT_FONT = `600 12px ${FONT_STACK}`;
export const FACE_FONT = `11px ${FONT_STACK}`;
export const NAME_FONT = `11px ${FONT_STACK}`;
export const PIN_FONT = `12px ${FONT_STACK}`;
/** A wire's type label, and its line's height. */
export const LABEL_FONT = `9px ${FONT_STACK}`;
export const LABEL_HEIGHT = 11;
/** The badge pills' font: the rate pill, the order badge and the overlay's pills. */
export const BADGE_FONT = `9px ${FONT_STACK}`;
/**
 * The badge pill: its inset from the block's edge, its height and its text's side padding. The rate pill straddles
 * the top edge at the left, so it never covers the segment, which answer 10 never truncates, and the events pill
 * the top edge at the right (answer 11). The order badge straddles the bottom edge at the left, as far below as the
 * rate pill rises above, and the overlay's pills the same row, stacked leftward from the right end `BADGE_GAP`
 * apart. Nothing yields: an overlay pill draws over an order badge it meets (the second look's 2.3 and 2.4). A
 * block's size depends on the top edge's pills alone, and only where the events pill stands (`topPillsWidth`).
 */
export const BADGE_INSET = 4, BADGE_HEIGHT = 12, BADGE_PAD = 4, BADGE_TOP = -7, BADGE_GAP = 2;
/** A pill's width around its text: the rate pill's, the events pill's and the order badge's. */
export const pillWidth = (text: string): number => Math.ceil(textWidth(text, BADGE_FONT)) + 2 * BADGE_PAD;
/** The texts a child's top edge can carry: the rate pill's as rate mode draws it, and the events pill's. */
export interface TopPills {
  rate?: string;
  events?: string;
}
/**
 * The width the top edge's pills need with their insets and the gap between them (answer 11, the notes' C2): only a
 * block with the events pill reserves it, the rate pill counted whatever the mode, so the layout outlives a change of
 * mode; 0 for a block without the events pill, whose size the pills never set.
 */
export const topPillsWidth = (top: TopPills): number =>
  top.events === undefined ? 0 : 2 * BADGE_INSET + pillWidth(top.events) + (top.rate === undefined ? 0 : pillWidth(top.rate) + BADGE_GAP);

/** The display name's fixed width, past which it is cut with an ellipsis. */
export const DISPLAY_NAME_WIDTH = 120;
/** An icon's fixed width, standing in for the display name's in the sizing rule (visual_grammar.md answer 7). */
export const ICON_WIDTH = 44;
/** An icon's height, the second line's. */
export const ICON_HEIGHT = 12;
/** A `Constant`'s value text's width, past which it is cut, shorter than a display name (answer 10). */
export const CONSTANT_WIDTH = 60;
/**
 * The legibility floor (visual_grammar.md answer 10): the scales, screen pixels per world unit, below which a
 * text level drops, face names first, then the display name with its icon, the segment last. A first pass.
 */
export const FLOOR_FACES = 0.6;
export const FLOOR_NAMES = 0.4;
export const FLOOR_SEGMENTS = 0.25;
export type Detail = "full" | "no-faces" | "segments" | "frames";
/** The text levels drawn at a scale. */
export const detailAt = (scale: number): Detail =>
  scale >= FLOOR_FACES ? "full" : scale >= FLOOR_NAMES ? "no-faces" : scale >= FLOOR_SEGMENTS ? "segments" : "frames";
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
export const MIN_WIDTH = 60;
/** The gap between an input name and the output name on its row. */
export const GUTTER = 16;

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
const names = new Map<string, string>(), constants = new Map<string, string>();
/** The display name as drawn: whole when it fits the fixed width, else cut with an ellipsis. */
export const cutName = (name: string): string => cutText(names, name, NAME_FONT, DISPLAY_NAME_WIDTH);
/** A `Constant`'s value as drawn, cut at `CONSTANT_WIDTH`. */
export const cutConstant = (value: string): string => cutText(constants, value, NAME_FONT, CONSTANT_WIDTH);
/** An icon's width in the head term: `ICON_WIDTH`, or a wider `Constant`'s cut text's. */
export const iconWidth = (icon: Icon): number =>
  icon.id === "constant" ? Math.max(ICON_WIDTH, textWidth(cutConstant(icon.text!), NAME_FONT)) : ICON_WIDTH;

/** Whether a face of a primitive child is pinned. */
export function isPinned(tree: Tree, b: ChildBlock, side: "in" | "out", name: string): boolean {
  const n = tree.byPath.get(b.path);
  return n?.class === "primitive" && !!(side === "in" ? n.inputs : n.outputs).find((f) => f.name === name)?.pinned;
}

export function sizeBlock(b: Block, tree: Tree, rootLabel: string, top: TopPills = {}): BlockSize {
  if (b.role === "in" || b.role === "out") {
    const tag = b.role === "in" && b.rootInput;
    const width = Math.ceil(textWidth(b.name, PIN_FONT)) + 2 * PAD + (tag ? POINT + SLOT : 0) + (tag && b.pinned ? MARK : 0);
    const port: PortPosition = { side: b.role === "in" ? "out" : "in", name: b.name, x: b.role === "in" ? width : 0, y: PIN_HEIGHT / 2 };
    return { width, height: PIN_HEIGHT, ports: [port] };
  }
  const face = (side: "in" | "out", name: string | undefined) =>
    name === undefined ? 0 : textWidth(name, FACE_FONT) + (isPinned(tree, b, side, name) ? MARK : 0);
  const rows = Math.max(b.inputs.length, b.outputs.length, 1);
  let body = 0;
  for (let i = 0; i < rows; i++) body = Math.max(body, face("in", b.inputs[i]) + face("out", b.outputs[i]));
  const icon = iconOf(tree.byPath.get(b.path)!);
  const second = icon ? iconWidth(icon) : textWidth(cutName(b.displayName), NAME_FONT);
  const head = Math.max(textWidth(label(tree, b.path, rootLabel), SEGMENT_FONT), second);
  const width = Math.ceil(Math.max(MIN_WIDTH, head + 2 * PAD, body + 2 * PAD + GUTTER, topPillsWidth(top)));
  const row = (i: number) => HEADER + i * ROW + ROW / 2;
  return {
    width, height: HEADER + rows * ROW + FOOT,
    ports: [
      ...b.inputs.map((name, i): PortPosition => ({ side: "in", name, x: 0, y: row(i) })),
      ...b.outputs.map((name, i): PortPosition => ({ side: "out", name, x: width, y: row(i) })),
    ],
  };
}

/** A child's top edge pills' texts, whatever the mode. */
export const topPills = (model: Model, path: string): TopPills => ({ rate: ratePill(model, path)?.text, events: eventsPill(model, path)?.text });

/** Every block's size on a level, by block id. */
export const sizeLevel = (level: Level, model: Model): Map<string, BlockSize> =>
  new Map(level.blocks.map((b) => [b.id, sizeBlock(b, model.tree!, model.label, b.role === "in" || b.role === "out" ? {} : topPills(model, b.path))]));

/** Every type label on a level, by producer port id: its unqualified type whole, one line high; none for an unknown type. */
export function sizeLabels(model: Model, level: Level): Map<string, EdgeLabel> {
  const out = new Map<string, EdgeLabel>();
  for (const p of labelledPorts(model, level)) {
    const text = shortType(p.type);
    if (text) out.set(p.port, { text, width: Math.ceil(textWidth(text, LABEL_FONT)), height: LABEL_HEIGHT });
  }
  return out;
}
