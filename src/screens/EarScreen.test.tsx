import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { soundContrasts } from '../content/contrasts';
import { stopClip } from '../hooks/useModelAudio';
import { EarScreen } from './EarScreen';

afterEach(() => {
  stopClip();
  vi.restoreAllMocks();
  vi.mocked(HTMLMediaElement.prototype.play).mockClear();
});

describe('EarScreen', () => {
  it('runs a round, gives feedback, and remembers the result', async () => {
    // With random() = 0 every trial plays the first word of its pair in the first voice.
    vi.spyOn(Math, 'random').mockReturnValue(0);
    const user = userEvent.setup();
    const onOpenNote = vi.fn();
    render(<EarScreen onOpenNote={onOpenNote} />);

    await user.click(screen.getByRole('button', { name: /Start 10 words/ }));
    expect(HTMLMediaElement.prototype.play).toHaveBeenCalledTimes(1);

    const answer = () => screen.getAllByRole('button').find((button) => button.classList.contains('answer-button'))!;
    await user.click(answer());
    expect(screen.getByText(/^Yes, “/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Next word/ })).toHaveFocus();

    const wrong = () => screen.getAllByRole('button').filter((button) => button.classList.contains('answer-button'))[1];
    await user.click(screen.getByRole('button', { name: /Next word/ }));
    await user.click(wrong());
    expect(screen.getByText(/^It was “/)).toBeInTheDocument();

    for (let word = 3; word <= 10; word += 1) {
      await user.click(screen.getByRole('button', { name: /Next word|See results/ }));
      await user.click(answer());
    }
    await user.click(screen.getByRole('button', { name: /See results/ }));

    expect(screen.getByRole('heading', { name: '9 of 10 heard correctly.' })).toHaveFocus();
    expect(screen.getByText(/This checks listening, not your pronunciation/)).toBeInTheDocument();
    expect(JSON.parse(localStorage.getItem('maitalki.ear.v1')!)[soundContrasts[0].id]).toMatchObject({ correct: 9, total: 10 });

    await user.click(screen.getByRole('button', { name: 'How to say it' }));
    expect(onOpenNote).toHaveBeenCalledWith(soundContrasts[0].noteId);
  });

  it('does not play anything until the learner starts', () => {
    render(<EarScreen onOpenNote={() => undefined} />);
    expect(HTMLMediaElement.prototype.play).not.toHaveBeenCalled();
    expect(screen.getByRole('radio', { name: /I \/ E/ })).toBeChecked();
  });
});
