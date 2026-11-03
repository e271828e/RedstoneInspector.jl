// A type's docstring rendered from Markdown (workspace.md answer 4, build_release.md
// answer 7): Documenter's `@ref` links rewritten to the core's hosted docs before
// parsing, a type outside `Redstone` keeping them as their text; raw HTML shown as
// text, images as their text, links kept only with an http scheme and opened in a
// new tab. Pure.
import { Marked, type Tokens } from "marked";

/** The core's documentation, `stable/` after its first release. */
export const DOCS_URL = "https://e271828e.github.io/Redstone.jl/dev/";

/**
 * The URL a `@ref` link resolves to, or `undefined` when it renders as its text: a glossary id `g-…` on the glossary
 * page, a binding on the API page, qualified as written or joined with the type's module, the link's text the binding
 * when no target is given.
 */
export function refLink(text: string, target: string | undefined, typeName: string): string | undefined {
  if (!typeName.startsWith("Redstone.")) return undefined;
  if (target?.startsWith("g-")) return `${DOCS_URL}glossary/#${target}`;
  const name = target ?? text.replace(/^`+|`+$/g, "");
  const module = typeName.slice(0, typeName.lastIndexOf("."));
  return `${DOCS_URL}api/#${name.includes(".") ? name : `${module}.${name}`}`;
}

/** Every `[text](@ref)` and `[text](@ref target)` replaced by `[text](url)`, or by `text` alone without a URL. */
export function rewriteRefs(source: string, typeName: string): string {
  return source.replace(/\[([^\]]+)\]\(@ref(?:\s+([^)\s]+))?\s*\)/g, (_, text: string, target: string | undefined) => {
    const url = refLink(text, target, typeName);
    return url === undefined ? text : `[${text}](${url})`;
  });
}

const escape = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

const marked = new Marked({
  gfm: true,
  renderer: {
    html: ({ text }: Tokens.HTML | Tokens.Tag) => escape(text),
    image: ({ text }: Tokens.Image) => `<code>${escape(text)}</code>`,
    link({ href, title, tokens }: Tokens.Link) {
      const text = this.parser.parseInline(tokens);
      if (!/^https?:\/\//.test(href)) return text;
      return `<a href="${escape(href)}" target="_blank" rel="noopener"${title ? ` title="${escape(title)}"` : ""}>${text}</a>`;
    },
  },
});

/** The docstring as HTML, safe to insert: its `@ref` links rewritten for `typeName`, its raw HTML and images inert. */
export function renderDocstring(source: string, typeName: string): string {
  return marked.parse(rewriteRefs(source, typeName), { async: false });
}
