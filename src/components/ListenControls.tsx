import { Snail, Square, Volume2 } from 'lucide-react';
import { useEffect, useId } from 'react';
import { clipUrl } from '../content/audio';
import { stopClipIf, useModelAudio } from '../hooks/useModelAudio';
import { useVoicePreference } from '../hooks/useVoicePreference';

interface Props {
  /** The practice text exactly as displayed; it is mapped to its generated clip. */
  text: string;
  /** What this audio is, for screen readers, e.g. "warm-up line 1". */
  label: string;
}

const slowRate = 0.75;

/** Listen and Slower buttons for one line. Renders nothing when no clip exists. */
export function ListenControls({ text, label }: Props) {
  const id = useId();
  const { voice } = useVoicePreference();
  const { playingId, failedId, play, stop } = useModelAudio();
  const src = voice ? clipUrl(voice.key, text) : undefined;
  const normalId = `${id}-normal`;
  const slowId = `${id}-slow`;

  // Stop this line's audio when it leaves the screen (step change, dialog close).
  useEffect(() => () => stopClipIf([normalId, slowId]), [normalId, slowId]);

  if (!src) return null;

  const toggle = (clipId: string, rate: number) => (playingId === clipId ? stop() : play(clipId, src, rate));
  const failed = failedId === normalId || failedId === slowId;

  // The accessible name starts with the visible word, then adds which line it plays.
  const button = (clipId: string, rate: number, Icon: typeof Volume2, action: string, name: string) => {
    const playing = playingId === clipId;
    return (
      <button type="button" className={`listen-button ${playing ? 'playing' : ''}`} onClick={() => toggle(clipId, rate)} aria-label={playing ? `Stop ${label}` : name}>
        {playing ? <Square aria-hidden="true" /> : <Icon aria-hidden="true" />}
        {playing ? 'Stop' : action}
      </button>
    );
  };

  return (
    <div className="listen-controls">
      {button(normalId, 1, Volume2, 'Listen', `Listen to ${label}`)}
      {button(slowId, slowRate, Snail, 'Slower', `Slower: ${label}`)}
      {failed && <span className="listen-error" role="status">Audio couldn’t play. Check your connection and try again.</span>}
    </div>
  );
}
