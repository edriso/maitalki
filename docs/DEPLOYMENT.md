# Deployment

Production URL: `https://edriso.github.io/maitalki/`

Every push to `main` triggers `.github/workflows/deploy.yml`. The job uses Node 22, installs the lockfile with `npm ci`, runs the full `npm run check` gate, uploads `dist`, and deploys through the official GitHub Pages actions.

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

Open the preview URL with `/maitalki/`. Verify all three hash views, a direct refresh, both themes, a saved note, denied microphone access, and a completed practice.

## Rename or custom domain

If the repository name changes, update:

- `base` in `vite.config.ts`;
- icon and manifest paths in `index.html`;
- `start_url` and `scope` in `public/manifest.webmanifest`;
- URLs in this document and `README.md`.

Do not edit or commit generated `dist`. To roll back, revert the offending commit and push; the workflow will redeploy the previous source.
