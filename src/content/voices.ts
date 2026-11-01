export interface ModelVoice {
  /** Stable key used in file paths and saved preferences. */
  key: string;
  /** Display name of the ElevenLabs default voice. */
  name: string;
  /** ElevenLabs voice ID. Changing it regenerates that voice's clips. */
  voiceId: string;
}

/**
 * Model voices for listening practice. Both are ElevenLabs default (premade) voices with a
 * General American accent. The first entry is the default for new learners.
 */
export const modelVoices: ModelVoice[] = [
  { key: 'sarah', name: 'Sarah', voiceId: 'EXAVITQu4vr4xnSDxMaL' },
  { key: 'eric', name: 'Eric', voiceId: 'cjVigY5qzO86Huf0OWal' },
];
