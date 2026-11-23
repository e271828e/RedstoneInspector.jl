import { describe, expect, it } from "vitest";
import { DOCS_URL, refLink, renderDocstring, rewriteRefs } from "./docstring";
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
  it("sends an explicit binding to the API page, qualified as written or joined with the type's module", () => {
    expect(refLink("`trim!`", "Redstone.trim!", T)).toBe(`${DOCS_URL}api/#Redstone.trim!`);
    expect(refLink("the junction", "Junction", T)).toBe(`${DOCS_URL}api/#Redstone.Library.Junction`);
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
