import assert from 'node:assert/strict'
import hljs from 'highlight.js'
import carve from '../src/index.js'

hljs.registerLanguage('carve', carve)
const highlight = (source) => hljs.highlight(source, { language: 'carve' }).value
let passed = 0
const ok = (label, condition) => {
  assert.ok(condition, label)
  passed++
}

// carve#5091 D3: alignment sits in the cell's leading braces.
const align = (symbol) => `{<span class="hljs-table-alignment">${symbol}</span>`
const braced = highlight('|={<} A |={~} B |={>} C |\n| a |{> .num} 12 |{?v} x |')
for (const symbol of ['&lt;', '~', '&gt;', '?v']) {
  ok('braced alignment ' + symbol + ' scopes', braced.includes(align(symbol)))
}
ok('braced alignment keeps its attributes', braced.includes(align('&gt;') + ' .num}'))
ok('the deprecated glued marker still scopes', highlight('|=> A |').includes('<span class="hljs-table-alignment">&gt;</span> A'))

// carve#5016: a first-line --- with no closing dash line is front matter to the end.
const open = highlight('---\n\n# H')
ok('closerless front matter opens', open.startsWith('<span class="hljs-meta">---</span><span class="language-yaml">'))
ok('closerless front matter runs to the end', !open.includes('hljs-section'))
ok('a closed front matter still ends', highlight('---\ntitle: x\n---\n\n# H').includes('<span class="hljs-section"># H</span>'))
ok('*** is a thematic break', highlight('a\n\n***').endsWith('<span class="hljs-meta">***</span>'))

// carve#4197: the = of !=, <= and >= neither opens nor closes a highlight.
ok('a comparison does not close a highlight', !highlight('x =y z<= w').includes('hljs-addition'))
ok('a comparison inside a highlight', highlight('x =!== y').includes('<span class="hljs-addition">=<span class="hljs-literal">!=</span>=</span>'))
ok('a highlight closes after a comparison', highlight('a =b>= c= d').includes('<span class="hljs-addition">=b<span class="hljs-literal">&gt;=</span> c=</span>'))
ok('an arrow still closes a highlight', highlight('x =y<== z').includes('<span class="hljs-addition">=y&lt;=</span>'))

console.log(`${passed} wave ruling assertions passed`)
