import { describe, expect, it } from 'vitest';
import { drills, getDailyDrill } from './drills';
import { notes } from './notes';

describe('practice content', () => {
  it('keeps note ids unique and required practice fields populated', () => {
    expect(new Set(notes.map((note) => note.id)).size).toBe(notes.length);
    for (const note of notes) {
      expect(note.examples.length).toBeGreaterThan(0);
      expect(note.drill.length).toBeGreaterThan(20);
      expect(note.tags.length).toBeGreaterThan(0);
    }
  });

  it('keeps daily drills concise and complete', () => {
    expect(drills.length).toBeGreaterThanOrEqual(7);
    for (const drill of drills) {
      expect(drill.outline).toHaveLength(3);
      expect(drill.checklist).toHaveLength(4);
      expect(drill.minutes).toBeLessThanOrEqual(10);
    }
  });

  it('selects the same drill throughout a date', () => {
    expect(getDailyDrill(new Date('2026-07-31T01:00:00Z'))).toEqual(getDailyDrill(new Date('2026-07-31T22:00:00Z')));
  });
});
