import { useEffect, useRef, useState } from 'react';

export function useRecorder() {
  const [status, setStatus] = useState<'idle' | 'recording' | 'ready' | 'denied'>('idle');
  const [audioUrl, setAudioUrl] = useState<string>();
  const [seconds, setSeconds] = useState(0);
  const recorderRef = useRef<MediaRecorder | undefined>(undefined);
  const streamRef = useRef<MediaStream | undefined>(undefined);
  const chunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    if (status !== 'recording') return;
    const timer = window.setInterval(() => setSeconds((value) => value + 1), 1000);
    return () => window.clearInterval(timer);
  }, [status]);

  useEffect(() => () => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    if (audioUrl) URL.revokeObjectURL(audioUrl);
  }, [audioUrl]);

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
        setAudioUrl((previous) => {
          if (previous) URL.revokeObjectURL(previous);
          return URL.createObjectURL(blob);
        });
        stream.getTracks().forEach((track) => track.stop());
        setStatus('ready');
      });
      setSeconds(0);
      recorder.start();
      setStatus('recording');
    } catch {
      setStatus('denied');
    }
  };

  const stop = () => recorderRef.current?.state === 'recording' && recorderRef.current.stop();
  const reset = () => {
    setAudioUrl((previous) => {
      if (previous) URL.revokeObjectURL(previous);
      return undefined;
    });
    setSeconds(0);
    setStatus('idle');
  };

  return { status, audioUrl, seconds, start, stop, reset };
}
