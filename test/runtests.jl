# The gate, from the repository root:
#   JULIA_LOAD_PATH="@" julia -t auto --startup-file=no --check-bounds=yes --warn-overwrite=yes --depwarn=yes --project=test test/runtests.jl

using Test, RedstoneInspector, Redstone, JSON, JSONSchema
import Redstone: AbstractComponent, x_init, s_init, u_types, y_types, y_state, y_direct,
    x_deriv, s_update, Absolute, Hz, Build, Deployment, DiagnosticError, descriptor, build
import Redstone.Blocks: Group
import RedstoneInspector: write_descriptor

# The core README's quick start: a plant with a state and a direct output under
# a discrete PI controller.
struct Plant <: AbstractComponent
    ω::Float64
    ζ::Float64
end

x_init(::Plant) = (q = 0.0, v = 0.0)
u_types(::Plant) = Float64
y_types(::Plant) = (y = Float64, power = Float64)

y_state(::Plant, (; x)) = (y = x.q,)
y_direct(::Plant, (; x, u)) = (power = u * x.v,)
x_deriv(p::Plant, (; x, u)) = (q = x.v, v = -p.ω^2 * x.q - 2p.ζ * p.ω * x.v + u)

struct PI <: AbstractComponent
    k_p::Float64
    k_i::Float64
end

s_init(::PI) = 0.0
u_types(::PI) = (ref = Float64, y = Float64)
y_types(::PI) = Float64

y_direct(c::PI, (; s, u)) = c.k_p * (u.ref - u.y) + s
s_update(c::PI, (; s, u, Δt)) = s + c.k_i * Δt * (u.ref - u.y)

# The loop closed through `feedback`: `y` through the state, `power` through
# the direct port, an algebraic cycle; `q` names no port, a structure failure.
loop(feedback) = Group((plant = Plant(2.0, 0.3), ctl = PI(3.0, 2.0));
    local_wires = ("ctl/y" => "plant/u", "plant/$feedback" => "ctl/y"),
    input_wires = "ref" => "ctl/ref",
    output_wires = "plant/y" => "y",
    sample_times = (ctl = Absolute(Hz(50)),))

text(x; kw...) = String(take!(let io = IOBuffer(); write_descriptor(io, x; kw...); io end))

function caught(root)
    try
        build(root)
    catch err
        err isa DiagnosticError && return err
        rethrow()
    end
    error("the build of the root succeeded")
end

carried_kinds(err::DiagnosticError) = [string(nameof(typeof(d))) for d in vcat(err.carried)]
written_kinds(parsed) = [d["kind"] for d in parsed["failure"]["diagnostics"]]

const SCHEMA = Schema(JSON.parsefile(joinpath(pkgdir(Redstone), "src", "descriptor.json")))

@testset "RedstoneInspector" begin
    clean_build = build(loop("y"))
    artifacts = (build = clean_build, deployment = Deployment(clean_build; h = 1//1000),
                 failure = caught(loop("power")))

    @testset "the primitive on a $kind" for (kind, artifact) in pairs(artifacts)
        unnamed = text(artifact)
        @test unnamed == JSON.json(descriptor(artifact); pretty = 2) * "\n"
        @test JSON.parse(unnamed) == JSON.parse(JSON.json(descriptor(artifact)))
        @test !haskey(JSON.parse(unnamed), "name")
        @test JSON.parse(unnamed)["kind"] == string(kind)

        named = JSON.parse(text(artifact; name = "loop"))
        @test collect(keys(named)) ==
              ["format_version", "redstone_version", "kind", "name", string(kind)]
        @test named["name"] == "loop"
        @test named[string(kind)] == JSON.parse(unnamed)[string(kind)]
        @test isvalid(SCHEMA, named)
    end

    mktempdir() do dir
        file = joinpath(dir, "loop.json")

        @testset "the path form" begin
            write(file, "x"^100_000)
            write_descriptor(file, clean_build; name = "loop")
            @test read(file, String) == text(clean_build; name = "loop")
        end

        @testset "the root form" begin
            write_descriptor(file, loop("y"))
            @test read(file, String) == text(clean_build)

            for (root, has_structure) in ((loop("power"), true), (loop("q"), false))
                err = caught(root)
                rm(file)
                @test_throws DiagnosticError write_descriptor(file, root; name = "loop")
                parsed = JSON.parse(read(file, String))
                @test parsed["kind"] == "failure"
                @test parsed["name"] == "loop"
                @test written_kinds(parsed) == carried_kinds(err)
                @test haskey(parsed["failure"], "structure") == has_structure
            end
        end
    end
end
