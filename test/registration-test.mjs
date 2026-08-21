/**
 * The definition registers and highlights, through both documented paths.
 *
 * These are the two things a consumer can actually do wrong: the ESM import
 * path (does the shim expose the factory?) and the classic-script path (does
 * the UMD file self-register without a bundler?). Both are asserted, and the
 * highlight assertion checks real token output rather than "did not throw" - a
 * definition that registers and then emits one undifferentiated blob would pass
 * the weaker check.
 */
import assert from 'node:assert'
import { readFileSync } from 'node:fs'
import vm from 'node:vm'
import hljs from 'highlight.js'
import carve from '../src/index.js'
import { REQUIRED_ALIASES, isKnownUpstreamGap } from './aliases.mjs'
import { upstreamVersion } from '../scripts/sync.mjs'

let passed = 0
const ok = (name, fn) => { fn(); passed++; console.log('  ok ' + name) }

const SAMPLE = [
    '# Heading /italic/ *bold* _under_',
    '',
    'Text with {=mark=}, ~strike~, {^sup^}, {,sub,} and `code`.',
    'A {+ins+}, {-del-}, [span]{.note}, [^fn] and a [link](https://example.com).',
    '',
    '- item',
    '- [x] done',
    '',
    '> quote',
    '',
    '::: note "Heads up"',
    'Body.',
    ':::',
].join('\n')

ok('ESM entry exports a language factory', () => {
    assert.strictEqual(typeof carve, 'function', 'default export is not a function')
    const def = carve(hljs)
    assert.strictEqual(def.name, 'Carve')
    assert.ok(Array.isArray(def.contains) && def.contains.length > 0)
})

ok('every required alias is declared, or is a recorded upstream gap', () => {
    const def = carve(hljs)
    const version = upstreamVersion()
    for (const alias of REQUIRED_ALIASES) {
        if (def.aliases.includes(alias)) continue
        assert.ok(
            isKnownUpstreamGap(alias, version),
            'alias ' + alias + ' is missing and @markup-carve/carve-grammars@' + version
                + ' is not recorded in ALIASES_MISSING_IN (declared: ' + def.aliases.join(', ') + ')',
        )
        console.log('    known upstream gap: ' + alias + ' is absent from carve-grammars@' + version)
    }
})

ok('registers and highlights with real token output', () => {
    hljs.registerLanguage('carve', carve)
    const { value } = hljs.highlight(SAMPLE, { language: 'carve' })
    assert.ok(value.length > SAMPLE.length, 'no markup was added')
    const classes = [...value.matchAll(/class="([^"]+)"/g)].map((m) => m[1])
    assert.ok(classes.length >= 8, 'expected many scoped spans, got ' + classes.length)
    assert.ok(new Set(classes).size >= 5, 'expected several distinct scopes, got ' + new Set(classes).size)
})

ok('registers under every alias the definition declares', () => {
    const declared = carve(hljs).aliases
    for (const alias of REQUIRED_ALIASES.filter((a) => declared.includes(a))) {
        assert.ok(hljs.getLanguage(alias), 'hljs.getLanguage(' + alias + ') is undefined after registration')
    }
})

ok('classic script self-registers against a global hljs', () => {
    const code = readFileSync(new URL('../src/languages/carve.js', import.meta.url), 'utf8')
    let registered = null
    const sandbox = { hljs: { registerLanguage: (name, fn) => { registered = { name, fn } } } }
    vm.createContext(sandbox)
    vm.runInContext(code, sandbox)
    assert.ok(registered && registered.name === 'carve', 'the classic script did not register the language')
    assert.strictEqual(typeof sandbox.carveHljs, 'function', 'globalThis.carveHljs was not exposed')
})

console.log('\n' + passed + ' passed')
