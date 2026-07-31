import { Bookmark, ChevronRight } from 'lucide-react';
import type { PracticeNote } from '../content/types';

interface Props {
  note: PracticeNote;
  favorite: boolean;
  onFavorite: () => void;
  onOpen: () => void;
}

export function NoteCard({ note, favorite, onFavorite, onOpen }: Props) {
  return (
    <article className="note-card">
      <div className="note-card-top">
        <div className="meta-row"><span className={`priority p-${note.priority.toLowerCase()}`}>{note.priority}</span><span>{note.category}</span></div>
        <button className={`save-button ${favorite ? 'saved' : ''}`} onClick={onFavorite} aria-label={`${favorite ? 'Remove' : 'Add'} ${note.title} ${favorite ? 'from' : 'to'} saved notes`}>
          <Bookmark fill={favorite ? 'currentColor' : 'none'} />
        </button>
      </div>
      <button className="card-main" onClick={onOpen}>
        <h3>{note.title}</h3>
        <p>{note.cue}</p>
        <span>Open note <ChevronRight /></span>
      </button>
    </article>
  );
}
