# Working on MaiTalki

MaiTalki is a small, personal speaking-practice app. Protect its focus: every feature should help the learner prepare a concise thought, hear a useful contrast, speak, reflect, or return for another short session.

## Before changing code

- Read `README.md` and the relevant file in `docs/`.
- Keep learning content out of components. Notes belong in `src/content/notes.ts`; daily sessions belong in `src/content/drills.ts`.
- Follow `docs/CONTENT_GUIDE.md` when turning a new lesson into notes. Curate; do not dump transcripts into the app.
- Preserve the versioned `maitalki.progress.v1` localStorage shape or document and test a migration.
- Treat `/home/edriso/Documents/italki` as private source material. Do not copy recordings, emails, prices, contact details, or raw teacher transcripts into the repository.

## Quality bar

- Use strict TypeScript and semantic HTML. Controls must be keyboard accessible and usable at 320 CSS px and 200% zoom.
- Never claim to score pronunciation or remove an accent. Prefer “clearer,” “more natural,” and “speaking practice.”
- Stress cannot be conveyed by color alone; preserve capitals, weight, arrows, slashes, or explanatory text.
- Use `--font-ui` for controls and reading text and `--font-display` only for headings. Do not introduce another font family without a measured readability need.
- Recording must remain optional and local. Never autoplay audio or upload a recording.
- Model audio is pre-generated with `npm run audio` and committed to `public/audio`. Never call ElevenLabs from the browser or CI, and never expose the API key with a `VITE_` prefix. After editing drills or note examples, regenerate audio before committing.
- Maintain both themes, WCAG AA contrast, visible focus, and `prefers-reduced-motion` support.
- Keep daily practice below ten minutes and make completion a stopping point, not a guilt mechanic.
- Run `npm run check` before every commit.
- Do not add AI attribution, co-author trailers, generated signatures, or personal contact information to commits or product copy.

## Content voice

Be direct, warm, and specific. Each note needs one rule, one reason, two or three realistic examples, and one action the learner can do now. Prefer client calls, development work, travel, and ordinary conversation over generic classroom examples.

## Deployment

Production uses the `/maitalki/` base path and deploys from `main` through `.github/workflows/deploy.yml`. Do not commit `dist`. See `docs/DEPLOYMENT.md`.
