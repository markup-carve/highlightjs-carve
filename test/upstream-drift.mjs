/**
 * Is the vendored definition behind the LATEST PUBLISHED carve-grammars?
 *
 * `drift-test.mjs` compares against the installed dependency, and `npm install`
 * keeps any lockfile entry that still satisfies the range, so it cannot see
 * upstream moving on. This reads the registry instead. It needs the network,
 * so it runs on a schedule (`.github/workflows/upstream-drift.yml`), not in `npm test`.
 *
 * A devDependency pinned to an unreleased source commit can be AHEAD of the
 * latest release; that is not drift, so the pin is checked for ancestry first.
 * With DRIFT_REPORT set the result goes to that file and only an unanswerable
 * comparison exits non-zero; without it, being behind exits non-zero.
 */
import { execFileSync } from 'node:child_process'
import { appendFileSync, mkdtempSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { render, upstreamVersion } from '../scripts/sync.mjs'

const pkg = '@markup-carve/carve-grammars'
const source = 'https://github.com/markup-carve/carve-grammars.git'
const run = (cmd, ...args) => execFileSync(cmd, args, { encoding: 'utf8' }).trim()

const latest = run('npm', 'view', pkg + '@latest', 'version')
const spec = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8')).devDependencies[pkg]
const revision = spec.match(/#([a-f0-9]{40})$/)?.[1]
const current = revision ?? upstreamVersion()
const dir = mkdtempSync(join(tmpdir(), 'carve-grammars-'))

function report(behind, note) {
    console.log(note)
    if (process.env.DRIFT_REPORT) {
        appendFileSync(process.env.DRIFT_REPORT, `behind=${behind}\ncurrent=${current}\nlatest=${latest}\n`)
    } else if (behind) {
        console.error(`Run npm install --save-dev ${pkg}@^${latest} and npm run sync.`)
        process.exitCode = 1
    }
}

try {
    if (revision) {
        const released = run('npm', 'view', pkg + '@' + latest, 'gitHead')
        const repo = join(dir, 'repo')
        run('git', 'clone', '-q', '--filter=blob:none', '--no-checkout', source, repo)
        const isAncestor = (a, b) => {
            try {
                execFileSync('git', ['-C', repo, 'merge-base', '--is-ancestor', a, b])
                return true
            } catch {
                return false
            }
        }
        if (isAncestor(revision, released)) {
            report(1, `source pin ${revision} is contained in the latest published ${pkg}@${latest}; move to the release.`)
        } else if (isAncestor(released, revision)) {
            const ahead = run('git', '-C', repo, 'rev-list', '--count', `${released}..${revision}`)
            report(0, `  ok source pin ${revision} is ${ahead} commit(s) ahead of the latest published ${pkg}@${latest}`)
        } else {
            console.error(`source pin ${revision} and the latest published ${pkg}@${latest} (${released}) have diverged.`)
            process.exitCode = 1
        }
    } else {
        const tarball = run('npm', 'pack', pkg + '@' + latest, '--silent', '--pack-destination', dir)
        execFileSync('tar', ['-xzf', join(dir, tarball), '-C', dir, 'package/highlightjs/carve.js'])
        const published = render(readFileSync(join(dir, 'package/highlightjs/carve.js'), 'utf8'), latest)
        const vendored = readFileSync(new URL('../src/languages/carve.js', import.meta.url), 'utf8')
        if (vendored === published) {
            report(0, `  ok vendored definition matches the latest published ${pkg}@${latest}`)
        } else {
            report(1, `src/languages/carve.js (vendored from ${pkg}@${current}) differs from the latest published ${pkg}@${latest}.`)
        }
    }
} finally {
    rmSync(dir, { recursive: true, force: true })
}
