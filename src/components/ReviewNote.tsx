import { BookmarkCheck, ChevronRight } from 'lucide-react';
import type { PracticeNote } from '../content/types';
import { ListenControls } from './ListenControls';

interface Props {
  note: PracticeNote;
  saved: boolean;
  onOpen: () => void;
}

/** An optional one-minute revisit shown after the daily practice is complete. */
export function ReviewNote({ note, saved, onOpen }: Props) {
  const example = note.examples[0];
  return (
    <section className="review-note" aria-labelledby="review-note-title">
      <span className="step-kicker"><BookmarkCheck aria-hidden="true" /> Optional · one minute</span>
      <h3 id="review-note-title">{saved ? 'Revisit a saved note' : 'Revisit a core note'}: {note.title}</h3>
      <p>{note.cue}</p>
      <blockquote>{example.after}</blockquote>
      <ListenControls text={example.after} label={`the ${note.title} example`} />
      <button type="button" className="text-button" onClick={onOpen}>Open the full note <ChevronRight aria-hidden="true" /></button>
    </section>
  );
}
