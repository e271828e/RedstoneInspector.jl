module RedstoneInspector

using Redstone
using JSON
using Preferences
import Redstone: AbstractComponent, Build, Deployment, DiagnosticError, descriptor, build
import HTTP, Artifacts, InteractiveUtils

"""
    write_descriptor(io::IO, build::Build; name = nothing)
    write_descriptor(io::IO, deployment::Deployment; name = nothing)
    write_descriptor(io::IO, err::DiagnosticError; name = nothing)
    write_descriptor(io::IO, root::AbstractComponent; name = nothing)
    write_descriptor(path::AbstractString, x; name = nothing)

Write the descriptor of a `Build`, a `Deployment`, a carrier exception or a
root component as JSON to `io`, or to the file at `path`, which is overwritten.

The root form builds `root` and writes the build's descriptor. When the build
fails, it writes the failure descriptor and rethrows the `DiagnosticError`.

The text is JSON.jl's at two spaces of indentation, with a trailing newline.
The envelope is `Redstone.descriptor`'s, with `name` right after `kind` when
`name` is given and no `name` otherwise. Nothing is validated.

See also `Redstone.descriptor`.
"""
write_descriptor(io::IO, x::Union{Build, Deployment, DiagnosticError}; name = nothing) =
    _write_envelope(io, _envelope(x; name))

function write_descriptor(io::IO, root::AbstractComponent; name = nothing)
    root_build = try
        build(root)
    catch err
        err isa DiagnosticError || rethrow()
        write_descriptor(io, err; name)
        rethrow()
    end
    write_descriptor(io, root_build; name)
end

write_descriptor(path::AbstractString, x::Union{Build, Deployment, DiagnosticError, AbstractComponent};
                 name = nothing) =
    open(io -> write_descriptor(io, x; name), path, "w")

# The descriptor's envelope, with `name` right after `kind` when given.
function _envelope(x::Union{Build, Deployment, DiagnosticError}; name = nothing)
    envelope = descriptor(x)
    name === nothing && return envelope
    body_key = Symbol(envelope.kind)
    return (; envelope.format_version, envelope.redstone_version, envelope.kind, name,
              NamedTuple{(body_key,)}((envelope[body_key],))...)
end

# The one encoding of an envelope, shared by the writer and the push.
function _write_envelope(io::IO, envelope)
    JSON.json(io, envelope; pretty = 2)
    println(io)
end

include("server.jl")

"""
    inspect(root::AbstractComponent; name = nothing, port = nothing)
    inspect(build::Build; name = nothing, port = nothing)
    inspect(deployment::Deployment; name = nothing, port = nothing)
    inspect(err::DiagnosticError; name = nothing, port = nothing)
    inspect(stack::Base.ExceptionStack; name = nothing, port = nothing)

Push the descriptor of a root component, a `Build`, a `Deployment` or a carrier
exception to the inspector's page in the browser.

The first call starts the session's server on `127.0.0.1` and prints its URL.
The server binds port 8601, or the `port` preference, or `port` when given on
that call, and tries the next nine ports when it is taken; a later `port` that
differs from the running one is a warning. The descriptor goes to the channel
`name`, `""` by default, which the page opens as `/?tab=name`: every tab
connected on that channel receives it, and a browser tab opens when none is,
unless the `open_browser` preference is `false`. `name` is also the envelope's
`name`, as for `write_descriptor`.

The root form builds `root` and pushes the build's descriptor. When the build
fails, it pushes the failure descriptor and rethrows the `DiagnosticError`.
The `ExceptionStack` form, the REPL's `err` after that failure, pushes the
stack's last `DiagnosticError` and throws an `ArgumentError` when it holds none.

Return `nothing`.

See also `write_descriptor` and `Redstone.descriptor`.
"""
function inspect(x::Union{Build, Deployment, DiagnosticError}; name = nothing, port = nothing)
    session = _session(port)
    push_descriptor!(session, String(something(name, "")), _envelope(x; name))
    return nothing
end

function inspect(root::AbstractComponent; name = nothing, port = nothing)
    root_build = try
        build(root)
    catch err
        err isa DiagnosticError || rethrow()
        inspect(err; name, port)
        rethrow()
    end
    inspect(root_build; name, port)
end

function inspect(stack::Base.ExceptionStack; name = nothing, port = nothing)
    i = findlast(entry -> entry.exception isa DiagnosticError, stack)
    i === nothing && throw(ArgumentError("the exception stack holds no `DiagnosticError`"))
    inspect(stack[i].exception; name, port)
end

end # module RedstoneInspector
