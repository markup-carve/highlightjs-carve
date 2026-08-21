/**
 * Vendor the Carve highlight.js definition from `@markup-carve/carve-grammars`.
 *
 * WHY VENDOR RATHER THAN RE-EXPORT. This package exists so that a `<script>`
 * tag and a CDN URL work with no bundler:
 *
 *   <script src="https://unpkg.com/highlightjs-carve/src/languages/carve.js">
 *
 * A re-export cannot serve that - a CDN cannot resolve the bare specifier a
 * re-export would contain. The upstream file is already dependency-free UMD, so
 * a verbatim copy is the whole build.
 *
 * WHY A COPY IS SAFE HERE. It is generated, never edited, and `drift-test.mjs`
 * re-runs this script and fails if the result differs from what is committed.
 * So the copy cannot silently fall behind the dependency: the only way to change
 * it is to move the dependency and re-run `npm run sync`.
 *
 * WHY THE GRAMMAR FILE IS RESOLVED AND NOT `package.json`. The obvious spelling
 * is `require.resolve('@markup-carve/carve-grammars/package.json')`, and it
 * throws ERR_PACKAGE_PATH_NOT_EXPORTED on carve-grammars 0.1.4 - that subpath
 * was missing from its `exports` map (markup-carve/carve-grammars#287, fixed
 * after 0.1.4). Resolving the grammar subpath, which every version exports, and
 * walking up to the package root works on both sides of that fix.
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const require = createRequire(import.meta.url)

/** The installed definition, resolved through the one subpath every version exports. */
export function grammarFile() {
    return require.resolve('@markup-carve/carve-grammars/highlightjs/carve.js')
}

/** The dependency's package root, found by walking up from the resolved file. */
export function grammarsDir() {
    let dir = dirname(grammarFile())
    for (let i = 0; i < 5; i++) {
        if (existsSync(join(dir, 'package.json'))) return dir
        dir = dirname(dir)
    }
    throw new Error('could not find the carve-grammars package root above ' + grammarFile())
}

export function upstreamVersion() {
    return JSON.parse(readFileSync(join(grammarsDir(), 'package.json'), 'utf8')).version
}

/** The vendored file: a provenance header plus the upstream definition verbatim. */
export function render() {
    const source = readFileSync(grammarFile(), 'utf8')
    const header = [
        '// GENERATED FILE - DO NOT EDIT.',
        '//',
        '// Vendored verbatim from @markup-carve/carve-grammars@' + upstreamVersion(),
        '// (highlightjs/carve.js) by scripts/sync.mjs. Edit the definition there,',
        '// release carve-grammars, then run: npm run sync',
        '',
    ].join('\n')
    return header + source
}

const target = join(dirname(fileURLToPath(import.meta.url)), '..', 'src', 'languages', 'carve.js')

if (process.argv[1] && process.argv[1].endsWith('sync.mjs')) {
    writeFileSync(target, render(), 'utf8')
    console.log('synced from @markup-carve/carve-grammars@' + upstreamVersion())
}
