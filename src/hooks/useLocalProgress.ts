import { useEffect, useState } from 'react';

interface Progress {
  version: 1;
  completedDays: string[];
  completedSessions: number;
  favorites: string[];
}

const storageKey = 'maitalki.progress.v1';
const emptyProgress: Progress = { version: 1, completedDays: [], completedSessions: 0, favorites: [] };

const readProgress = (): Progress => {
  try {
    const stored = localStorage.getItem(storageKey);
    if (!stored) return emptyProgress;
    const parsed = JSON.parse(stored) as Partial<Progress>;
    if (parsed.version !== 1) return emptyProgress;
    return {
      version: 1,
      completedDays: Array.isArray(parsed.completedDays) ? parsed.completedDays : [],
      completedSessions: typeof parsed.completedSessions === 'number' ? parsed.completedSessions : 0,
      favorites: Array.isArray(parsed.favorites) ? parsed.favorites : [],
    };
  } catch {
    return emptyProgress;
  }
};

export const localDateKey = (date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export function useLocalProgress() {
  const [progress, setProgress] = useState<Progress>(readProgress);

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(progress));
  }, [progress]);

  const completeToday = () => {
    const today = localDateKey();
    setProgress((current) => current.completedDays.includes(today) ? current : {
      ...current,
      completedDays: [...current.completedDays, today],
      completedSessions: current.completedSessions + 1,
    });
  };

  const toggleFavorite = (id: string) => setProgress((current) => ({
    ...current,
    favorites: current.favorites.includes(id)
      ? current.favorites.filter((favorite) => favorite !== id)
      : [...current.favorites, id],
  }));

  return { progress, completeToday, toggleFavorite };
}
