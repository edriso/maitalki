interface Round {
  title: string;
  rate: number;
  mode: 'echo' | 'along';
}

/** Listen slowly and repeat, listen and repeat, then speak along: from careful to natural. */
export const shadowRounds: Round[] = [
  { title: 'Listen slowly, then repeat', rate: 0.75, mode: 'echo' },
  { title: 'Listen at natural speed, then repeat', rate: 1, mode: 'echo' },
  { title: 'Speak along with the voice', rate: 1, mode: 'along' },
];

/** Time to repeat a line: its length at the played speed plus room to start. */
export const repeatGap = (duration: number, rate: number) => Math.max(1.6, (duration || 2) / rate * 1.2 + 0.6);
