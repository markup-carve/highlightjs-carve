# Development

## Regenerating the vendored definition

```sh
npm install     # install the generator and grammar dependency
npm run sync    # regenerate from the installed dependency
npm test        # fails if the committed copy no longer matches it
```

## Tests

```sh
npm install
npm test
```

`test/registration-test.mjs` covers both documented entry paths and asserts real
token output rather than "did not throw". `test/drift-test.mjs` re-runs the
generator and compares, which is what keeps the vendored copy honest.
`test/timing-test.mjs` highlights long runs of unclosed delimiters under a
deadline, so a definition that backtracks exponentially fails before it ships.

`npm test` never touches the network, so it cannot notice a new carve-grammars
release while the lockfile still satisfies the range. `npm run drift:upstream`
compares the vendored copy against the latest published release instead, and
against `highlightjs/carve.js` on carve-grammars main. The `Upstream drift`
workflow runs it daily and reports a copy behind main as a warning.
