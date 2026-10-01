import assert from 'node:assert/strict'
import hljs from 'highlight.js'
import carve from '../src/index.js'
hljs.registerLanguage('carve', carve)
let passed = 0
for (const prefix of ['# a ', '> # a ', '![alt](x.png)\n^ cap ', '> ![alt](x.png)\n> ^ cap ']) {
  for (const body of ['`x %% b`', '``x %% b``', '!`x %% b`', '$`x %% b`', '`x %% b', '` x `` y %% hidden', '``x```y %% hidden']) {
    const source = prefix + body + '\n\nplain tail'
    const { value } = hljs.highlight(source, { language: 'carve' })
    assert.ok(!value.includes('hljs-comment'), source)
    assert.ok(value.endsWith('\n\nplain tail'), source)
    passed += 2
  }
  for (const gap of [' ', '\t']) {
    const { value } = hljs.highlight(prefix + '`x`' + gap + '%% hidden', { language: 'carve' })
    assert.ok(value.includes('<span class="hljs-comment">%% hidden</span>'), value)
    passed++
  }
  for (const slashes of [1, 2, 3, 4]) {
    const source = prefix + String.fromCharCode(92).repeat(slashes) + '`x %% hidden'
    const { value } = hljs.highlight(source, { language: 'carve' })
    assert.equal(value.includes('hljs-comment'), slashes % 2 === 1, source)
    passed++
  }
}
console.log(`${passed} heading and caption assertions passed`)
