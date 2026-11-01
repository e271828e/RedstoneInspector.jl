# The repo's own models, one function per fixture file, each named as its file.
module Synthetic

using Redstone
import Redstone: AbstractComponent, x_init, s_init, m_init, u_types, y_types, y_state,
    y_direct, x_deriv, s_update, local_wires, input_wires, output_wires, sample_times,
    transparent_container, Absolute, Relative, Hz
import Redstone.Blocks: Group, Constant
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

end # module Synthetic
