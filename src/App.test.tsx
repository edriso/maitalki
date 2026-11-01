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

  it('offers model audio for warm-ups and note examples', async () => {
    const user = userEvent.setup();
    render(<App />);
    expect(screen.getByRole('button', { name: 'Listen to warm-up line 1' })).toBeInTheDocument();
    expect(screen.getByRole('group', { name: 'Model voice' })).toBeInTheDocument();
    await user.click(screen.getAllByRole('button', { name: 'Notes' })[0]);
    await user.click(screen.getByRole('button', { name: /^Stress the message.*Open note/ }));
    expect(screen.getByRole('button', { name: 'Listen to example 1' })).toBeInTheDocument();
    expect(HTMLMediaElement.prototype.play).not.toHaveBeenCalled();
  });

  it('opens ear training from the navigation', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getAllByRole('button', { name: 'Ear training' })[0]);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/Hear it before\s*you say it/);
    expect(window.location.hash).toBe('#ear');
  });

  it('offers one optional note to revisit after finishing', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole('button', { name: /4\s*Review/ }));
    expect(screen.queryByText(/Optional · one minute/)).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /Finish practice/ }));
    expect(screen.getByText('Done for today.')).toBeInTheDocument();
    expect(screen.getByText(/Optional · one minute/)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /Open the full note/ }));
    expect(document.querySelector('dialog[open]')).not.toBeNull();
  });

  it('persists the selected theme', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole('button', { name: 'Use dark theme' }));
    expect(document.documentElement).toHaveAttribute('data-theme', 'dark');
    expect(localStorage.getItem('maitalki.theme')).toBe('dark');
  });
});
