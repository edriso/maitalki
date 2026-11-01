import { useEffect, useRef, useState } from 'react';

export interface Take {
  url: string;
  seconds: number;
}

/** "One take. Then one better take." A third recording replaces the second take. */
export const maxTakes = 2;
const maxSeconds = 120;

export function useRecorder() {
  const [status, setStatus] = useState<'idle' | 'recording' | 'ready' | 'denied'>('idle');
  const [takes, setTakes] = useState<Take[]>([]);
  const [seconds, setSeconds] = useState(0);
  const takesRef = useRef<Take[]>([]);
  const secondsRef = useRef(0);
  const recorderRef = useRef<MediaRecorder | undefined>(undefined);
  const streamRef = useRef<MediaStream | undefined>(undefined);
  const chunksRef = useRef<Blob[]>([]);

  const updateTakes = (next: Take[]) => {
    takesRef.current = next;
    setTakes(next);
  };

  useEffect(() => {
    if (status !== 'recording') return;
    const timer = window.setInterval(() => {
      secondsRef.current = Math.min(maxSeconds, secondsRef.current + 1);
      setSeconds(secondsRef.current);
      if (secondsRef.current >= maxSeconds && recorderRef.current?.state === 'recording') recorderRef.current.stop();
    }, 1000);
    return () => window.clearInterval(timer);
  }, [status]);

  // Release the microphone and every take when the practice screen closes.
  useEffect(() => () => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    takesRef.current.forEach((take) => URL.revokeObjectURL(take.url));
  }, []);

  const start = async () => {
    try {
      if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') {
        setStatus('denied');
        return;
      }
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];
      streamRef.current = stream;
      recorderRef.current = recorder;
      recorder.addEventListener('dataavailable', (event) => {
        if (event.data.size) chunksRef.current.push(event.data);
      });
      recorder.addEventListener('stop', () => {
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || 'audio/webm' });
        const take = { url: URL.createObjectURL(blob), seconds: secondsRef.current };
        const kept = takesRef.current.slice(0, maxTakes - 1);
        takesRef.current.slice(maxTakes - 1).forEach((replaced) => URL.revokeObjectURL(replaced.url));
        updateTakes([...kept, take]);
        stream.getTracks().forEach((track) => track.stop());
        setStatus('ready');
      });
      secondsRef.current = 0;
      setSeconds(0);
      recorder.start();
      setStatus('recording');
    } catch {
      setStatus('denied');
    }
  };

  const stop = () => recorderRef.current?.state === 'recording' && recorderRef.current.stop();

  /** Clear both takes and start over. */
  const reset = () => {
    takesRef.current.forEach((take) => URL.revokeObjectURL(take.url));
    updateTakes([]);
    secondsRef.current = 0;
    setSeconds(0);
    setStatus('idle');
  };

  return { status, takes, seconds, start, stop, reset };
}
