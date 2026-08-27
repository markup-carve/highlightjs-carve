# Changelog

All notable changes to highlightjs-carve are documented in this file.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

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
