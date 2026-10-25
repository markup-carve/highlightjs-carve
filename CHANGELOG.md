# Changelog

All notable changes to highlightjs-carve are documented in this file.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

## [0.1.8] - 2026-10-26

Carve highlighting recognizes the new task states and distinguishes table marker roles.

### Fixes

- Progress `[/]`, blocked `[!]`, and open alias `[_]` task markers receive the full list marker scope (#45).

### Improvements

- Table continuation markers have their own scope, separate from other table operators (#45).

**Full Changelog**: https://github.com/markup-carve/highlightjs-carve/compare/0.1.7...0.1.8

## [0.1.7] - 2026-10-24

Carve highlighting follows the published 0.1.12 grammar rules.

### Fixes

- Wrapped attributes in definitions and quotes, table spans, and lone continuation markers receive their current scopes.

**Full Changelog**: https://github.com/markup-carve/highlightjs-carve/compare/0.1.6...0.1.7

## [0.1.6] - 2026-10-23

### Fixed

- A document that starts with a blank line followed by a list no longer hangs
  highlight.js: 0.1.5 scoped nothing there and could spend over a minute of
  CPU. The definition moves to carve-grammars 0.1.19, which also fixes
  definition lists: a list marker under a paragraph line hosts no term, and a
  footnote body's description and tab count from the body's column.
  markup-carve/highlightjs-carve#40

## [0.1.5] - 2026-10-23

### Added

- `csv` and `tsv` fence bodies highlight their separators, quoted fields and
  header row. The package now ships `src/languages/delimited.js` (vendored from
  carve-grammars 0.1.18), the ESM entry exports `csv` and `tsv`, and the
  classic script registers both against a global `hljs`.
  markup-carve/highlightjs-carve#37

## [0.1.4] - 2026-10-23

### Fixed

- A continuation marker is highlighted where the engine reads one, by its
  container's column: a `+` before a sibling list item at its column is text,
  and `- [ ] +` scopes the bullet and the marker apart.
  markup-carve/highlightjs-carve#30, markup-carve/highlightjs-carve#31
- A quote-prefixed `+` needs one space after each `>` (markup-carve/carve#3421):
  `>+`, `>>+` and `>> +` are paragraph text, also after a list marker
  (`- >+`), while `> +` and `> > +` are markers.
  markup-carve/highlightjs-carve#32, markup-carve/highlightjs-carve#33,
  markup-carve/highlightjs-carve#34
- A code fence on a list item's marker line is highlighted as a block.
  markup-carve/highlightjs-carve#31
- Vendor the definition from the released carve-grammars 0.1.18 instead of an
  unreleased commit. A `:` below its list's column is text
  (markup-carve/carve#3458), and a quoted definition list scopes its `::` and
  `:` markers. markup-carve/highlightjs-carve#36

## [0.1.3] - 2026-10-14

### Fixed

- Highlighting no longer takes exponential time on repeated unclosed delimiters
  such as `*a *a *a ...`; 0.1.2 did not finish 75 bytes of them in a minute.
  The definition is vendored from carve-grammars main (2583b07e), which also
  brings its block-context, caption, table-cell, link-label, definition-term and
  fence-language fixes. markup-carve/highlightjs-carve#25
- The definition moves on to carve-grammars 0.1.16. An
  unclosed code fence is code to the end of the document, or to the closer of
  its container, while a closed fence longer than 32 KB still ends at its own
  closer; a footnote definition body highlights its inline markup; a `{empty}`
  body in a description or footnote is an attribute; and an escaped closer such
  as `x\]{.c}` takes no attribute block. markup-carve/highlightjs-carve#26,
  markup-carve/highlightjs-carve#29

## [0.1.2] - 2026-10-08

### Changed

- The Carve definition is vendored from carve-grammars 0.1.11 instead of 0.1.9.
  The devDependency range already allowed it, but the lockfile pinned 0.1.9, so
  neither `npm install` nor `npm ci` moved it. markup-carve/highlightjs-carve#11

### Fixed

These come with the new definition:

- A table row needs a closing pipe in its opener; a continuation row and the
  separator row get their own modes, and an inline code run inside a cell
  carries across a continuation row rather than to any later line.
  markup-carve/highlightjs-carve#11
- A comment in a heading or a caption ends where the engine ends it, so a code
  span keeps its percent runs and a trailing comment keeps its scope.
  Display math and quote continuation boundaries are covered too.
  markup-carve/highlightjs-carve#13
- An include option recognizes its marker with no space in front of it, so a
  directive that glues the option or the section onto the path still opens as a
  directive, and an unquoted option value stops at the next option marker
  instead of swallowing it. markup-carve/highlightjs-carve#19

## [0.1.1] - 2026-09-21

### Changed

- The Carve definition is vendored from carve-grammars 0.1.9 instead of 0.1.5 (#6, #9).

### Fixed

These come with the new definition:

- Emphasis, underline, strong, highlight and strike runs scope their content
  and find their closer the way the engine reads them. A closer after
  whitespace, an escaped `=`, and a bold run before a star or an unclosed
  brace no longer color text the engine renders plain
  (markup-carve/carve-grammars#392, markup-carve/carve-grammars#385,
  markup-carve/carve-grammars#390, markup-carve/carve-grammars#472,
  markup-carve/carve-grammars#473, markup-carve/carve-grammars#485).
- The include directive `{{ path #section @key:value }}` is scoped by part,
  and a line counts as a directive only when it has a path, the pad before
  `}}`, and a closer outside any quoted run
  (markup-carve/carve-grammars#403, markup-carve/carve-grammars#418,
  markup-carve/carve-grammars#419, markup-carve/carve-grammars#434).
- A reference definition is scoped only where the line completes one, with
  the destination as `link` and the title as `string`
  (markup-carve/carve-grammars#533).
- An inline attribute block with nothing to attach to is prose
  (markup-carve/carve-grammars#467), and the braced en dash `{--}` is smart
  typography rather than a deletion (markup-carve/carve-grammars#378).
- A long run of spaces before plain text no longer takes quadratic time
  (markup-carve/carve-grammars#440).

## [0.1.0] - 2026-08-27

First release.

### Added

- The Carve language definition for highlight.js, vendored verbatim from
  `@markup-carve/carve-grammars` so a `<script>` tag or a CDN URL works with no
  bundler, and re-exported as an ES module for `hljs.registerLanguage`.
- `npm run sync` regenerates the definition from the installed dependency, and
  `test/drift-test.mjs` fails when the committed copy no longer matches it - so
  a stale grammar cannot ship under a fresh version.
- Alias coverage is asserted against the same required set carve-grammars uses
  (`carve`, `crv`). Where an upstream release predates an alias, that exact
  version is recorded in `ALIASES_MISSING_IN` rather than skipped, so bumping
  the dependency re-arms the assertion.

### Known gaps

- `crv` is absent from `@markup-carve/carve-grammars@0.1.4`, the newest release
  at the time of writing (markup-carve/carve-grammars#290). It arrives with the
  next carve-grammars release; re-run `npm run sync` then and drop the entry
  from `ALIASES_MISSING_IN`.
