# Architecture

MaiTalki is a client-only React application built with strict TypeScript and Vite. It has no router package, server, account, analytics, or external state.

The interface uses Atkinson Hyperlegible Next for controls and reading text, with Manrope reserved for display headings. The pair is self-hosted, variable-weight, and exposed through `--font-ui` and `--font-display` tokens in `src/styles.css`; keep those roles distinct when adding UI.

## Application flow

`App.tsx` owns the three hash-addressable views (`#today`, `#library`, and `#playbook`), theme, mobile navigation, and the selected note dialog. Screens compose typed content and reusable components.

```text
content → screens → components
             ↓
       local browser hooks
```

- `src/content/notes.ts` is the source of truth for the note library.
- `src/content/drills.ts` is the source of truth for rotating daily practice.
- `useLocalProgress` owns saved notes, completed days, and session count.
- `useRecorder` owns the optional MediaRecorder lifecycle and temporary playback URL.
- `useModelAudio` owns one shared audio element for model clips, so starting a clip stops any other. `useVoicePreference` stores the chosen model voice.

## Model audio

```text
drills.ts + notes.ts ─ toSpeechText ─▶ scripts/generate-audio.ts ─▶ ElevenLabs
                                              │
                         public/audio/<voice>/<hash>.mp3 + src/content/audio-manifest.json
                                              │
                    ListenControls ─ clipUrl(voice, text) ─▶ static MP3, played on click
```

- `src/content/speech.ts` converts display notation (capitals, ` / `, ↗ ↘, ` · `, tə/əv) into the plain sentence a speaker would say. The UI and the script share it, so a clip is found by its spoken text.
- File names hash the spoken text, voice, model, and settings. Changing any of them creates new clips; the script deletes clips no longer referenced.
- `src/content/voices.ts` lists the voices. The picker appears only when two or more voices have audio, and lines without a clip show no audio controls.
- The ElevenLabs key is read from `.env.local` by the local script only. The deployed site serves static files and never contacts ElevenLabs.
- Tests fail if any displayed line lacks a clip for an available voice, or if the manifest points to a missing file.

## Local state

`maitalki.progress.v1` contains:

```ts
{
  version: 1,
  completedDays: string[],
  completedSessions: number,
  favorites: string[]
}
```

`maitalki.theme` contains `light` or `dark`. `maitalki.voice` contains a voice key from `src/content/voices.ts`; unknown values fall back to the first voice. Recordings are Blob URLs held only in memory; leaving or refreshing the page removes them.

Any schema change needs a migration or a new versioned key plus tests. Never silently reinterpret old data.

## Deliberate constraints

- Hash navigation keeps GitHub Pages refreshes safe without rewrite rules.
- Content is TypeScript rather than remote CMS data so changes are reviewed and tested with the interface.
- The app gives observable coaching cues and self-review checklists. It does not generate a fake confidence or pronunciation score.
- Model audio never autoplays and is fetched only when the learner presses Listen or Slower. Slower playback uses the browser’s pitch-preserving `playbackRate` (0.75×) rather than separate files.
- Browser recording is optional and stops automatically after two minutes; all practice remains usable when microphone access is absent or denied.
