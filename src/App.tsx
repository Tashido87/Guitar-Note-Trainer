import React, { useState, useEffect } from 'react';
import { TrainingMode, GameStats } from './types';
import { GUITAR_OPEN_NOTES } from './data/notesData';
import { FlashcardMode } from './components/FlashcardMode';
import { ArcadeGame } from './components/ArcadeGame';
import { FretboardFindMode } from './components/FretboardFindMode';
import { ReferenceChart } from './components/ReferenceChart';
import { BassNoteExercise } from './components/BassNoteExercise';
import { MasteryStats } from './components/MasteryStats';
import { soundManager } from './utils/audio';
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
  Info
} from 'lucide-react';

const INITIAL_STATS: GameStats = {
  totalAnswered: 0,
  correctAnswered: 0,
  currentStreak: 0,
  bestStreak: 0,
  highScore: 0,
  noteAccuracy: {},
  stringMastery: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 },
};

export default function App() {
  const [activeTab, setActiveTab] = useState<TrainingMode | 'mastery'>('flashcards');
  const [isMuted, setIsMuted] = useState(false);
  const [stats, setStats] = useState<GameStats>(() => {
    try {
      const saved = localStorage.getItem('guitar_note_trainer_stats');
      if (saved) return JSON.parse(saved);
    } catch {
      // Ignore
    }
    return INITIAL_STATS;
  });

  // Persist stats to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('guitar_note_trainer_stats', JSON.stringify(stats));
    } catch {
      // Ignore
    }
  }, [stats]);

  const handleToggleSound = () => {
    const nextState = !isMuted;
    setIsMuted(nextState);
    soundManager.setMuted(nextState);
  };

  const handleUpdateStats = (isCorrect: boolean, noteId: string, stringNum: number) => {
    setStats((prev) => {
      const totalAnswered = prev.totalAnswered + 1;
      const correctAnswered = isCorrect ? prev.correctAnswered + 1 : prev.correctAnswered;
      const currentStreak = isCorrect ? prev.currentStreak + 1 : 0;
      const bestStreak = Math.max(prev.bestStreak, currentStreak);

      // Note specific accuracy
      const currentNoteData = prev.noteAccuracy[noteId] || { correct: 0, total: 0 };
      const updatedNoteAccuracy = {
        ...prev.noteAccuracy,
        [noteId]: {
          total: currentNoteData.total + 1,
          correct: isCorrect ? currentNoteData.correct + 1 : currentNoteData.correct,
        },
      };

      return {
        ...prev,
        totalAnswered,
        correctAnswered,
        currentStreak,
        bestStreak,
        noteAccuracy: updatedNoteAccuracy,
      };
    });
  };

  const handleUpdateHighScore = (newScore: number) => {
    setStats((prev) => ({
      ...prev,
      highScore: Math.max(prev.highScore, newScore),
    }));
  };

  const handleResetStats = () => {
    if (window.confirm('Reset all your training progress and accuracy records?')) {
      setStats(INITIAL_STATS);
      localStorage.removeItem('guitar_note_trainer_stats');
    }
  };

  return (
    <div className="min-h-screen bg-stone-100 dark:bg-stone-950 text-stone-900 dark:text-stone-100 flex flex-col font-sans selection:bg-amber-500 selection:text-black">
      {/* Top Main Navigation Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-white/85 dark:bg-stone-900/85 border-b border-stone-200 dark:border-stone-800 shadow-xs">
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

          {/* Right Action Tools (Sound toggle, Quick Stats) */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Quick Streak Pill */}
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs font-bold text-amber-700 dark:text-amber-400">
              <span>🔥 Streak:</span>
              <span className="font-extrabold">{stats.currentStreak}</span>
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
              { id: 'flashcards', label: 'Flashcards', icon: Zap, badge: 'Rapid Recall' },
              { id: 'arcade', label: 'Arcade Rush', icon: Flame, badge: 'Timed Game' },
              { id: 'fretboard-finder', label: 'Fretboard Pluck', icon: Crosshair },
              { id: 'reference-chart', label: 'Summary Chart', icon: BookOpen, badge: 'Book Pg 1' },
              { id: 'bass-exercise', label: 'Pick-Strum Song', icon: Music, badge: 'Ex 18' },
              { id: 'mastery', label: 'My Progress', icon: BarChart3 },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  id={`nav-tab-${tab.id}`}
                  onClick={() => setActiveTab(tab.id as any)}
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
        {activeTab === 'flashcards' && (
          <FlashcardMode stats={stats} onUpdateStats={handleUpdateStats} />
        )}

        {activeTab === 'arcade' && (
          <ArcadeGame
            stats={stats}
            onUpdateStats={handleUpdateStats}
            onUpdateHighScore={handleUpdateHighScore}
          />
        )}

        {activeTab === 'fretboard-finder' && (
          <FretboardFindMode stats={stats} onUpdateStats={handleUpdateStats} />
        )}

        {activeTab === 'reference-chart' && <ReferenceChart />}

        {activeTab === 'bass-exercise' && <BassNoteExercise />}

        {activeTab === 'mastery' && (
          <MasteryStats stats={stats} onResetStats={handleResetStats} />
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-stone-200 dark:border-stone-800 bg-white/60 dark:bg-stone-900/60 py-4 text-center text-xs text-stone-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Guitar Open Position Note Memory Trainer</span>
          <div className="flex items-center gap-3">
            <span>Standard Treble Clef (8vb)</span>
            <span>•</span>
            <span>Real Acoustic Web Audio Plucks</span>
            <span>•</span>
            <span>Keyboard Shortcuts (A-G, H for hint)</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
