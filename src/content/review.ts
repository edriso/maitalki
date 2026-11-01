import type { NoteCategory, PracticeNote } from './types';

const dayNumber = (date: Date) => Math.floor(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86_400_000);

/**
 * One note to revisit after today's practice: a saved note, rotating daily, or else a Core
 * note from today's category so the suggestion connects to what was just practiced.
 */
export function pickReviewNote(notes: PracticeNote[], favorites: string[], category: NoteCategory, date = new Date()): PracticeNote | undefined {
  const saved = notes.filter((note) => favorites.includes(note.id));
  const pool = saved.length ? saved : notes.filter((note) => note.priority === 'Core' && note.category === category);
  const fallback = pool.length ? pool : notes.filter((note) => note.priority === 'Core');
  return fallback[dayNumber(date) % fallback.length];
}
