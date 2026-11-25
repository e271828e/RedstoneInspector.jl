// The keyboard's prefixes (workspace.md answer 11): `z`, the view, and `g`, go, each waiting for a second key
// without a timeout, and a held `z` acting on every key under it.

/** A prefix waiting for its second key. `held` while `z` stays down; `used` once a key came under that hold. */
export interface Prefix {
  key: "z" | "g";
  held: boolean;
  used: boolean;
}

/** The second keys each prefix knows; the command is the two keys, `zz`, `gT`. */
const SECOND: Record<Prefix["key"], readonly string[]> = { z: ["z", "h", "j", "k", "l", "i", "o"], g: ["g", "t", "T"] };

/** A key by its name: a letter in lower case, or in upper case with Shift, so a `g` under Caps Lock stays `g`. */
export const keyName = (e: { key: string; shiftKey: boolean }): string =>
  e.key.length > 1 ? e.key : e.shiftKey ? e.key.toUpperCase() : e.key.toLowerCase();

/**
 * One key under the standing prefix: the prefix after it, and the command when the key completes one; a key the
 * prefix does not know is dropped, and Escape cancels it. Undefined when the key is none of the prefixes' business.
 */
export function pressPrefix(p: Prefix | undefined, name: string, repeat = false): { next: Prefix | undefined; command?: string } | undefined {
  if (name === "z" && repeat) return { next: p };
  if (["Shift", "Alt", "AltGraph", "CapsLock"].includes(name)) return undefined;
  if (!p) return name === "z" || name === "g" ? { next: { key: name, held: name === "z", used: false } } : undefined;
  if (name === "Escape") return { next: undefined };
  return { next: p.held ? { ...p, used: true } : undefined, command: SECOND[p.key].includes(name) ? p.key + name : undefined };
}

/** A key released: `z`, in either case, ends its hold, and one that no key came under goes on waiting. */
export function releasePrefix(p: Prefix | undefined, key: string): Prefix | undefined {
  if (!p?.held || key.toLowerCase() !== "z") return p;
  return p.used ? undefined : { ...p, held: false };
}
