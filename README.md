# highlightjs-carve

[![CI](https://github.com/markup-carve/highlightjs-carve/actions/workflows/ci.yml/badge.svg)](https://github.com/markup-carve/highlightjs-carve/actions/workflows/ci.yml)

[Carve](https://markup-carve.github.io/carve/) language definition for
[highlight.js](https://highlightjs.org/).

Carve is a post-Markdown markup language whose inline delimiters deliberately
differ from Markdown's: emphasis is `/italic/`, strong is `*bold*`, `_x_` is
underline, `~x~` is strikethrough, and sup/sub are braced (`{^x^}`, `{,x,}`). A
Markdown grammar therefore highlights a Carve document wrongly rather than not
at all, which is why Carve needs its own definition.

highlight.js does not bundle new languages
([their contributing guide](https://github.com/highlightjs/highlight.js/blob/main/docs/language-contribution.rst):
"due to lack of maintainer time we no longer merge new languages grammars into
the core library"), so Carve ships as this third-party package.

## Install

```sh
npm install highlight.js highlightjs-carve
```

## Usage

### ES modules

```js
import hljs from 'highlight.js'
import carve from 'highlightjs-carve'

hljs.registerLanguage('carve', carve)

const { value } = hljs.highlight(source, { language: 'carve' })
```

### Browser, no bundler

The definition is UMD and dependency-free, so a plain `<script>` after
highlight.js registers it against the global `hljs`:

```html
<link rel="stylesheet" href="https://unpkg.com/highlight.js/styles/github.css">
<script src="https://unpkg.com/highlight.js/lib/highlight.min.js"></script>
<script src="https://unpkg.com/highlightjs-carve/src/languages/carve.js"></script>
<script>hljs.highlightAll();</script>
```

Then a fenced block marked `language-carve` or `language-crv` highlights:

```html
<pre><code class="language-carve"># Heading /italic/ *bold*</code></pre>
```

### Fence words

`carve` and `crv` both resolve to this grammar - `crv` is the file extension, so
it is the fence word an author reaches for just as readily.

## What it covers

Headings, lists (including task items), tables, blockquotes, fenced and raw
blocks, container divs, front matter and comments; inline emphasis in Carve's
spelling, code and inline literals, links, images, spans, attributes,
footnotes, math, CriticMarkup, citations, code callouts, mentions, tags and
emoji.

**One deliberate limit.** highlight.js modes are line-based, so this grammar has
no container model and cannot tell ` # H` at document level (a paragraph, per
the spec) from the same opener at a list item's content column (a real
heading). Every block opener is therefore anchored `^[ \t]*` and knowingly
over-colours the indented-at-document-level case; anchoring at column 0 instead
would stop highlighting every legitimately indented construct inside a list
item, which is the common valid shape. The TextMate grammar in carve-grammars
does track the content column and makes that distinction, and the trade-off is
written up
[there](https://github.com/markup-carve/carve-grammars#where-the-three-grammars-deliberately-differ).

## Relationship to carve-grammars

The definition is developed in
[carve-grammars](https://github.com/markup-carve/carve-grammars), which holds
the Prism, highlight.js, TextMate and Tiptap surfaces together with one shared
construct inventory so a syntax construct cannot land on some of them and be
forgotten on the rest.

This package vendors the highlight.js file from there verbatim, because a CDN
cannot resolve the bare import a re-export would contain. The copy is
generated, never edited:

```sh
npm run sync    # regenerate from the installed dependency
npm test        # fails if the committed copy no longer matches it
```

So fixes belong upstream in carve-grammars. Report grammar bugs there; report
packaging and registration bugs here.

## Tests

```sh
npm install
npm test
```

`test/registration-test.mjs` covers both documented entry paths and asserts real
token output rather than "did not throw". `test/drift-test.mjs` re-runs the
generator and compares, which is what keeps the vendored copy honest.

## License

MIT, see [LICENSE](LICENSE). The definition it vendors is MIT from
carve-grammars.
