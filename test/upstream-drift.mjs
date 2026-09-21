/**
 * The vendored definition equals what the LATEST PUBLISHED carve-grammars ships.
 *
 * `drift-test.mjs` compares against the installed dependency, and `npm install`
 * keeps any lockfile entry that still satisfies the range, so it cannot see
 * upstream moving on. This reads the registry instead. It needs the network,
 * so it runs on a schedule (`.github/workflows/upstream-drift.yml`), not in `npm test`.
 */
import { execFileSync } from 'node:child_process'
import { mkdtempSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { render } from '../scripts/sync.mjs'

const pkg = '@markup-carve/carve-grammars'
const npm = (...args) => execFileSync('npm', args, { encoding: 'utf8' }).trim()

const latest = npm('view', pkg + '@latest', 'version')
const dir = mkdtempSync(join(tmpdir(), 'carve-grammars-'))
try {
    const tarball = npm('pack', pkg + '@' + latest, '--silent', '--pack-destination', dir)
    execFileSync('tar', ['-xzf', join(dir, tarball), '-C', dir, 'package/highlightjs/carve.js'])
    const published = render(readFileSync(join(dir, 'package/highlightjs/carve.js'), 'utf8'), latest)
    const vendored = readFileSync(new URL('../src/languages/carve.js', import.meta.url), 'utf8')
    const at = (vendored.match(/carve-grammars@(\S+)/) ?? [])[1] ?? 'unknown'

    if (vendored !== published) {
        console.error(`src/languages/carve.js (vendored from ${pkg}@${at}) differs from the latest published ${pkg}@${latest}.`)
        console.error(`Raise the devDependency to ^${latest}, run npm install and npm run sync.`)
        process.exitCode = 1
    } else {
        console.log(`  ok vendored definition matches the latest published ${pkg}@${latest}`)
    }
} finally {
    rmSync(dir, { recursive: true, force: true })
}
