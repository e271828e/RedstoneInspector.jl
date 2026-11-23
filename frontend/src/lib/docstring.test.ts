import { describe, expect, it } from "vitest";
import { DOCS_URL, joinBare, refLink, renderDocstring, rewriteRefs } from "./docstring";
import { fixtureModel } from "./fixtures";
import type { Model } from "./model";

const row = (m: Model, name: string) => m.structure!.types.find((t) => t.name === name)!;
const lib = fixtureModel("library");
const integrator = row(lib, "Redstone.Library.Integrator");
const hrefs = (html: string) => [...html.matchAll(/<a href="([^"]*)"/g)].map((m) => m[1]);
const HOSTILE = "a <b>x</b> and <script>alert(1)</script>\n\n![alt](https://x/y.png) [x](javascript:alert(1))";

describe("refLink", () => {
  const T = "Redstone.Library.Integrator";
  it("sends a glossary id to the glossary page", () => {
    expect(refLink("component", "g-component", T)).toBe(`${DOCS_URL}glossary/#g-component`);
  });
  it("sends a target under Redstone. to the API page as written, and shows any other target as text", () => {
    expect(refLink("`trim!`", "Redstone.trim!", T)).toBe(`${DOCS_URL}api/#Redstone.trim!`);
    expect(refLink("the junction", "Junction", T)).toBeUndefined();
  });
  it("reads a bare link's binding from its text, backticks stripped", () => {
    expect(refLink("`init!`", undefined, T)).toBe(`${DOCS_URL}api/#Redstone.Library.init!`);
    expect(refLink("`Build.x`", undefined, "Redstone.Foo")).toBe(`${DOCS_URL}api/#Build.x`);
    expect(refLink("`x_init`", undefined, "Redstone.Foo")).toBe(`${DOCS_URL}api/#Redstone.x_init`);
  });
  it("gives no URL for a type outside Redstone", () => {
    expect(refLink("component", "g-component", "RedstoneExamples.Longitudinal")).toBeUndefined();
    expect(refLink("`init!`", undefined, "Main.Plant")).toBeUndefined();
  });
});

// deployment_overlay.md answer 15, as amended 2026-11-23: the target read, the joining kept for a bare link
describe("refLink reads the target", () => {
  it("links a target under Redstone. whatever the type's module, never joined", () => {
    expect(refLink("`Pinned`", "Redstone.Pinned", "Main.Plant")).toBe(`${DOCS_URL}api/#Redstone.Pinned`);
    expect(refLink("`Pinned`", "Redstone.Pinned", "RedstoneExamples.Longitudinal")).toBe(`${DOCS_URL}api/#Redstone.Pinned`);
    expect(refLink("`Pinned`", "Redstone.Pinned", "Redstone.Library.Freeze")).toBe(`${DOCS_URL}api/#Redstone.Pinned`);
  });
  it("shows a target outside Redstone as text, in a core type's docstring too", () => {
    expect(refLink("`helper`", "MyPkg.helper", "Main.Plant")).toBeUndefined();
    expect(refLink("`helper`", "MyPkg.helper", "Redstone.Library.Integrator")).toBeUndefined();
  });
  it("shows a link to the module Redstone itself as text in a core type's docstring, the module not being under Redstone.", () => {
    expect(refLink("`Redstone`", "Redstone", "Redstone.Library.Integrator")).toBeUndefined();
    const html = renderDocstring("Part of [`Redstone`](@ref Redstone).", "Redstone.Library.Integrator");
    expect(hrefs(html)).toEqual([]);
    expect(html).toContain("Part of <code>Redstone</code>.");
  });
  it("joins a bare link to its type's module only under Redstone.", () => {
    expect(joinBare("`Pinned`", "Redstone.Library.Freeze")).toBe(`${DOCS_URL}api/#Redstone.Library.Pinned`);
    expect(refLink("`Pinned`", undefined, "Main.Plant")).toBeUndefined();
  });
  it("a user's docstring with a rewritten link: that one link, the glossary id, the bare link and the foreign target as text", () => {
    const html = renderDocstring("Wraps [`Pinned`](@ref Redstone.Pinned) and [`helper`](@ref MyPkg.helper); see [entry](@ref g-entry) and [`init!`](@ref).", "Main.Plant");
    expect(hrefs(html)).toEqual([`${DOCS_URL}api/#Redstone.Pinned`]);
    expect(html).toContain("<code>helper</code>; see entry and <code>init!</code>.");
  });
  it("library: 260 glossary links, 101 joined and 2 targets read, as the oracle classes them", () => {
    const all = lib.structure!.types.flatMap((t) => hrefs(renderDocstring(t.docstring ?? "", t.name)));
    expect(all.filter((h) => h.startsWith(`${DOCS_URL}glossary/`))).toHaveLength(260);
    expect(all.filter((h) => h.startsWith(`${DOCS_URL}api/`))).toHaveLength(103);
    expect(all.filter((h) => h === `${DOCS_URL}api/#Redstone.trim!` || h === `${DOCS_URL}api/#Redstone.linearize`)).toHaveLength(2);
    expect(all).toHaveLength(363);
  });
});

describe("rewriteRefs", () => {
  it("rewrites the Integrator row's eleven glossary links and three bare ones", () => {
    const out = rewriteRefs(integrator.docstring!, integrator.name);
    expect(out).not.toContain("@ref");
    for (const g of ["primitive", "library-component", "stage-function", "feedthrough", "activation", "face", "state-event",
      "non-localized", "boundary", "edge-semantics", "boundary-zero"]) {
      expect(out).toContain(`](${DOCS_URL}glossary/#g-${g})`);
    }
    expect(out).toContain(`[\`Comparator\`](${DOCS_URL}api/#Redstone.Library.Comparator)`);
    expect(out).toContain(`[\`LimitedIntegrator\`](${DOCS_URL}api/#Redstone.Library.LimitedIntegrator)`);
    expect(out).toContain(`[\`DiscreteIntegrator\`](${DOCS_URL}api/#Redstone.Library.DiscreteIntegrator)`);
    expect(out.match(/\]\(https:/g)).toHaveLength(14);
  });
  it("qualifies the LQRTracker row's explicit target as written", () => {
    const r = row(lib, "Redstone.Library.LQRTracker");
    expect(rewriteRefs(r.docstring!, r.name)).toContain(`[\`trim!\`](${DOCS_URL}api/#Redstone.trim!)`);
  });
  it("joins the Freeze row's bare Pinned, a name of Redstone, with the row's module", () => {
    const r = row(lib, "Redstone.Library.Freeze");
    expect(rewriteRefs(r.docstring!, r.name)).toContain(`[\`Pinned\`](${DOCS_URL}api/#Redstone.Library.Pinned)`);
  });
  it("leaves a link outside Redstone as its text", () => {
    expect(rewriteRefs("See [`init!`](@ref) and [component](@ref g-component).", "Main.Plant")).toBe("See `init!` and component.");
  });
});

describe("renderDocstring", () => {
  it("renders closed_loop's Longitudinal row without a link", () => {
    const r = row(fixtureModel("closed_loop"), "RedstoneExamples.Longitudinal");
    const html = renderDocstring(r.docstring!, r.name);
    expect(html).not.toContain("<a");
    expect(html).toContain("<pre><code>");
  });
  it("renders the Integrator source: the signature a code block, fourteen links in a new tab, no raw tag", () => {
    const html = renderDocstring(integrator.docstring!, integrator.name);
    expect(html.startsWith("<pre><code>Integrator(; x0 = 0.0, reset::Bool = false) -&gt; Integrator")).toBe(true);
    const links = hrefs(html);
    expect(links).toHaveLength(14);
    expect(links.filter((h) => h.startsWith(`${DOCS_URL}glossary/#g-`))).toHaveLength(11);
    expect(links).toContain(`${DOCS_URL}api/#Redstone.Library.LimitedIntegrator`);
    expect(links).toContain(`${DOCS_URL}api/#Redstone.Library.DiscreteIntegrator`);
    expect(html.match(/<a [^>]*target="_blank" rel="noopener"/g)).toHaveLength(14);
    expect(html).not.toContain("@ref");
  });
  it("shows a hostile source's raw HTML as text, its image as its text and its javascript link as text", () => {
    const html = renderDocstring(HOSTILE, "Redstone.Library.X");
    expect(html).toContain("&lt;b&gt;x&lt;/b&gt;");
    expect(html).toContain("&lt;script&gt;");
    expect(html).toContain("<code>alt</code>");
    expect(html).not.toMatch(/<(b|script|img|a)[\s>]/);
    expect(html).not.toContain("javascript:");
  });
});
