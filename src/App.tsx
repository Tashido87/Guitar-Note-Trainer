import React, { useState, useEffect } from 'react';
import { TrainingMode, GameStats } from './types';
import { GUITAR_OPEN_NOTES } from './data/notesData';
import { FlashcardMode } from './components/FlashcardMode';
import { ArcadeGame } from './components/ArcadeGame';
import { FretboardFindMode } from './components/FretboardFindMode';
import { ReferenceChart } from './components/ReferenceChart';
import { BassNoteExercise } from './components/BassNoteExercise';
import { MasteryStats } from './components/MasteryStats';
import { MemoryTricksMode } from './components/MemoryTricksMode';
import { soundManager } from './utils/audio';
import {
  loadStoredStats,
  saveStoredStats,
  loadUserPreferences,
  saveUserPreferences,
  calculateUpdatedDailyStreak,
  clearAllStoredData,
  StoredGameStats,
  UserPreferences,
  INITIAL_EXTENDED_STATS,
} from './utils/storage';
import { 
  Zap, 
  Flame, 
  Crosshair, 
  BookOpen, 
  Music, 
  BarChart3, 
  Volume2, 
  VolumeX, 
  Guitar,
  Sparkles,
  Lightbulb,
  Calendar,
  Trophy
} from 'lucide-react';

export default function App() {
  const [preferences, setPreferences] = useState<UserPreferences>(() => loadUserPreferences());
  const [activeTab, setActiveTab] = useState<TrainingMode | 'mastery'>(preferences.lastTab || 'memory-tricks');
  const [isMuted, setIsMuted] = useState<boolean>(preferences.isMuted);
  const [stats, setStats] = useState<StoredGameStats>(() => loadStoredStats());

  // Keep audio system synchronized with initial mute state
  useEffect(() => {
    soundManager.setMuted(preferences.isMuted);
  }, []);

  // Persist preferences when updated
  useEffect(() => {
    saveUserPreferences(preferences);
  }, [preferences]);

  // Persist stats to browser localStorage on any stat update
  useEffect(() => {
    saveStoredStats(stats);
  }, [stats]);

  const handleTabChange = (tab: TrainingMode | 'mastery') => {
    setActiveTab(tab);
    setPreferences(prev => ({ ...prev, lastTab: tab }));
  };

  const handleToggleSound = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    soundManager.setMuted(nextMuted);
    setPreferences(prev => ({ ...prev, isMuted: nextMuted }));
  };

  const handleUpdateStats = (
    isCorrect: boolean, 
    noteId: string, 
    stringNum: number, 
    reactionMs?: number
  ) => {
    setStats((prev) => {
      const totalAnswered = prev.totalAnswered + 1;
      const correctAnswered = isCorrect ? prev.correctAnswered + 1 : prev.correctAnswered;
      const currentStreak = isCorrect ? prev.currentStreak + 1 : 0;
      const bestStreak = Math.max(prev.bestStreak, currentStreak);

      // Daily streak calculation
      const { dailyStreak, today } = calculateUpdatedDailyStreak(
        prev.lastPracticeDate || '',
        prev.dailyStreak || 0
      );

      // Daily history recording
      const existingTodayRecord = prev.dailyHistory?.[today] || { date: today, drills: 0, correct: 0 };
      const updatedDailyHistory = {
        ...(prev.dailyHistory || {}),
        [today]: {
          date: today,
          drills: existingTodayRecord.drills + 1,
          correct: isCorrect ? existingTodayRecord.correct + 1 : existingTodayRecord.correct,
        },
      };

      // Note specific accuracy & speed
      const currentNoteData = prev.noteAccuracy[noteId] || { correct: 0, total: 0 };
      const currentTotalMs = currentNoteData.totalMs || 0;
      const currentFastestMs = currentNoteData.fastestMs;
      
      const newFastestMs = reactionMs && isCorrect 
        ? (currentFastestMs ? Math.min(currentFastestMs, reactionMs) : reactionMs)
        : currentFastestMs;

      const updatedNoteAccuracy = {
        ...prev.noteAccuracy,
        [noteId]: {
          total: currentNoteData.total + 1,
          correct: isCorrect ? currentNoteData.correct + 1 : currentNoteData.correct,
          totalMs: reactionMs ? currentTotalMs + reactionMs : currentTotalMs,
          fastestMs: newFastestMs,
        },
      };

      return {
        ...prev,
        totalAnswered,
        correctAnswered,
        currentStreak,
        bestStreak,
        dailyStreak,
        lastPracticeDate: today,
        dailyHistory: updatedDailyHistory,
        noteAccuracy: updatedNoteAccuracy,
      };
    });
  };

  const handleUpdateHighScore = (newScore: number, mode: 'timed' | 'survival' = 'timed') => {
    setStats((prev) => {
      if (mode === 'survival') {
        return {
          ...prev,
          survivalHighScore: Math.max(prev.survivalHighScore || 0, newScore),
        };
      }
      return {
        ...prev,
        highScore: Math.max(prev.highScore, newScore),
      };
    });
  };

  const handleUpdateSessionBest = (mode: 'flashcards' | 'fretboard', streak: number) => {
    setStats((prev) => {
      if (mode === 'flashcards') {
        return {
          ...prev,
          flashcardSessionBest: Math.max(prev.flashcardSessionBest || 0, streak),
        };
      } else {
        return {
          ...prev,
          fretboardSessionBest: Math.max(prev.fretboardSessionBest || 0, streak),
        };
      }
    });
  };

  const handleLogSession = (session: {
    mode: string;
    totalQuestions: number;
    correctAnswers: number;
    accuracy: number;
    streak: number;
    score?: number;
  }) => {
    setStats((prev) => {
      const record = {
        id: `sess-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        timestamp: Date.now(),
        ...session,
      };
      const recentSessions = [record, ...(prev.recentSessions || []).slice(0, 19)];
      return {
        ...prev,
        recentSessions,
      };
    });
  };

  const handleFlashcardFilterChange = (filter: number | null) => {
    setPreferences(prev => ({ ...prev, flashcardStringFilter: filter }));
  };

  const handleFlashcardNoteCountChange = (count: 1 | 2 | 4) => {
    setPreferences(prev => ({ ...prev, flashcardNoteCount: count }));
  };

  const handleBassBpmChange = (bpm: number) => {
    setPreferences(prev => ({ ...prev, bassExerciseBpm: bpm }));
  };

  const handleResetStats = () => {
    if (window.confirm('Are you sure you want to reset all your training streaks, high scores, and accuracy data? This cannot be undone.')) {
      clearAllStoredData();
      setStats(INITIAL_EXTENDED_STATS);
      setPreferences(prev => ({ ...prev, flashcardStringFilter: null }));
    }
  };

  const handleImportData = (importedStats: StoredGameStats, importedPrefs?: UserPreferences) => {
    setStats(importedStats);
    saveStoredStats(importedStats);
    if (importedPrefs) {
      setPreferences(importedPrefs);
      saveUserPreferences(importedPrefs);
      setIsMuted(importedPrefs.isMuted);
      soundManager.setMuted(importedPrefs.isMuted);
    }
  };

  return (
    <div className="min-h-screen bg-stone-100 dark:bg-stone-950 text-stone-900 dark:text-stone-100 flex flex-col font-sans selection:bg-amber-500 selection:text-black">
      {/* Top Main Navigation Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-white/90 dark:bg-stone-900/90 border-b border-stone-200 dark:border-stone-800 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-400 flex items-center justify-center text-stone-950 shadow-sm ring-2 ring-amber-500/20">
              <Guitar className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-black tracking-tight flex items-center gap-2">
                <span>Guitar Note Trainer</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30">
                  Open Position
                </span>
              </h1>
              <p className="text-[11px] text-stone-500 dark:text-stone-400 hidden sm:block">
                Master 17 open notes on musical staff & fretboard
              </p>
            </div>
          </div>

          {/* Right Action Tools (Daily Streak, Active Streak, Sound toggle) */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Daily Streak Indicator */}
            <div 
              className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-sky-500/10 border border-sky-500/20 text-xs font-bold text-sky-700 dark:text-sky-400"
              title="Consecutive daily practice streak"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>{stats.dailyStreak || 0}d</span>
            </div>

            {/* Quick Drill Streak Pill */}
            <div 
              className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs font-bold text-amber-700 dark:text-amber-400"
              title="Current correct answer drill streak"
            >
              <Flame className="w-3.5 h-3.5 text-amber-500" />
              <span>{stats.currentStreak}</span>
            </div>

            {/* Audio Mute/Unmute */}
            <button
              id="sound-toggle-btn"
              type="button"
              onClick={handleToggleSound}
              className={`p-2 rounded-xl border transition-all ${
                isMuted
                  ? 'bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800 text-rose-500'
                  : 'bg-stone-50 dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:text-amber-500'
              }`}
              title={isMuted ? 'Unmute Sound' : 'Mute Sound'}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Tab Navigation Menu */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 overflow-x-auto scrollbar-none">
          <nav className="flex space-x-1 border-t border-stone-100 dark:border-stone-800/80 py-1.5">
            {[
              { id: 'memory-tricks', label: 'Memory Tricks', icon: Lightbulb, badge: 'Tips & Hacks' },
              { id: 'flashcards', label: 'Flashcards', icon: Zap, badge: 'Rapid Recall' },
              { id: 'arcade', label: 'Arcade Rush', icon: Flame, badge: 'Timed Game' },
              { id: 'fretboard-finder', label: 'Fretboard Pluck', icon: Crosshair },
              { id: 'reference-chart', label: 'Summary Chart', icon: BookOpen, badge: 'Book Pg 1' },
              { id: 'bass-exercise', label: 'Pick-Strum Song', icon: Music, badge: 'Ex 18' },
              { id: 'mastery', label: 'My Progress', icon: BarChart3, badge: 'Saved' },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  id={`nav-tab-${tab.id}`}
                  onClick={() => handleTabChange(tab.id as any)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
                    isActive
                      ? 'bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 shadow-sm'
                      : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-800/60'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                  {tab.badge && (
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                        isActive
                          ? 'bg-amber-400 text-stone-950 font-bold'
                          : 'bg-stone-200 dark:bg-stone-800 text-stone-500'
                      }`}
                    >
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      {/* Main App Content View Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {activeTab === 'memory-tricks' && <MemoryTricksMode />}

        {activeTab === 'flashcards' && (
          <FlashcardMode 
            stats={stats} 
            onUpdateStats={handleUpdateStats}
            onUpdateSessionBest={handleUpdateSessionBest}
            initialStringFilter={preferences.flashcardStringFilter}
            onFilterChange={handleFlashcardFilterChange}
            initialNoteCount={preferences.flashcardNoteCount || 1}
            onNoteCountChange={handleFlashcardNoteCountChange}
          />
        )}

        {activeTab === 'arcade' && (
          <ArcadeGame
            stats={stats}
            onUpdateStats={handleUpdateStats}
            onUpdateHighScore={handleUpdateHighScore}
            onLogSession={handleLogSession}
          />
        )}

        {activeTab === 'fretboard-finder' && (
          <FretboardFindMode 
            stats={stats} 
            onUpdateStats={handleUpdateStats} 
            onUpdateSessionBest={handleUpdateSessionBest}
          />
        )}

        {activeTab === 'reference-chart' && <ReferenceChart />}

        {activeTab === 'bass-exercise' && (
          <BassNoteExercise 
            initialBpm={preferences.bassExerciseBpm}
            onBpmChange={handleBassBpmChange}
          />
        )}

        {activeTab === 'mastery' && (
          <MasteryStats 
            stats={stats} 
            preferences={preferences}
            onResetStats={handleResetStats}
            onImportData={handleImportData}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-stone-200 dark:border-stone-800 bg-white/60 dark:bg-stone-900/60 py-4 text-center text-xs text-stone-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Guitar Open Position Note Memory Trainer</span>
          <div className="flex items-center gap-3">
            <span>Standard Treble Clef (8vb)</span>
            <span>•</span>
            <span>Local Browser Auto-Save Active</span>
            <span>•</span>
            <span>Keyboard Shortcuts (A-G, H for hint)</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
