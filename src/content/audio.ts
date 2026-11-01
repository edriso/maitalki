import manifest from './audio-manifest.json';
import { toSpeechText } from './speech';
import { modelVoices, type ModelVoice } from './voices';

const clipsByVoice = (manifest as { voices: Record<string, Record<string, string>> }).voices;

/** Voices that have generated clips, in their configured order. */
export const availableVoices: ModelVoice[] = modelVoices.filter((voice) => Object.keys(clipsByVoice[voice.key] ?? {}).length > 0);

/** URL of the pre-generated clip for a line of practice text, or undefined if none exists. */
export function clipUrl(voiceKey: string, text: string): string | undefined {
  const hash = clipsByVoice[voiceKey]?.[toSpeechText(text)];
  return hash ? `${import.meta.env.BASE_URL}audio/${voiceKey}/${hash}.mp3` : undefined;
}
