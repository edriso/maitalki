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

`maitalki.theme` contains `light` or `dark`. Recordings are Blob URLs held only in memory; leaving or refreshing the page removes them.

Any schema change needs a migration or a new versioned key plus tests. Never silently reinterpret old data.

## Deliberate constraints

- Hash navigation keeps GitHub Pages refreshes safe without rewrite rules.
- Content is TypeScript rather than remote CMS data so changes are reviewed and tested with the interface.
- The app gives observable coaching cues and self-review checklists. It does not generate a fake confidence or pronunciation score.
- Browser recording is optional and stops automatically after two minutes; all practice remains usable when microphone access is absent or denied.
