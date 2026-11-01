import { useSyncExternalStore } from 'react';

/**
 * One shared player for model audio, so starting a clip always stops the previous one.
 * Playback only ever starts from a learner's action; nothing autoplays.
 */
interface PlayerState {
  playingId?: string;
  failedId?: string;
}

export interface PlayResult {
  /** True when the clip played to the end; false when it was stopped, replaced, or failed. */
  completed: boolean;
  /** Clip length in seconds at normal speed, when known. */
  duration: number;
}

let player: HTMLAudioElement | undefined;
let state: PlayerState = {};
let settle: ((completed: boolean) => void) | undefined;
const listeners = new Set<() => void>();

const setState = (next: PlayerState) => {
  state = next;
  listeners.forEach((listener) => listener());
};

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

const finish = (completed: boolean) => {
  const done = settle;
  settle = undefined;
  done?.(completed);
};

/** Pause page audio elements (such as your recorded takes) other than `except`. */
export function pauseOtherMedia(except?: HTMLMediaElement) {
  document.querySelectorAll('audio, video').forEach((element) => {
    if (element !== except) (element as HTMLMediaElement).pause();
  });
}

export function stopClip() {
  if (player) {
    player.pause();
    player.currentTime = 0;
  }
  finish(false);
  if (state.playingId || state.failedId) setState({});
}

/** Stop playback only if one of these clips is the one playing. */
export function stopClipIf(ids: string[]) {
  if (state.playingId && ids.includes(state.playingId)) stopClip();
}

export function playClip(id: string, src: string, rate = 1): Promise<PlayResult> {
  stopClip();
  pauseOtherMedia();
  player ??= new Audio();
  const audio = player;
  audio.preload = 'auto';
  audio.src = src;
  // Loading a new source resets playbackRate to defaultPlaybackRate, so set both.
  audio.defaultPlaybackRate = rate;
  audio.playbackRate = rate;
  audio.preservesPitch = true;

  const result = new Promise<PlayResult>((resolve) => {
    settle = (completed) => resolve({ completed, duration: Number.isFinite(audio.duration) ? audio.duration : 0 });
  });
  audio.onended = () => {
    setState({});
    finish(true);
  };
  audio.onerror = () => {
    setState({ failedId: id });
    finish(false);
  };
  setState({ playingId: id });
  audio.play()?.catch(() => {
    if (state.playingId !== id) return;
    setState({ failedId: id });
    finish(false);
  });
  return result;
}

export function useModelAudio() {
  const current = useSyncExternalStore(subscribe, () => state, () => state);
  return { ...current, play: playClip, stop: stopClip };
}
