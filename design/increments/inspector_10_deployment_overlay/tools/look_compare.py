# Compares look_reading.py's output with look_modules.test.ts's.
#   python3 -I look_compare.py <reading.out> <modules.out>
import collections, sys
def load(p):
    d=collections.OrderedDict()
    for l in open(p):
        a=l.rstrip("\n").split("|",3); d[tuple(a[:3])]=a[3]
    return d
r,m=load(sys.argv[1]),load(sys.argv[2]); ag=collections.Counter(); dis=0
for (f,s,k),v in m.items():
    s0=s.replace("@level","")
    w=r.get((f,s0,k))
    if v==w: ag[s]+=1
    else: dis+=1; print("DIFF",f,s,k,"\n  mine",w,"\n  mod ",v)
for k in r:
    if k not in m: dis+=1; print("MISSING",k,r[k])
print(dict(ag),sum(ag.values()),"dis",dis, "files",len({k[0] for k in m}))
