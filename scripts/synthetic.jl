# The repo's own models, one function per fixture file, each named as its file.
module Synthetic

using Redstone
import Redstone: AbstractComponent, x_init, s_init, m_init, u_types, y_types, y_state,
    y_direct, x_deriv, s_update, local_wires, input_wires, output_wires, sample_times,
    transparent_container, input_passthrough, Absolute, Relative, Group, Pinned, state_events, StateEvent
import Redstone.Library: Constant, Junction, SumJunction, Or, And, Pack, Unpack, Switch, StopRequest,
    Step, Source, GaussianWhiteNoise, Integrator, LimitedIntegrator, FirstOrderLag, StateSpace,
    TransferFunction, Relay, UnitDelay, DiscreteIntegrator, RateLimiter, DiscreteStateSpace,
    DiscreteTransferFunction, DiscretizedStateSpace, DiscretizedTransferFunction,
    DiscreteLimitedIntegrator, Delay, Freeze, PID, DiscretePID, LQRTracker, DiscreteLQRTracker,
    Fn, Fields, Select, Sequence, Backlash, LimitedDoubleIntegrator, Comparator
using StaticArrays: SVector, SMatrix
using Random: Xoshiro

# --- large: 150 components -----------------------------------------------------

port_names(prefix, n) = ntuple(i -> Symbol(prefix, i), n)

"A primitive of `NI` inputs and `NO` outputs, every output its state, the gained input sum's integral."
struct ContinuousPrimitive{NI, NO} <: AbstractComponent
    gain::Float64
end

"A primitive of `NI` inputs and `NO` outputs, every output its store, the gained input sum's accumulation."
struct DiscretePrimitive{NI, NO} <: AbstractComponent
    gain::Float64
end

u_types(::Union{ContinuousPrimitive{NI}, DiscretePrimitive{NI}}) where {NI} =
    NamedTuple{port_names(:in, NI)}(ntuple(_ -> Float64, NI))
y_types(::Union{ContinuousPrimitive{NI, NO}, DiscretePrimitive{NI, NO}}) where {NI, NO} =
    NamedTuple{port_names(:out, NO)}(ntuple(_ -> Float64, NO))

x_init(::ContinuousPrimitive) = (q = 0.0,)
x_deriv(c::ContinuousPrimitive, (; u)) = (q = c.gain * sum(u),)
y_state(::ContinuousPrimitive{NI, NO}, (; x)) where {NI, NO} =
    NamedTuple{port_names(:out, NO)}(ntuple(_ -> x.q, NO))

s_init(::DiscretePrimitive) = (q = 0.0,)
s_update(c::DiscretePrimitive, (; s, u)) = (q = s.q + c.gain * sum(u),)
y_state(::DiscretePrimitive{NI, NO}, (; s)) where {NI, NO} =
    NamedTuple{port_names(:out, NO)}(ntuple(_ -> s.q, NO))

series(gain) = Group((; a = ContinuousPrimitive{1, 1}(gain), b = ContinuousPrimitive{1, 1}(gain));
                     local_wires = ("a/out1" => "b/in1",),
                     input_wires = ("in1" => "a/in1",),
                     output_wires = ("b/out1" => "out1",))

const N_COMPONENTS = 150

"""
150 components under one root, ten of them two-primitive assemblies, about a third
of the primitives discrete at 50 Hz, every input port fed once: the first six
components' from the root inputs `u1` to `u4`, the rest mostly from the eight
components before, a tenth from the eight after.
"""
function large()
    rng = Xoshiro(20261026)
    component_names = [Symbol("b", lpad(i, 3, '0')) for i in 1:N_COMPONENTS]
    components = AbstractComponent[]
    input_counts = Int[]
    output_counts = Int[]
    anchored = Symbol[]
    for i in 1:N_COMPONENTS
        gain = round(10 * rand(rng); digits = 3)
        if (i - 1) % 15 == 7
            push!(components, series(gain))
            push!(input_counts, 1)
            push!(output_counts, 1)
        else
            n_in = rand(rng, (1, 1, 2, 2, 3, 4))
            n_out = rand(rng, 1:3)
            if rand(rng) < 0.3
                push!(components, DiscretePrimitive{n_in, n_out}(gain))
                push!(anchored, component_names[i])
            else
                push!(components, ContinuousPrimitive{n_in, n_out}(gain))
            end
            push!(input_counts, n_in)
            push!(output_counts, n_out)
        end
    end
    level_wires = Pair{String, String}[]
    root_consumers = [String[] for _ in 1:4]
    n_root = 0
    for i in 1:N_COMPONENTS, port in 1:input_counts[i]
        consumer = "$(component_names[i])/in$port"
        if i <= 6
            push!(root_consumers[n_root % 4 + 1], consumer)
            n_root += 1
        else
            j = rand(rng) < 0.1 && i < N_COMPONENTS ? i + rand(rng, 1:min(8, N_COMPONENTS - i)) :
                                                  i - rand(rng, 1:min(8, i - 1))
            push!(level_wires, "$(component_names[j])/out$(rand(rng, 1:output_counts[j]))" => consumer)
        end
    end
    Group(NamedTuple{Tuple(component_names)}(Tuple(components));
          local_wires = Tuple(level_wires),
          input_wires = ntuple(i -> "u$i" => Tuple(root_consumers[i]), 4),
          output_wires = ("$(component_names[end])/out1" => "y1", "$(component_names[end - 1])/out1" => "y2"),
          sample_times = NamedTuple{Tuple(anchored)}(ntuple(_ -> Absolute(1//50), length(anchored))))
end

# --- containers: the three memberships -----------------------------------------

struct Gain <: AbstractComponent
    k::Float64
end

x_init(::Gain) = nothing
u_types(::Gain) = (e = Float64,)
y_types(::Gain) = (out = Float64,)
y_direct(c::Gain, (; u)) = (out = c.k * u.e,)

"""
Gains through a keyed container `gains`, a `Tuple` container `pair`, the
name-transparent container `stages` and the field `scale`, a `Scale` assembly.
"""
struct Containers{S <: AbstractComponent} <: AbstractComponent
    gains::NamedTuple{(:a, :b), Tuple{Gain, Gain}}
    pair::Tuple{Gain}
    stages::NamedTuple{(:s1, :s2), Tuple{Gain, Gain}}
    scale::S
end

transparent_container(::Containers) = :stages
local_wires(::Containers) = ("gains/a/out" => "gains/b/e", "gains/b/out" => "pair/1/e",
                             "pair/1/out" => "s1/e", "s1/out" => "s2/e", "s2/out" => "scale/e")
input_wires(::Containers) = ("u" => "gains/a/e",)
output_wires(::Containers) = ("scale/out" => "y",)

containers() = Containers((a = Gain(2.0), b = Gain(3.0)), (Gain(4.0),),
                          (s1 = Gain(0.5), s2 = Gain(0.25)), Scale((c = Gain(10.0),)))

# --- primitive: one primitive as the root ----------------------------------------

"A damped oscillator driven by `u` and `d`, with a state output and a direct one."
struct Plant <: AbstractComponent
    ω::Float64
    ζ::Float64
end

x_init(::Plant) = (q = 0.0, v = 0.0)
u_types(::Plant) = (u = Float64, d = Float64)
y_types(::Plant) = (y = Float64, power = Float64)

y_state(::Plant, (; x)) = (y = x.q,)
y_direct(::Plant, (; x, u)) = (power = u.u * x.v,)
x_deriv(p::Plant, (; x, u)) = (q = x.v, v = -p.ω^2 * x.q - 2p.ζ * p.ω * x.v + u.u + u.d)

primitive() = Plant(2.0, 0.3)

# --- kinds: one face of every kind marker ------------------------------------------

@enum Gear up = 1 down = 2

"An enum mode returned from stage 1, beside a `Float64` read off it."
struct GearMode <: AbstractComponent end

m_init(::GearMode) = (gear = up,)
x_init(::GearMode) = nothing
y_types(::GearMode) = (gear = Gear, y = Float64)
y_state(::GearMode, (; m)) = (gear = m.gear, y = m.gear === up ? 0.0 : 1.0)

"A discrete producer of a `Symbol` port."
struct PhaseSelector <: AbstractComponent end

s_init(::PhaseSelector) = (n = 0,)
y_types(::PhaseSelector) = (phase = Symbol,)
y_state(::PhaseSelector, (; s)) = (phase = iseven(s.n) ? :idle : :armed,)
s_update(::PhaseSelector, (; s)) = (n = s.n + 1,)

"A consumer of a `Symbol` port, producing a `Bool` one."
struct PhaseReader <: AbstractComponent end

x_init(::PhaseReader) = nothing
u_types(::PhaseReader) = (phase = Symbol,)
y_types(::PhaseReader) = (armed = Bool,)
y_direct(::PhaseReader, (; u)) = (armed = u.phase === :armed,)

scaled(k) = x -> k * x

"The constants' pinned outputs, an integer, a rational, a vector, a matrix, a struct and a function, beside the modes."
kinds() = Group((; i = Constant(Int8(0)), r = Constant(1//2), v = Constant(SVector(1.0, 2.0)),
                   mat = Constant(SMatrix{2, 2}(1.0, 2.0, 3.0, 4.0)), nt = Constant((a = 1.0, b = 2.0)),
                   fn = Constant(scaled(2.0)), g = GearMode(), s = PhaseSelector(), p = PhaseReader());
                local_wires = ("s/phase" => "p/phase",),
                output_wires = ("i/y" => "i", "r/y" => "r", "v/y" => "v", "mat/y" => "mat", "nt/y" => "nt",
                                "fn/y" => "fn", "g/gear" => "gear", "g/y" => "g_y", "p/armed" => "armed"))

# --- rates: two anchors and a relative rate ---------------------------------------

"A sample-and-hold, discrete and stateless."
struct ZOH <: AbstractComponent end

s_init(::ZOH) = nothing
u_types(::ZOH) = (in = Float64,)
y_types(::ZOH) = (out = Float64,)
y_direct(::ZOH, (; u)) = (out = u.in,)

"A clock, continuous and stateless: `out = t`."
struct Ramp <: AbstractComponent end

x_init(::Ramp) = nothing
y_types(::Ramp) = (out = Float64,)
y_state(::Ramp, (; t)) = (out = t,)

held() = Group((; hold = ZOH()); input_wires = ("in" => "hold/in",), output_wires = ("hold/out" => "out",))

rates() = Group((; src = Ramp(),
                   fast = Group((; inner = ZOH(), outer = held());
                                input_wires = ("in" => ("inner/in", "outer/in"),),
                                output_wires = ("inner/out" => "inner", "outer/out" => "outer"),
                                sample_times = (outer = Relative(2),)),
                   slow = held());
                local_wires = ("src/out" => "fast/in", "src/out" => "slow/in"),
                output_wires = ("fast/inner" => "inner", "fast/outer" => "outer", "slow/out" => "slow"),
                sample_times = (fast = Absolute(1//50), slow = Absolute(1//10)))

# --- library: one of every shipped library component --------------------------------

wave(t) = sin(t)
half(x) = x / 2

"""
One instance of every shipped component of the core's library, beside a `Junction`
over a user function and two more `Constant`s, a `NamedTuple` for `Fields` and a `Gear`
for `Select`, wired as one chain from the sources; the discrete primitives on two
anchors, the base grid, a `Relative(2)` and a phased `Relative(2, 1)`.
"""
function library()
    m = [1.0;;]
    Group((; sum = SumJunction{Float64, 2}(), or = Or{2}(), and = And{2}(), pack = Pack{Float64, 2}(),
             unpack = Unpack{Float64, 2}(), switch = Switch{Float64}(), stop = StopRequest(reason = "flags"),
             constant = Constant(1.0), step = Step(t_step = 1.0), source = Source(wave),
             noise = GaussianWhiteNoise(seed = 1, σ = 0.1), integrator = Integrator(),
             limited = LimitedIntegrator(lower = -1.0, upper = 1.0), lag = FirstOrderLag(τ = 0.5),
             ss = StateSpace(A = -m, B = m, C = m), tf = TransferFunction(num = (1.0,), den = (1.0, 1.0)),
             relay = Relay(lower = -0.5, upper = 0.5), unit_delay = UnitDelay(0.0),
             d_integrator = DiscreteIntegrator(), rate_limiter = RateLimiter(rising = 1.0),
             dss = DiscreteStateSpace(A = 0.5m, B = m, C = m), dtf = DiscreteTransferFunction(num = (1.0,), den = (1.0, -0.5)),
             zoh_ss = DiscretizedStateSpace(A = -m, B = m, C = m), zoh_tf = DiscretizedTransferFunction(num = (1.0,), den = (1.0, 1.0)),
             d_limited = DiscreteLimitedIntegrator(lower = -1.0, upper = 1.0), delay = Delay(K = 3),
             freeze = Freeze{Float64}(), pid = PID(Kp = 1.0, Ki = 0.5), d_pid = DiscretePID(Kp = 1.0, Ki = 0.5),
             lqr = LQRTracker(K_fbk = SMatrix{1, 2}(1.0, 0.5), K_fwd = SMatrix{1, 2}(1.0, 0.0)),
             d_lqr = DiscreteLQRTracker(K_fbk = SMatrix{1, 2}(1.0, 0.5), K_fwd = SMatrix{1, 2}(1.0, 0.0)),
             fn = Junction{Float64, Float64, 1}(half), apply = Fn{Float64}(half),
             pair = Constant((a = 1.0, b = 2.0)), fields = Fields{typeof((a = 1.0, b = 2.0))}(),
             gear = Constant(up), select = Select{Float64, Gear}(),
             sequence = Sequence(times = (1.0, 2.0), values = (0.0, 1.0, -1.0)),
             backlash = Backlash(width = 0.2), ld_integrator = LimitedDoubleIntegrator(lower = -1.0, upper = 1.0),
             comparator = Comparator(threshold = 0.5));
          local_wires = ("source/y" => "sum/in1", "noise/y" => "sum/in2", "constant/y" => "pack/in1",
                         "step/y" => "pack/in2", "pack/y" => "unpack/u", "pack/y" => "lqr/x", "pack/y" => "lqr/z",
                         "pack/y" => "lqr/z_ref", "pack/y" => "d_lqr/x", "pack/y" => "d_lqr/z", "pack/y" => "d_lqr/z_ref",
                         "unpack/out1" => "switch/in1", "unpack/out2" => "switch/in2", "and/y" => "switch/select",
                         "or/y" => "and/in2", "or/y" => "stop/u", "sum/y" => "integrator/u", "switch/y" => "limited/u",
                         "integrator/y" => "lag/u", "lag/y" => "ss/u", "ss/y" => "tf/u", "tf/y" => "relay/u",
                         "relay/y" => "freeze/u", "freeze/y" => "unit_delay/u", "unit_delay/y" => "d_integrator/u",
                         "d_integrator/y" => "rate_limiter/u", "rate_limiter/y" => "dss/u", "dss/y" => "dtf/u",
                         "dtf/y" => "zoh_ss/u", "zoh_ss/y" => "zoh_tf/u", "zoh_tf/y" => "d_limited/u",
                         "d_limited/out" => "delay/u", "delay/y" => "fn/in1", "constant/y" => "pid/r", "constant/y" => "d_pid/r",
                         "fn/y" => "pid/y", "pid/u" => "d_pid/y", "pair/y" => "fields/u",
                         "sequence/y" => "select/up", "fields/a" => "select/down", "gear/y" => "select/select",
                         "select/y" => "backlash/u", "backlash/y" => "ld_integrator/u",
                         "ld_integrator/out" => "comparator/u", "ld_integrator/velocity" => "apply/u"),
          input_wires = ("a" => ("or/in1", "and/in1"), "b" => "or/in2"),
          sample_times = (noise = Absolute(1//10), dss = Absolute(1//50), d_limited = Relative(2),
                          d_pid = Relative(2, 1)))
end

# --- the failures --------------------------------------------------------------------

"A PI controller, discrete, its output direct."
struct PI <: AbstractComponent
    k_p::Float64
    k_i::Float64
end

s_init(::PI) = 0.0
u_types(::PI) = (ref = Float64, y = Float64)
y_types(::PI) = Float64

y_direct(c::PI, (; s, u)) = c.k_p * (u.ref - u.y) + s
s_update(c::PI, (; s, u, Δt)) = s + c.k_i * Δt * (u.ref - u.y)

"The core README's loop, closed through the plant's stage-2 `power`: an algebraic cycle."
failure_cycle() = Group((plant = Plant(2.0, 0.3), ctl = PI(3.0, 2.0));
                        local_wires = ("ctl/y" => "plant/u", "plant/power" => "ctl/y"),
                        input_wires = ("ref" => "ctl/ref", "d" => "plant/d"),
                        output_wires = "plant/y" => "y",
                        sample_times = (ctl = Absolute(1//50),))

"Two-input summing junction."
struct Sum <: AbstractComponent end

x_init(::Sum) = nothing
u_types(::Sum) = (a = Float64, b = Float64)
y_types(::Sum) = (e = Float64,)
y_direct(::Sum, (; u)) = (e = u.a - u.b,)

"A wire from a port `g` does not declare, which leaves `s/a` unfed: two structure failures."
failure_structure() = Group((; g = Gain(1.0), s = Sum());
                            local_wires = ("g/ot" => "s/a",),
                            input_wires = ("e" => "g/e", "b" => "s/b"))

"`failure_cycle`'s loop with the controller one level down: the chain crosses `ctl`'s boundary."
failure_nested() = Group((plant = Plant(2.0, 0.3),
                          ctl = Group((; pi = PI(3.0, 2.0));
                                      input_wires = ("ref" => "pi/ref", "y" => "pi/y"),
                                      output_wires = "pi/y" => "u",
                                      sample_times = (pi = Absolute(1//50),)));
                         local_wires = ("ctl/u" => "plant/u", "plant/power" => "ctl/y"),
                         input_wires = ("ref" => "ctl/ref", "d" => "plant/d"),
                         output_wires = "plant/y" => "y")

"A primitive whose `F` reads `v` and `f` directly and whose state integrates `g`."
struct Piecewise <: AbstractComponent end

x_init(::Piecewise) = (q = 0.0,)
u_types(::Piecewise) = (v = Float64, f = Float64, g = Float64)
y_types(::Piecewise) = (F = Float64,)
y_direct(::Piecewise, (; u)) = (F = u.v > 0 ? u.f + u.v : -u.f,)
x_deriv(::Piecewise, (; u)) = (q = u.g,)

"An artificial loop through `m` and `g2`: the hop from `m/g` to `m/F` is dead."
failure_dead() = Group((m = Piecewise(), g1 = Gain(1.0), g2 = Gain(1.0));
                       local_wires = ("m/F" => "g2/e", "g2/out" => "m/g", "g1/out" => "m/v"),
                       input_wires = ("r" => "g1/e", "f" => "m/f"))

"A gain whose input passthrough selects nothing: an `EmptyFaceSelection` warning, and a sound model."
struct SelectedNothing <: AbstractComponent
    g::Gain
    src::Gain
end

local_wires(::SelectedNothing) = ("src/out" => "g/e",)
input_wires(a::SelectedNothing) = (input_passthrough(a, "g"; select = _ -> false)..., "in" => "src/e")
output_wires(::SelectedNothing) = ("g/out" => "out",)

"A primitive whose state output throws."
struct Thrower <: AbstractComponent end

x_init(::Thrower) = (; a = 0.0)
y_types(::Thrower) = (p = Float64,)
y_state(::Thrower, (; x)) = error("boom")
x_deriv(::Thrower, (; x)) = (; a = 0.0)

"A probe throw beside an empty selection: fail-fast, with the structure and a warning."
failure_probe() = Group((s = SelectedNothing(Gain(2.0), Gain(3.0)), t = Thrower());
                        input_wires = ("in" => "s/in",))

"A clean build with one `EmptyFaceSelection` warning."
warning() = SelectedNothing(Gain(2.0), Gain(3.0))

# --- containers' scale, last so that no other fixture's locations move ----------

"An assembly holding its one gain in the keyed container `taps`, below `containers`' root."
struct Scale <: AbstractComponent
    taps::NamedTuple{(:c,), Tuple{Gain}}
end

local_wires(::Scale) = ()
input_wires(::Scale) = ("e" => "taps/c/e",)
output_wires(::Scale) = ("taps/c/out" => "out",)

# --- timing: the cases that need the writer (deployment_overlay.md answer 16) -------

"A gain whose input entry is `Pinned`: continuous, its output direct."
struct PinnedGain <: AbstractComponent end

x_init(::PinnedGain) = nothing
u_types(::PinnedGain) = (in = Pinned{Float64},)
y_types(::PinnedGain) = (out = Float64,)
y_direct(::PinnedGain, (; u)) = (out = 2u.in,)

timing_deep() = Group((; hold = ZOH()); input_wires = ("in" => "hold/in",), output_wires = ("hold/out" => "out",))

timing_outer() = Group((; hold = ZOH(), same = ZOH(), deep = timing_deep());
                       input_wires = ("in" => ("hold/in", "same/in", "deep/in"),),
                       output_wires = ("hold/out" => "hold", "same/out" => "same", "deep/out" => "deep"),
                       sample_times = (hold = Relative(3, 1), same = Relative(1), deep = Relative(2, 1)))

# An offset anchor beside a plain one, `ref` pinned by declaration beside `u` pinned by tier, and beneath
# `fast/outer` a keyed primitive, an explicit Relative(1) and a nested scope.
timing() = Group((; staggered = ZOH(),
                    fast = Group((; inner = ZOH(), outer = timing_outer());
                                 input_wires = ("in" => ("inner/in", "outer/in"),),
                                 output_wires = ("inner/out" => "inner", "outer/hold" => "hold", "outer/same" => "same",
                                                 "outer/deep" => "deep"),
                                 sample_times = (outer = Relative(2, 1),)),
                    frozen = PinnedGain());
                 input_wires = ("u" => ("staggered/in", "fast/in"), "ref" => "frozen/in"),
                 output_wires = ("staggered/out" => "staggered", "fast/inner" => "inner", "fast/hold" => "hold",
                                 "fast/same" => "same", "fast/deep" => "deep", "frozen/out" => "frozen"),
                 sample_times = (staggered = Absolute(1//10, 1//300), fast = Absolute(1//50)))

# --- events: the state events' cases (increment 10b, the notes' C1) -------------------

"A ball's height under gravity, bounced off the floor by one localized event."
struct Bouncer <: AbstractComponent
    restitution::Float64
end

x_init(::Bouncer) = (h = 1.0, v = 0.0)
y_types(::Bouncer) = (h = Float64,)
y_state(::Bouncer, (; x)) = (h = x.h,)
x_deriv(::Bouncer, (; x)) = (h = x.v, v = -9.81)
bounce_guard(::Bouncer, (; x)) = -x.h
bounce_handler(b::Bouncer, (; x)) = (x = (h = 0.0, v = -b.restitution * x.v),)
state_events(::Bouncer) = (bounce = StateEvent(bounce_guard, bounce_handler),)

"A room heated between two thresholds, two localized events, and a trip latched past a limit, a non-localized one."
struct Thermostat <: AbstractComponent
    low::Float64
    high::Float64
    limit::Float64
end

x_init(::Thermostat) = (T = 20.0,)
m_init(::Thermostat) = (heating = true, tripped = false)
u_types(::Thermostat) = (ambient = Float64,)
y_types(::Thermostat) = (T = Float64, heating = Bool)
y_state(::Thermostat, (; x, m)) = (T = x.T, heating = m.heating && !m.tripped)
x_deriv(::Thermostat, (; x, m, u)) = (T = (m.heating && !m.tripped ? 2.0 : 0.0) + 0.1 * (u.ambient - x.T),)
heat_on_guard(c::Thermostat, (; x, m)) = m.heating ? -1.0 : c.low - x.T
heat_off_guard(c::Thermostat, (; x, m)) = m.heating ? x.T - c.high : -1.0
trip_guard(c::Thermostat, (; x, m)) = !m.tripped && x.T > c.limit
heat_on_handler(::Thermostat, _) = (m = (heating = true,),)
heat_off_handler(::Thermostat, _) = (m = (heating = false,),)
trip_handler(::Thermostat, _) = (m = (tripped = true,),)
state_events(::Thermostat) = (heat_on = StateEvent(heat_on_guard, heat_on_handler),
                              heat_off = StateEvent(heat_off_guard, heat_off_handler),
                              trip = StateEvent(trip_guard, trip_handler))

"A ball sampled by a hold: a discrete primitive beside an event-declaring one."
pod(restitution, Δt) = Group((; ball = Bouncer(restitution), hold = ZOH());
                             local_wires = ("ball/h" => "hold/in",), output_wires = ("hold/out" => "h",),
                             sample_times = (hold = Absolute(Δt),))

"Two pods in the keyed container `pods`, a non-localized step beside a ball one level down, and the thermostat."
struct Events{A, B, N} <: AbstractComponent
    pods::NamedTuple{(:a, :b), Tuple{A, B}}
    nest::N
    heater::Thermostat
end

local_wires(::Events) = ()
input_wires(::Events) = ("ambient" => "heater/ambient",)
output_wires(::Events) = ("pods/a/h" => "a", "pods/b/h" => "b", "nest/y" => "step", "nest/h" => "h",
                          "heater/T" => "T", "heater/heating" => "heating")

# The keyed pods: a short name and one face each, narrower than their two pills; the nest's two levels each hold
# an event; the heater a localized and a non-localized event in one component.
events() = Events((a = pod(0.8, 1//50), b = pod(0.5, 1//10)),
                  Group((; step = Step(t_step = 1.0, localized = false),
                           deep = Group((; ball = Bouncer(0.6)); output_wires = ("ball/h" => "h",)));
                        output_wires = ("step/y" => "y", "deep/h" => "h")),
                  Thermostat(18.0, 22.0, 30.0))

end # module Synthetic
