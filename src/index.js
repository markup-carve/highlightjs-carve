/**
 * ESM entry for the Carve highlight.js language definition.
 *
 * ```js
 * import hljs from 'highlight.js'
 * import carve from 'highlightjs-carve'
 *
 * hljs.registerLanguage('carve', carve)
 * hljs.highlight(source, { language: 'carve' })
 * ```
 *
 * `csv` and `tsv` are the fence-body languages the Carve definition embeds for
 * `csv`/`tsv` fences; register them too or those bodies stay plain.
 *
 * The definition itself is UMD (see `src/languages/carve.js`), so the same file
 * also works as a classic `<script>` after highlight.js, where it registers
 * itself against the global `hljs`. This shim runs it for that side effect and
 * re-exports the factory.
 */
import './languages/carve.js'
import './languages/delimited.js'

/** @type {(hljs?: object) => object} */
const carve = globalThis.carveHljs

export default carve

/** @type {{ csv: (hljs?: object) => object, tsv: (hljs?: object) => object }} */
export const { csv, tsv } = globalThis.carveHljsDelimited
