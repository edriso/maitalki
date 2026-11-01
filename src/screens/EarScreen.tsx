import { ArrowRight, Check, Ear, RotateCcw, Volume2, X } from 'lucide-react';
import { useEffect, useId, useRef, useState } from 'react';
import { availableVoices, clipUrl } from '../content/audio';
import { soundContrasts } from '../content/contrasts';
import { createRound, readEarResults, saveEarResult, type Trial } from '../hooks/earTraining';
import { localDateKey } from '../hooks/useLocalProgress';
import { stopClip, useModelAudio } from '../hooks/useModelAudio';

interface Props {
  onOpenNote: (noteId: string) => void;
  /** Contrast to select first, e.g. when arriving from a note. */
  initialContrastId?: string;
}

export function EarScreen({ onOpenNote, initialContrastId }: Props) {
  const baseId = useId();
  const [contrastId, setContrastId] = useState(initialContrastId ?? soundContrasts[0].id);
  const [trials, setTrials] = useState<Trial[]>();
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<(0 | 1)[]>([]);
  const [results, setResults] = useState(readEarResults);
  const { playingId, failedId, play } = useModelAudio();
  const nextRef = useRef<HTMLButtonElement>(null);
  const answerRef = useRef<HTMLButtonElement>(null);
  const summaryRef = useRef<HTMLHeadingElement>(null);
  const focusAfter = useRef<'next' | 'answer' | 'summary' | undefined>(undefined);

  const contrast = soundContrasts.find((item) => item.id === contrastId) ?? soundContrasts[0];
  const voiceKeys = availableVoices.map((voice) => voice.key);
  const trial = trials?.[index];
  const answered = answers.length > index;
  const finished = Boolean(trials && index >= trials.length);
  const correctCount = trials ? answers.filter((answer, item) => answer === trials[item].answer).length : 0;

  useEffect(() => () => stopClip(), []);

  useEffect(() => {
    if (focusAfter.current === 'next') nextRef.current?.focus();
    if (focusAfter.current === 'answer') answerRef.current?.focus();
    if (focusAfter.current === 'summary') summaryRef.current?.focus();
    focusAfter.current = undefined;
  }, [answers, index]);

  if (!voiceKeys.length) {
    return <main className="screen" id="main-content"><div className="page-heading"><div><span className="eyebrow">Ear training</span><h1>Audio is not available yet.</h1></div></div></main>;
  }

  const playWord = (word: string, voiceKey: string, key: string) => {
    const src = clipUrl(voiceKey, word);
    if (src) void play(`${baseId}-${key}`, src);
  };
  const playTrial = (round: Trial[], item: number) => playWord(round[item].pair[round[item].answer], round[item].voiceKey, `trial-${item}`);

  const begin = () => {
    const round = createRound(contrast, voiceKeys);
    setTrials(round);
    setIndex(0);
    setAnswers([]);
    focusAfter.current = 'answer';
    playTrial(round, 0);
  };

  const choose = (choice: 0 | 1) => {
    if (!trials || answered) return;
    const next = [...answers, choice];
    focusAfter.current = 'next';
    setAnswers(next);
    if (next.length === trials.length) {
      const correct = next.filter((answer, item) => answer === trials[item].answer).length;
      saveEarResult(contrast.id, { correct, total: trials.length, date: localDateKey() });
      setResults(readEarResults());
    }
  };

  const nextWord = () => {
    if (!trials) return;
    stopClip();
    setIndex(index + 1);
    if (index + 1 >= trials.length) {
      focusAfter.current = 'summary';
      return;
    }
    focusAfter.current = 'answer';
    playTrial(trials, index + 1);
  };

  const chooseContrast = (id: string) => {
    stopClip();
    setContrastId(id);
    setTrials(undefined);
    setAnswers([]);
    setIndex(0);
  };

  const hearButtons = (pair: [string, string], voiceKey: string, key: string) => (
    <div className="hear-pair">{pair.map((word) => <button key={word} type="button" className="listen-button" onClick={() => playWord(word, voiceKey, `${key}-${word}`)}><Volume2 aria-hidden="true" />Hear “{word}”</button>)}</div>
  );

  const missed = trials ? trials.map((item, position) => ({ item, position, choice: answers[position] })).filter(({ item, choice }) => choice !== undefined && choice !== item.answer) : [];
  const last = results[contrast.id];

  return (
    <main className="screen ear-screen" id="main-content">
      <div className="page-heading">
        <div>
          <span className="eyebrow">Ear training</span>
          <h1>Hear it before<br />you say it.</h1>
          <p>Pick the word you hear. Ten quick words, two voices. Hearing a contrast clearly makes it easier to produce.</p>
        </div>
      </div>

      <fieldset className="contrast-picker">
        <legend>Sound</legend>
        {soundContrasts.map((item) => <label key={item.id} className={item.id === contrast.id ? 'active' : ''}>
          <input type="radio" className="sr-only" name={`${baseId}-contrast`} value={item.id} checked={item.id === contrast.id} onChange={() => chooseContrast(item.id)} />
          <strong>{item.label}</strong>
          <small>{results[item.id] ? `Last: ${results[item.id].correct}/${results[item.id].total}` : 'New'}</small>
        </label>)}
      </fieldset>

      <section className="practice-panel ear-panel" aria-live="polite">
        {!trials && <div className="step-content">
          <span className="step-kicker">{contrast.title}</span>
          <h2>Listen for one difference.</h2>
          <p className="step-lede">{contrast.listenFor}</p>
          <div className="pair-preview" aria-label="Word pairs">{contrast.pairs.map(([first, second]) => <span key={first}>{first} / {second}</span>)}</div>
          <button type="button" className="primary-button" onClick={begin}><Ear aria-hidden="true" /> Start 10 words</button>
          {last && <p className="ear-last">Last time: {last.correct} of {last.total} heard correctly.</p>}
        </div>}

        {trial && !finished && <div className="step-content">
          <div className="ear-progress">
            <span className="step-kicker">Word {index + 1} of {trials!.length}</span>
            <span className="ear-bar" aria-hidden="true"><span style={{ width: `${(index / trials!.length) * 100}%` }} /></span>
          </div>
          <h2>Which word did you hear?</h2>
          <button type="button" className="secondary-button replay" onClick={() => playTrial(trials!, index)}>
            <Volume2 aria-hidden="true" />{playingId === `${baseId}-trial-${index}` ? 'Playing…' : 'Play again'}
          </button>
          {failedId === `${baseId}-trial-${index}` && <p className="listen-error" role="status">Audio couldn’t play. Check your connection and press Play again.</p>}
          <div className="answer-grid">{trial.pair.map((word, choice) => {
            const state = !answered ? '' : choice === trial.answer ? 'right' : answers[index] === choice ? 'wrong' : '';
            return <button key={word} ref={choice === 0 ? answerRef : undefined} type="button" className={`answer-button ${state}`} onClick={() => choose(choice as 0 | 1)} aria-disabled={answered}>
              {word}{state === 'right' && <><Check aria-hidden="true" /><span className="sr-only"> (the word you heard)</span></>}{state === 'wrong' && <><X aria-hidden="true" /><span className="sr-only"> (your choice)</span></>}
            </button>;
          })}</div>
          {answered && <div className={`ear-feedback ${answers[index] === trial.answer ? 'right' : 'wrong'}`} role="status">
            <p>{answers[index] === trial.answer ? <><strong>Yes, “{trial.pair[trial.answer]}”.</strong> Hear both once more to lock in the difference.</> : <><strong>It was “{trial.pair[trial.answer]}”.</strong> Compare the two, listening only for the target sound.</>}</p>
            {hearButtons(trial.pair, trial.voiceKey, `feedback-${index}`)}
            <button ref={nextRef} type="button" className="primary-button" onClick={nextWord}>{index + 1 === trials!.length ? 'See results' : 'Next word'} <ArrowRight aria-hidden="true" /></button>
          </div>}
        </div>}

        {finished && trials && <div className="step-content ear-summary">
          <span className="step-kicker">{contrast.title} · Round complete</span>
          <h2 ref={summaryRef} tabIndex={-1}>{correctCount} of {trials.length} heard correctly.</h2>
          <p className="step-lede">{correctCount >= 9 ? 'Your ear is catching this contrast. Say the pairs aloud, or try another sound.' : 'Replay the pairs you missed, then try again tomorrow. Short, regular rounds work better than long ones.'} This checks listening, not your pronunciation.</p>
          {missed.length > 0 && <ul className="missed-list">{missed.map(({ item, position, choice }) => <li key={position}>
            <p><strong>{item.pair[item.answer]}</strong> <span>you chose “{item.pair[choice!]}”</span></p>
            {hearButtons(item.pair, item.voiceKey, `missed-${position}`)}
          </li>)}</ul>}
          <div className="ear-actions">
            <button type="button" className="primary-button" onClick={begin}><RotateCcw aria-hidden="true" /> Practice again</button>
            <button type="button" className="secondary-button" onClick={() => onOpenNote(contrast.noteId)}>How to say it</button>
          </div>
        </div>}
      </section>
    </main>
  );
}
