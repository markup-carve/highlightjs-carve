/**
 * Unclosed inline delimiters and a list after a leading blank line highlight in linear time.
 *
 * highlightjs-carve 0.1.2 vendored a definition that backtracked exponentially
 * on repeated unclosed bare delimiters: 25 copies of `*a ` (75 bytes) did not
 * finish in 60 s. Each input runs in a worker, because a catastrophic regex
 * blocks its thread and no timer in the same thread can interrupt it.
 */
import assert from 'node:assert'
import { Worker } from 'node:worker_threads'

const REPEATS = 2000
// Linear input this size highlights in well under a second; the deadline only
// has to separate linear from exponential, so it is generous for slow CI.
const DEADLINE_MS = 10000

const INPUTS = {
  'unclosed strong': '*a ',
  'unclosed emphasis': '/a ',
  'unclosed underline': '_a ',
  'unclosed strikethrough': '~a ',
  'unclosed highlight': '=a ',
  'unclosed forced strong and emphasis': '{*a {/b ',
  'list after a leading blank line': '\n- a',
}

const worker = `
import { parentPort, workerData } from 'node:worker_threads'
const { default: hljs } = await import(workerData.core)
const { default: carve } = await import(workerData.carve)
hljs.registerLanguage('carve', carve)
const start = performance.now()
hljs.highlight(workerData.source, { language: 'carve' })
parentPort.postMessage(performance.now() - start)
`

function time(source) {
  return new Promise((resolve, reject) => {
    const w = new Worker(new URL('data:text/javascript,' + encodeURIComponent(worker)), {
      workerData: {
        source,
        core: import.meta.resolve('highlight.js/lib/core'),
        carve: new URL('../src/index.js', import.meta.url).href,
      },
    })
    const timer = setTimeout(() => {
      w.terminate()
      resolve(Infinity)
    }, DEADLINE_MS)
    w.once('message', (ms) => {
      clearTimeout(timer)
      w.terminate()
      resolve(ms)
    })
    w.once('error', (error) => {
      clearTimeout(timer)
      reject(error)
    })
  })
}

let failures = 0
for (const [label, unit] of Object.entries(INPUTS)) {
  const ms = await time(unit.repeat(REPEATS))
  if (ms < DEADLINE_MS) {
    console.log(`  ok ${label} x ${REPEATS} in ${Math.round(ms)} ms`)
  } else {
    failures += 1
    console.log(`  FAIL ${label} x ${REPEATS} did not finish in ${DEADLINE_MS} ms`)
  }
}

console.log('')
assert.strictEqual(failures, 0, failures + ' timing check(s) failed')
console.log(Object.keys(INPUTS).length + ' passed')
