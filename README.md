# highlightjs-carve

Carve 0.2 syntax highlighting for highlight.js. The `carve` language also serves `.crv` source.

```js
import hljs from 'highlight.js'
import carve from 'highlightjs-carve'

hljs.registerLanguage('carve', carve)
const { value } = hljs.highlight(source, { language: 'carve' })
```

The root entry and `carve.mjs` expose the 0.2 definition. The `carve.js` UMD entry supports classic scripts. Register the package's `csv` and `tsv` exports to color delimited fence bodies. The grammar is pinned to carve-grammars `6621ad19`.
