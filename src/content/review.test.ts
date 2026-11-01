import { describe, expect, it } from 'vitest';
import { notes } from './notes';
import { pickReviewNote } from './review';

describe('pickReviewNote', () => {
  it('rotates through saved notes by day', () => {
    const saved = ['th', 'ch-sh'];
    const first = pickReviewNote(notes, saved, 'Sales', new Date(2026, 10, 1));
    const second = pickReviewNote(notes, saved, 'Sales', new Date(2026, 10, 2));
    expect(saved).toContain(first?.id);
    expect(saved).toContain(second?.id);
    expect(first?.id).not.toBe(second?.id);
  });

  it('suggests a Core note from today’s category when nothing is saved', () => {
    const note = pickReviewNote(notes, [], 'Sales', new Date(2026, 10, 1));
    expect(note).toMatchObject({ category: 'Sales', priority: 'Core' });
  });

  it('is stable within a day', () => {
    expect(pickReviewNote(notes, [], 'Rhythm', new Date(2026, 10, 1, 8))).toBe(pickReviewNote(notes, [], 'Rhythm', new Date(2026, 10, 1, 22)));
  });
});
