module RedstoneInspector

using Redstone
using JSON
import Redstone: AbstractComponent, Build, Deployment, DiagnosticError, descriptor, build

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
function write_descriptor(io::IO, x::Union{Build, Deployment, DiagnosticError}; name = nothing)
    envelope = descriptor(x)
    if name !== nothing
        body_key = Symbol(envelope.kind)
        envelope = (; envelope.format_version, envelope.redstone_version, envelope.kind, name,
                      NamedTuple{(body_key,)}((envelope[body_key],))...)
    end
    JSON.json(io, envelope; pretty = 2)
    println(io)
end

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

write_descriptor(path::AbstractString, x; name = nothing) =
    open(io -> write_descriptor(io, x; name), path, "w")

end # module RedstoneInspector
