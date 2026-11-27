# The core's own reading of the committed fixtures' models, for the oracle to compare with.
# Writes show/<fixture>.txt: show(::Structure), and for a deployment show(::Deployment) and the
# core's private derivations (_hyperperiod, _steps_line, _admissible_line, _grid_report).
#   julia --startup-file=no --project=<worktree>/scripts crosscheck.jl <worktree>
const REPO = ARGS[1]
const OUT = joinpath(@__DIR__, "show")

using Redstone, RedstoneExamples
import Redstone: Simulation, Deployment, build, trim!, linearize, set
import RedstoneExamples: aircraft, level_flight, longitudinal_taps, lqr_gains, closed_loop, approach
include(joinpath(REPO, "scripts", "synthetic.jl"))

descent() = Redstone.Group((; plant = RedstoneExamples.Longitudinal(), gear = RedstoneExamples.GroundContact(),
                              stop = Redstone.Library.StopRequest(reason = "touchdown"));
                           input_wires = ("δe" => "plant/δe", "δt" => "plant/δt"),
                           local_wires = ("plant/h" => "gear/h", "gear/contact" => "stop/u"))

mkpath(OUT)
sim = Simulation(aircraft(); Δt_frame = 1//100)
report = trim!(sim, level_flight(); baseline = set(u = (δe = 0.0, δt = 0.5)))
gains = lqr_gains(linearize(sim, longitudinal_taps()))
closed = closed_loop(report.solution, gains)

builds = Dict{String,Any}("aircraft" => build(aircraft()), "descent" => build(descent()), "closed_loop" => build(closed))
for name in ("large", "containers", "primitive", "kinds", "rates", "library", "warning", "timing")
    builds[name] = build(getfield(Synthetic, Symbol(name))())
end
deployments = Dict{String,Any}(
    "closed_loop_deployment" => Deployment(builds["closed_loop"]; Δt_frame = 1//100),
    "timing_deployment" => Deployment(builds["timing"]; Δt_frame = 1//100, Δt_base = :derive),
    "library_deployment" => Deployment(builds["library"]; Δt_frame = 1//100),
    "rates_deployment" => Deployment(builds["rates"]; Δt_frame = 1//100, Δt_base = 1//200),
    "approach_deployment" => Deployment(build(approach(report.solution)); Δt_frame = 1//200),
    "events_deployment" => Deployment(build(Synthetic.events()); Δt_frame = 1//100, firing_budget = 2,
                                      localization_tol = 2.5e-5, localization_budget = 16))

text(x) = sprint(show, MIME("text/plain"), x)
for (name, b) in builds
    write(joinpath(OUT, name * ".txt"), "--- structure ---\n" * text(b.structure) * "\n")
end
for (name, d) in deployments
    g = Redstone._grid_report(d.build.structure.anchors)
    core = ["--- core ---",
            "hyperperiod: " * (isempty(d.schedule.rows) ? "none" : string(Redstone._hyperperiod(d.schedule))),
            "steps: " * Redstone._steps_line(d),
            "admissible line: " * something(Redstone._admissible_line(d.build.structure, d.Δt_base), "none"),
            "grid admissible: " * string(g.admissible),
            "grid pool: " * join(["$(e.kind) $(e.value) ×$(e.factor) alt $(e.alternatives)" for e in g.pool], "; "),
            "grid primes: " * join(["$(p.prime)^$(p.power) $(p.suppliers)" for p in g.primes], "; ")]
    write(joinpath(OUT, name * ".txt"),
          "--- deployment ---\n" * text(d) * "\n--- structure ---\n" * text(d.build.structure) * "\n" * join(core, "\n") * "\n")
end
