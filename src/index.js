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
 * The definition itself is UMD (see `src/languages/carve.js`), so the same file
 * also works as a classic `<script>` after highlight.js, where it registers
 * itself against the global `hljs`. This shim runs it for that side effect and
 * re-exports the factory.
 */
import './languages/carve.js'

/** @type {(hljs?: object) => object} */
const carve = globalThis.carveHljs

export default carve
