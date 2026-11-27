using Pkg.Artifacts
dist = ARGS[1]
function pack(out)
    tree = create_artifact(dir -> cp(dist, dir; force = true))
    sha = archive_artifact(tree, out)
    return tree, sha
end
t1, s1 = pack("a.tar.gz"); sleep(2)
touch(joinpath(dist, "index.html"))            # a new mtime, the same bytes
t2, s2 = pack("b.tar.gz")
println("tree  ", t1, "  same=", t1 == t2)
println("sha   ", s1, "  same=", s1 == s2)
println("files ", length(readdir(artifact_path(t1))), "  ", readdir(artifact_path(t1)))
println("size  ", filesize("a.tar.gz"))
bind_artifact!("Artifacts.toml", "bundle", t1; download_info = [("https://example.invalid/bundle.tar.gz", s1)], force = true)
print(read("Artifacts.toml", String))
remove_artifact(t1)
