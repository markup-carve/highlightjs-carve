/**
 * Every construct scopes, and the things that only LOOK like constructs do not.
 *
 * The drift test proves the vendored file equals the dependency. It cannot say
 * whether the dependency still covers the language, so a grammar that quietly
 * lost a rule would ship green. This is the other half: it asks the definition
 * what it paints.
 *
 * The negative half matters more than the positive one. A grammar that paints
 * everything scores full marks on a coverage list and is useless - `/usr/local`
 * is not emphasis, a bare `^2^` is not superscript in Carve, and a
 * tab-separated `*[HTML]:` is not a definition. Those are the cases that
 * separate a careful grammar from an eager one, and each is a real corpus
 * document.
 */
import assert from 'node:assert'
import hljs from 'highlight.js/lib/core'
import carve from '../src/index.js'

hljs.registerLanguage('carve', carve)

const highlight = (source) => hljs.highlight(source, { language: 'carve' }).value
const painted = (source) => highlight(source).includes('class="hljs-')

/** Whether the given text is inside a scope, rather than merely present. */
function paints(source, text) {
  const html = highlight(source)
  const escaped = text.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c])
  const index = html.indexOf(escaped)
  if (index === -1) return false
  const before = html.slice(0, index)
  const opens = (before.match(/<span/g) || []).length
  const closes = (before.match(/<\/span>/g) || []).length
  return opens > closes
}

let failures = 0
const check = (label, condition) => {
  if (condition) {
    console.log('  ok ' + label)
  } else {
    failures += 1
    console.log('  FAIL ' + label)
  }
}

// ---------------------------------------------------------------------------
// Every construct the language has.
// ---------------------------------------------------------------------------
const CONSTRUCTS = {
  'strong': 'a *bold* b',
  'emphasis': 'a /it/ b',
  'underline': 'a _u_ b',
  'strikethrough': 'a ~s~ b',
  'highlight': 'a =m= b',
  'superscript': 'H{^2^}O',
  'subscript': 'H{,2,}O',
  'inline code': 'a `x` b',
  'literal code span': 'a !`x` b',
  'inline math': 'a $`e=mc` b',
  'link': '[t](/u)',
  'image': '![alt](i.png)',
  'autolink': 'see <https://example.com>',
  'cross-reference': 'see </#sec>',
  'attribute block': '{#id .cls key="v"}',
  'mention': 'hi @user',
  'tag': 'a #tag',
  'footnote reference': 'x[^1]',
  'inline footnote': 'x ^[note]',
  'citation': '[@knuth1984]',
  'symbol shortcode': 'a :smile: b',
  'inline extension': ':kbd[Ctrl]',
  'code callout': 'a <1> b',
  'heading': '# Title',
  'blockquote': '> quoted',
  'bullet item': '- item',
  'ordered item': '3. item',
  'task item': '- [x] done',
  'table header row': '|= A |= B |',
  'row attributes': '| a | b |{.ok}',
  'container': '::: note "T"',
  'caption': '^ Figure 1',
  'thematic break': '---',
  'definition term': ':: term',
  'code fence': '```php\n$x = 1;\n```',
  'raw fence': '```=html\n<b>x</b>\n```',
  'frontmatter': '---\ntitle: x\n---\n\n# H',
  'trailing comment': 'x %% note',
  'comment fence': '%%%\nhidden\n%%%',
  'critic insertion': '{+added+}',
  'critic deletion': '{-removed-}',
  'critic substitution': '{~old~>new~}',
  'forced emphasis': 'my{*x*}word',
  'abbreviation definition': '*[HTML]: HyperText',
  'link reference definition': '[ref]: /url',
  'footnote definition': '[^1]: note text',
}

console.log('constructs that must scope')
for (const [label, source] of Object.entries(CONSTRUCTS)) {
  check(label, painted(source))
}

// ---------------------------------------------------------------------------
// Shapes that look like markup and are not. Each is a corpus document.
// ---------------------------------------------------------------------------
console.log('\nshapes that must stay plain')
const NEGATIVES = {
  'a path is not emphasis': ['A path like /usr/local/bin here.', '/usr/local/bin'],
  'a range is not strikethrough': ['A range 10-20 here.', '10-20'],
  'an email is not a mention': ['Mail a@b.dev please.', 'a@b.dev'],
  'a bare caret is not superscript': ['x ^2^ y', '^2^'],
  'a bare comma is not subscript': ['typo ,oops, happens', ',oops,'],
  'a tab-separated definition marker is not a definition': ['*[HTML]:\tHyper Text', '*[HTML]:'],
  'a colon fence needs a space before its word': ['text\n:::note\nbody', ':::note'],
  'a colon with only whitespace opens no description': [':: t\n:   \n', ':   '],
  'a term marker with no content is not a term': [':: \n', ':: '],
}
for (const [label, [source, text]] of Object.entries(NEGATIVES)) {
  check(label, !paints(source, text))
}

// ---------------------------------------------------------------------------
// The definition the language actually needs, in context.
// ---------------------------------------------------------------------------
console.log('\ncontext-sensitive rulings')
check('a description with content scopes', paints(':: t\n:  real content\n', 'real content'))
check('the {empty} sentinel scopes', paints(':: t\n: {empty}\n', '{empty}'))

console.log('')
assert.strictEqual(failures, 0, failures + ' coverage check(s) failed')
console.log(Object.keys(CONSTRUCTS).length + Object.keys(NEGATIVES).length + 2 + ' passed')
