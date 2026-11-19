import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { FILES, render, target, upstreamFile, upstreamVersion } from '../scripts/sync.mjs'

for (const file of FILES) {
    assert.equal(readFileSync(target(file), 'utf8'),
        render(readFileSync(upstreamFile(file), 'utf8'), upstreamVersion(), file),
        `src/languages/${file} differs from the pinned carve-grammars source`)
}
console.log(`${FILES.length} pinned grammar files match carve-grammars`)
