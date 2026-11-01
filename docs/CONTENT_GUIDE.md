# Adding content

How to turn a lesson into notes, daily drills, ear-training pairs, and model audio. Do this after each lesson while the feedback is still fresh.

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

Examples are also spoken aloud, so avoid words a listener or a voice could read two ways (bass, read, lead, live). Use an unambiguous word that shows the same point.

## 4. Add a daily drill only when useful

Daily drills in `src/content/drills.ts` must take ten minutes or less and contain:

- two warm-up lines;
- one realistic prompt;
- exactly three outline bullets;
- one model answer;
- four self-review checks.

Favor rotating skills over adding many variations of the same prompt.

## 5. Add ear-training pairs only when they are unambiguous

Minimal pairs live in `src/content/contrasts.ts`. Use common words that differ only in the target sound. Avoid homographs (bass, read, lead) and pairs that merge in some American accents (pin/pen). After adding pairs, run `npm run audio -- --verify`; if a word is heard as another word, add a retake in `scripts/audio-retakes.json`, and replace the pair if retakes keep failing.

## 6. Regenerate model audio

Every drill warm-up, model answer, note example, and ear-training word has model audio. After adding or editing one, run:

```bash
npm run audio -- --dry-run
npm run audio
```

Only new or changed lines are generated, and `npm run check` fails until every line has a clip in every voice. See the README for key and `ffmpeg` requirements. Notation is converted to plain speech automatically; if a new line uses unusual notation, add a case to `src/content/speech.test.ts` and check `toSpeechText` reads it naturally. Listen to each new clip once before committing.

## 7. Verify

Run:

```bash
npm run check
```

Then check the new content in both themes and at a narrow phone width:

- search for a new note’s tags, open the dialog, play an example, save it, refresh, and confirm it remains saved;
- for a new drill, play each warm-up line and the model answer, and run the shadowing rounds once;
- for new pairs, run one ear-training round with that sound.
