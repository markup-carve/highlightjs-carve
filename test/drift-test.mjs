/**
 * The vendored definition equals what the installed dependency ships.
 *
 * This is what makes vendoring safe. `src/languages/carve.js` is generated, so
 * the failure mode is that the dependency moves and the copy does not - which
 * is invisible in a diff and would ship a stale grammar under a fresh version.
 * Re-running the generator and comparing catches exactly that, and it also
 * catches a hand-edit of the generated file.
 */
import assert from 'node:assert'
import { readFileSync } from 'node:fs'
import { render, upstreamVersion } from '../scripts/sync.mjs'

const vendored = readFileSync(new URL('../src/languages/carve.js', import.meta.url), 'utf8')
const expected = render()

assert.strictEqual(
    vendored,
    expected,
    'src/languages/carve.js is out of date with @markup-carve/carve-grammars@'
        + upstreamVersion()
        + '. Run: npm run sync',
)

console.log('  ok vendored definition matches @markup-carve/carve-grammars@' + upstreamVersion())
console.log('\n1 passed')
