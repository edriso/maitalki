import { BookOpen, Dumbbell, Ear, Library } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Brand } from './components/Brand';
import { NoteDialog } from './components/NoteDialog';
import { ThemeToggle } from './components/ThemeToggle';
import { getDailyDrill } from './content/drills';
import { notes } from './content/notes';
import type { PracticeNote } from './content/types';
import { localDateKey, useLocalProgress } from './hooks/useLocalProgress';
import { EarScreen } from './screens/EarScreen';
import { LibraryScreen } from './screens/LibraryScreen';
import { PlaybookScreen } from './screens/PlaybookScreen';
import { TodayScreen } from './screens/TodayScreen';

type View = 'today' | 'ear' | 'library' | 'playbook';
const views: { id: View; label: string; icon: typeof Dumbbell }[] = [
  { id: 'today', label: 'Practice', icon: Dumbbell },
  { id: 'ear', label: 'Ear training', icon: Ear },
  { id: 'library', label: 'Notes', icon: Library },
  { id: 'playbook', label: 'Playbook', icon: BookOpen },
];

const initialView = (): View => {
  const hash = window.location.hash.slice(1);
  return views.some((view) => view.id === hash) ? hash as View : 'today';
};

const initialTheme = (): 'light' | 'dark' => {
  const stored = localStorage.getItem('maitalki.theme');
  if (stored === 'light' || stored === 'dark') return stored;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

export default function App() {
  const [view, setView] = useState<View>(initialView);
  const [theme, setTheme] = useState<'light' | 'dark'>(initialTheme);
  const [openNote, setOpenNote] = useState<PracticeNote>();
  const { progress, completeToday, toggleFavorite } = useLocalProgress();
  const dailyDrill = getDailyDrill();
  const completed = progress.completedDays.includes(localDateKey());

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('maitalki.theme', theme);
  }, [theme]);

  useEffect(() => {
    const onHashChange = () => setView(initialView());
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const navigate = (next: View) => {
    window.location.hash = next;
    setView(next);
    window.scrollTo({ top: 0, behavior: 'auto' });
  };

  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">Skip to content</a>
      <header className="topbar">
        <button className="brand-button" onClick={() => navigate('today')}><Brand /></button>
        <nav className="desktop-nav" aria-label="Main navigation">{views.map((item) => <button key={item.id} className={view === item.id ? 'active' : ''} onClick={() => navigate(item.id)}>{item.label}</button>)}</nav>
        <div className="header-actions"><ThemeToggle theme={theme} onToggle={() => setTheme((value) => value === 'light' ? 'dark' : 'light')} /></div>
      </header>

      {view === 'today' && <TodayScreen drill={dailyDrill} completed={completed} sessions={progress.completedSessions} favorites={progress.favorites} onComplete={completeToday} onOpenNote={setOpenNote} />}
      {view === 'ear' && <EarScreen onOpenNote={(id) => setOpenNote(notes.find((note) => note.id === id))} />}
      {view === 'library' && <LibraryScreen favorites={progress.favorites} onFavorite={toggleFavorite} onOpen={setOpenNote} />}
      {view === 'playbook' && <PlaybookScreen />}

      <footer><Brand /><p>Clearer English. Better conversations. A few focused minutes at a time.</p><span>Practice stays on this device.</span></footer>
      <nav className="bottom-nav" aria-label="Main navigation">{views.map((item) => <button key={item.id} className={view === item.id ? 'active' : ''} onClick={() => navigate(item.id)}><item.icon /><span>{item.label}</span></button>)}</nav>
      <NoteDialog note={openNote} favorite={openNote ? progress.favorites.includes(openNote.id) : false} onFavorite={() => openNote && toggleFavorite(openNote.id)} onClose={() => setOpenNote(undefined)} />
    </div>
  );
}
