import { Bookmark, Search, SlidersHorizontal } from 'lucide-react';
import { useMemo, useState } from 'react';
import { NoteCard } from '../components/NoteCard';
import { categories, notes } from '../content/notes';
import type { NoteCategory, PracticeNote } from '../content/types';

interface Props {
  favorites: string[];
  onFavorite: (id: string) => void;
  onOpen: (note: PracticeNote) => void;
}

export function LibraryScreen({ favorites, onFavorite, onOpen }: Props) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<'All' | NoteCategory>('All');
  const [savedOnly, setSavedOnly] = useState(false);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return notes.filter((note) => {
      const categoryMatch = category === 'All' || note.category === category;
      const savedMatch = !savedOnly || favorites.includes(note.id);
      const queryMatch = !normalized || [note.title, note.cue, note.rule, ...note.tags].join(' ').toLowerCase().includes(normalized);
      return categoryMatch && savedMatch && queryMatch;
    });
  }, [category, favorites, query, savedOnly]);

  return (
    <main className="screen" id="main-content">
      <div className="page-heading"><div><span className="eyebrow">Your field notes</span><h1>Learn one thing.<br />Use it today.</h1><p>Cleaned, corrected, and organized from your lessons by what will improve clarity first.</p></div></div>
      <div className="library-tools">
        <label className="search-box"><Search /><span className="sr-only">Search notes</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search stress, discovery, R…" /></label>
        <button className={`saved-filter ${savedOnly ? 'active' : ''}`} onClick={() => setSavedOnly((value) => !value)}><Bookmark fill={savedOnly ? 'currentColor' : 'none'} /> Saved</button>
      </div>
      <div className="category-row" aria-label="Filter note category"><SlidersHorizontal aria-hidden="true" />{categories.map((item) => <button key={item} onClick={() => setCategory(item)} className={category === item ? 'active' : ''}>{item}</button>)}</div>
      <div className="result-row"><p>{filtered.length} {filtered.length === 1 ? 'note' : 'notes'}</p><span>Core comes first</span></div>
      {filtered.length ? <div className="notes-grid">{filtered.map((note) => <NoteCard key={note.id} note={note} favorite={favorites.includes(note.id)} onFavorite={() => onFavorite(note.id)} onOpen={() => onOpen(note)} />)}</div> : <div className="empty-state"><Search /><h2>No notes found</h2><p>Try a broader word or clear the saved filter.</p></div>}
    </main>
  );
}
