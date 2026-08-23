export interface GuitarNote {
  id: string;
  name: 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G';
  octave: number; // e.g. E2, A2, D3, G3, B3, E4, etc.
  stringNumber: 1 | 2 | 3 | 4 | 5 | 6; // 1 is high E, 6 is low E
  stringName: string; // "1st (High E)", "2nd (B)", etc.
  fret: 0 | 1 | 2 | 3;
  finger: number; // 0 = open, 1 = index, 2 = middle, 3 = ring
  frequency: number; // Hz for guitar pitch
  staffYStep: number; // steps from bottom line (E4 = line 1 is 0, F4 is 1, etc.) or relative to middle C
  // Standard treble staff:
  // Line 1 (bottom): E4 -> step 0
  // Space 1: F4 -> step 1
  // Line 2: G4 -> step 2
  // Space 2: A4 -> step 3
  // Line 3: B4 -> step 4
  // Space 3: C5 -> step 5
  // Line 4: D5 -> step 6
  // Space 4: E5 -> step 7
  // Line 5 (top): F5 -> step 8
  // Space above: G5 -> step 9
  // Ledger lines below:
  // D4: step -1 (space below bottom line)
  // C4: step -2 (1st ledger line below)
  // B3: step -3 (space below 1st ledger line)
  // A3: step -4 (2nd ledger line below)
  // G3: step -5 (space below 2nd ledger line)
  // F3: step -6 (3rd ledger line below)
  // E3: step -7 (space below 3rd ledger line)
  ledgerLinesBelow: number; // count of ledger lines below staff (0, 1, 2, 3)
  ledgerLinesAbove: number; // count of ledger lines above staff (0)
  staffDescription: string; // e.g. "3rd ledger line below staff", "Bottom line of staff"
  mnemonicHint?: string;
}

export type TrainingMode = 
  | 'flashcards' 
  | 'arcade' 
  | 'fretboard-finder' 
  | 'reference-chart' 
  | 'bass-exercise'
  | 'memory-tricks';

export type InputMode = 'note-name' | 'fretboard-click' | 'both';

export type BeatType = 'bass' | 'strum';

export interface ScoreBeat {
  beatNumber: number; // 1, 2, 3, 4
  type: BeatType;
  noteName?: string; // e.g. "C", "E", "F", "D", "G", "B", "A"
  octave?: number;
  staffYStep?: number; // steps from bottom line (E4 is 0, F4 is 1, D4 is -1, C4 is -2, B3 is -3, A3 is -4, G3 is -5, E3 is -7)
  ledgerLinesBelow?: number;
  stringNumber?: number; // 1 to 6 (6 is lowest E string, 1 is highest E string)
  fret?: number; // 0, 1, 2, 3
  finger?: number; // 0 = open, 1, 2, 3
  isDownstrum?: boolean;
  frequency?: number; // Hz for synthesizer
}

export interface ScoreMeasure {
  measureNumber: number;
  chordName: string;
  beats: ScoreBeat[];
}

export interface PickStrumSong {
  id: string;
  exerciseNumber: number;
  title: string;
  subtitle: string;
  timeSignature: '4/4' | '3/4';
  defaultBpm: number;
  key: string;
  level: 'Beginner' | 'Intermediate';
  description: string;
  techniqueTip: string;
  measures: ScoreMeasure[];
  hasRepeat?: boolean;
}

export interface GameStats {
  totalAnswered: number;
  correctAnswered: number;
  currentStreak: number;
  bestStreak: number;
  dailyStreak?: number;
  lastPracticeDate?: string;
  highScore: number;
  survivalHighScore?: number;
  flashcardSessionBest?: number;
  fretboardSessionBest?: number;
  totalPracticeSeconds?: number;
  noteAccuracy: Record<string, { 
    correct: number; 
    total: number;
    fastestMs?: number;
    totalMs?: number;
  }>;
  stringMastery: Record<number, number>; // 1-6 string -> percent
  recentSessions?: {
    id: string;
    timestamp: number;
    mode: string;
    totalQuestions: number;
    correctAnswers: number;
    accuracy: number;
    streak: number;
    score?: number;
  }[];
  dailyHistory?: Record<string, { date: string; drills: number; correct: number }>;
}
