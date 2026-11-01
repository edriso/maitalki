import { describe, expect, it } from 'vitest';
import { soundContrasts } from './contrasts';
import { drills } from './drills';
import { notes } from './notes';
import { collectSpeechTexts, toSpeechText } from './speech';

describe('toSpeechText', () => {
  it('turns stress capitals and thought groups into a natural sentence', () => {
    expect(toSpeechText('Based on what you TOLD me / speed is the PRIORITY.')).toBe('Based on what you told me, speed is the priority.');
  });

  it('removes intonation arrows and keeps list commas', () => {
    expect(toSpeechText('the HISTORY ↗ / the FOOD ↗ / and the PEOPLE ↘')).toBe('The history, the food, and the people.');
  });

  it('restores reduced spellings to the words a speaker would say', () => {
    expect(toSpeechText('I NEED tə FINISH the REPORT before FRIDAY.')).toBe('I need to finish the report before Friday.');
    expect(toSpeechText('She could əv CALLED me EARLIER.')).toBe('She could have called me earlier.');
    expect(toSpeechText('We NEED tə BUY ə COUPLE əv THINGS.')).toBe('We need to buy a couple of things.');
  });

  it('keeps real acronyms and proper nouns', () => {
    expect(toSpeechText('I’m waiting for the final API KEY.')).toBe('I’m waiting for the final API key.');
    expect(toSpeechText('No, I live in EGYPT.')).toBe('No, I live in Egypt.');
  });

  it('turns minimal pairs and dotted lists into short separate items', () => {
    expect(toSpeechText('chip / ship · chair / share · which / wish')).toBe('Chip, ship. Chair, share. Which, wish.');
    expect(toSpeechText('a PREsent / to preSENT')).toBe('A present, to present.');
    expect(toSpeechText('I’d say… · Personally,… · In my experience,…')).toBe('I’d say… Personally… In my experience…');
  });

  it('does not add a pause after a sentence that already ended', () => {
    expect(toSpeechText('I hear you. / When you say EXPENSIVE / what are you comparing it WITH?')).toBe('I hear you. When you say expensive, what are you comparing it with?');
  });

  it('never leaves coaching notation in spoken text', () => {
    for (const text of collectSpeechTexts({ drills, notes, contrasts: soundContrasts })) {
      expect(text).not.toMatch(/[↗↘·/ə]/);
      expect(text).not.toMatch(/\b(?!API\b)[A-Z]{2,}\b/);
    }
  });
});
