# Architecture

MaiTalki is a client-only React application built with strict TypeScript and Vite. It has no router package, server, account, analytics, or external state.

The interface uses Atkinson Hyperlegible Next for controls and reading text, with Manrope reserved for display headings. The pair is self-hosted, variable-weight, and exposed through `--font-ui` and `--font-display` tokens in `src/styles.css`; keep those roles distinct when adding UI.

## Application flow

`App.tsx` owns the four hash-addressable views (`#today`, `#ear`, `#library`, and `#playbook`), theme, mobile navigation, and the selected note dialog. Screens compose typed content and reusable components.

```text
content → screens → components
             ↓
       local browser hooks
```

- `src/content/notes.ts` is the source of truth for the note library.
- `src/content/drills.ts` is the source of truth for rotating daily practice.
- `useLocalProgress` owns saved notes, completed days, and session count.
- `src/content/contrasts.ts` is the source of truth for ear-training minimal pairs.
- `useRecorder` owns the optional MediaRecorder lifecycle and up to two temporary takes; a third recording replaces take 2.
- `earTraining.ts` builds ear-training rounds (every pair once before repeats, random word and voice) and stores the last result per contrast.
- `ShadowCoach` runs three shadowing rounds on top of the shared model-audio player and stops cleanly when interrupted.
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
- `npm run audio -- --verify` sends single-word clips to ElevenLabs speech-to-text and flags any heard as a different word (known homophones excepted). A flagged clip gets a retake number in `scripts/audio-retakes.json`, which changes its seed and file name. Ear-training answers depend on these words, so verify after adding pairs.
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

`maitalki.theme` contains `light` or `dark`. `maitalki.ear.v1` maps a contrast id to its last `{ correct, total, date }`; malformed entries are ignored. `maitalki.voice` contains a voice key from `src/content/voices.ts`; unknown values fall back to the first voice. Recordings are Blob URLs held only in memory; leaving or refreshing the page removes them.

Any schema change needs a migration or a new versioned key plus tests. Never silently reinterpret old data.

## Deliberate constraints

- Hash navigation keeps GitHub Pages refreshes safe without rewrite rules.
- Content is TypeScript rather than remote CMS data so changes are reviewed and tested with the interface.
- The app gives observable coaching cues and self-review checklists. It does not generate a fake confidence or pronunciation score.
- Model audio never autoplays and is fetched only when the learner presses Listen or Slower. Slower playback uses the browser’s pitch-preserving `playbackRate` (0.75×) rather than separate files.
- Browser recording is optional and stops automatically after two minutes; all practice remains usable when microphone access is absent or denied.
