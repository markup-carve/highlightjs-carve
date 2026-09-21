# Changelog

All notable changes to highlightjs-carve are documented in this file.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

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
