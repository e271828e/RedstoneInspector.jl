// The live session's messages (frontend/PROTOCOL.md; live_session.md answers 4
// to 6): the greeting, the open-in-editor request, the rule telling a
// descriptor frame from a control message, the reconnect's backoff and the
// download's name.

/** The descriptor format's major this bundle reads. */
export const MAJOR = 1;

/** The greeting: the channel from the `tab` parameter of a URL's search text, `""` without one. */
export function helloMessage(search: string): string {
  return JSON.stringify({ type: "hello", channel: new URLSearchParams(search).get("tab") ?? "", major: MAJOR });
}

/** The request to open a location of the descriptor's `types` table in the user's editor. */
export function openLocationMessage(file: string, line: number): string {
  return JSON.stringify({ type: "open_location", file, line });
}

export type Frame = "descriptor" | "control" | "other";

/** A JSON object with `format_version` at the top is a descriptor, one with `type` a control message. */
export function classifyFrame(text: string): Frame {
  let v: unknown;
  try {
    v = JSON.parse(text);
  } catch {
    return "other";
  }
  if (typeof v !== "object" || v === null || Array.isArray(v)) return "other";
  if ("format_version" in v) return "descriptor";
  return "type" in v ? "control" : "other";
}

/** Milliseconds before reconnect attempt `attempt`, from 0: doubling from one second, capped at thirty. */
export const backoff = (attempt: number): number => Math.min(1000 * 2 ** attempt, 30000);

/** The download's file name. */
export const downloadName = (label: string): string => `${label}.json`;
