export interface SoundContrast {
  id: string;
  /** Short label for pickers, e.g. "I / E". */
  label: string;
  title: string;
  /** The note that teaches how to say this contrast. */
  noteId: string;
  /** What to listen for, in one line. */
  listenFor: string;
  /** Minimal pairs: real, common words that differ only in the target sound. */
  pairs: [string, string][];
}

/**
 * Ear-training sets for the Core sound contrasts in the curriculum. Words avoid
 * homographs (bass, read, lead) and regional mergers (pin/pen) so each answer is unambiguous.
 */
export const soundContrasts: SoundContrast[] = [
  {
    id: 'short-i-e', label: 'I / E', title: 'Short I vs short E', noteId: 'short-i-e',
    listenFor: '/ɪ/ is higher and tighter; /ɛ/ opens lower and wider.',
    pairs: [['sit', 'set'], ['bit', 'bet'], ['fill', 'fell'], ['lift', 'left'], ['miss', 'mess'], ['disk', 'desk'], ['will', 'well'], ['tin', 'ten']],
  },
  {
    id: 'ch-sh', label: 'CH / SH', title: 'CH vs SH', noteId: 'ch-sh',
    listenFor: 'CH starts with a tiny stop; SH flows from the start.',
    pairs: [['chip', 'ship'], ['cheat', 'sheet'], ['which', 'wish'], ['cheap', 'sheep'], ['chop', 'shop'], ['watch', 'wash'], ['match', 'mash'], ['catch', 'cash']],
  },
  {
    id: 'th', label: 'TH', title: 'TH vs F and S', noteId: 'th',
    listenFor: 'TH is soft air past the tongue; F is lip on teeth; S is a sharp hiss.',
    pairs: [['thin', 'fin'], ['three', 'free'], ['thought', 'fought'], ['think', 'sink'], ['math', 'mass'], ['path', 'pass'], ['faith', 'face'], ['mouth', 'mouse']],
  },
];
