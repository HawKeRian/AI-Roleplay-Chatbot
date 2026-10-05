# Fable Friendly UI

A lightweight SillyTavern UI extension that keeps SillyTavern's roleplay features while presenting a simpler, character-first interface.

## Features

- Persistent searchable character sidebar
- Compact current-character header and model status
- Character-style chat layout with a quieter composer
- Light and dark modes saved in the browser
- Mobile character drawer
- Per-chat language picker with automatic language matching
- Local-only Qwen language guidance; no external translation provider
- Conservative handling of short messages to reduce invented relationships and facts
- Character Card profile editor for identity, speech, relationships, and roleplay preferences
- Separate gender, pronouns, age, occupation, and story-role fields
- Portable `data.extensions.fable` metadata stored inside exported V2 character cards
- Live card validation, prompt preview, and approximate token-budget warnings
- User Persona preferences stored separately from exported character data
- Local Qwen tools for dialogue examples and cached display translations
- A single compiled Fable prompt to avoid conflicting extension instructions
- Advanced SillyTavern controls remain available on demand

The extension changes browser-side presentation and writes opt-in Fable profile metadata to `data.extensions.fable` when the user saves the Character Card Profile. The chosen language is stored in chat metadata and remembered as the default for that character. Persona preferences remain browser-local and are not embedded into exported cards. Translation and authoring helpers use the active local model through SillyTavern; no external translation provider is called.

## Local installation

From the Fable Local project root:

```powershell
.\scripts\install-sillytavern-ui.ps1
```

Restart SillyTavern and refresh the browser afterward.
