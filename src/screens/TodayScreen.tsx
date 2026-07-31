import { Check, ChevronLeft, ChevronRight, CircleStop, Mic, RotateCcw, Sparkles } from 'lucide-react';
import { useState } from 'react';
import type { DailyDrill } from '../content/types';
import { useRecorder } from '../hooks/useRecorder';

interface Props {
  drill: DailyDrill;
  completed: boolean;
  sessions: number;
  onComplete: () => void;
}

const stepLabels = ['Set up', 'Shape it', 'Say it', 'Review'];

export function TodayScreen({ drill, completed, sessions, onComplete }: Props) {
  const [step, setStep] = useState(completed ? 3 : 0);
  const [outline, setOutline] = useState(['', '', '']);
  const [showModel, setShowModel] = useState(false);
  const [checks, setChecks] = useState<boolean[]>(drill.checklist.map(() => false));
  const recorder = useRecorder();

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
          <p className="step-lede">Read each line three times. Slow first, then natural. Tap the capitalized words.</p>
          <div className="warmup-lines">{drill.warmup.map((line) => <p key={line}>{line}</p>)}</div>
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
          {showModel && <blockquote className="model-answer">{drill.model}</blockquote>}
        </div>}

        {step === 2 && <div className="step-content speak-step">
          <span className="step-kicker">03 · Say it</span>
          <h2>One take. Then one better take.</h2>
          <p className="prompt compact">{drill.prompt}</p>
          <div className={`recorder ${recorder.status}`}>
            <div className="record-orbit"><span>{recorder.status === 'recording' ? `${recorder.seconds}s` : <Mic />}</span></div>
            {recorder.status === 'idle' && <><h3>Record your first take</h3><p>Up to two minutes. It stays in this browser and disappears when you leave.</p><button className="primary-button" onClick={recorder.start}><Mic /> Start recording</button></>}
            {recorder.status === 'recording' && <><h3>Recording…</h3><p>Finish the thought. A clean pause is allowed.</p><button className="stop-button" onClick={recorder.stop}><CircleStop /> Stop</button></>}
            {recorder.status === 'ready' && <><h3>Listen for one improvement</h3>{recorder.audioUrl && <audio controls src={recorder.audioUrl}>Your browser does not support audio playback.</audio>}<button className="secondary-button" onClick={recorder.reset}><RotateCcw /> Record again</button></>}
            {recorder.status === 'denied' && <><h3>Recording is unavailable</h3><p>Allow microphone access, or use your phone’s recorder. You can still complete the practice.</p><button className="secondary-button" onClick={recorder.start}><Mic /> Try again</button></>}
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
          {!completed ? <button className="primary-button finish-button" onClick={finish}><Check /> Finish practice</button> : <div className="complete-note"><Check /><p><strong>Done for today.</strong>One focused repetition is enough. Come back tomorrow for a different skill.</p></div>}
        </div>}
      </section>

      <div className="practice-actions">
        <button className="secondary-button" onClick={back} disabled={step === 0}><ChevronLeft /> Back</button>
        {step < 3 && <button className="primary-button" onClick={next}>Continue <ChevronRight /></button>}
      </div>
    </main>
  );
}
