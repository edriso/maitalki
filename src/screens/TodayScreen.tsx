import { Check, ChevronLeft, ChevronRight, CircleStop, Mic, RotateCcw, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { notes } from '../content/notes';
import { pickReviewNote } from '../content/review';
import type { DailyDrill, PracticeNote } from '../content/types';
import { ListenControls } from '../components/ListenControls';
import { ReviewNote } from '../components/ReviewNote';
import { ShadowCoach } from '../components/ShadowCoach';
import { VoicePicker } from '../components/VoicePicker';
import { pauseOtherMedia, stopClip } from '../hooks/useModelAudio';
import { maxTakes, useRecorder } from '../hooks/useRecorder';

interface Props {
  drill: DailyDrill;
  completed: boolean;
  sessions: number;
  favorites: string[];
  onComplete: () => void;
  onOpenNote: (note: PracticeNote) => void;
}

const stepLabels = ['Set up', 'Shape it', 'Say it', 'Review'];

export function TodayScreen({ drill, completed, sessions, favorites, onComplete, onOpenNote }: Props) {
  const [step, setStep] = useState(completed ? 3 : 0);
  const [outline, setOutline] = useState(['', '', '']);
  const [showModel, setShowModel] = useState(false);
  const [checks, setChecks] = useState<boolean[]>(drill.checklist.map(() => false));
  const recorder = useRecorder();
  const reviewNote = pickReviewNote(notes, favorites, drill.category);

  // Silence model audio and earlier takes first, so the microphone only hears the learner.
  const startRecording = () => {
    stopClip();
    pauseOtherMedia();
    void recorder.start();
  };

  const next = () => setStep((value) => Math.min(3, value + 1));
  const back = () => setStep((value) => Math.max(0, value - 1));
  const finish = () => { onComplete(); setStep(3); };

  return (
    <main className="screen today-screen" id="main-content">
      <div className="page-heading today-heading">
        <div><span className="eyebrow">Today’s practice · {drill.minutes} min</span><h1>{drill.title}</h1><p>{drill.focus}</p></div>
        <div className="session-stat"><strong>{sessions}</strong><span>sessions<br />completed</span></div>
      </div>

      <nav className="step-nav" aria-label="Practice steps">
        {stepLabels.map((label, index) => <button key={label} className={step === index ? 'active' : step > index ? 'done' : ''} onClick={() => setStep(index)} aria-current={step === index ? 'step' : undefined}>
          <span>{step > index ? <Check /> : index + 1}</span><small>{label}</small>
        </button>)}
      </nav>

      <section className="practice-panel" aria-live="polite">
        {step === 0 && <div className="step-content">
          <span className="step-kicker">01 · Warm up</span>
          <h2>Put the beat in your mouth.</h2>
          <p className="step-lede">Listen once if it helps. Then read each line three times: slow first, then natural. Tap the capitalized words.</p>
          <VoicePicker />
          <div className="warmup-lines">{drill.warmup.map((line, index) => <div className="warmup-line" key={line}>
            <p>{line}</p>
            <ListenControls text={line} label={`warm-up line ${index + 1}`} />
          </div>)}</div>
          <ShadowCoach subject="the warm-up lines" lines={drill.warmup.map((line, index) => ({ text: line, label: `warm-up line ${index + 1}` }))} />
          <div className="coach-note"><Sparkles /><p><strong>Keep this in mind</strong>Clarity before speed. Let the important words carry the sentence.</p></div>
        </div>}

        {step === 1 && <div className="step-content">
          <span className="step-kicker">02 · Shape it</span>
          <h2>Think in three bullets.</h2>
          <p className="prompt">{drill.prompt}</p>
          <div className="outline-grid">{drill.outline.map((label, index) => <label key={label}>
            <span>0{index + 1}</span>{label}
            <textarea value={outline[index]} onChange={(event) => setOutline((items) => items.map((item, itemIndex) => itemIndex === index ? event.target.value : item))} placeholder="A few words, not a script" rows={2} />
          </label>)}</div>
          <button className="text-button" onClick={() => setShowModel((value) => !value)} aria-expanded={showModel}>{showModel ? 'Hide' : 'Compare with'} a model answer</button>
          {showModel && <div className="model-answer"><blockquote>{drill.model}</blockquote><ListenControls text={drill.model} label="the model answer" /></div>}
        </div>}

        {step === 2 && <div className="step-content speak-step">
          <span className="step-kicker">03 · Say it</span>
          <h2>One take. Then one better take.</h2>
          <p className="prompt compact">{drill.prompt}</p>
          <div className={`recorder ${recorder.status}`}>
            <div className="record-orbit"><span>{recorder.status === 'recording' ? `${recorder.seconds}s` : <Mic />}</span></div>
            {recorder.status === 'idle' && <><h3>Record your first take</h3><p>Up to two minutes. It stays in this browser and disappears when you leave.</p><button className="primary-button" onClick={startRecording}><Mic /> Start recording</button></>}
            {recorder.status === 'recording' && <><h3>Recording take {Math.min(recorder.takes.length + 1, maxTakes)}…</h3><p>Finish the thought. A clean pause is allowed.</p><button className="stop-button" onClick={recorder.stop}><CircleStop /> Stop</button></>}
            {recorder.status === 'ready' && <>
              <h3>{recorder.takes.length === 1 ? 'Listen for one improvement' : 'Compare your two takes'}</h3>
              <p>{recorder.takes.length === 1 ? 'Play your take, then the model. Pick one thing to change: a pause, a stressed word, or a shorter answer.' : 'Which one is easier to follow? Listen for clean pauses and the stressed words.'}</p>
              <div className="takes">{recorder.takes.map((take, index) => <div className="take" key={take.url}>
                <span>Take {index + 1}<small>{take.seconds}s</small></span>
                <audio controls preload="metadata" src={take.url} onPlay={(event) => { stopClip(); pauseOtherMedia(event.currentTarget); }}>Your browser does not support audio playback.</audio>
              </div>)}</div>
              <div className="compare-model"><p>The model answer</p><ListenControls text={drill.model} label="the model answer" /></div>
              <div className="take-actions">
                <button className="primary-button" onClick={startRecording}><Mic /> {recorder.takes.length === 1 ? 'Record a better take' : 'Re-record take 2'}</button>
                {recorder.takes.length === maxTakes && <button className="secondary-button" onClick={recorder.reset}><RotateCcw /> Start over</button>}
              </div>
            </>}
            {recorder.status === 'denied' && <><h3>Recording is unavailable</h3><p>Allow microphone access, or use your phone’s recorder. You can still complete the practice.</p><button className="secondary-button" onClick={startRecording}><Mic /> Try again</button></>}
          </div>
        </div>}

        {step === 3 && <div className="step-content review-step">
          <span className="step-kicker">04 · Review</span>
          <h2>{completed ? 'Practice logged.' : 'Notice, don’t score.'}</h2>
          <p className="step-lede">Check what you deliberately practiced. This is reflection, not automated pronunciation grading.</p>
          <div className="check-list">{drill.checklist.map((item, index) => <label key={item} className={checks[index] ? 'checked' : ''}>
            <input type="checkbox" checked={checks[index]} onChange={() => setChecks((items) => items.map((checked, itemIndex) => itemIndex === index ? !checked : checked))} />
            <span><Check /></span>{item}
          </label>)}</div>
          {!completed ? <button className="primary-button finish-button" onClick={finish}><Check /> Finish practice</button> : <>
            <div className="complete-note"><Check /><p><strong>Done for today.</strong>One focused repetition is enough. Come back tomorrow for a different skill.</p></div>
            {reviewNote && <ReviewNote note={reviewNote} saved={favorites.includes(reviewNote.id)} onOpen={() => onOpenNote(reviewNote)} />}
          </>}
        </div>}
      </section>

      <div className="practice-actions">
        <button className="secondary-button" onClick={back} disabled={step === 0}><ChevronLeft /> Back</button>
        {step < 3 && <button className="primary-button" onClick={next}>Continue <ChevronRight /></button>}
      </div>
    </main>
  );
}
