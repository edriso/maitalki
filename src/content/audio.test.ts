import { describe, expect, it } from 'vitest';
import manifest from './audio-manifest.json';
import { availableVoices, clipUrl } from './audio';
import { soundContrasts } from './contrasts';
import { drills } from './drills';
import { notes } from './notes';
import { collectSpeechTexts } from './speech';
import { modelVoices } from './voices';

const audioFiles = Object.keys(import.meta.glob('/public/audio/**/*.mp3')).map((path) => path.replace('/public/', ''));
const clipsByVoice = (manifest as { voices: Record<string, Record<string, string>> }).voices;

describe('model audio', () => {
  it('offers every configured voice', () => {
    expect(availableVoices.map((voice) => voice.key)).toEqual(modelVoices.map((voice) => voice.key));
  });

  it('has a clip for every displayed line in every voice (run `npm run audio` after content changes)', () => {
    const texts = collectSpeechTexts({ drills, notes, contrasts: soundContrasts });
    for (const voice of availableVoices) {
      const missing = texts.filter((text) => !clipsByVoice[voice.key]?.[text]);
      expect(missing, `${voice.name} is missing clips`).toEqual([]);
    }
  });

  it('points only at files that exist, with no stray files', () => {
    const referenced = Object.entries(clipsByVoice).flatMap(([voice, clips]) => Object.values(clips).map((hash) => `audio/${voice}/${hash}.mp3`));
    expect([...referenced].sort()).toEqual([...audioFiles].sort());
  });

  it('builds base-path URLs from display text', () => {
    const line = drills[0].warmup[0];
    expect(clipUrl('sarah', line)).toMatch(new RegExp(`^${import.meta.env.BASE_URL}audio/sarah/[0-9a-f]{16}\\.mp3$`));
    expect(clipUrl('sarah', 'A line that does not exist.')).toBeUndefined();
    expect(clipUrl('unknown-voice', line)).toBeUndefined();
  });
});
