export type NoteCategory = 'Rhythm' | 'Sounds' | 'Speaking' | 'Sales' | 'Vocabulary';
export type Priority = 'Core' | 'Next' | 'Polish';

export interface ExamplePair {
  label?: string;
  before?: string;
  after: string;
  note?: string;
}

export interface PracticeNote {
  id: string;
  category: NoteCategory;
  priority: Priority;
  title: string;
  cue: string;
  rule: string;
  why: string;
  examples: ExamplePair[];
  drill: string;
  tags: string[];
}

export interface DailyDrill {
  id: string;
  title: string;
  focus: string;
  category: NoteCategory;
  minutes: number;
  warmup: string[];
  prompt: string;
  outline: [string, string, string];
  model: string;
  checklist: string[];
}
