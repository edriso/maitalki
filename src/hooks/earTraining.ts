import type { SoundContrast } from '../content/contrasts';

export interface Trial {
  pair: [string, string];
  /** Index in `pair` of the word that plays. */
  answer: 0 | 1;
  voiceKey: string;
}

export const trialsPerRound = 10;

const shuffle = <T,>(items: T[], random: () => number) => {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(random() * (index + 1));
    [copy[index], copy[swap]] = [copy[swap], copy[index]];
  }
  return copy;
};

/**
 * Ten trials that cover every pair before repeating one, with the played word and
 * the voice chosen at random. Hearing several voices helps the contrast generalize.
 */
export function createRound(contrast: SoundContrast, voiceKeys: string[], random = Math.random): Trial[] {
  const pairs: [string, string][] = [];
  while (pairs.length < trialsPerRound) pairs.push(...shuffle(contrast.pairs, random));
  return pairs.slice(0, trialsPerRound).map((pair) => ({
    pair,
    answer: random() < 0.5 ? 0 : 1,
    voiceKey: voiceKeys[Math.floor(random() * voiceKeys.length)] ?? voiceKeys[0],
  }));
}

export interface EarResult {
  correct: number;
  total: number;
  date: string;
}

const storageKey = 'maitalki.ear.v1';

/** Last result per contrast, e.g. { "ch-sh": { correct: 8, total: 10, date: "2026-11-01" } }. */
export function readEarResults(): Record<string, EarResult> {
  try {
    const parsed = JSON.parse(localStorage.getItem(storageKey) ?? '{}') as unknown;
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {};
    return Object.fromEntries(Object.entries(parsed).filter(([, value]) => {
      const result = value as Partial<EarResult>;
      return typeof result.correct === 'number' && typeof result.total === 'number' && typeof result.date === 'string';
    })) as Record<string, EarResult>;
  } catch {
    return {};
  }
}

export function saveEarResult(contrastId: string, result: EarResult) {
  try {
    localStorage.setItem(storageKey, JSON.stringify({ ...readEarResults(), [contrastId]: result }));
  } catch {
    // Storage may be unavailable; the round still works.
  }
}
