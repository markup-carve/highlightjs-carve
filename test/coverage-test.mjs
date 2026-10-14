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
  // A caption needs a block above it; carve 0.1.11 renders a lone `^ Figure 1` as <p>.
  'caption': '![a](i.png)\n^ Figure 1',
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
  // carve 0.1.11: `^ Figure 1` with no block above renders <p>^ Figure 1</p>.
  'a caption line with no block above is a paragraph': ['^ Figure 1', '^ Figure 1'],
  // carve 0.1.11 renders `x\]{.c} y` as <p>x]{.c} y</p>: an escaped closer takes no attribute.
  'an escaped closer takes no attribute block': ['x\\]{.c} y', '{.c}'],
}
for (const [label, [source, text]] of Object.entries(NEGATIVES)) {
  check(label, !paints(source, text))
}

// ---------------------------------------------------------------------------
// The definition the language actually needs, in context.
// ---------------------------------------------------------------------------
console.log('\ncontext-sensitive rulings')
// carve 0.1.11 renders `:: t` / `:  real content` as <dd>real content</dd>: the
// marker is syntax, the text is plain paragraph content, as in a list item.
check('a description marker scopes', highlight(':: t\n:  real content\n').split('\n')[1].startsWith('<span'))
check('description text stays plain', !paints(':: t\n:  real content\n', 'real content'))
// carve 0.1.11 renders `: {empty}` as an empty <dd></dd>: the marker opens it
// and `{empty}` is a block attribute, not text.
check('an {empty} description marker scopes', highlight(':: t\n: {empty}\n').split('\n')[1].startsWith('<span'))
check('an {empty} description body is an attribute', highlight(':: t\n: {empty}\n').includes('<span class="hljs-attr">{empty}</span>'))
// carve 0.1.11 renders `[^n]: some *strong* text` with <strong> inside the note.
check('a footnote definition body highlights inline', highlight('x[^n]\n\n[^n]: some *strong* text\n').includes('<span class="hljs-strong">*strong*</span>'))
check('an {empty} footnote body is an attribute', highlight('[^n]: {empty}\n').includes('<span class="hljs-attr">{empty}</span>'))
// carve 0.1.11 renders an unclosed fence as code to the end of the document...
const unclosed = highlight('```\ncode *a*\nmore')
check('an unclosed fence runs to the end as code', unclosed.startsWith('<span class="hljs-code">') && !unclosed.includes('hljs-strong') && unclosed.endsWith('more</span>'))
// ...or to its container's closer: the paragraph after the aside is inline again.
const contained = highlight('::: note\n```\ncode *x*\n:::\n\nafter *b*\n')
check('an unclosed fence ends at its container closer', !paints('::: note\n```\ncode *x*\n:::\n\nafter *b*\n', 'after') && contained.includes('<span class="hljs-strong">*b*</span>') && !contained.includes('<span class="hljs-strong">*x*</span>'))
// A closed fence past the paired rules' lookahead is still closed, not unclosed:
// carve 0.1.11 renders the text after its closer as a paragraph with <strong>.
const longFence = highlight('```\n' + 'x'.repeat(33000) + '\n```\n\n*after*\n')
check('a closed fence over 32 KB ends at its closer', longFence.includes('<span class="hljs-strong">*after*</span>'))

console.log('')
assert.strictEqual(failures, 0, failures + ' coverage check(s) failed')
console.log(Object.keys(CONSTRUCTS).length + Object.keys(NEGATIVES).length + 8 + ' passed')
