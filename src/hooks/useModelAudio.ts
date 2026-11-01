import { useSyncExternalStore } from 'react';

/**
 * One shared player for model audio, so starting a clip always stops the previous one.
 * Playback only ever starts from a learner's click; nothing autoplays.
 */
interface PlayerState {
  playingId?: string;
  failedId?: string;
}

let player: HTMLAudioElement | undefined;
let state: PlayerState = {};
const listeners = new Set<() => void>();

const setState = (next: PlayerState) => {
  state = next;
  listeners.forEach((listener) => listener());
};

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

export function stopClip() {
  if (player) {
    player.pause();
    player.currentTime = 0;
  }
  if (state.playingId || state.failedId) setState({});
}

/** Stop playback only if one of these clips is the one playing. */
export function stopClipIf(ids: string[]) {
  if (state.playingId && ids.includes(state.playingId)) stopClip();
}

export function playClip(id: string, src: string, rate = 1) {
  stopClip();
  player ??= new Audio();
  const audio = player;
  audio.preload = 'auto';
  audio.src = src;
  // Loading a new source resets playbackRate to defaultPlaybackRate, so set both.
  audio.defaultPlaybackRate = rate;
  audio.playbackRate = rate;
  audio.preservesPitch = true;
  audio.onended = () => setState({});
  audio.onerror = () => setState({ failedId: id });
  setState({ playingId: id });
  audio.play()?.catch(() => {
    if (state.playingId === id) setState({ failedId: id });
  });
}

export function useModelAudio() {
  const current = useSyncExternalStore(subscribe, () => state, () => state);
  return { ...current, play: playClip, stop: stopClip };
}
