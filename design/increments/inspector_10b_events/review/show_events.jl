using Redstone; import Redstone: Deployment, build
include("<worktree>/scripts/synthetic.jl")
b = build(Synthetic.events())
println("=== show(build.events)"); show(stdout, MIME"text/plain"(), b.events); println()
d = Deployment(b; Δt_frame = 1//100, firing_budget = 2, localization_tol = 2.5e-5, localization_budget = 16)
println("=== show(deployment)"); show(stdout, MIME"text/plain"(), d); println()
lb = build(Synthetic.library())
println("=== library events"); show(stdout, MIME"text/plain"(), lb.events); println()
