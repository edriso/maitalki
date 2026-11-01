# MaiTalki

A focused personal practice space for clearer English, natural rhythm, concise answers, and customer-first sales conversations.

Live site: [edriso.github.io/maitalki](https://edriso.github.io/maitalki/)

## What it does

- Rotates a complete 6–8 minute practice each day, with twelve practices across sounds, rhythm, speaking, and sales
- Guides planning with three bullets instead of a script
- Records two private takes in the browser so you can compare them with each other and the model
- Plays natural American model audio for warm-ups, model answers, and note examples, with a slower option and two voices
- Guides shadowing in three rounds: listen slowly and repeat, listen and repeat, then speak along
- Trains your ear on minimal pairs (I/E, CH/SH, TH) with both voices and instant feedback—listening practice, not a pronunciation score
- Organizes lesson notes by impact: Core, Next, and Polish
- Searches and saves notes locally
- Turns the original sales notes into a five-step GAP conversation playbook
- Offers one optional saved note to revisit after you finish—never a streak or a guilt prompt
- Works offline after the first visit: the app and any audio you have played are cached on your device
- Supports light/dark themes, keyboard navigation, reduced motion, and small screens

No account or server is involved. Theme, voice, saved notes, ear-training results, and completion history stay in local storage. Your recordings are temporary object URLs and are never uploaded. Model audio is pre-generated MP3 files served with the site; nothing plays until you press Listen.

## Start locally

Requires Node 24.

```bash
npm ci
npm run dev
```

Quality gate:

```bash
npm run check
```

This runs ESLint, Vitest, TypeScript, and the production Vite build.

### Model audio (ElevenLabs)

The generated clips are committed, so you only need this after changing drills or note examples.

1. Create an ElevenLabs API key restricted to **Text to Speech** and **Voices (read)**, with a credit limit. Copy the secret that starts with `sk_`, not the key ID.
2. Copy `.env.example` to `.env.local` and set `ELEVENLABS_API_KEY`.
3. Generate, then verify:

```bash
npm run audio -- --dry-run   # what would be generated, and the credit cost
npm run audio                # generate only new or changed lines
npm run audio -- --verify    # transcribe single-word clips to catch ones that sound like another word
npm run check
```

`.env.local` is git-ignored. The key is used by the local script only and never ships to the site, so never prefix it with `VITE_`. Voices live in `src/content/voices.ts`; `npm run audio -- --audition` writes a short sample per voice to `.audio-auditions/` for comparing before a full run. Model audio is generated with [ElevenLabs](https://elevenlabs.io).

## Project map

```text
src/
  components/   Reusable UI and note presentation
  content/      Typed practice notes and daily drills
  hooks/        Local progress, private recording, and model audio playback
  screens/      Practice, ear training, notes library, and playbook
  test/         Browser test setup
public/audio/   Generated model audio (one folder per voice)
scripts/        Local audio generation (ElevenLabs)
docs/           Architecture, curriculum, content, and deployment
```

Before changing content, read [the content guide](docs/CONTENT_GUIDE.md). For larger changes, read [the architecture](docs/ARCHITECTURE.md) and [curriculum notes](docs/CURRICULUM.md).

## Deployment

Every push to `main` runs the complete quality gate and deploys `dist` through GitHub Actions. See [deployment](docs/DEPLOYMENT.md).

## License

No license has been selected. All rights are reserved by the repository owner.
