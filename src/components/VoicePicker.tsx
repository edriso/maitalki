import { useId } from 'react';
import { availableVoices } from '../content/audio';
import { stopClip } from '../hooks/useModelAudio';
import { useVoicePreference } from '../hooks/useVoicePreference';

/** Choose the model voice. Hidden unless more than one voice has audio. */
export function VoicePicker() {
  const name = useId();
  const { voice, setVoice } = useVoicePreference();
  if (availableVoices.length < 2 || !voice) return null;

  return (
    <fieldset className="voice-picker">
      <legend>Model voice</legend>
      {availableVoices.map((item) => <label key={item.key} className={item.key === voice.key ? 'active' : ''}>
        <input type="radio" className="sr-only" name={name} value={item.key} checked={item.key === voice.key} onChange={() => { stopClip(); setVoice(item.key); }} />
        {item.name}
      </label>)}
    </fieldset>
  );
}
