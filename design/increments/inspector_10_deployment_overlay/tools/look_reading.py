# Independent reading of the look's rulings from the record. fixture|section|key|text
#   python3 -I look_reading.py <descriptors' folder>... > reading.out
import json, sys, glob, os
from fractions import Fraction as F
from math import gcd, lcm, floor, ceil
SUB="₀₁₂₃₄₅₆₇₈₉"; SUP="⁰¹²³⁴⁵⁶⁷⁸⁹"
sub=lambda k:"".join(SUB[int(c)] for c in str(k)); sup=lambda k:"" if k==1 else "".join(SUP[int(c)] for c in str(k))
q=lambda o:F(o["num"],o["den"])
def sec(x):
    x=F(x)
    if x==0: return "0"
    return (str(x.numerator) if x.denominator==1 else f"{x.numerator}/{x.denominator})")[:None].rstrip(")")+" s"
bm=lambda k:"0" if k==0 else ("Δt_base" if k==1 else f"{k}·Δt_base")
def flcm(a,b): a,b=F(a),F(b); return F(lcm(a.numerator,b.numerator),gcd(a.denominator,b.denominator))
plural=lambda n,w:f"{n} {w}" if n==1 else f"{n} {w}s"
def run(path):
    name=os.path.basename(path)[:-5]; d=json.load(open(path)); kind=d["kind"]; body=d[kind]
    dep=body if kind=="deployment" else None
    s=(body["build"] if dep else body).get("structure")
    out=[]; emit=lambda a,k,v: out.append(f"{name}|{a}|{k}|{v}")
    if not s or "nodes" not in s: emit("structure","-","none"); return out
    A=s["anchors"]; aname=lambda k:"A₀ (base)" if k==0 else f"A{sub(k)} ({A[k-1]['key']})"
    base=q(dep["dt_base"]) if dep else None; frame=q(dep["dt_frame"]) if dep else None
    R=dep["schedule"]["rows"] if dep else []
    if dep:
        alg=dep["algorithm"]; hm=q(dep["h_max"])
        emit("head","1",f"Δt_frame: {sec(frame)}   Δt_base: {sec(base)}")
        l=f"algorithm: {alg['text']}   h_max: {sec(hm)}"
        if alg["proposes"]:
            if dep.get("h_min"): l+=f"   h_min: {sec(q(dep['h_min']))}"
            l+=f"   attempt_budget: {dep['attempt_budget']}"
        emit("head","2",l)
        lo=ceil(frame/hm); st=str(lo)
        if alg["proposes"] and dep.get("h_min"): st=f"{lo} to {max(lo,floor(frame/q(dep['h_min'])))}, as proposed"
        sp=[r["path"] or "/" for r in R if (r["D"]*base)%frame or (r["phi"]*base)%frame]
        emit("head","3",(f"steps per unsplit frame: {st}   rows that split frames: {', '.join(sp)}" if sp else f"steps per frame: {st}"))
        if not R: emit("hyper","-","none")
        else:
            H=1
            for r in R: H=lcm(H,r["D"])
            emit("hyper","-",f"hyperperiod: {plural(H,'base tick')} ({sec(H*base)})")
            j=flcm(H*base,frame); jt=j/base; jf=j/frame
            emit("joint","-",f"the chart spans the joint period with Δt_frame: {plural(jt,'base tick')} ({sec(j)}), {plural(jf,'frame')}" if jt>H else "none")
            lines=base%frame!=0
            emit("omitted","-",f"chart omitted: the joint period is {plural(jt,'base tick')} ({sec(j)})" if jt>1000 or (lines and jf>1000) else "none")
    g=s["grid"]; pool=g["pool"]
    if A:
        adm=q(g["admissible"])
        emit("grid","first",f"Δt_base: {sec(base)}, coarsest admissible: {sec(adm)}" if dep else f"coarsest admissible Δt_base: {sec(adm)}")
        sym=lambda e:("Δt" if e["kind"]=="period" else "τ")+f"(A{sub(e['anchor'])})"
        n=0
        for e in pool:
            if e["factor"]<=1: continue
            a=A[e["anchor"]-1]; v=q(a["dt"] if e["kind"]=="period" else a["tau"])
            t=f"{sym(e)} = {sec(v)} ({a['key']}) makes the grid {e['factor']}× finer."
            if e.get("alternatives"): t+=f" With {sym(e)} = {' or '.join(sec(q(x)) for x in e['alternatives'])}, the coarsest admissible Δt_base would be {sec(e['factor']*adm)}."
            n+=1; emit("grid",f"entry{n}",t)
        if adm.denominator!=1:
            pw=[f"{p['prime']} unfactored" if p.get("unfactored") else f"{p['prime']}{sup(p['power'])}" for p in g["primes"]]
            emit("grid","primes",f"Prime factors of the denominator, {adm.denominator} = {'·'.join(pw)}")
            for i,p in enumerate(g["primes"]):
                emit("grid",f"prime{i+1}",f"{pw[i]}: "+", ".join(f"{sym(pool[j-1])} ({A[pool[j-1]['anchor']-1]['key']})" for j in p["suppliers"]))
    else: emit("grid","first","none")
    byp={n["path"]:n for n in s["nodes"]}; sc={x["path"]:x for x in s["scopes"]}
    assert len(sc)==len(s["scopes"]),"two scope rows on one path"
    rows={r["path"]:r for r in R}; srows={(r["path"],r["key"]):r for r in dep["schedule"]["scopes"]} if dep else {}
    def enc(p):
        while "/" in p:
            p=p.rsplit("/",1)[0]
            if p in sc: return p
    def table(p,t,r):
        e=enc(p) if p else None
        st=sc[e]["timing"] if e else {"anchor":0,"D":1,"phi":0}
        k,Da,Pa=t["anchor"],t["D"],t["phi"]; L=[]
        if k==st["anchor"]:
            Ds=F(Da,st["D"]); ph=F(Pa-st["phi"],st["D"])
            L.append(f"scope {e or 'the root'} Dₛ = {Ds} Φₛ = {ph} "+(f"ticks of {e}" if e else "base ticks"))
        L.append(f"anchor {aname(k)} Dₐ = {Da} Φₐ = {Pa} "+(f"ticks of A{sub(k)}" if k else "base ticks")+" ["+("the base grid" if k==0 else f"{A[k-1]['key']} at {A[k-1]['scope'] or 'the root'}")+"]")
        if dep: L.append(f"base grid D₀ = {r['D']} Φ₀ = {r['phi']} base ticks"); dt,tau=sec(r["D"]*base),sec(r["phi"]*base)
        elif k==0: dt,tau=bm(Da),bm(Pa)
        else: dt,tau=sec(Da*q(A[k-1]["dt"])),sec(q(A[k-1]["tau"])+Pa*q(A[k-1]["dt"]))
        L.append(f"seconds Δt = {dt} τ = {tau}")
        return " | ".join(L), f"Δt {dt} · τ {tau}"
    types={t["name"]:t for t in s["types"]}
    for n in s["nodes"]:
        p=n["path"]; tm=None; ch="none"
        if n["class"]=="primitive":
            if n["tier"]=="discrete":
                tm=table(p,n["timing"],rows.get(p))
                jr=lambda o:f"{o['num']}//{o['den']}"
                if n["rates"]: ch=" → ".join(f"{l['key']} = "+(f"Relative({l['D']}, {l['phi']})" if "D" in l else f"Absolute({jr(l['dt'])}, {jr(l['tau'])})") for l in n["rates"])
        elif p in sc: tm=table(p,sc[p]["timing"],srows.get((p,sc[p]["key"])))
        T=types.get(n["type"],{})
        S=[]
        if n["signature"]!=n["type"]: S.append("signature")
        if T.get("docstring"): S.append("docstring")
        if T.get("locations"): S.append("locations")
        if tm: S.append("timing")
        if n["parameters"]: S.append("parameters")
        if n["inputs"] or n["outputs"]: S.append("faces")
        emit("sections",p or "/"," ".join(S))
        emit("timing",p or "/",tm[0] if tm else "none"); 
        if tm: emit("chain",p or "/",ch)
    return out
for d in sys.argv[1:]:
    for f in sorted(glob.glob(d+"/*.json")):
        for l in run(f): print(l)
