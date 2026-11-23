// A deployment's timing as data (deployment_overlay.md answers 3, 5, 6, 8 to 11
// and 13): exact fractions over BigInt and their printed form, the schedule's
// rows joined to the nodes, the timing tab's tables, head list and grid report,
// the steps per frame, the hyperperiod and the joint period, the chart's rows and
// fit, the pane's frames table with its chain line, and the legend's line text.
// The page reads no float from the file and multiplies none. Pure.
import type { Node, RateLink, Rational, StructureSection, Timing } from "./descriptor";
import type { Model } from "./model";
import { stepsOf, tripleKey, type Triple } from "./rates";

// --- exact fractions ---------------------------------------------------------

/** An exact fraction, in lowest terms, its denominator positive. */
export interface Q {
  n: bigint;
  d: bigint;
}

const abs = (a: bigint) => (a < 0n ? -a : a);
export const gcd = (a: bigint, b: bigint): bigint => (b === 0n ? abs(a) : gcd(b, a % b));
export const lcm = (a: bigint, b: bigint): bigint => (a === 0n || b === 0n ? 0n : abs(a / gcd(a, b) * b));

export function q(n: bigint | number, d: bigint | number = 1n): Q {
  let [N, D] = [BigInt(n), BigInt(d)];
  if (D < 0n) [N, D] = [-N, -D];
  const g = gcd(N, D) || 1n;
  return { n: N / g, d: D / g };
}
export const fromRational = (r: Rational): Q => q(r.num, r.den);
export const mul = (a: Q, b: Q): Q => q(a.n * b.n, a.d * b.d);
export const div = (a: Q, b: Q): Q => q(a.n * b.d, a.d * b.n);
export const add = (a: Q, b: Q): Q => q(a.n * b.d + b.n * a.d, a.d * b.d);
export const isWhole = (a: Q): boolean => a.d === 1n;
export const lt = (a: Q, b: Q): boolean => a.n * b.d < b.n * a.d;
export const floorQ = (a: Q): bigint => (a.n >= 0n ? a.n / a.d : -((-a.n + a.d - 1n) / a.d));
export const ceilQ = (a: Q): bigint => -floorQ(q(-a.n, a.d));
/** The least common multiple of two positive fractions: lcm of the numerators over gcd of the denominators. */
export const lcmQ = (a: Q, b: Q): Q => q(lcm(a.n, b.n), gcd(a.d, b.d));
/** A fraction as a float, for a pixel position alone. */
export const toNumber = (a: Q): number => Number(a.n) / Number(a.d);

/** Seconds as the page prints them: `0`, `1/50 s`, `3 s`. */
export const seconds = (a: Q): string => (a.n === 0n ? "0" : a.d === 1n ? `${a.n} s` : `${a.n}/${a.d} s`);
/** A count of the symbolic base tick, a build's `A₀` seconds: `0`, `Δt_base`, `2·Δt_base`. */
export const baseMultiple = (k: number | bigint): string => (BigInt(k) === 0n ? "0" : BigInt(k) === 1n ? "Δt_base" : `${k}·Δt_base`);
/** A fraction as Julia prints a `Rational`, `1//50`, for the chain line as `show` spells it. */
export const julia = (a: Q): string => `${a.n}//${a.d}`;

// --- names -------------------------------------------------------------------

const SUBSCRIPTS = "₀₁₂₃₄₅₆₇₈₉";
const SUPERSCRIPTS = "⁰¹²³⁴⁵⁶⁷⁸⁹";
export const subscript = (k: number): string => [...String(k)].map((c) => SUBSCRIPTS[+c]).join("");
const superscript = (p: number): string => (p === 1 ? "" : [...String(p)].map((c) => SUPERSCRIPTS[+c]).join(""));
/** `A₂`. */
export const anchorName = (k: number): string => `A${subscript(k)}`;
/** `A₂ (fast)` by the declaring key, `A₀ (base)` for the base grid. */
export const anchorLabel = (s: StructureSection, k: number): string => `${anchorName(k)} (${k === 0 ? "base" : s.anchors[k - 1].key})`;
/** A scope's path as the tables read it, `the root` for "". */
export const scopeName = (path: string): string => (path === "" ? "the root" : path);
/** The tooltip of `Aₖ (key)`: the declaring key and scope, `fast at the root`; `the base grid` for `A₀`. */
export const anchorTitle = (s: StructureSection, k: number): string =>
  k === 0 ? "the base grid" : `${s.anchors[k - 1].key} at ${scopeName(s.anchors[k - 1].scope)}`;

// --- the deployment ------------------------------------------------------------

/** What binding fixed: the base tick and the frame, exact, and each anchor's `(Dₖ, Φₖ)`, `A₀` at `(1, 0)` first. */
export interface Bound {
  base: Q;
  frame: Q;
  hMax: Q;
  hMin?: Q;
  anchors: { D: number; phi: number }[];
}

export function boundOf(model: Model): Bound | undefined {
  const d = model.descriptor;
  if (d.kind !== "deployment") return undefined;
  const b = d.deployment;
  return {
    base: fromRational(b.dt_base), frame: fromRational(b.dt_frame), hMax: fromRational(b.h_max),
    hMin: b.h_min && fromRational(b.h_min), anchors: [{ D: 1, phi: 0 }, ...b.schedule.anchors],
  };
}

/** The schedule's rows joined to their nodes by path (answer 5), relying on no order; empty for a build. */
export function scheduleRows(model: Model): Map<string, { D: number; phi: number }> {
  const d = model.descriptor;
  return new Map(d.kind === "deployment" ? d.deployment.schedule.rows.map((r) => [r.path, { D: r.D, phi: r.phi }]) : []);
}

const scopeKey = (path: string, key: string) => `${path}\u0000${key}`;
/** The schedule's scope rows joined to `structure.scopes` by path and key; empty for a build. */
export function scheduleScopes(model: Model): Map<string, { D: number; phi: number }> {
  const d = model.descriptor;
  return new Map(d.kind === "deployment" ? d.deployment.schedule.scopes.map((r) => [scopeKey(r.path, r.key), { D: r.D, phi: r.phi }]) : []);
}
export const scopeRowOf = (model: Model, path: string, key: string) => scheduleScopes(model).get(scopeKey(path, key));

/** Whether a row with these counts splits frames (answer 9): `Δt_frame` fails to divide `D·Δt_base` or `Φ·Δt_base`. */
export const splitsFrames = (D: number, phi: number, bound: Bound): boolean =>
  !isWhole(div(mul(q(D), bound.base), bound.frame)) || !isWhole(div(mul(q(phi), bound.base), bound.frame));

/** A timing's seconds pair: a build's on `A₀` symbolic, every other exact. */
function secondsPair(s: StructureSection, t: Timing, bound?: Bound, counts?: { D: number; phi: number }): { dt: string; tau: string } {
  if (bound && counts) return { dt: seconds(mul(q(counts.D), bound.base)), tau: seconds(mul(q(counts.phi), bound.base)) };
  if (t.anchor === 0) return { dt: baseMultiple(t.m), tau: baseMultiple(t.c) };
  const a = s.anchors[t.anchor - 1], dt = fromRational(a.dt);
  return { dt: seconds(mul(q(t.m), dt)), tau: seconds(add(fromRational(a.tau), mul(q(t.c), dt))) };
}

// --- the timing tab's tables (answer 9) ----------------------------------------

/** An anchors table row: the base grid first. A pool entry's factor stands beside its value; a deployment adds `Dₖ`, `Φₖ`. */
export interface AnchorTableRow {
  index: number;
  label: string;
  dt: string;
  tau: string;
  /** The period's pool factor, on every anchor but `A₀`. */
  dtFactor?: number;
  /** The offset's pool factor, on an anchor with a nonzero `τₖ`. */
  tauFactor?: number;
  D?: number;
  phi?: number;
  /** The declaring scope, `""` for the root; undefined for `A₀`. */
  scope?: string;
  key?: string;
}

export function anchorTable(model: Model): AnchorTableRow[] {
  const s = model.structure;
  if (!s) return [];
  const bound = boundOf(model);
  const factor = (k: number, kind: "period" | "offset") => s.grid.pool.find((e) => e.anchor === k && e.kind === kind)?.factor;
  return [
    { index: 0, label: anchorLabel(s, 0), dt: bound ? seconds(bound.base) : "Δt_base", tau: "0", ...(bound && { D: 1, phi: 0 }) },
    ...s.anchors.map((a, i): AnchorTableRow => ({
      index: i + 1, label: anchorLabel(s, i + 1), dt: seconds(fromRational(a.dt)), tau: seconds(fromRational(a.tau)),
      dtFactor: factor(i + 1, "period"), tauFactor: factor(i + 1, "offset"),
      ...(bound && bound.anchors[i + 1]), scope: a.scope, key: a.key,
    })),
  ];
}

/** A component's or a scope's row in the notation's columns: `k`, `m`, `c`, a deployment's `D`, `Φ`, then `Δt`, `τ`. */
export interface TimingRow {
  path: string;
  /** A scope's key; undefined on a component. */
  key?: string;
  triple: Triple;
  anchor: string;
  m: number;
  c: number;
  D?: number;
  phi?: number;
  dt: string;
  tau: string;
  /** Whether the row splits frames, on a deployment. */
  splits?: boolean;
}

function timingRow(s: StructureSection, path: string, t: Timing, bound?: Bound, counts?: { D: number; phi: number }, key?: string): TimingRow {
  return {
    path, ...(key !== undefined && { key }), triple: [t.anchor, t.m, t.c], anchor: anchorLabel(s, t.anchor), m: t.m, c: t.c,
    ...(bound && counts && { D: counts.D, phi: counts.phi, splits: splitsFrames(counts.D, counts.phi, bound) }),
    ...secondsPair(s, t, bound, counts),
  };
}

/**
 * Every discrete primitive in walk order, joined to its schedule row on a deployment; with `byPeriod` in the palette's
 * order of their triples (`tripleOrder`: anchor 0 first, then period ascending), equal triples in walk order.
 */
export function componentTable(model: Model, byPeriod = false): TimingRow[] {
  const s = model.structure;
  if (!s) return [];
  const bound = boundOf(model), rows = scheduleRows(model);
  const out = s.nodes.flatMap((n) => (n.class === "primitive" && n.tier === "discrete" ? [timingRow(s, n.path, n.timing, bound, rows.get(n.path))] : []));
  if (!byPeriod) return out;
  const steps = stepsOf(model);
  return out.sort((a, b) => steps.get(tripleKey(a.triple))! - steps.get(tripleKey(b.triple))!);
}

/** Every rate scope in `structure.scopes`' order, the key after the path, joined by path and key on a deployment. */
export function scopeTable(model: Model): TimingRow[] {
  const s = model.structure;
  if (!s) return [];
  const bound = boundOf(model), rows = scheduleScopes(model);
  return s.scopes.map((x) => timingRow(s, x.path, x.timing, bound, rows.get(scopeKey(x.path, x.key)), x.key));
}

// --- the grid report (answers 6 and 9) ------------------------------------------

/** The line above the anchors table: a build's coarsest admissible tick, or a deployment's `Δt_base` against it. */
export function coarsestLine(model: Model): string | undefined {
  const g = model.structure?.grid;
  if (!g?.admissible) return undefined;
  const admissible = fromRational(g.admissible), bound = boundOf(model);
  if (!bound) return `coarsest admissible Δt_base: ${seconds(admissible)}`;
  const k = div(admissible, bound.base);
  return `Δt_base: ${seconds(bound.base)}, the coarsest admissible` + (k.n === 1n && k.d === 1n ? "" : ` ${seconds(admissible)} divided by ${k.n}`);
}

/** A supplier of a prime power: a pool entry named by its anchor and its kind, `Δt₂ (fast)`, `τ₁ (staggered)`. */
export interface Supplier {
  anchor: number;
  kind: "period" | "offset";
  text: string;
}
export interface PrimeAttribution {
  /** `2²`, `3`, `1000003 unfactored`. */
  power: string;
  /** A cofactor the writer left unfactored. */
  unfactored: boolean;
  suppliers: Supplier[];
}
/** The report under the anchors table: the alternatives' lines, then the denominator's factors and one row per prime power. */
export interface GridReport {
  alternatives: string[];
  /** `primes: 300 = 2²·3·5²`; undefined on a whole-second grid. */
  primes?: string;
  attribution: PrimeAttribution[];
}

export function gridReport(model: Model): GridReport | undefined {
  const s = model.structure, g = s?.grid;
  if (!s || !g?.admissible) return undefined;
  const admissible = fromRational(g.admissible);
  const alternatives = g.pool.flatMap((e) => e.alternatives
    ? [`${anchorLabel(s, e.anchor)}: declaring τ${subscript(e.anchor)} = ${e.alternatives.map((a) => seconds(fromRational(a))).join(" or ")} keeps ${seconds(mul(q(e.factor), admissible))}`]
    : []);
  const powers = g.primes.map((p) => (p.unfactored ? `${p.prime} unfactored` : `${p.prime}${superscript(p.power)}`));
  const attribution = g.primes.map((p, i): PrimeAttribution => ({
    power: powers[i],
    unfactored: !!p.unfactored,
    suppliers: p.suppliers.map((j) => {
      const e = g.pool[j - 1];
      return { anchor: e.anchor, kind: e.kind, text: `${e.kind === "period" ? "Δt" : "τ"}${subscript(e.anchor)} (${s.anchors[e.anchor - 1].key})` };
    }),
  }));
  return { alternatives, ...(powers.length && { primes: `primes: ${admissible.d} = ${powers.join("·")}` }), attribution };
}

// --- the head list and the steps per frame (answer 9) ----------------------------

export interface Steps {
  /** `steps per frame`, or `steps per unsplit frame` where some row splits. */
  label: string;
  /** `1`, or a proposing method's `2 to 5, as proposed`. */
  value: string;
  /** The rows that split frames, in walk order. */
  splitting: string[];
}

export function stepsPerFrame(model: Model): Steps | undefined {
  const bound = boundOf(model), d = model.descriptor;
  if (!bound || d.kind !== "deployment") return undefined;
  const lower = ceilQ(div(bound.frame, bound.hMax));
  const upper = d.deployment.algorithm.proposes && bound.hMin ? floorQ(div(bound.frame, bound.hMin)) : undefined;
  const value = upper === undefined ? `${lower}` : `${lower} to ${upper > lower ? upper : lower}, as proposed`;
  const splitting = d.deployment.schedule.rows.filter((r) => splitsFrames(r.D, r.phi, bound)).map((r) => r.path);
  return { label: splitting.length ? "steps per unsplit frame" : "steps per frame", value, splitting };
}

export interface HeadItem {
  /** The symbol or name: `Δt_frame`, `Δt_base`, `h_max`, `h_min`, `algorithm`, `attempt_budget`, then the steps' label. */
  label: string;
  value: string;
}

/** The head list of a deployment's tab; the three event parameters wait for 10b. Undefined for a build. */
export function headList(model: Model): HeadItem[] | undefined {
  const bound = boundOf(model), d = model.descriptor, steps = stepsPerFrame(model);
  if (!bound || d.kind !== "deployment" || !steps) return undefined;
  return [
    { label: "Δt_frame", value: seconds(bound.frame) },
    { label: "Δt_base", value: seconds(bound.base) },
    { label: "h_max", value: seconds(bound.hMax) },
    ...(bound.hMin ? [{ label: "h_min", value: seconds(bound.hMin) }] : []),
    { label: "algorithm", value: d.deployment.algorithm.text },
    { label: "attempt_budget", value: `${d.deployment.attempt_budget}` },
    { label: steps.label, value: steps.value + (steps.splitting.length ? `; the rows that split frames: ${steps.splitting.join(", ")}` : "") },
  ];
}

// --- the hyperperiod and the chart (answers 8 and 11) ----------------------------

/** The least common multiple of the rows' `D`, in base ticks; undefined for a build or a deployment with no rows. */
export function hyperperiod(model: Model): bigint | undefined {
  const d = model.descriptor;
  if (d.kind !== "deployment" || !d.deployment.schedule.rows.length) return undefined;
  return d.deployment.schedule.rows.reduce((h, r) => lcm(h, BigInt(r.D)), 1n);
}

/** The span the chart draws: the least common multiple of the hyperperiod and `Δt_frame` taken in time. */
export interface JointPeriod {
  hyperperiod: bigint;
  /** The hyperperiod in seconds. */
  hyperSeconds: Q;
  seconds: Q;
  baseTicks: bigint;
  frames: bigint;
  /** A frame in base ticks, `Δt_frame / Δt_base`: frame top `j` stands at `j·frameInTicks` base ticks. */
  frameInTicks: Q;
}

export function jointPeriod(model: Model): JointPeriod | undefined {
  const bound = boundOf(model), H = hyperperiod(model);
  if (!bound || H === undefined) return undefined;
  const hyperSeconds = mul(q(H), bound.base), span = lcmQ(hyperSeconds, bound.frame);
  return { hyperperiod: H, hyperSeconds, seconds: span, baseTicks: div(span, bound.base).n, frames: div(span, bound.frame).n, frameInTicks: div(bound.frame, bound.base) };
}

/** The frame tops: drawn only where some base tick is not one; otherwise the caption and the frames in one base tick. */
export interface FrameLines {
  drawn: boolean;
  /** `Δt_base / Δt_frame` where it is whole, the lines then not drawn. */
  framesPerTick?: bigint;
  /** The caption where no line is drawn: `every base tick is a frame top: 1 frame in one base tick`. */
  caption?: string;
}

export function frameLines(model: Model): FrameLines | undefined {
  const bound = boundOf(model);
  if (!bound || hyperperiod(model) === undefined) return undefined;
  const k = div(bound.base, bound.frame);
  if (!isWhole(k)) return { drawn: true };
  return { drawn: false, framesPerTick: k.n, caption: `every base tick is a frame top: ${k.n} frame${k.n === 1n ? "" : "s"} in one base tick` };
}

/** A swatch on a chart row: a triple that lands there, with its legend key and palette step. */
export interface ChartSwatch {
  triple: Triple;
  key: string;
  step: number;
}
/** A chart row: everything that ticks together, its swatches in palette order, its count and whether it splits frames. */
export interface ChartRow {
  D: number;
  phi: number;
  /** `D 2 · Φ 1`. */
  label: string;
  swatches: ChartSwatch[];
  count: number;
  /** `1 primitive`, `9 primitives`. */
  countText: string;
  splits: boolean;
  /** Whether base tick `k` (from 0) is due: `k mod D = Φ`. */
  due: (k: bigint) => boolean;
}

/** One row per distinct `(D, Φ)`, fastest first by `D` then `Φ`; empty for a build or no rows. */
export function chartRows(model: Model): ChartRow[] {
  const bound = boundOf(model), d = model.descriptor, tree = model.tree;
  if (!bound || d.kind !== "deployment" || !tree) return [];
  const steps = stepsOf(model);
  const rows = new Map<string, ChartRow>();
  for (const r of d.deployment.schedule.rows) {
    const n = tree.byPath.get(r.path) as Extract<Node, { class: "primitive" }>;
    const triple: Triple = [n.timing.anchor, n.timing.m, n.timing.c];
    const k = `${r.D},${r.phi}`;
    if (!rows.has(k)) {
      const D = BigInt(r.D), phi = BigInt(r.phi);
      rows.set(k, { D: r.D, phi: r.phi, label: `D ${r.D} · Φ ${r.phi}`, swatches: [], count: 0, countText: "", splits: splitsFrames(r.D, r.phi, bound), due: (t) => t % D === phi });
    }
    const row = rows.get(k)!;
    row.count++;
    if (!row.swatches.some((x) => x.key === tripleKey(triple))) row.swatches.push({ triple, key: tripleKey(triple), step: steps.get(tripleKey(triple))! });
  }
  return [...rows.values()]
    .map((r) => ({ ...r, swatches: r.swatches.sort((a, b) => a.step - b.step), countText: `${r.count} primitive${r.count === 1 ? "" : "s"}` }))
    .sort((a, b) => a.D - b.D || a.phi - b.phi);
}

/** The hyperperiod as the tab states it (answer 8): `hyperperiod: 10 base ticks, 1/10 s`. */
export const hyperperiodLine = (joint: JointPeriod): string =>
  `hyperperiod: ${joint.hyperperiod} base ticks, ${seconds(joint.hyperSeconds)}`;

/** The span the chart draws where it outlasts the hyperperiod (answer 11); undefined where the two are equal. */
export const jointLine = (joint: JointPeriod): string | undefined =>
  joint.baseTicks === joint.hyperperiod
    ? undefined
    : `the chart spans the joint period with Δt_frame: ${seconds(joint.seconds)}, ${joint.baseTicks} base ticks, ${joint.frames} frames`;

/** The chart's constants, the look pass's (answer 11): the threshold in units of the span, the minimum pitch in px. */
export const CHART_THRESHOLD = 1000;
export const CHART_PITCH = 6;

/** How the timeline is drawn: omitted past the threshold, else fitted to the width or scrolled at the minimum pitch. */
export type ChartFit =
  | { kind: "omitted"; line: string }
  | {
      kind: "fit" | "scroll";
      /** The finer of the base tick and the frame, which the minimum pitch applies to. */
      finer: "base tick" | "frame";
      /** The finer unit's count over the span. */
      units: bigint;
      /** Pixels per base tick. */
      tickPx: number;
      /** The timeline's width in pixels. */
      width: number;
    };

/**
 * The threshold and pitch decision (answer 11, ruling 9): past `threshold` base ticks or frame tops over the joint
 * period the timeline is omitted with one line of its length; else the finer unit gets `width / units` pixels when
 * that reaches `pitch`, and `pitch` otherwise, the timeline then scrolling sideways.
 */
export function chartFit(joint: JointPeriod, width: number, threshold = CHART_THRESHOLD, pitch = CHART_PITCH): ChartFit {
  const limit = BigInt(threshold);
  if (joint.baseTicks > limit || joint.frames > limit) {
    return { kind: "omitted", line: `chart omitted: the joint period is ${joint.baseTicks} base ticks, ${seconds(joint.seconds)}` };
  }
  const frameFiner = lt(joint.frameInTicks, q(1));
  const units = frameFiner ? joint.frames : joint.baseTicks;
  const fitted = width / Number(units);
  const unitPx = fitted >= pitch ? fitted : pitch;
  // a frame is `frameInTicks` base ticks, so a frame's pitch is that many ticks' pixels
  const tickPx = frameFiner ? unitPx / toNumber(joint.frameInTicks) : unitPx;
  return { kind: fitted >= pitch ? "fit" : "scroll", finer: frameFiner ? "frame" : "base tick", units, tickPx, width: tickPx * Number(joint.baseTicks) };
}

/** A timeline the chart draws, fitted or scrolled. */
export type DrawnFit = Exclude<ChartFit, { kind: "omitted" }>;
/** The timeline's margin at each end in px, so a mark at the span's ends is whole. */
export const CHART_PAD = 4;
/** Base tick `k`'s x on a drawn timeline: `k` pitches in from the margin. */
export const tickX = (k: bigint, fit: DrawnFit): number => CHART_PAD + Number(k) * fit.tickPx;
/** Frame top `j`'s x: `j·Δt_frame / Δt_base` base ticks in, which can fall between two ticks. */
export const frameTopX = (j: bigint, joint: JointPeriod, fit: DrawnFit): number =>
  CHART_PAD + toNumber(mul(q(j), joint.frameInTicks)) * fit.tickPx;
/** The base ticks of the span where a chart row is due: `Φ`, `Φ + D`, and on. */
export function dueTicks(row: ChartRow, joint: JointPeriod): bigint[] {
  const out: bigint[] = [];
  for (let k = BigInt(row.phi); k < joint.baseTicks; k += BigInt(row.D)) out.push(k);
  return out;
}

/** The notation's law (answer 3), the timing tab's caption: each line's frame and its two equations. */
export const EQUATIONS: { frame: string; period: string; phase: string }[] = [
  { frame: "in seconds", period: "Δt = m · Δtₖ", phase: "τ = τₖ + c · Δtₖ" },
  { frame: "in base ticks", period: "D = m · Dₖ", phase: "Φ = Φₖ + c · Dₖ" },
  { frame: "linked by", period: "Δtₖ = Dₖ · Δt_base", phase: "τₖ = Φₖ · Δt_base" },
  { frame: "hence", period: "Δt = D · Δt_base", phase: "τ = Φ · Δt_base" },
];

// --- the pane's frames table (answer 10) -----------------------------------------

/** One frame of answer 3: its head, its period and phase cells, its unit; `opens` replaces the pair on a scope row. */
export interface FramesRow {
  frame: "scope" | "anchor" | "base grid" | "seconds";
  /** The scope's or the anchor's name: `fast/outer`, `the root`, `A₂ (fast)`; empty on the last two. */
  name: string;
  period: string;
  phase: string;
  /** `ticks of fast/outer`, `ticks of A₂`, `base ticks`; empty on seconds. */
  unit: string;
  /** On the scope row of a component that opens its own anchor: `opens A₁ at the root`. */
  opens?: string;
}
export interface FramesTable {
  rows: FramesRow[];
}

/** Each frame's tooltip: its pair and unit, answer 3's table. */
export const FRAME_TITLES: Record<FramesRow["frame"], string> = {
  scope: "Its rate scope: K and φ in ticks of the enclosing scope, as declared",
  anchor: "Its anchor: m and c in ticks of anchor k",
  "base grid": "The base grid: D and Φ in base ticks, the deployment's",
  seconds: "Seconds: Δt and τ",
};

/** The nearest strict ancestor with a scope row, by the tree's parent rule, with its timing; the root at `(1, 0)` on `A₀`. */
function enclosingScope(model: Model, path: string): { path: string; timing: Timing } {
  const s = model.structure!, tree = model.tree!;
  for (let p = tree.parent.get(path); p !== undefined; p = tree.parent.get(p)) {
    const x = s.scopes.find((y) => y.path === p);
    if (x) return { path: p, timing: x.timing };
  }
  return { path: "", timing: { anchor: 0, m: 1, c: 0 } };
}

function framesRows(model: Model, path: string, t: Timing, counts?: { D: number; phi: number }): FramesRow[] {
  const s = model.structure!, bound = boundOf(model);
  const enc = enclosingScope(model, path);
  const rows: FramesRow[] = [];
  if (t.anchor !== enc.timing.anchor) {
    const a = s.anchors[t.anchor - 1];
    rows.push({ frame: "scope", name: "", period: "", phase: "", unit: "", opens: `opens ${anchorName(t.anchor)} at ${scopeName(a.scope)}` });
  } else {
    const K = t.m / enc.timing.m, phi = (t.c - enc.timing.c) / enc.timing.m;
    rows.push({ frame: "scope", name: scopeName(enc.path), period: `K = ${K}`, phase: `φ = ${phi}`, unit: enc.path === "" ? "base ticks" : `ticks of ${enc.path}` });
  }
  rows.push({ frame: "anchor", name: anchorLabel(s, t.anchor), period: `m = ${t.m}`, phase: `c = ${t.c}`, unit: t.anchor === 0 ? "base ticks" : `ticks of ${anchorName(t.anchor)}` });
  if (bound && counts) rows.push({ frame: "base grid", name: "", period: `D = ${counts.D}`, phase: `Φ = ${counts.phi}`, unit: "base ticks" });
  const pair = secondsPair(s, t, bound, counts);
  rows.push({ frame: "seconds", name: "", period: `Δt = ${pair.dt}`, phase: `τ = ${pair.tau}`, unit: "" });
  return rows;
}

/** A discrete primitive's frames table; undefined for any other node. */
export function framesTable(model: Model, path: string): FramesTable | undefined {
  const n = model.tree?.byPath.get(path);
  if (n?.class !== "primitive" || n.tier !== "discrete") return undefined;
  return { rows: framesRows(model, path, n.timing, scheduleRows(model).get(path)) };
}

/** A rate scope's frames table, by the same derivation; an assembly carries no `rates`, so no chain line. */
export function scopeFramesTable(model: Model, path: string, key: string): FramesTable | undefined {
  const x = model.structure?.scopes.find((y) => y.path === path && y.key === key);
  return x && { rows: framesRows(model, path, x.timing, scopeRowOf(model, path, key)) };
}

/** A rate link as `show` spells it: `outer = Relative(2, 1)`, `fast = Absolute(1//50, 0//1)`. */
export const linkText = (link: RateLink): string =>
  "K" in link ? `${link.key} = Relative(${link.K}, ${link.phi})` : `${link.key} = Absolute(${julia(fromRational(link.dt))}, ${julia(fromRational(link.tau))})`;

/** The chain line under a primitive's frames table, outermost first (ruling 2): one call the drawing can drop. */
export function chainLine(model: Model, path: string): string | undefined {
  const n = model.tree?.byPath.get(path);
  return n?.class === "primitive" && n.rates.length ? n.rates.map(linkText).join(" → ") : undefined;
}

// --- the legend's line (answer 13) -------------------------------------------------

export interface LegendText {
  /** `A₂ (dss) · m 1 · c 0`. */
  text: string;
  /** `Δt_base`, `2·Δt_base`, `1/50 s`; a deployment's `A₀` lines concrete. */
  dt: string;
  /** The tooltip: a deployment's `D 2 · Φ 0 · τ 0`, a build's `τ 0`; then the declaring scope. */
  title: string;
}

export function legendText(model: Model, t: Triple): LegendText {
  const s = model.structure!, bound = boundOf(model);
  const [k, m, c] = t;
  const where = anchorTitle(s, k);
  const timing = { anchor: k, m, c };
  if (bound) {
    const A = bound.anchors[k], counts = { D: m * A.D, phi: A.phi + c * A.D };
    const pair = secondsPair(s, timing, bound, counts);
    return { text: `${anchorLabel(s, k)} · m ${m} · c ${c}`, dt: pair.dt, title: `D ${counts.D} · Φ ${counts.phi} · τ ${pair.tau}; ${where}` };
  }
  const pair = secondsPair(s, timing);
  return { text: `${anchorLabel(s, k)} · m ${m} · c ${c}`, dt: pair.dt, title: `τ ${pair.tau}; ${where}` };
}
