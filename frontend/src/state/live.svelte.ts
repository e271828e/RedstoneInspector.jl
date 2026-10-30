// The live tab's connection (live_session.md answers 4 and 5), per tab and
// apart from the model: the handshake's outcome, the raw descriptor text last
// received and the reconnect count. Set only by `src/live/socket.ts`.

/** `hosted` when the first handshake failed, `connected`, or `lost` while retrying; undefined until the first resolves. */
export type LiveState = "hosted" | "connected" | "lost";

let state = $state<LiveState | undefined>();
let text = $state.raw<string | undefined>();
let attempt = $state(0);

export const live = {
  get state() { return state; },
  /** The raw descriptor text last received, the download's bytes. */
  get text() { return text; },
  /** Reconnect attempts since the connection was lost. */
  get attempt() { return attempt; },
};

export function setLiveState(s: LiveState) {
  state = s;
}
export function setLiveText(t: string) {
  text = t;
}
export function setAttempt(n: number) {
  attempt = n;
}
