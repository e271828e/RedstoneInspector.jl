# The live session's protocol

The contract between the inspector's server, `src/server.jl`, and the page. It
has one section per message type, and each stage appends its own. The design
record is `design/inspector/live_session.md` in the Redstone.jl repo, answers
3 to 6.

## The handshake

On load, the page always opens a WebSocket to `/ws` at its own origin,
`ws://<host>/ws` for a page served from `http://<host>/`.

- **The live page.** The inspector's server accepts the handshake only when
  the `Origin` header is its own address, `http://localhost:<port>` or
  `http://127.0.0.1:<port>` with the port it listens on. It answers any other
  `Origin` with `403`, so a page from another site cannot connect. A client
  that sends no `Origin` is not a browser, and it connects.
- **The hosted page.** GitHub Pages serves no socket, so the handshake fails at
  once and the page is the hosted copy: no retry and no connection indicator.
- **A lost connection.** A connection that closes after a successful handshake
  means the server went away. The page retries with a backoff, and when a
  server answers it greets again.

There is no keepalive and no protocol version field. The bundle and the
package ship under one tag, so the two ends are always one release.

## Telling frames apart

Every frame in stage 1 is a text frame holding one JSON object.

- An object with `format_version` at the top is a descriptor.
- An object with `type` at the top is a control message.

The descriptor schema closes the envelope with `additionalProperties: false`,
so an envelope never carries `type`.

## `hello`, page to server

The greeting, the page's first message after the handshake:

```json
{"type": "hello", "channel": "loop", "major": 1}
```

- `channel` is the name of the tab's channel: the `tab` query parameter of the
  page's URL, `/?tab=loop`, and `""` at `/` with no query.
- `major` is the descriptor format's major version that the bundle reads.

The server joins the socket to the channel and answers with the channel's
stored descriptor frame, the latest one pushed, if there is one. Otherwise it
sends nothing, and the page waits for `inspect`. A second `hello` on the same
socket moves it to the new channel.

When `major` differs from the major the package writes, the server prints a
warning on the REPL and still sends the descriptor. The format check is the
page loader's, as for any descriptor. A `hello` with no string `channel` is
dropped with a warning.

## The descriptor frame, server to page

One text frame holding the pretty-printed envelope, unwrapped. Its bytes equal
the file `write_descriptor` writes for the same artifact and `name`: JSON at two
spaces of indentation with a trailing newline, and `name` right after `kind`
when `inspect` was given one.

The server sends it in two cases:

- in answer to a `hello`, when the channel holds a descriptor;
- on every `inspect` with the channel's name, to every socket on that
  channel. Sockets on other channels receive nothing.

The page keeps the raw text for the download, which is then byte for byte a
written file. It feeds the text to the same loader a dropped file goes through.

## `open_location`, page to server

A click on a source location asks the server to open it in the user's editor:

```json
{"type": "open_location", "file": "/home/me/src/Plant.jl", "line": 12}
```

`file` and `line` are copied from a `locations` entry of a row of the
descriptor's `types` table.

The server runs `InteractiveUtils.edit(file, line)` only when the pair is among
the locations of the `types` rows of the channel's current descriptor. It
drops any other request with a warning on the REPL:

- a pair that matches no row, a known file with another line included;
- a request from a socket that has not greeted;
- a request on a channel whose descriptor has no `structure`, such as a build
  that failed at the structure step.

The server never replies to `open_location`.

## Other messages

A frame that is not a JSON object with a known `type` is dropped with a
warning on the REPL. The socket stays open.

## What is not promised

There is no TLS and no login. The `Origin` check keeps out pages from other
sites, but a local process that is not a browser connects regardless, as it
could read the files anyway.

## Stage 2

Subscribe, stage, control and history arrive as more control message `type`s,
and values arrive as binary frames.
