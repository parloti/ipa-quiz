# Sound Manifests — meta.json

This document describes the optional source- and voice-level metadata files you can place under `public/sounds` to provide friendly display metadata for sound providers and their voices.

Purpose

- Provide a human-friendly `title` and optional logo override for a sound provider (`sourceId`).
- Provide friendly `name` and optional `author` (or attribution) for individual voices (`voiceId`).

Location

- Source-level meta: `public/sounds/<sourceId>/meta.json`
- Voice-level meta: `public/sounds/<sourceId>/<voiceId>/meta.json`
- For `default` voices (audio files directly under the source root) the generator also checks these filenames under the source root: `voice.meta.json`, `default.meta.json`, `meta.voice.json`.

Source meta format

```json
{
  "title": "Provider Title",
  "logo": "logo-custom.png"
}
```

- `title` (optional): human-friendly provider title.
- `logo` (optional): a filename or public path to use instead of an auto-detected logo. If a relative filename is provided it will be treated as `sounds/<sourceId>/<logo>`.

Voice meta format

```json
{
  "name": "Friendly Voice Name",
  "author": "Voice Author"
}
```

- `name` (optional): friendly display name for the voice.
- `author` (optional): attribution or other short metadata for the voice.

Behavior

- The generator (`npm run generate:sound-manifests`) will include `title` and `logoUrl` on the source entry in `public/sounds/manifest.json` when provided.
- Voice entries in the global manifest gain `name` and `author` fields when matching voice-level meta is present.
- Missing meta files or missing fields are ignored; the generator falls back to auto-detected logos and voice IDs.

Run

```bash
npm run generate:sound-manifests
```

Notes

- The generator still auto-detects provider logos by looking for `logo.<ext>` under `public/sounds/<sourceId>/` using the known extensions (`svg`, `png`, `webp`, `jpg`, `jpeg`, `icon`). A source `logo` in `meta.json` overrides that detection.
- Keep meta JSON files small and human-editable.
