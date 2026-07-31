# MaiTalki

A focused personal practice space for clearer English, natural rhythm, concise answers, and customer-first sales conversations.

Live site: [edriso.github.io/maitalki](https://edriso.github.io/maitalki/)

## What it does

- Rotates a complete 6–8 minute practice each day
- Guides planning with three bullets instead of a script
- Records private speaking takes in the browser for honest A/B listening
- Organizes lesson notes by impact: Core, Next, and Polish
- Searches and saves notes locally
- Turns the original sales notes into a five-step GAP conversation playbook
- Supports light/dark themes, keyboard navigation, reduced motion, and small screens

No account or server is involved. Theme, saved notes, and completion history stay in local storage. Audio recordings are temporary object URLs and are never uploaded.

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

## Project map

```text
src/
  components/   Reusable UI and note presentation
  content/      Typed practice notes and daily drills
  hooks/        Local progress and private recording
  screens/      Practice, notes library, and playbook
  test/         Browser test setup
docs/           Architecture, curriculum, content, and deployment
```

Before changing content, read [the content guide](docs/CONTENT_GUIDE.md). For larger changes, read [the architecture](docs/ARCHITECTURE.md) and [curriculum notes](docs/CURRICULUM.md).

## Deployment

Every push to `main` runs the complete quality gate and deploys `dist` through GitHub Actions. See [deployment](docs/DEPLOYMENT.md).

## License

No license has been selected. All rights are reserved by the repository owner.
