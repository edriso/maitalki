# Adding future notes

Do this after each lesson while the feedback is still fresh.

## 1. Capture privately

Keep the raw lesson material in `/home/edriso/Documents/italki`, not this repository. Save the teacher’s note, your exact mistake, a corrected version, and the assigned practice.

Do not add recordings, full transcripts, teacher contact details, private email, payment information, or copied worksheets to Git.

## 2. Decide whether it belongs

Add a note when at least one is true:

- the correction has appeared more than once;
- confusing it changes meaning;
- it supports a current Core or Next priority;
- it is a reusable structure for real work or sales conversations.

Update an existing note when the lesson adds a better example or drill. Avoid near-duplicates.

## 3. Write one `PracticeNote`

Add an object to `src/content/notes.ts` with:

```ts
{
  id: 'short-stable-id',
  category: 'Rhythm',
  priority: 'Core',
  title: 'One memorable instruction',
  cue: 'The five-second reminder.',
  rule: 'One accurate explanation.',
  why: 'The listening or communication payoff.',
  examples: [
    { before: 'The old version', after: 'The useful version' },
    { after: 'A second realistic example' },
  ],
  drill: 'One observable action that takes under three minutes.',
  tags: ['searchable', 'terms'],
}
```

Use capitals for stress, `/` for thought-group boundaries, `↗` for continuation, and `↘` for a final fall. Include plain-language explanation so formatting is never the only cue.

## 4. Add a daily drill only when useful

Daily drills in `src/content/drills.ts` must take ten minutes or less and contain:

- two warm-up lines;
- one realistic prompt;
- exactly three outline bullets;
- one model answer;
- four self-review checks.

Favor rotating skills over adding many variations of the same prompt.

## 5. Regenerate model audio

Every drill warm-up, model answer, and note example has model audio. After adding or editing one, run:

```bash
npm run audio -- --dry-run
npm run audio
```

Only new or changed lines are generated. Notation is converted to plain speech automatically; if a new line uses unusual notation, add a case to `src/content/speech.test.ts` and check `toSpeechText` reads it naturally. Listen to each new clip once before committing.

## 6. Verify

Run:

```bash
npm run check
```

Then check the new note in both themes and at a narrow phone width. Search for its tags, open the dialog, save it, refresh, and confirm it remains saved.
