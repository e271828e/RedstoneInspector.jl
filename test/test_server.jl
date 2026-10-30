# The live session, with HTTP.jl's WebSocket client playing the page. Every server
# binds a free port, opens no browser and serves the stub bundle.

import HTTP, InteractiveUtils
import RedstoneInspector: inspect, start!, stop!, SESSION

const STUB_BUNDLE = joinpath(@__DIR__, "stub_bundle")

start_stub() = start!(; port = 0, open_browser = false, bundle_dir = STUB_BUNDLE)

own_origin(session) = "http://localhost:$(session.port)"

page_socket(session; origin = own_origin(session)) =
    HTTP.WebSockets.open("ws://127.0.0.1:$(session.port)/ws";
                         headers = origin === nothing ? Pair{String, String}[] : ["Origin" => origin])

greet(socket, channel_name; major = Redstone.DESCRIPTOR_FORMAT.major) =
    HTTP.WebSockets.send(socket, JSON.json((type = "hello", channel = channel_name, major)))

request_edit(socket, file, line) =
    HTTP.WebSockets.send(socket, JSON.json((type = "open_location", file, line)))

# A bounded wait, so a missing message fails a test rather than hanging the gate.
within(ready; seconds = 10) = timedwait(ready, seconds; pollint = 0.01) === :ok

# The next message, or `nothing` when none arrives in time.
next_message(socket) = within(() -> isready(socket)) ? HTTP.WebSockets.receive(socket) : nothing

# Nothing arrives within half a second.
stays_quiet(socket) = (sleep(0.5); !isready(socket))

# The server has joined `n` sockets to the channel `channel_name`.
joined(session, channel_name, n) = within() do
    @lock(session.lock, haskey(session.channels, channel_name) &&
                        length(session.channels[channel_name].sockets) == n)
end

thrown(f) = try
    f()
    nothing
catch err
    err
end

# Run `f` with the `open_browser` and `bundle_dir` preferences set to the stub's,
# through an environment first on the load path whose `Project.toml` carries
# them, for the calls that start a server with the preferences' defaults.
function with_stub_preferences(f)
    environment = mktempdir()
    write(joinpath(environment, "Project.toml"), """
        [deps]
        RedstoneInspector = "$(Base.PkgId(RedstoneInspector).uuid)"

        [preferences.RedstoneInspector]
        open_browser = false
        bundle_dir = $(repr(STUB_BUNDLE))
        """)
    pushfirst!(LOAD_PATH, environment)
    try
        f()
    finally
        deleteat!(LOAD_PATH, findfirst(==(environment), LOAD_PATH))
    end
end

# Kill the server's serving task and wait until it is done.
function kill_serving(session)
    schedule(session.server.serve_task, InterruptException(); error = true)
    return within(() -> istaskdone(session.server.serve_task))
end

@testset "the live session" begin
    loop_build = build(loop("y"))
    loop_deployment = Deployment(loop_build; h = 1//1000)
    cycle_err = caught(loop("power"))
    structure_err = caught(loop("q"))

    @testset "the lifetime" begin
        hooks_before = length(Base.atexit_hooks)
        session = @test_logs (:info, r"at http://localhost:\d+/ — Vimium users: exclude http://localhost:\d+/\*") start_stub()
        try
            @test session.port != 0
            @test isopen(session.server)
            @test SESSION[] === session
        finally
            stop!()
        end
        @test !isopen(session.server)
        @test SESSION[] === nothing
        stop!()
        @test SESSION[] === nothing
        hooks_after_start = length(Base.atexit_hooks)
        @test hooks_after_start - hooks_before <= 1

        restarted = start_stub()
        try
            @test isopen(restarted.server)
            @test SESSION[] === restarted
            @test length(Base.atexit_hooks) == hooks_after_start
        finally
            stop!()
        end

        dead = start_stub()
        @test kill_serving(dead)
        @test_logs (:warn, r"failed while closing") stop!()
        @test SESSION[] === nothing

        dead = start_stub()
        @test kill_serving(dead)
        with_stub_preferences(() -> inspect(loop_build; name = "after death", port = 0))
        @test SESSION[] !== nothing && SESSION[] !== dead
        @test SESSION[] !== nothing && isopen(SESSION[].server)
        thrown(() -> HTTP.forceclose(dead.server))
        @test thrown(stop!) === nothing
        @test SESSION[] === nothing

        # A first call's `port` wins over the `port` preference, 8601 by default.
        with_stub_preferences(() -> inspect(loop_build; name = "first", port = 0))
        @test SESSION[] !== nothing && SESSION[].port != 0 && !(SESSION[].port in 8601:8610)
        stop!()

        for bundle_dir in (joinpath(STUB_BUNDLE, "missing"), nothing)
            err = thrown(() -> start!(; port = 0, open_browser = false, bundle_dir))
            @test err isa ErrorException
            @test err isa ErrorException && occursin("bundle_dir", err.msg)
        end
        @test SESSION[] === nothing

        occupant = start_stub()
        try
            fallback = start!(; port = occupant.port, open_browser = false, bundle_dir = STUB_BUNDLE)
            @test fallback.port == occupant.port + 1
            @test isopen(occupant.server) && isopen(fallback.server)
        finally
            HTTP.forceclose(occupant.server)
            stop!()
        end
    end

    session = start_stub()
    try
        url = "http://127.0.0.1:$(session.port)"

        @testset "the files" begin
            response = HTTP.get("$url/"; status_exception = false)
            @test response.status == 200
            @test Vector{UInt8}(response.body) == read(joinpath(STUB_BUNDLE, "index.html"))
            @test HTTP.header(response, "Cache-Control") == "no-cache"
            response = HTTP.get("$url/?tab=loop"; status_exception = false)
            @test response.status == 200
            # From the stub bundle, `/../Project.toml` names the test project's.
            response = HTTP.get("$url/../Project.toml"; status_exception = false)
            @test response.status in (400, 404)
            @test String(response.body) != read(joinpath(@__DIR__, "Project.toml"), String)
            @test HTTP.get("$url/ws"; status_exception = false).status == 404
        end

        @testset "the handshake" begin
            for origin in (own_origin(session), "http://127.0.0.1:$(session.port)", nothing)
                socket = page_socket(session; origin)
                @test !HTTP.WebSockets.isclosed(socket)
                close(socket)
            end
            err = thrown(() -> page_socket(session; origin = "http://example.com"))
            @test err isa HTTP.WebSockets.WebSocketError
            @test occursin("403", sprint(showerror, err))
        end

        @testset "a Symbol name" begin
            @test inspect(loop_build; name = :loop) === nothing
            @test session.channels["loop"].text == text(loop_build; name = "loop")
        end

        @testset "the greeting and the push" begin
            empty_socket = page_socket(session)
            greet(empty_socket, "empty")
            @test stays_quiet(empty_socket)
            inspect(loop_build; name = "empty")
            @test next_message(empty_socket) == text(loop_build; name = "empty")
            close(empty_socket)

            inspect(loop_build; name = "loop")
            late_socket = page_socket(session)
            greet(late_socket, "loop")
            @test next_message(late_socket) == text(loop_build; name = "loop")

            twin_socket = page_socket(session)
            other_socket = page_socket(session)
            greet(twin_socket, "loop")
            greet(other_socket, "other")
            @test next_message(twin_socket) == text(loop_build; name = "loop")
            @test joined(session, "loop", 2) && joined(session, "other", 1)
            @test inspect(loop_deployment; name = "loop") === nothing
            @test next_message(late_socket) == text(loop_deployment; name = "loop")
            @test next_message(twin_socket) == text(loop_deployment; name = "loop")
            @test stays_quiet(other_socket)

            regreeted_socket = page_socket(session)
            greet(regreeted_socket, "loop")
            @test next_message(regreeted_socket) == text(loop_deployment; name = "loop")

            close(twin_socket)
            @test joined(session, "loop", 2)
            @test inspect(loop_build; name = "loop") === nothing
            @test next_message(late_socket) == text(loop_build; name = "loop")
            foreach(close, (late_socket, other_socket, regreeted_socket))

            default_socket = page_socket(session)
            greet(default_socket, "")
            @test joined(session, "", 1)
            inspect(loop_build)
            @test next_message(default_socket) == text(loop_build)
            close(default_socket)
        end

        @testset "a second greeting" begin
            socket = page_socket(session)
            greet(socket, "first")
            greet(socket, "second")
            @test joined(session, "second", 1) && joined(session, "first", 0)
            inspect(loop_build; name = "first")
            @test stays_quiet(socket)
            inspect(loop_build; name = "second")
            @test next_message(socket) == text(loop_build; name = "second")
            close(socket)
        end

        @testset "the five forms" begin
            @test_throws DiagnosticError inspect(loop("power"); name = "root")
            @test session.channels["root"].text == text(cycle_err; name = "root")
            @test inspect(loop("y"); name = "root") === nothing
            @test session.channels["root"].text == text(loop_build; name = "root")

            socket = page_socket(session)
            greet(socket, "carrier")
            @test joined(session, "carrier", 1)
            @test inspect(cycle_err; name = "carrier") === nothing
            @test next_message(socket) == text(cycle_err; name = "carrier")
            close(socket)

            stack = try
                build(loop("power"))
            catch
                current_exceptions()
            end
            @test inspect(stack; name = "stack") === nothing
            @test session.channels["stack"].text == text(cycle_err; name = "stack")
            plain_stack = try
                error("not a build")
            catch
                current_exceptions()
            end
            err = thrown(() -> inspect(plain_stack; name = "stack"))
            @test err isa ArgumentError && occursin("DiagnosticError", err.msg)
        end

        @testset "the messages" begin
            socket = page_socket(session)
            HTTP.WebSockets.send(socket, "not JSON")
            HTTP.WebSockets.send(socket, JSON.json((type = "subscribe",)))
            HTTP.WebSockets.send(socket, "[1, 2]")
            greet(socket, "loop")
            @test next_message(socket) == text(loop_build; name = "loop")
            close(socket)

            socket = page_socket(session)
            hello = JSON.json((type = "hello", channel = "loop", major = Redstone.DESCRIPTOR_FORMAT.major))
            HTTP.WebSockets.send(socket, Vector{UInt8}(hello))
            @test stays_quiet(socket)
            greet(socket, "loop")
            @test next_message(socket) == text(loop_build; name = "loop")
            close(socket)

            socket = page_socket(session)
            greet(socket, "loop"; major = Redstone.DESCRIPTOR_FORMAT.major + 1)
            @test next_message(socket) == text(loop_build; name = "loop")
            close(socket)
        end

        @testset "open in the editor" begin
            edits = Channel{Tuple{String, Int}}(Inf)
            InteractiveUtils.define_editor("inspector_stand_in") do cmd, path, line, column
                put!(edits, (path, line))
                Sys.iswindows() ? `cmd /c exit 0` : `true`
            end
            plant_row = only(row for row in descriptor(loop_build).build.structure.types
                             if endswith(row.name, "Plant"))
            location = first(plant_row.locations)
            withenv("JULIA_EDITOR" => "inspector_stand_in") do
                inspect(structure_err; name = "no structure")

                ungreeted_socket = page_socket(session)
                request_edit(ungreeted_socket, location.file, location.line)

                bare_socket = page_socket(session)
                greet(bare_socket, "no structure")
                @test joined(session, "no structure", 1)
                request_edit(bare_socket, location.file, location.line)

                socket = page_socket(session)
                greet(socket, "loop")
                @test next_message(socket) == text(loop_build; name = "loop")
                request_edit(socket, location.file, location.line + 1000)
                request_edit(socket, "elsewhere.jl", location.line)
                request_edit(socket, location.file, location.line)
                @test within(() -> isready(edits))
                @test isready(edits) && take!(edits) == (location.file, location.line)

                inspect(loop_deployment; name = "deployment")
                deployment_socket = page_socket(session)
                greet(deployment_socket, "deployment")
                @test next_message(deployment_socket) == text(loop_deployment; name = "deployment")
                request_edit(deployment_socket, location.file, location.line)
                @test within(() -> isready(edits))
                @test isready(edits) && take!(edits) == (location.file, location.line)

                failure_location = first(first(descriptor(cycle_err).failure.structure.types).locations)
                inspect(cycle_err; name = "failure")
                failure_socket = page_socket(session)
                greet(failure_socket, "failure")
                @test next_message(failure_socket) == text(cycle_err; name = "failure")
                request_edit(failure_socket, failure_location.file, failure_location.line)
                @test within(() -> isready(edits))
                @test isready(edits) &&
                      take!(edits) == (failure_location.file, failure_location.line)

                sleep(0.5)
                @test !isready(edits)
                foreach(close, (ungreeted_socket, bare_socket, socket, deployment_socket,
                                failure_socket))
            end
        end
    finally
        stop!()
    end
end
