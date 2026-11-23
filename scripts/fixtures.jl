# Writes the committed descriptors into frontend/fixtures/ and the schema of
# record into frontend/schema/. From the repository root:
#   julia --project=scripts scripts/fixtures.jl

using TOML

const REPO = normpath(joinpath(@__DIR__, ".."))

let redstone_rev = TOML.parsefile(joinpath(REPO, "Project.toml"))["sources"]["Redstone"]["rev"],
    examples_rev = TOML.parsefile(joinpath(@__DIR__, "Project.toml"))["sources"]["RedstoneExamples"]["rev"]
    redstone_rev == examples_rev ||
        error("the pin's revisions differ: Redstone at $redstone_rev in Project.toml, " *
              "RedstoneExamples at $examples_rev in scripts/Project.toml")
    manifest_deps = TOML.parsefile(joinpath(REPO, "Manifest.toml"))["deps"]
    for pkg in ("Redstone", "RedstoneExamples")
        manifest_rev = manifest_deps[pkg][1]["repo-rev"]
        manifest_rev == redstone_rev ||
            error("the manifest is stale: $pkg at $manifest_rev in Manifest.toml, pinned at " *
                  "$redstone_rev; delete Manifest.toml and instantiate from the repo root")
    end
end

using Redstone, RedstoneExamples, RedstoneInspector
import Redstone: Simulation, Deployment, DiagnosticError, build, trim!, linearize, set
import RedstoneExamples: aircraft, level_flight, longitudinal_taps, lqr_gains, closed_loop, approach
import RedstoneInspector: write_descriptor
include("synthetic.jl")

const FIXTURE_DIR = joinpath(REPO, "frontend", "fixtures")
const SCHEMA_DIR = joinpath(REPO, "frontend", "schema")

# Method locations are absolute and differ per machine, so the repo root and
# then the depot become labels; the repo may sit under the depot.
labelled(text) = replace(replace(text, REPO => "<repo>/"), DEPOT_PATH[1] => "<depot>")

save(base_name, io) = write(joinpath(FIXTURE_DIR, base_name * ".json"), labelled(String(take!(io))))

function write_fixture(base_name, x; name = base_name)
    io = IOBuffer()
    write_descriptor(io, x; name)
    save(base_name, io)
end

function write_failure_fixture(base_name, root)
    io = IOBuffer()
    try
        write_descriptor(io, root; name = base_name)
    catch err
        err isa DiagnosticError || rethrow()
        return save(base_name, io)
    end
    error("the build of `$base_name` succeeded")
end

# The aircraft with the ground and a stop request. The core's examples dropped
# this model, so the script builds it (deployment_overlay.md answer 16). The
# types stay qualified: a name imported here would print bare in `signature`.
descent() = Redstone.Group((; plant = RedstoneExamples.Longitudinal(), gear = RedstoneExamples.GroundContact(),
                              stop = Redstone.Library.StopRequest(reason = "touchdown"));
                           input_wires = ("δe" => "plant/δe", "δt" => "plant/δt"),
                           local_wires = ("plant/h" => "gear/h", "gear/contact" => "stop/u"))

mkpath(FIXTURE_DIR)
mkpath(SCHEMA_DIR)

sim = Simulation(aircraft(); Δt_frame = 1//100)
report = trim!(sim, level_flight(); baseline = set(u = (δe = 0.0, δt = 0.5)))
gains = lqr_gains(linearize(sim, longitudinal_taps()))
closed = closed_loop(report.solution, gains)

write_fixture("aircraft", aircraft(); name = nothing)
write_fixture("descent", descent())
write_fixture("closed_loop", closed)
write_fixture("closed_loop_deployment", Deployment(build(closed); Δt_frame = 1//100))

for base_name in ("large", "containers", "primitive", "kinds", "rates", "library", "warning", "timing")
    write_fixture(base_name, getfield(Synthetic, Symbol(base_name))())
end
# deployment_overlay.md answer 16: each deployment shows what no other does.
write_fixture("timing_deployment", Deployment(build(Synthetic.timing()); Δt_frame = 1//100, Δt_base = :derive))
write_fixture("library_deployment", Deployment(build(Synthetic.library()); Δt_frame = 1//100))
write_fixture("rates_deployment", Deployment(build(Synthetic.rates()); Δt_frame = 1//100, Δt_base = 1//200))
write_fixture("approach_deployment", Deployment(build(approach(report.solution)); Δt_frame = 1//200))
for base_name in ("failure_cycle", "failure_structure", "failure_nested", "failure_dead", "failure_probe")
    write_failure_fixture(base_name, getfield(Synthetic, Symbol(base_name))())
end

write(joinpath(SCHEMA_DIR, "descriptor.json"), read(joinpath(pkgdir(Redstone), "src", "descriptor.json")))
