import { GuitarNote, GameStats, TrainingMode } from '../types';

export const STORAGE_KEY = 'guitar_note_trainer_v2_data';
export const SETTINGS_KEY = 'guitar_note_trainer_v2_settings';

export interface PracticeSessionRecord {
  id: string;
  timestamp: number;
  mode: string;
  totalQuestions: number;
  correctAnswers: number;
  accuracy: number;
  streak: number;
  score?: number;
  durationSeconds?: number;
}

export interface DayPracticeRecord {
  date: string; // YYYY-MM-DD
  drills: number;
  correct: number;
}

export interface StoredGameStats extends GameStats {
  // Streaks
  currentStreak: number;
  bestStreak: number;
  dailyStreak: number;
  lastPracticeDate: string; // YYYY-MM-DD
  
  // Session bests
  highScore: number; // Arcade timed high score
  survivalHighScore: number; // Arcade survival high score
  flashcardSessionBest: number;
  fretboardSessionBest: number;
  
  // Historical logs
  totalAnswered: number;
  correctAnswered: number;
  totalPracticeSeconds: number;
  dailyHistory: Record<string, DayPracticeRecord>;
  recentSessions: PracticeSessionRecord[];
  
  // Note accuracy
  noteAccuracy: Record<string, { 
    correct: number; 
    total: number;
    fastestMs?: number;
    totalMs?: number;
  }>;
  stringMastery: Record<number, number>;
}

export type InstrumentType = 'guitar' | 'piano';

export interface UserPreferences {
  isMuted: boolean;
  instrument: InstrumentType;
  lastTab: TrainingMode | 'mastery';
  flashcardStringFilter: number | null;
  flashcardNoteCount: 1 | 2 | 4;
  bassExerciseBpm: number;
}

export const DEFAULT_USER_PREFS: UserPreferences = {
  isMuted: false,
  instrument: 'guitar',
  lastTab: 'memory-tricks',
  flashcardStringFilter: null,
  flashcardNoteCount: 1,
  bassExerciseBpm: 76,
};

const getTodayDateString = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getYesterdayDateString = (): string => {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const INITIAL_EXTENDED_STATS: StoredGameStats = {
  totalAnswered: 0,
  correctAnswered: 0,
  currentStreak: 0,
  bestStreak: 0,
  dailyStreak: 0,
  lastPracticeDate: '',
  highScore: 0,
  survivalHighScore: 0,
  flashcardSessionBest: 0,
  fretboardSessionBest: 0,
  totalPracticeSeconds: 0,
  dailyHistory: {},
  recentSessions: [],
  noteAccuracy: {},
  stringMastery: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 },
};

/**
 * Load statistics from browser LocalStorage with migration fallback
 */
export function loadStoredStats(): StoredGameStats {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        ...INITIAL_EXTENDED_STATS,
        ...parsed,
        noteAccuracy: parsed.noteAccuracy || {},
        stringMastery: parsed.stringMastery || INITIAL_EXTENDED_STATS.stringMastery,
        dailyHistory: parsed.dailyHistory || {},
        recentSessions: Array.isArray(parsed.recentSessions) ? parsed.recentSessions : [],
      };
    }

    // Try migrating from older key if present
    const legacy = localStorage.getItem('guitar_note_trainer_stats');
    if (legacy) {
      const parsedLegacy = JSON.parse(legacy);
      return {
        ...INITIAL_EXTENDED_STATS,
        ...parsedLegacy,
        noteAccuracy: parsedLegacy.noteAccuracy || {},
        stringMastery: parsedLegacy.stringMastery || INITIAL_EXTENDED_STATS.stringMastery,
      };
    }
  } catch (err) {
    console.warn('Failed to load stats from localStorage:', err);
  }
  return INITIAL_EXTENDED_STATS;
}

/**
 * Save stats to browser LocalStorage
 */
export function saveStoredStats(stats: StoredGameStats): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
  } catch (err) {
    console.warn('Failed to save stats to localStorage:', err);
  }
}

/**
 * Load user preferences
 */
export function loadUserPreferences(): UserPreferences {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) {
      return {
        ...DEFAULT_USER_PREFS,
        ...JSON.parse(raw),
      };
    }
  } catch (err) {
    console.warn('Failed to load settings from localStorage:', err);
  }
  return DEFAULT_USER_PREFS;
}

/**
 * Save user preferences
 */
export function saveUserPreferences(prefs: UserPreferences): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(prefs));
  } catch (err) {
    console.warn('Failed to save settings to localStorage:', err);
  }
}

/**
 * Updates daily streak according to current date
 */
export function calculateUpdatedDailyStreak(lastDate: string, currentDailyStreak: number): { dailyStreak: number; today: string } {
  const today = getTodayDateString();
  const yesterday = getYesterdayDateString();

  if (!lastDate) {
    // First practice ever
    return { dailyStreak: 1, today };
  }

  if (lastDate === today) {
    // Already practiced today, keep current streak
    return { dailyStreak: Math.max(1, currentDailyStreak), today };
  }

  if (lastDate === yesterday) {
    // Practiced yesterday, consecutive streak increases by 1
    return { dailyStreak: currentDailyStreak + 1, today };
  }

  // Missed a day or more, reset streak to 1 today
  return { dailyStreak: 1, today };
}

/**
 * Helper to export all local data as a JSON file download
 */
export function exportDataAsJson(stats: StoredGameStats, prefs: UserPreferences): void {
  const exportPayload = {
    version: '2.0',
    exportDate: new Date().toISOString(),
    stats,
    preferences: prefs,
  };

  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(exportPayload, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', dataStr);
  downloadAnchor.setAttribute('download', `guitar_trainer_backup_${getTodayDateString()}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

/**
 * Clear all local storage data
 */
export function clearAllStoredData(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(SETTINGS_KEY);
    localStorage.removeItem('guitar_note_trainer_stats');
  } catch (err) {
    console.warn('Failed to clear localStorage:', err);
  }
}
