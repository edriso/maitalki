import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import App from './App';

describe('MaiTalki app', () => {
  it('opens on the daily practice and moves through steps', async () => {
    const user = userEvent.setup();
    render(<App />);
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    expect(screen.getByText('Put the beat in your mouth.')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /continue/i }));
    expect(screen.getByText('Think in three bullets.')).toBeInTheDocument();
  });

  it('searches the note library', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getAllByRole('button', { name: 'Notes' })[0]);
    const search = screen.getByPlaceholderText(/Search stress/i);
    await user.type(search, 'objection');
    expect(screen.getByText('Slow down an objection')).toBeInTheDocument();
    expect(screen.queryByText('Keep the American R clear')).not.toBeInTheDocument();
  });

  it('persists the selected theme', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole('button', { name: 'Use dark theme' }));
    expect(document.documentElement).toHaveAttribute('data-theme', 'dark');
    expect(localStorage.getItem('maitalki.theme')).toBe('dark');
  });
});
