import assert from 'node:assert/strict'
import hljs from 'highlight.js'
import carve, { carve2 } from '../src/index.js'

hljs.registerLanguage('carve', carve)
hljs.registerLanguage('carve2', carve2)

// Each source is an upgrade or clause case in the 0.2 grammar inventory.
// Old spellings are intentional negative cases.
const cases = [
    ['U-001', 'text\n# Heading\n', [], ['section']],
    ['U-014', '- first\n+\n> note\n', ['bullet', 'quote'], ['punctuation']],
    ['U-031', '{.note}\n\nParagraph.\n', ['attr'], []],
    ['U-032', '{.a\n .b}\nParagraph.\n', [], ['attr']],
    ['U-044', 'para\n\n---\n\n___\n', [], ['meta']],
    ['U-045', '* * *\n\n- - -\n', ['bullet'], ['meta']],
    ['U-049', '```\ncode\n   ```\nafter\n', ['code'], []],
    ['U-050', '%%%\nhidden\n%%% visible?\nafter\n', ['comment'], []],
    ['U-055', '| a | b |\n|---|--:|\n| 1 | 2 |\n', ['table-boundary'], ['table-alignment']],
    ['U-056', '|=< a |=> b |=~ c |\n', ['table-header'], ['table-alignment']],
    ['U-063', '| a | b |\n\n^ Caption\n', ['caption_'], []],
    ['U-065', 'an _underlined_ word\n', [], ['emphasis']],
    ['U-066', 'a ~struck~ word\n', [], ['deletion']],
    ['U-067', 'a =marked= word\n', [], ['addition']],
    ['U-068', '/*bold italic*/ and */bold italic/*\n', ['strong', 'emphasis'], []],
    ['U-069', '{~old~>new~}\n', ['deletion'], ['addition']],
    ['U-101', '= Heading\n', ['section'], []],
    ['U-103', 'a. one\nb. two\n', ['bullet'], []],
    ['U-104', '::: > "T"\nquoted\n:::\n', ['keyword'], []],
    ['U-105', '```=html "T"\n<b>x</b>\n```\n', ['code'], []],
    ['U-106', ':: term\nmore term text\n: first description\n', ['title'], []],
    ['U-107', '| a | b |\n^ first\n^ second\n', ['caption_'], []],
    ['U-289', '{{ a.crv @shift:1 }}\n', ['meta'], []],
    ['CC-112', 'a\n%% #region x\nb', ['comment'], []],
    ['CC-893', '|=< a |\n', ['table-header'], ['table-alignment']],
    ['CC-894', '|={<} a |\n', ['table-header', 'table-alignment'], []],
]

for (const [id, input, required, absent] of cases) {
    const output = hljs.highlight(input, { language: 'carve2' }).value
    const scopes = new Set([...output.matchAll(/class="([^"]+)"/g)].flatMap(match => match[1].split(' ')))
    for (const scope of required) {
        assert.ok(scopes.has(`hljs-${scope}`) || scopes.has(scope), `${id}: missing ${scope}: ${output}`)
    }
    for (const scope of absent) {
        assert.ok(!scopes.has(`hljs-${scope}`) && !scopes.has(scope), `${id}: unexpected ${scope}: ${output}`)
    }
}

for (const [input, scope] of [
    ['***\n', 'meta'],
    ['{^sup^}', 'built_in'],
    ['{,sub,}', 'built_in'],
    ['{_under_}', 'emphasis'],
    ['{~strike~}', 'deletion'],
    ['{=mark=}', 'addition'],
]) {
    assert.ok(hljs.highlight(input, { language: 'carve2' }).value.includes(`hljs-${scope}`))
}
assert.ok(hljs.highlight('~~~js\nx\n~~~\n', { language: 'carve' }).value.includes('hljs-code'))
assert.ok(!hljs.highlight('~~~js\nx\n~~~\n', { language: 'carve2' }).value.includes('hljs-code'))

console.log(`${cases.length} Carve 0.2 inventory cases and 7 version checks passed`)
