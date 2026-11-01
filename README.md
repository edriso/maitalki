# MaiTalki

A focused personal practice space for clearer English, natural rhythm, concise answers, and customer-first sales conversations. Prepare a short answer, hear a natural model, say it, compare, and stop—in under ten minutes a day.

Live site: [edriso.github.io/maitalki](https://edriso.github.io/maitalki/)

## What it does

**Daily practice**

- Rotates a complete 6–8 minute practice each day, twelve in all, across sounds, rhythm, speaking, and sales
- Warms up with stress-marked lines, then plans the answer as three bullets instead of a script
- Records two private takes so you can compare them with each other and with the model answer
- Ends with a short self-review checklist and, optionally, one saved note to revisit—never a streak or a guilt prompt

**Listening**

- Natural American model audio (two voices, Sarah and Eric) for every warm-up, model answer, and note example, with a pitch-preserving **Slower** option
- Shadowing in three guided rounds: listen slowly and repeat, listen and repeat, then speak along
- Ear training on minimal pairs (I/E, CH/SH, TH) with both voices, instant feedback, and missed pairs to replay—a listening check, not a pronunciation score

**Notes and playbook**

- Lesson notes organized by impact (Core, Next, Polish), searchable and saveable; the I/E, CH/SH, and TH notes link straight to ear training
- A five-step GAP conversation playbook for customer-first sales calls

**Private, accessible, offline**

- No account or server. Theme, voice, saved notes, ear-training results, and completion history stay in local storage
- Recordings are temporary in-memory URLs and are never uploaded; nothing plays until you press a button
- Works offline after the first visit and installs to a phone’s home screen
- Light and dark themes, keyboard navigation, visible focus, reduced motion, and layouts down to 320 px; checked against WCAG 2.2 AA with axe

## Start locally

Requires Node 24.

```bash
npm ci
npm run dev
```

Quality gate (ESLint, Vitest, TypeScript, and the production build):

```bash
npm run check
```

## Model audio (ElevenLabs)

Generated clips are committed, so you only need this after changing drill warm-ups, model answers, note examples, or ear-training pairs.

**Requirements**

- An ElevenLabs API key restricted to **Text to Speech** and **Voices (read)**, plus **Speech to Text** if you use `--verify`. Give it a credit limit, and copy the secret that starts with `sk_`, not the key ID.
- `ffmpeg` on your PATH (macOS: `brew install ffmpeg`), used to level every clip to the same loudness.

**Setup**

```bash
cp .env.example .env.local   # then set ELEVENLABS_API_KEY
```

**Generate**

```bash
npm run audio -- --dry-run   # what would be generated, and the character count
npm run audio                # generate only new or changed lines
npm run audio -- --verify    # transcribe single-word clips; flags any heard as another word
npm run check                # tests fail if any line is missing its clip
```

Other options: `--voice=eric` limits a run to one voice, and `--audition` writes a short sample per voice to `.audio-auditions/`. If a clip sounds wrong, add it to `scripts/audio-retakes.json` and run again; only that clip is regenerated.

`.env.local` is git-ignored. The key is used by the local script only and never ships to the site, so never prefix it with `VITE_`. Voices are configured in `src/content/voices.ts`. Model audio is generated with [ElevenLabs](https://elevenlabs.io).

## Project map

```text
src/
  components/    Listen controls, shadowing coach, voice picker, notes
  content/       Notes, daily drills, ear-training pairs, voices, speech text, audio manifest
  hooks/         Progress, recording takes, model audio player, ear-training rounds
  screens/       Practice, ear training, notes library, and playbook
  test/          Browser test setup
public/
  audio/         Generated model audio, one folder per voice
  sw.js          Offline service worker
scripts/         Local audio generation, verification, and retakes
docs/            Architecture, curriculum, content, and deployment
```

Before changing content, read [the content guide](docs/CONTENT_GUIDE.md). For larger changes, read [the architecture](docs/ARCHITECTURE.md) and [curriculum notes](docs/CURRICULUM.md).

## Deployment

Every push to `main` runs the complete quality gate and deploys `dist` to GitHub Pages through GitHub Actions. See [deployment](docs/DEPLOYMENT.md).

## License

No license has been selected. All rights are reserved by the repository owner.
