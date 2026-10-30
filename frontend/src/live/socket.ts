// The one module that touches `WebSocket` (live_session.md answer 5,
// frontend/PROTOCOL.md): a socket to `/ws` at the page's origin, greeting on
// every open; a close before any open is the hosted copy, a close after one a
// lost server retried with a backoff. No keepalive.
import { backoff, classifyFrame, helloMessage, openLocationMessage } from "../lib/protocol";
import { live, setAttempt, setLiveState, setLiveText } from "../state/live.svelte";

let socket: WebSocket | undefined;

/** Opens the socket; a descriptor frame's text is kept and handed to `onDescriptor`, anything else dropped. */
export function connect(onDescriptor: (text: string) => void) {
  const url = `${location.protocol === "https:" ? "wss" : "ws"}://${location.host}/ws`;
  let opened = false;
  const attempt = () => {
    const ws = new WebSocket(url);
    socket = ws;
    ws.onopen = () => {
      opened = true;
      ws.send(helloMessage(location.search));
      setAttempt(0);
      setLiveState("connected");
    };
    ws.onmessage = (e) => {
      if (typeof e.data !== "string" || classifyFrame(e.data) !== "descriptor") return;
      setLiveText(e.data);
      onDescriptor(e.data);
    };
    ws.onclose = () => {
      socket = undefined;
      if (!opened) {
        setLiveState("hosted");
        return;
      }
      setLiveState("lost");
      const wait = backoff(live.attempt);
      setAttempt(live.attempt + 1);
      setTimeout(attempt, wait);
    };
  };
  attempt();
}

/** Sends `open_location` while connected; false, and nothing sent, otherwise. */
export function sendOpenLocation(file: string, line: number): boolean {
  if (live.state !== "connected" || socket?.readyState !== WebSocket.OPEN) return false;
  socket.send(openLocationMessage(file, line));
  return true;
}
