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
import { FILES, render, target, upstreamFile, upstreamVersion } from '../scripts/sync.mjs'

for (const file of FILES) {
    assert.strictEqual(
        readFileSync(target(file), 'utf8'),
        render(readFileSync(upstreamFile(file), 'utf8'), upstreamVersion(), file),
        'src/languages/' + file + ' is out of date with @markup-carve/carve-grammars@'
            + upstreamVersion()
            + '. Run: npm run sync',
    )
    console.log('  ok vendored ' + file + ' matches @markup-carve/carve-grammars@' + upstreamVersion())
}

console.log('\n' + FILES.length + ' passed')
