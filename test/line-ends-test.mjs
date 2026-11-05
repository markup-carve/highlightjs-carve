import assert from 'node:assert/strict'
import hljs from 'highlight.js'
import carve from '../src/index.js'

hljs.registerLanguage('carve', carve)

// A lone CR ends a line like LF and CRLF do (carve-grammars#822).
const samples = [
  ['image caption', '![a](b.png)\n^ Abb'],
  ['bare quote', '>\n^ no caption'],
  ['definition term', ':: term\n: description'],
  ['quoted footnote', '[^n]:\n> :: term\n> : description'],
  ['comment before term', ':: outer\n: description\n%% comment\n  :: term'],
  ['list continuation', '- item\n  +\n  next'],
  ['description with paren', '> :: a\n> : x\n> : (b)'],
  ['nonquote prefix', '?> :: a\n> : b'],
]
const normalize = (value) => value.replace(/\r\n?|\n/g, '\n')
let passed = 0
for (const [name, source] of samples) {
  const [lf, ...rest] = ['\n', '\r\n', '\r'].map((end) =>
    hljs.highlight(source.replaceAll('\n', end), { language: 'carve' }).value)
  for (const output of rest) {
    assert.equal(normalize(output), normalize(lf), name)
    passed++
  }
}

// Captions scope as title.caption with the marker apart, so stock themes color them (carve-grammars#827).
assert.equal(
  hljs.highlight('![a](i.png)\n^ Figure 1', { language: 'carve' }).value,
  '<span class="hljs-link">![a](i.png)</span>\n<span class="hljs-title caption_"><span class="hljs-punctuation caption-marker_">^</span> Figure 1</span>',
)
passed++

console.log(`${passed} line end and caption assertions passed`)
