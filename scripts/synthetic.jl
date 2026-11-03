# The repo's own models, one function per fixture file, each named as its file.
module Synthetic

using Redstone
import Redstone: AbstractComponent, x_init, s_init, m_init, u_types, y_types, y_state,
    y_direct, x_deriv, s_update, local_wires, input_wires, output_wires, sample_times,
    transparent_container, input_passthrough, Absolute, Relative, Hz
import Redstone.Blocks: Group, Constant, Junction, SumJunction, Or, And, Pack, Unpack, Switch, StopRequest,
    Step, Source, GaussianWhiteNoise, Integrator, LimitedIntegrator, FirstOrderLag, StateSpace,
    TransferFunction, Relay, UnitDelay, DiscreteIntegrator, RateLimiter, DiscreteStateSpace,
    DiscreteTransferFunction, DiscretizedStateSpace, DiscretizedTransferFunction,
    DiscreteLimitedIntegrator, Delay, Freeze, PID, DiscretePID, LQRTracker, DiscreteLQRTracker
using StaticArrays: SVector, SMatrix
using Random: Xoshiro

# --- large: the spike's 150 blocks ---------------------------------------------

port_names(prefix, n) = ntuple(i -> Symbol(prefix, i), n)

"A leaf of `NI` inputs and `NO` outputs, every output its state, the gained input sum's integral."
struct ContinuousBlock{NI, NO} <: AbstractComponent
    gain::Float64
end

"A leaf of `NI` inputs and `NO` outputs, every output its store, the gained input sum's accumulation."
struct DiscreteBlock{NI, NO} <: AbstractComponent
    gain::Float64
end

u_types(::Union{ContinuousBlock{NI}, DiscreteBlock{NI}}) where {NI} =
    NamedTuple{port_names(:in, NI)}(ntuple(_ -> Float64, NI))
y_types(::Union{ContinuousBlock{NI, NO}, DiscreteBlock{NI, NO}}) where {NI, NO} =
    NamedTuple{port_names(:out, NO)}(ntuple(_ -> Float64, NO))

x_init(::ContinuousBlock) = (q = 0.0,)
x_deriv(c::ContinuousBlock, (; u)) = (q = c.gain * sum(u),)
y_state(::ContinuousBlock{NI, NO}, (; x)) where {NI, NO} =
    NamedTuple{port_names(:out, NO)}(ntuple(_ -> x.q, NO))

s_init(::DiscreteBlock) = (q = 0.0,)
s_update(c::DiscreteBlock, (; s, u)) = (q = s.q + c.gain * sum(u),)
y_state(::DiscreteBlock{NI, NO}, (; s)) where {NI, NO} =
    NamedTuple{port_names(:out, NO)}(ntuple(_ -> s.q, NO))

series(gain) = Group((; a = ContinuousBlock{1, 1}(gain), b = ContinuousBlock{1, 1}(gain));
                     local_wires = ("a/out1" => "b/in1",),
                     input_wires = ("in1" => "a/in1",),
                     output_wires = ("b/out1" => "out1",))

const N_BLOCKS = 150

"""
150 blocks under one root, ten of them two-leaf assemblies, about a third of the
leaves discrete at 50 Hz, every input port fed once: the first six blocks' from
the root inputs `u1` to `u4`, the rest mostly from the eight blocks before, a
tenth from the eight after.
"""
function large()
    rng = Xoshiro(20261026)
    block_names = [Symbol("b", lpad(i, 3, '0')) for i in 1:N_BLOCKS]
    blocks = AbstractComponent[]
    input_counts = Int[]
    output_counts = Int[]
    anchored = Symbol[]
    for i in 1:N_BLOCKS
        gain = round(10 * rand(rng); digits = 3)
        if (i - 1) % 15 == 7
            push!(blocks, series(gain))
            push!(input_counts, 1)
            push!(output_counts, 1)
        else
            n_in = rand(rng, (1, 1, 2, 2, 3, 4))
            n_out = rand(rng, 1:3)
            if rand(rng) < 0.3
                push!(blocks, DiscreteBlock{n_in, n_out}(gain))
                push!(anchored, block_names[i])
            else
                push!(blocks, ContinuousBlock{n_in, n_out}(gain))
            end
            push!(input_counts, n_in)
            push!(output_counts, n_out)
        end
    end
    level_wires = Pair{String, String}[]
    root_consumers = [String[] for _ in 1:4]
    n_root = 0
    for i in 1:N_BLOCKS, port in 1:input_counts[i]
        consumer = "$(block_names[i])/in$port"
        if i <= 6
            push!(root_consumers[n_root % 4 + 1], consumer)
            n_root += 1
        else
            j = rand(rng) < 0.1 && i < N_BLOCKS ? i + rand(rng, 1:min(8, N_BLOCKS - i)) :
                                                  i - rand(rng, 1:min(8, i - 1))
            push!(level_wires, "$(block_names[j])/out$(rand(rng, 1:output_counts[j]))" => consumer)
        end
    end
    Group(NamedTuple{Tuple(block_names)}(Tuple(blocks));
          local_wires = Tuple(level_wires),
          input_wires = ntuple(i -> "u$i" => Tuple(root_consumers[i]), 4),
          output_wires = ("$(block_names[end])/out1" => "y1", "$(block_names[end - 1])/out1" => "y2"),
          sample_times = NamedTuple{Tuple(anchored)}(ntuple(_ -> Absolute(Hz(50)), length(anchored))))
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
A chain of gains through a keyed container `gains`, a `Tuple` container `pair`,
the name-transparent container `stages` and the component field `scale`.
"""
struct Containers <: AbstractComponent
    gains::NamedTuple{(:a, :b), Tuple{Gain, Gain}}
    pair::Tuple{Gain}
    stages::NamedTuple{(:s1, :s2), Tuple{Gain, Gain}}
    scale::Gain
end

transparent_container(::Containers) = :stages
local_wires(::Containers) = ("gains/a/out" => "gains/b/e", "gains/b/out" => "pair/1/e",
                             "pair/1/out" => "s1/e", "s1/out" => "s2/e", "s2/out" => "scale/e")
input_wires(::Containers) = ("u" => "gains/a/e",)
output_wires(::Containers) = ("scale/out" => "y",)

containers() = Containers((a = Gain(2.0), b = Gain(3.0)), (Gain(4.0),),
                          (s1 = Gain(0.5), s2 = Gain(0.25)), Gain(10.0))

# --- primitive: one leaf as the root ---------------------------------------------

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
                sample_times = (fast = Absolute(Hz(50)), slow = Absolute(Hz(10))))

# --- library: one of every shipped block --------------------------------------------

wave(t) = sin(t)
half(x) = x / 2

"""
One instance of every shipped block of the core's library, beside a `Junction` over
a user function, wired as one chain from the sources; the discrete leaves on two
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
             fn = Junction{Float64, Float64, 1}(half));
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
                         "fn/y" => "pid/y", "pid/u" => "d_pid/y"),
          input_wires = ("a" => ("or/in1", "and/in1"), "b" => "or/in2"),
          sample_times = (noise = Absolute(Hz(10)), dss = Absolute(Hz(50)), d_limited = Relative(2),
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
                        sample_times = (ctl = Absolute(Hz(50)),))

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
                                      sample_times = (pi = Absolute(Hz(50)),)));
                         local_wires = ("ctl/u" => "plant/u", "plant/power" => "ctl/y"),
                         input_wires = ("ref" => "ctl/ref", "d" => "plant/d"),
                         output_wires = "plant/y" => "y")

"A leaf whose `F` reads `v` and `f` directly and whose state integrates `g`."
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

"A leaf whose state output throws."
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

end # module Synthetic
