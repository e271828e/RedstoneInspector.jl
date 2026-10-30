# --- the live session (live_session.md answers 3 to 8) ---------------------------
# One server per process serves the page's bundle and its socket at `/ws`. A push
# stores the descriptor text on its channel and sends it to the channel's sockets;
# a page greets with its channel and receives the stored text.

# A channel's record: the latest descriptor text, the `(file, line)` pairs of its
# `types` rows, and the sockets of the tabs that greeted with its name.
struct InspectorChannel
    text::Union{Nothing, String}
    locations::Set{Tuple{String, Int}}
    sockets::Set{HTTP.WebSockets.WebSocket}
end

InspectorChannel() =
    InspectorChannel(nothing, Set{Tuple{String, Int}}(), Set{HTTP.WebSockets.WebSocket}())

# The session takes its server once bound, since the server's handler needs the
# session first; `port` holds the requested port until then.
mutable struct Session
    channels::Dict{String, InspectorChannel}
    lock::ReentrantLock
    open_browser::Bool
    port::Int
    server::HTTP.Server
    Session(open_browser::Bool, port::Int) =
        new(Dict{String, InspectorChannel}(), ReentrantLock(), open_browser, port)
end

const SESSION = Ref{Union{Nothing, Session}}(nothing)
const STOP_REGISTERED = Ref(false)

# Start the session's server and store it in the slot. The preferences are read
# here, at call time, as the keywords' defaults.
function start!(; port = load_preference(RedstoneInspector, "port", 8601),
                open_browser = load_preference(RedstoneInspector, "open_browser", true),
                bundle_dir = load_preference(RedstoneInspector, "bundle_dir", nothing))
    file_handler = HTTP.streamhandler(HTTP.fileserver(_bundle_directory(bundle_dir);
                                                      cache_control = "no-cache"))
    session = Session(open_browser, port)
    # The handlers run in the latest world, so Revise reaches a running server.
    handler = stream -> Base.invokelatest(_handle_stream, session, file_handler, stream)
    session.server = _bind_server(handler, port)
    session.port = HTTP.port(session.server)
    SESSION[] = session
    if !STOP_REGISTERED[]
        atexit(stop!)
        STOP_REGISTERED[] = true
    end
    url = "http://localhost:$(session.port)/"
    @info "RedstoneInspector $(pkgversion(RedstoneInspector)) at $url — Vimium users: exclude $(url)*"
    return session
end

# The `bundle_dir` preference's folder, else the installed bundle artifact.
function _bundle_directory(bundle_dir)
    directory = bundle_dir
    if directory === nothing
        bundle_hash = Artifacts.artifact_hash("bundle",
                                              joinpath(pkgdir(RedstoneInspector), "Artifacts.toml"))
        directory = bundle_hash === nothing ? nothing : Artifacts.artifact_path(bundle_hash)
    end
    directory !== nothing && isdir(directory) && return directory
    error("RedstoneInspector found no page bundle to serve: no installed bundle, and the " *
          "`bundle_dir` preference names no directory ($(repr(bundle_dir))). Set `bundle_dir` " *
          "to a built bundle, `frontend/dist` after `npm run build`.")
end

# Bind loopback on `port`, or on the next of ten ports when it is taken; port 0
# binds a free port.
function _bind_server(handler, port::Int)
    port == 0 && return HTTP.listen!(handler, "127.0.0.1", 0; listenany = true)
    for candidate in port:(port + 9)
        try
            return HTTP.listen!(handler, "127.0.0.1", candidate)
        catch err
            err isa HTTP.AddressInUseError && candidate < port + 9 || rethrow()
        end
    end
end

# The slot's session while its server is open and serving, else a new one.
function _session(port)
    session = SESSION[]
    # `serve_task` is an internal field of HTTP's `Server`; a dead task leaves it open.
    if session !== nothing && isopen(session.server) && !istaskdone(session.server.serve_task)
        port === nothing || port == session.port ||
            @warn "RedstoneInspector's server already runs on port $(session.port); `port = $port` is ignored."
        return session
    end
    return port === nothing ? start!() : start!(; port)
end

# Clear the slot and close the server; a failure to close is a warning.
function stop!()
    session = SESSION[]
    session === nothing && return nothing
    SESSION[] = nothing
    try
        HTTP.forceclose(session.server)
    catch err
        @warn "RedstoneInspector's server failed while closing." exception = err
    end
    return nothing
end

# Store the envelope's text and locations on the channel `name`, then send the
# text to the channel's sockets, or open a browser tab when it has none.
function push_descriptor!(session::Session, name::String, envelope)
    text = sprint(_write_envelope, envelope)
    locations = _location_set(envelope)
    channel_sockets, listening_sockets = @lock session.lock begin
        channel = get!(InspectorChannel, session.channels, name)
        session.channels[name] = InspectorChannel(text, locations, channel.sockets)
        channel.sockets, copy(channel.sockets)
    end
    for socket in listening_sockets
        try
            HTTP.WebSockets.send(socket, text)
        catch
            @lock session.lock delete!(channel_sockets, socket)
        end
    end
    if isempty(listening_sockets) && session.open_browser
        query = isempty(name) ? "" : "?tab=" * HTTP.escapeuri(name)
        _open_browser("http://localhost:$(session.port)/$query")
    end
    return session
end

# Every `(file, line)` of the `types` rows, none when the body has no structure.
function _location_set(envelope)
    body = envelope[Symbol(envelope.kind)]
    envelope.kind == "deployment" && (body = body.build)
    haskey(body, :structure) || return Set{Tuple{String, Int}}()
    return Set{Tuple{String, Int}}((location.file, location.line)
                                   for row in body.structure.types for location in row.locations)
end

# A handshake goes to the socket loop when its `Origin` is the server's own or
# absent; any other request is a file of the bundle.
function _handle_stream(session::Session, file_handler, stream::HTTP.Stream)
    if HTTP.WebSockets.isupgrade(stream.message)
        own_origins = ("http://localhost:$(session.port)", "http://127.0.0.1:$(session.port)")
        try
            HTTP.WebSockets.upgrade(socket -> _serve_socket(session, socket), stream;
                                    check_origin = (request, origin) ->
                                        origin === nothing || origin in own_origins)
        catch err
            # A refused handshake or a socket the page dropped.
            err isa HTTP.WebSockets.WebSocketError || rethrow()
        end
    else
        file_handler(stream)
    end
    return nothing
end

# Read control messages until the socket closes, then forget it.
function _serve_socket(session::Session, socket::HTTP.WebSockets.WebSocket)
    channel_name = nothing
    try
        for message in socket
            channel_name = Base.invokelatest(_handle_message, session, socket, channel_name, message)
        end
    finally
        channel_name === nothing ||
            @lock session.lock delete!(session.channels[channel_name].sockets, socket)
    end
    return nothing
end

# Act on one message and return the socket's channel name, which `hello` sets.
function _handle_message(session::Session, socket, channel_name, message)
    if !(message isa String)
        @warn "RedstoneInspector dropped a binary socket frame; stage 1's frames are text."
        return channel_name
    end
    parsed = try
        JSON.parse(message)
    catch
        nothing
    end
    message_type = parsed isa AbstractDict ? get(parsed, "type", nothing) : nothing
    if message_type == "hello"
        return _greet(session, socket, channel_name, parsed)
    elseif message_type == "open_location"
        _open_location(session, channel_name, parsed)
    else
        @warn "RedstoneInspector dropped a socket message that is not a known control message."
    end
    return channel_name
end

# Join the socket to the greeting's channel and answer with its text, if any.
function _greet(session::Session, socket, channel_name, parsed)
    name = get(parsed, "channel", nothing)
    if !(name isa String)
        @warn "RedstoneInspector dropped a `hello` with no channel name."
        return channel_name
    end
    major = get(parsed, "major", nothing)
    major == Redstone.DESCRIPTOR_FORMAT.major ||
        @warn "The page reads descriptor format $major and the package writes " *
              "$(Redstone.DESCRIPTOR_FORMAT.major); pushing anyway."
    @lock session.lock begin
        channel_name === nothing || delete!(session.channels[channel_name].sockets, socket)
        channel = get!(InspectorChannel, session.channels, name)
        push!(channel.sockets, socket)
        channel.text === nothing || HTTP.WebSockets.send(socket, channel.text)
    end
    return name
end

# Open the editor on a location of the channel's descriptor, on a spawned task so
# an editor that waits blocks no socket, and in the latest world, which holds the
# editors `define_editor` added after the server started.
function _open_location(session::Session, channel_name, parsed)
    file = get(parsed, "file", nothing)
    line = get(parsed, "line", nothing)
    known = channel_name !== nothing && file isa String && line isa Integer &&
            @lock(session.lock, (file, line) in session.channels[channel_name].locations)
    if !known
        @warn "RedstoneInspector dropped an `open_location` outside the descriptor's locations." file line
        return nothing
    end
    Threads.@spawn try
        Base.invokelatest(InteractiveUtils.edit, file, line)
    catch err
        @warn "RedstoneInspector could not open the editor on $file:$line." exception = err
    end
    return nothing
end

# Ask the system to open `url` in the default browser, detached; a failure is a warning.
function _open_browser(url::String)
    command = Sys.isapple() ? `open $url` :
              Sys.iswindows() ? `cmd /c start "" $url` : `xdg-open $url`
    try
        run(pipeline(detach(command); stdout = devnull, stderr = devnull); wait = false)
    catch err
        @warn "RedstoneInspector could not open a browser; open $url." exception = err
    end
    return nothing
end
