import { useSyncExternalStore } from 'react';
import { availableVoices } from '../content/audio';
import type { ModelVoice } from '../content/voices';

const storageKey = 'maitalki.voice';
const listeners = new Set<() => void>();
let memoryKey = '';

const readKey = () => {
  try {
    return localStorage.getItem(storageKey) ?? memoryKey;
  } catch {
    return memoryKey;
  }
};

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

/** The learner's model voice, falling back to the first voice with audio. */
export function useVoicePreference(): { voice?: ModelVoice; setVoice: (key: string) => void } {
  const key = useSyncExternalStore(subscribe, readKey, () => '');
  const voice = availableVoices.find((item) => item.key === key) ?? availableVoices[0];

  const setVoice = (next: string) => {
    memoryKey = next;
    try {
      localStorage.setItem(storageKey, next);
    } catch {
      // Storage can be unavailable (private mode); the choice still applies until reload.
    }
    listeners.forEach((listener) => listener());
  };

  return { voice, setVoice };
}
