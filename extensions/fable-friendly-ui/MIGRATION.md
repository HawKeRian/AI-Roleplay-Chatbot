# Fable profile compatibility

The current character-profile format is version 2. Its public shape is defined
in `fable-profile.schema.json` and is stored inside a SillyTavern character card
at `data.extensions.fable`.

## Version 1 to version 2

Older cards may store gender or identity text in `identity.identity`. The
extension reads that value as `identity.gender` and writes version 2 when the
card is next saved. Unknown top-level and nested fields are preserved so cards
can safely round-trip through newer versions or other extensions.

## User Persona privacy

User Persona values are intentionally separate from character cards. They stay
in browser local storage, keyed by the current SillyTavern persona. Exporting a
character therefore does not include the user's preferred name, pronouns,
self-reference, preferred form of address, or private notes.

## Localized metadata

Translated taglines and descriptions live under `localizations.<language>` in
the Fable profile. Each entry includes a hash of the source text. The extension
only displays a cached translation while that hash still matches, preventing a
stale translation from replacing edited source text.
