using Redstone, RedstoneExamples, RedstoneInspector
import Redstone: Simulation, Deployment, build, trim!, set
import RedstoneExamples: aircraft, level_flight, autopilot
import RedstoneInspector: write_descriptor
out = ARGS[1]
sim = Simulation(aircraft(); Δt_frame = 1//100)
report = trim!(sim, level_flight(); baseline = set(u = (δe = 0.0, δt = 0.5)))
model = autopilot(report.solution)
write_descriptor(joinpath(out, "autopilot.json"), model; name = "autopilot")
write_descriptor(joinpath(out, "autopilot_deployment.json"), Deployment(build(model); Δt_frame = 1//100); name = "autopilot_deployment")
println("written")
