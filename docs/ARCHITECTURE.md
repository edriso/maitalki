# Architecture

MaiTalki is a client-only React application built with strict TypeScript and Vite. It has no router package, server, account, analytics, or external state.

The interface uses Atkinson Hyperlegible Next for controls and reading text, with Manrope reserved for display headings. The pair is self-hosted, variable-weight, and exposed through `--font-ui` and `--font-display` tokens in `src/styles.css`; keep those roles distinct when adding UI.

Color tokens meet WCAG AA in both themes. For small colored text use `--core-text`, `--blue-text`, or `--purple-text`; `--accent`, `--accent-strong`, `--blue`, and `--purple` are for fills, borders, and icons, not small text. `--faint` is the lightest text color that still passes AA.

## Application flow

`App.tsx` owns the four hash-addressable views (`#today`, `#ear`, `#library`, and `#playbook`), theme, mobile navigation, and the selected note dialog. Screens compose typed content and reusable components.

```text
content → screens → components
             ↓
       local browser hooks
```

Content (`src/content/`):

- `notes.ts` is the source of truth for the note library.
- `drills.ts` is the source of truth for rotating daily practice.
- `contrasts.ts` is the source of truth for ear-training minimal pairs; each set names the note that teaches it.
- `voices.ts` lists the model voices.
- `review.ts` picks the optional note to revisit after practice: saved notes first, rotating daily, else a Core note from the day’s category.

Behavior (`src/hooks/`):

- `useLocalProgress` owns saved notes, completed days, and session count.
- `useRecorder` owns the optional MediaRecorder lifecycle and up to two temporary takes; a third recording replaces take 2. Starting a recording pauses model audio first.
- `useModelAudio` owns one shared audio element for model clips, so starting a clip stops any other and pauses recorded takes. `playClip` resolves when a clip ends or is interrupted.
- `useVoicePreference` stores the chosen model voice.
- `earTraining.ts` builds ear-training rounds (every pair once before repeats, random word and voice) and stores the last result per contrast.
- `shadowing.ts` defines the three shadowing rounds and repeat timing; `ShadowCoach` runs them and stops cleanly when interrupted.

A note with an ear-training set (I/E, CH/SH, TH) links to ear training with that contrast preselected, and the ear-training summary links back to the note.

## Model audio

```text
drills + notes + contrasts ─ toSpeechText ─▶ scripts/generate-audio.ts ─▶ ElevenLabs ─▶ ffmpeg
                                              │
                         public/audio/<voice>/<hash>.mp3 + src/content/audio-manifest.json
                                              │
                    ListenControls ─ clipUrl(voice, text) ─▶ static MP3, played on click
```

- `src/content/speech.ts` converts display notation (capitals, ` / `, ↗ ↘, ` · `, tə/əv) into the plain sentence a speaker would say. The UI and the script share it, so a clip is found by its spoken text.
- File names hash the spoken text, voice, model, and settings. Changing any of them creates new clips; the script deletes clips no longer referenced.
- Every clip is lightly compressed and leveled to −16 LUFS with ffmpeg, so switching lines or voices never jumps in volume. Each file is encoded once from a fresh original.
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

## Offline

`public/sw.js` is a small hand-written service worker, registered only in production builds:

- Pages are network first, so deploys appear immediately; the cached page is the offline fallback.
- `assets/` and `audio/` files are cache first because their names contain content hashes. When a new build of an asset is cached, older builds of the same file are deleted.
- Audio Range requests (Safari always sends them) are answered with `206` from the cached file.
- Model clips are cached as they are played; nothing downloads in the background. Recordings are `blob:` URLs and never touch the cache.

Bump `CACHE` in `sw.js` only if the caching strategy itself changes.

## Deliberate constraints

- Hash navigation keeps GitHub Pages refreshes safe without rewrite rules.
- Content is TypeScript rather than remote CMS data so changes are reviewed and tested with the interface.
- The app gives observable coaching cues and self-review checklists. It does not generate a fake confidence or pronunciation score. Ear training reports how many words you *heard* correctly, which is a listening check, and says so on screen.
- Model audio never autoplays and is fetched only when the learner presses Listen or Slower. Slower playback uses the browser’s pitch-preserving `playbackRate` (0.75×) rather than separate files.
- Browser recording is optional and stops automatically after two minutes; all practice remains usable when microphone access is absent or denied.
