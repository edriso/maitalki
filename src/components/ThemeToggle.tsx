import { Moon, Sun } from 'lucide-react';

interface Props {
  theme: 'light' | 'dark';
  onToggle: () => void;
}

export function ThemeToggle({ theme, onToggle }: Props) {
  return (
    <button className="icon-button" onClick={onToggle} aria-label={`Use ${theme === 'light' ? 'dark' : 'light'} theme`}>
      {theme === 'light' ? <Moon /> : <Sun />}
    </button>
  );
}
