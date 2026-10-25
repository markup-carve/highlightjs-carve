import assert from 'node:assert/strict'
import hljs from 'highlight.js'
import carve from '../src/index.js'

hljs.registerLanguage('carve', carve)

for (const [state, label] of [['/', 'progress'], ['!', 'blocked'], ['_', 'open']]) {
  const html = hljs.highlight(`- [${state}] ${label}`, { language: 'carve' }).value
  assert.equal(html, `<span class="hljs-bullet">- [${state}]</span> ${label}`)
}

console.log('task states: progress, blocked, and open alias scoped')
