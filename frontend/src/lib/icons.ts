// Library icons (visual_grammar.md answer 7): keyed on the alias, then the
// type, for `Redstone.Blocks` types alone; a user type gets none. Pure: the
// canvas draws the text or its own `<symbol>` of the glyph's id.
import type { Node } from "./descriptor";

export interface Icon {
  id: string;
  /** A text icon is drawn as its `text` in the display name's font, a glyph as the canvas's symbol of its id. */
  kind: "text" | "glyph";
  text?: string;
  /** The display name the icon stands in for, or the `Constant`'s whole value. */
  title: string;
}

const LIBRARY = "Redstone.Blocks.";

/** The roster by key: a glyph's id, or a text icon's id and text. */
const ROSTER: Record<string, [id: string, text?: string]> = {
  SumJunction: ["sum"], Or: ["or"], And: ["and"],
  Pack: ["pack"], Unpack: ["unpack"],
  Integrator: ["integrator", "1/s"], LimitedIntegrator: ["limited-integrator"],
  DiscreteIntegrator: ["discrete-integrator"], DiscreteLimitedIntegrator: ["discrete-limited-integrator"],
  UnitDelay: ["unit-delay", "z⁻¹"], Delay: ["delay", "z⁻ᴷ"],
  FirstOrderLag: ["lag", "1/(τs+1)"],
  StateSpace: ["state-space", "ẋ=Ax+Bu"], DiscreteStateSpace: ["state-space", "ẋ=Ax+Bu"],
  DiscretizedStateSpace: ["state-space", "ẋ=Ax+Bu"],
  TransferFunction: ["transfer-function", "N(s)/D(s)"],
  DiscreteTransferFunction: ["transfer-function-z", "N(z)/D(z)"],
  DiscretizedTransferFunction: ["transfer-function-z", "N(z)/D(z)"],
  Constant: ["constant"],
  Step: ["step"], Source: ["source", "f(t)"], GaussianWhiteNoise: ["noise"],
  Switch: ["switch"], Relay: ["relay"], RateLimiter: ["rate-limiter"],
  Freeze: ["freeze"], StopRequest: ["stop"],
  PID: ["pid", "PID"], DiscretePID: ["pid", "PID"],
  LQRTracker: ["lqr", "LQR"], DiscreteLQRTracker: ["lqr", "LQR"],
};

const SUPERSCRIPT = "⁰¹²³⁴⁵⁶⁷⁸⁹";
const superscript = (n: string) => [...n].map((d) => SUPERSCRIPT[+d]).join("");

/** The signature's top-level type parameters, `Delay{Float64, 3}` giving `Float64` and `3`. */
function typeParameters(signature: string): string[] {
  const open = signature.indexOf("{");
  if (open < 0) return [];
  const out: string[] = [];
  let depth = 0, start = open + 1;
  for (let i = open + 1; i < signature.length; i++) {
    const ch = signature[i];
    if (ch === "{") depth++;
    else if (ch === "}" && depth-- === 0) { out.push(signature.slice(start, i).trim()); break; }
    else if (ch === "," && depth === 0) { out.push(signature.slice(start, i).trim()); start = i + 1; }
  }
  return out;
}

/** A `Constant`'s value as text: its `value` entry, or its opened `value.*` entries joined. */
function constantText(n: Node): string {
  const whole = n.parameters.find((p) => p.name === "value");
  if (whole) return whole.value;
  return n.parameters.filter((p) => p.name.startsWith("value.")).map((p) => `${p.name.slice(6)}=${p.value}`).join(", ");
}

/** The node's icon, or `undefined` for a user type, a `Junction` with no alias and every key off the roster. */
export function iconOf(n: Node): Icon | undefined {
  const name = n.alias ?? n.type;
  if (!name.startsWith(LIBRARY)) return undefined;
  const key = name.slice(LIBRARY.length);
  const entry = ROSTER[key];
  if (!entry) return undefined;
  const [id, text] = entry;
  if (key === "Constant") {
    if (n.class === "leaf" && n.outputs[0]?.kind.kind === "opaque") return { id: "constant-opaque", kind: "glyph", title: key };
    const value = constantText(n);
    return { id, kind: "text", text: value, title: `${key} ${value}` };
  }
  if (key === "Delay") {
    // K is the one integer among the signature's type parameters; the literal superscript when none is.
    const k = typeParameters(n.signature).find((p) => /^\d+$/.test(p));
    return { id, kind: "text", text: k ? `z⁻${superscript(k)}` : text, title: key };
  }
  return text === undefined ? { id, kind: "glyph", title: key } : { id, kind: "text", text, title: key };
}
