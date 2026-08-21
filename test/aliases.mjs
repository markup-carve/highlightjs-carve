/**
 * The fence words this package must answer to.
 *
 * Mirrors tests/lib/aliases.js in carve-grammars, which is where the set is
 * decided (markup-carve/carve-grammars#290). The extension `crv` is the fence
 * word an author reaches for as readily as the language name.
 *
 * ALIASES_MISSING_IN records upstream releases that predate an alias. The
 * definition here is vendored verbatim, so this package cannot add an alias the
 * dependency does not declare - it can only refuse to pretend otherwise. Keying
 * the exemption on the exact version, rather than skipping the assertion, means
 * the check RE-ARMS by itself: bump the dependency to any version not listed and
 * the alias becomes required again. A plain skip would be a check that cannot
 * fail, which is how a gap like this survives a release in the first place.
 */
export const REQUIRED_ALIASES = ['carve', 'crv']

/** alias -> upstream versions known to lack it. Delete an entry when it ships. */
export const ALIASES_MISSING_IN = {
    crv: ['0.1.4'],
}

/**
 * Whether a missing alias is a recorded upstream gap rather than a defect here.
 *
 * @param {string} alias
 * @param {string} version installed @markup-carve/carve-grammars version
 */
export function isKnownUpstreamGap(alias, version) {
    return (ALIASES_MISSING_IN[alias] ?? []).includes(version)
}
