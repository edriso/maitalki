import { Ear, Mic, RotateCcw, Square, Users } from 'lucide-react';
import { useEffect, useId, useRef, useState } from 'react';
import { clipUrl } from '../content/audio';
import { playClip, stopClipIf, useModelAudio } from '../hooks/useModelAudio';
import { repeatGap, shadowRounds } from '../hooks/shadowing';
import { useVoicePreference } from '../hooks/useVoicePreference';

interface Line {
  text: string;
  label: string;
}

interface Props {
  lines: Line[];
  /** What is being shadowed, e.g. "the warm-up lines". */
  subject: string;
}

type Phase = 'listen' | 'repeat' | 'along';

const wait = (seconds: number) => new Promise((resolve) => setTimeout(resolve, seconds * 1000));

interface Progress {
  round: number;
  line: number;
  phase: Phase;
  gap?: number;
}

export function ShadowCoach({ lines, subject }: Props) {
  const clipId = `${useId()}-shadow`;
  const { voice } = useVoicePreference();
  const { failedId } = useModelAudio();
  const [progress, setProgress] = useState<Progress | 'done'>();
  const runRef = useRef(0);
  const sources = lines.map((line) => (voice ? clipUrl(voice.key, line.text) : undefined));

  useEffect(() => () => {
    runRef.current += 1;
    stopClipIf([clipId]);
  }, [clipId]);

  if (!lines.length || sources.some((src) => !src)) return null;

  const start = async () => {
    const run = ++runRef.current;
    const active = () => runRef.current === run;
    for (const [round, { rate, mode }] of shadowRounds.entries()) {
      for (const [line, src] of sources.entries()) {
        setProgress({ round, line, phase: mode === 'along' ? 'along' : 'listen' });
        const { completed, duration } = await playClip(clipId, src!, rate);
        if (!active()) return;
        if (!completed) {
          setProgress(undefined);
          return;
        }
        if (mode === 'echo') {
          const gap = repeatGap(duration, rate);
          setProgress({ round, line, phase: 'repeat', gap });
          await wait(gap);
        } else {
          await wait(0.8);
        }
        if (!active()) return;
      }
    }
    setProgress('done');
  };

  const stop = () => {
    runRef.current += 1;
    stopClipIf([clipId]);
    setProgress(undefined);
  };

  if (progress === undefined || progress === 'done') {
    return (
      <section className="shadow-coach" aria-label={`Shadow ${subject}`}>
        <div className="shadow-intro">
          <Users aria-hidden="true" />
          <p>
            <strong>{progress === 'done' ? 'Shadowing done. Now say the lines once on your own.' : `Shadow ${subject}`}</strong>
            {progress === 'done' ? 'Notice which words felt different from the model.' : 'Three short rounds: listen slowly and repeat, listen and repeat, then speak along. About a minute. Headphones help.'}
          </p>
        </div>
        <button type="button" className="secondary-button" onClick={start}>{progress === 'done' ? <><RotateCcw aria-hidden="true" /> Shadow again</> : <><Ear aria-hidden="true" /> Start shadowing</>}</button>
        {failedId === clipId && <p className="listen-error" role="status">Audio couldn’t play. Check your connection and try again.</p>}
      </section>
    );
  }

  const round = shadowRounds[progress.round];
  const cue = progress.phase === 'listen' ? 'Listen' : progress.phase === 'repeat' ? 'Your turn: say it' : 'Speak along now';

  return (
    <section className="shadow-coach running" aria-label={`Shadow ${subject}`}>
      <div className="shadow-status">
        <span className="shadow-round">Round {progress.round + 1} of {shadowRounds.length} · {round.title}</span>
        <p className="shadow-line">{lines[progress.line].text}</p>
        <p className={`shadow-cue ${progress.phase}`} role="status">
          {progress.phase === 'listen' ? <Ear aria-hidden="true" /> : <Mic aria-hidden="true" />}
          {cue}<span className="sr-only">: {lines[progress.line].label}</span>
        </p>
        {progress.phase === 'repeat' && <span className="shadow-timer" aria-hidden="true"><span key={`${progress.round}-${progress.line}`} style={{ animationDuration: `${progress.gap}s` }} /></span>}
      </div>
      <button type="button" className="secondary-button" onClick={stop}><Square aria-hidden="true" /> Stop</button>
    </section>
  );
}
