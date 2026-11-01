/**
 * Turns on-screen coaching notation into the plain sentence a model speaker says.
 *
 * Practice text marks stress with CAPITALS, thought groups with ` / `, list intonation
 * with ↗ ↘, separate items with ` · `, and reductions with schwa spellings (tə, əv).
 * A voice model should hear natural English instead, so it can produce the rhythm itself.
 *
 * Keep this file dependency-free: the audio generation script imports it directly.
 */

/** All-caps words that are genuinely spoken as letters. */
const acronyms = new Set(['API', 'CRM', 'CEO', 'QA', 'UI', 'URL']);

/** Proper nouns that may appear in capitals for stress. */
const properNouns: Record<string, string> = {
  egypt: 'Egypt', giza: 'Giza', jordan: 'Jordan', monday: 'Monday', tuesday: 'Tuesday',
  wednesday: 'Wednesday', thursday: 'Thursday', friday: 'Friday', mediterranean: 'Mediterranean',
};

const reductions: Record<string, string> = { tə: 'to', fər: 'for', ən: 'and', kən: 'can', thə: 'the', ə: 'a' };
const modalsBeforeHave = new Set(['could', 'should', 'would', 'might', 'must']);

const endsWithPause = /[.?!…,:;]$/;

const normalizeWord = (word: string, previous: string | undefined): string => {
  const core = word.replace(/^[^\p{L}]+|[^\p{L}]+$/gu, '');
  if (!core) return word;
  const [lead, trail] = [word.slice(0, word.indexOf(core)), word.slice(word.indexOf(core) + core.length)];

  let spoken = core;
  if (core === 'əv') spoken = previous && modalsBeforeHave.has(previous.toLowerCase()) ? 'have' : 'of';
  else if (reductions[core]) spoken = reductions[core];
  else if (acronyms.has(core)) spoken = core;
  else if ((core.match(/\p{Lu}/gu) ?? []).length >= 2) spoken = core.toLowerCase();

  spoken = properNouns[spoken.toLowerCase()] ?? spoken;
  return `${lead}${spoken}${trail}`;
};

const capitalizeSentences = (text: string) =>
  text.replace(/(^|[.?!…]\s+)(\p{Ll})/gu, (_match, boundary: string, letter: string) => `${boundary}${letter.toUpperCase()}`);

/** Join two spoken chunks, adding `glue` only when the left side has no pause of its own. */
const joinChunks = (chunks: string[], glue: string) =>
  chunks.map((chunk) => chunk.trim()).filter(Boolean).reduce((joined, chunk) => {
    if (!joined) return chunk;
    return endsWithPause.test(joined) ? `${joined} ${chunk}` : `${joined}${glue} ${chunk}`;
  }, '');

interface SpeakableContent {
  drills: { warmup: string[]; model: string }[];
  notes: { examples: { after: string }[] }[];
}

/** Every line the app offers as model audio, in display order, as unique spoken text. */
export function collectSpeechTexts({ drills, notes }: SpeakableContent): string[] {
  const lines = [
    ...drills.flatMap((drill) => [...drill.warmup, drill.model]),
    ...notes.flatMap((note) => note.examples.map((example) => example.after)),
  ];
  return [...new Set(lines.map(toSpeechText))];
}

export function toSpeechText(text: string): string {
  const cleaned = text
    .replace(/[↗↘]/g, ' ')
    .replace(/,?\s*…/g, '…')
    .replace(/\s+/g, ' ')
    .trim();

  // Items separated by " · " become short sentences; " / " thought groups become a comma pause.
  const sentences = cleaned.split(/\s+·\s+/).map((item) => joinChunks(item.split(/\s+\/\s+/), ','));
  const joined = joinChunks(sentences, '.');

  const words = joined.split(' ');
  const spoken = words.map((word, index) => normalizeWord(word, words[index - 1]?.replace(/[^\p{L}]/gu, ''))).join(' ');

  const finished = endsWithPause.test(spoken) ? spoken : `${spoken}.`;
  return capitalizeSentences(finished.replace(/\s+([,.?!])/g, '$1'));
}
