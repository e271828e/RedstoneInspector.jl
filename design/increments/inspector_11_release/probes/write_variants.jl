using Redstone, RedstoneExamples, RedstoneInspector
import Redstone: Simulation, Deployment, build, trim!, set, Group, Absolute, Relative
import RedstoneExamples: aircraft, level_flight, autopilot
import RedstoneInspector: write_descriptor
out = ARGS[1]
sim = Simulation(aircraft(); Δt_frame = 1//100)
report = trim!(sim, level_flight(); baseline = set(u = (δe = 0.0, δt = 0.5)))
base = autopilot(report.solution)
kids = base.children
slow_outer = (h_ctl = Relative(5), V_ctl = Relative(5))
# A: one clock per assembly. The cascade ticks at 1/50 s and its outer loops every fifth tick.
a = Group(base; children = merge(kids, (; sensing = Group(kids.sensing; sample_times = (;)),
                                          cascade = Group(kids.cascade; sample_times = slow_outer),
                                          actuators = Group(kids.actuators; sample_times = (;)))),
          sample_times = (sensing = Absolute(1//10), cascade = Absolute(1//50), actuators = Absolute(1//50)))
# B: no clock declared. Everything counts base ticks, and the deployment sets the tick.
b = Group(base; children = merge(kids, (; sensing = Group(kids.sensing; sample_times = (;)),
                                          cascade = Group(kids.cascade; sample_times = slow_outer),
                                          actuators = Group(kids.actuators; sample_times = (;)))),
          sample_times = (sensing = Relative(5),))
for (name, model) in (("one_per_assembly", a), ("base_ticks", b))
    try
        write_descriptor(joinpath(out, name * ".json"), model; name = "autopilot")
        println(name, " build ok")
    catch err
        println(name, " build FAILED: ", sprint(showerror, err)[1:min(end, 600)])
    end
    try
        write_descriptor(joinpath(out, name * "_deployment.json"),
                         Deployment(build(model); Δt_frame = 1//50, Δt_base = 1//50); name = "autopilot")
        println(name, " deployment ok")
    catch err
        println(name, " deployment FAILED: ", sprint(showerror, err)[1:min(end, 600)])
    end
end
