import { describe, expect, it } from 'vitest';
import { soundContrasts } from '../content/contrasts';
import { createRound, readEarResults, saveEarResult, trialsPerRound } from './earTraining';

const seeded = (seed: number) => () => {
  seed = (seed * 16807) % 2147483647;
  return (seed - 1) / 2147483646;
};

describe('ear training', () => {
  it('builds ten trials that cover every pair before repeating', () => {
    for (const contrast of soundContrasts) {
      const round = createRound(contrast, ['sarah', 'eric'], seeded(7));
      expect(round).toHaveLength(trialsPerRound);
      const firstPairs = new Set(round.slice(0, contrast.pairs.length).map((trial) => trial.pair.join('/')));
      expect(firstPairs.size).toBe(contrast.pairs.length);
      for (const trial of round) {
        expect([0, 1]).toContain(trial.answer);
        expect(['sarah', 'eric']).toContain(trial.voiceKey);
      }
    }
  });

  it('uses both voices and both answers across a round', () => {
    const round = createRound(soundContrasts[0], ['sarah', 'eric'], seeded(42));
    expect(new Set(round.map((trial) => trial.voiceKey)).size).toBe(2);
    expect(new Set(round.map((trial) => trial.answer)).size).toBe(2);
  });

  it('stores the last result per contrast and ignores malformed data', () => {
    localStorage.setItem('maitalki.ear.v1', JSON.stringify({ broken: { correct: 'x' } }));
    expect(readEarResults()).toEqual({});
    saveEarResult('ch-sh', { correct: 8, total: 10, date: '2026-11-01' });
    expect(readEarResults()).toEqual({ 'ch-sh': { correct: 8, total: 10, date: '2026-11-01' } });
    localStorage.setItem('maitalki.ear.v1', 'not json');
    expect(readEarResults()).toEqual({});
  });

  it('uses only distinct, single-word pairs', () => {
    for (const contrast of soundContrasts) {
      for (const [first, second] of contrast.pairs) {
        expect(first).not.toBe(second);
        expect(`${first}${second}`).toMatch(/^[a-z]+$/);
      }
    }
  });
});
