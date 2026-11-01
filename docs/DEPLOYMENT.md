# Deployment

Production URL: `https://edriso.github.io/maitalki/`

Every push to `main` triggers `.github/workflows/deploy.yml`. The job uses Node 24, installs the lockfile with `npm ci`, runs the full `npm run check` gate, uploads `dist`, and deploys through the official GitHub Pages actions.

## One-time GitHub setup

In the `edriso/maitalki` repository:

1. Open **Settings → Pages**.
2. Set **Source** to **GitHub Actions**.
3. Run the `Deploy to GitHub Pages` workflow or push to `main`.

## Local production check

```bash
npm ci
npm run check
npm run preview
```

Open the preview URL with `/maitalki/`. Verify:

- all four hash views, a direct refresh, and both themes;
- model audio: Listen, Slower, switching voices, and shadowing;
- an ear-training round, including the link from a sound note;
- two recorded takes, and denied microphone access;
- a saved note, and a completed practice with the optional revisit.

## What ships

`dist` is static: the app, self-hosted fonts, the service worker, icons, and the model audio in `public/audio`. Audio is generated locally (`npm run audio`) and committed, so CI needs no ElevenLabs key and never calls the API.

## Offline

The service worker (`public/sw.js`) registers only in production builds, so test it with `npm run preview`: load the app, reload once, play a clip, then switch the browser to offline and reload. The app should open and the played clip should still play.

## Icons

`public/icon.svg` is the source. `apple-touch-icon.png` (180 px), `icon-192.png`, and `icon-512.png` are full-bleed square renders of it, with no transparency and the glyph inside the maskable safe zone. Regenerate them if the SVG changes.

## Dependencies

`package.json` `overrides` pin `rolldown` and `postcss` (Vite’s bundler dependencies) to releases at least two weeks old. When upgrading Vite, update or remove these pins in the same change, and prefer releases that have been public for two weeks or more.

## Rename or custom domain

If the repository name changes, update:

- `base` in `vite.config.ts`;
- icon, Apple touch icon, and manifest paths in `index.html`;
- `start_url` and `scope` in `public/manifest.webmanifest`;
- URLs in this document and `README.md`.

The service worker derives its scope from where it is registered, so it needs no change.

## Roll back

Do not edit or commit generated `dist`. To roll back, revert the offending commit and push; the workflow redeploys the previous source.
