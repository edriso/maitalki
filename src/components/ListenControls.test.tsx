import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { drills } from '../content/drills';
import { stopClip } from '../hooks/useModelAudio';
import { ListenControls } from './ListenControls';
import { VoicePicker } from './VoicePicker';

const [firstLine, secondLine] = drills[0].warmup;

afterEach(() => {
  stopClip();
  vi.mocked(HTMLMediaElement.prototype.play).mockClear();
});

describe('ListenControls', () => {
  it('plays only after a click and toggles to Stop', async () => {
    const user = userEvent.setup();
    render(<ListenControls text={firstLine} label="warm-up line 1" />);
    expect(HTMLMediaElement.prototype.play).not.toHaveBeenCalled();

    await user.click(screen.getByRole('button', { name: 'Listen to warm-up line 1' }));
    expect(HTMLMediaElement.prototype.play).toHaveBeenCalledTimes(1);
    await user.click(screen.getByRole('button', { name: 'Stop warm-up line 1' }));
    expect(HTMLMediaElement.prototype.pause).toHaveBeenCalled();
    expect(screen.getByRole('button', { name: 'Listen to warm-up line 1' })).toBeInTheDocument();
  });

  it('plays the slower version at a reduced rate', async () => {
    const user = userEvent.setup();
    const play = vi.mocked(HTMLMediaElement.prototype.play);
    render(<ListenControls text={firstLine} label="warm-up line 1" />);
    await user.click(screen.getByRole('button', { name: 'Slower: warm-up line 1' }));
    const audio = play.mock.contexts[0] as HTMLAudioElement;
    expect(audio.playbackRate).toBe(0.75);
    expect(audio.src).toMatch(/\/audio\/sarah\/[0-9a-f]{16}\.mp3$/);
  });

  it('keeps one clip playing at a time', async () => {
    const user = userEvent.setup();
    render(<><ListenControls text={firstLine} label="line 1" /><ListenControls text={secondLine} label="line 2" /></>);
    await user.click(screen.getByRole('button', { name: 'Listen to line 1' }));
    await user.click(screen.getByRole('button', { name: 'Listen to line 2' }));
    expect(screen.getAllByRole('button', { name: /^Stop/ })).toHaveLength(1);
    expect(screen.getByRole('button', { name: 'Stop line 2' })).toBeInTheDocument();
  });

  it('renders nothing for a line without audio', () => {
    const { container } = render(<ListenControls text="No clip for this line." label="missing" />);
    expect(container).toBeEmptyDOMElement();
  });

  it('switches and remembers the model voice', async () => {
    const user = userEvent.setup();
    const play = vi.mocked(HTMLMediaElement.prototype.play);
    render(<><VoicePicker /><ListenControls text={firstLine} label="line 1" /></>);
    expect(screen.getByRole('radio', { name: 'Sarah' })).toBeChecked();

    await user.click(screen.getByRole('radio', { name: 'Eric' }));
    expect(localStorage.getItem('maitalki.voice')).toBe('eric');
    await user.click(screen.getByRole('button', { name: 'Listen to line 1' }));
    expect((play.mock.contexts[0] as HTMLAudioElement).src).toContain('/audio/eric/');
  });
});
