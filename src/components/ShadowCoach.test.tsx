import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { drills } from '../content/drills';
import { stopClip } from '../hooks/useModelAudio';
import { repeatGap } from '../hooks/shadowing';
import { ShadowCoach } from './ShadowCoach';

const lines = drills[0].warmup.map((text, index) => ({ text, label: `line ${index + 1}` }));
const lastAudio = () => vi.mocked(HTMLMediaElement.prototype.play).mock.contexts.at(-1) as HTMLAudioElement;

afterEach(() => {
  stopClip();
  vi.mocked(HTMLMediaElement.prototype.play).mockClear();
});

describe('ShadowCoach', () => {
  it('plays slowly first, then gives a turn to repeat, and can be stopped', async () => {
    const user = userEvent.setup();
    render(<ShadowCoach subject="the warm-up lines" lines={lines} />);
    expect(HTMLMediaElement.prototype.play).not.toHaveBeenCalled();

    await user.click(screen.getByRole('button', { name: 'Start shadowing' }));
    expect(lastAudio().playbackRate).toBe(0.75);
    expect(screen.getByText(/Round 1 of 3/)).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('Listen');

    await act(async () => { lastAudio().dispatchEvent(new Event('ended')); });
    expect(screen.getByRole('status')).toHaveTextContent('Your turn: say it');

    await user.click(screen.getByRole('button', { name: 'Stop' }));
    expect(screen.getByRole('button', { name: 'Start shadowing' })).toBeInTheDocument();
  });

  it('gives enough time to repeat a line at the played speed', () => {
    expect(repeatGap(2, 1)).toBeCloseTo(3);
    expect(repeatGap(2, 0.75)).toBeGreaterThan(repeatGap(2, 1));
    expect(repeatGap(0.3, 1)).toBe(1.6);
  });

  it('hides itself when a line has no audio', () => {
    const { container } = render(<ShadowCoach subject="x" lines={[{ text: 'No clip here.', label: 'x' }]} />);
    expect(container).toBeEmptyDOMElement();
  });
});
