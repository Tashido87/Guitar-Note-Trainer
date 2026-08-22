import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GUITAR_OPEN_NOTES } from '../data/notesData';
import { GuitarNote, GameStats } from '../types';
import { MusicStaff } from './MusicStaff';
import { soundManager } from '../utils/audio';
import confetti from 'canvas-confetti';
import { 
  Flame, 
  Timer, 
  Heart, 
  Trophy, 
  Play, 
  RotateCcw, 
  Sparkles, 
  Zap, 
  Volume2 
} from 'lucide-react';

interface ArcadeGameProps {
  stats: GameStats;
  onUpdateStats: (isCorrect: boolean, noteId: string, stringNum: number) => void;
  onUpdateHighScore: (score: number) => void;
}

export const ArcadeGame: React.FC<ArcadeGameProps> = ({
  stats,
  onUpdateStats,
  onUpdateHighScore,
}) => {
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'gameover'>('idle');
  const [gameMode, setGameMode] = useState<'timed' | 'survival'>('timed');
  const [timeLeft, setTimeLeft] = useState<number>(60);
  const [lives, setLives] = useState<number>(3);
  const [score, setScore] = useState<number>(0);
  const [combo, setCombo] = useState<number>(0);
  const [currentNote, setCurrentNote] = useState<GuitarNote>(GUITAR_OPEN_NOTES[0]);
  const [feedback, setFeedback] = useState<'idle' | 'correct' | 'wrong'>('idle');
  const [selectedGuess, setSelectedGuess] = useState<string | null>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const isAnsweredRef = useRef(false);

  // Multiplier calculation: 1x, 2x (3+ streak), 3x (6+ streak), 4x (10+ streak)
  const multiplier = combo >= 10 ? 4 : combo >= 6 ? 3 : combo >= 3 ? 2 : 1;

  const pickNextNote = useCallback(() => {
    isAnsweredRef.current = false;
    setSelectedGuess(null);
    setFeedback('idle');

    const pool = GUITAR_OPEN_NOTES.filter(n => n.id !== currentNote.id);
    const chosen = pool[Math.floor(Math.random() * pool.length)] || GUITAR_OPEN_NOTES[0];
    setCurrentNote(chosen);
    soundManager.playGuitarNote(chosen.frequency);
  }, [currentNote.id]);

  const startGame = (mode: 'timed' | 'survival') => {
    setGameMode(mode);
    setGameState('playing');
    setScore(0);
    setCombo(0);
    setLives(3);
    setTimeLeft(60);
    setFeedback('idle');
    setSelectedGuess(null);

    const firstNote = GUITAR_OPEN_NOTES[Math.floor(Math.random() * GUITAR_OPEN_NOTES.length)];
    setCurrentNote(firstNote);
    soundManager.playGuitarNote(firstNote.frequency);
  };

  // Timer loop for timed mode
  useEffect(() => {
    if (gameState === 'playing' && gameMode === 'timed') {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            setGameState('gameover');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameState, gameMode]);

  // Handle Game Over score check
  useEffect(() => {
    if (gameState === 'gameover') {
      if (score > stats.highScore) {
        onUpdateHighScore(score);
        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.6 },
        });
      }
    }
  }, [gameState, score, stats.highScore, onUpdateHighScore]);

  const handleGuess = useCallback((letter: string) => {
    if (gameState !== 'playing' || isAnsweredRef.current) return;
    isAnsweredRef.current = true;
    setSelectedGuess(letter);

    const isCorrect = letter === currentNote.name;

    if (isCorrect) {
      setFeedback('correct');
      soundManager.playCorrectSound();
      soundManager.playGuitarNote(currentNote.frequency);

      const pointsEarned = 100 * multiplier;
      setScore((s) => s + pointsEarned);
      const newCombo = combo + 1;
      setCombo(newCombo);

      if (newCombo === 3 || newCombo === 6 || newCombo === 10) {
        soundManager.playComboSound(multiplier);
      }

      onUpdateStats(true, currentNote.id, currentNote.stringNumber);

      setTimeout(() => {
        pickNextNote();
      }, 450);
    } else {
      setFeedback('wrong');
      soundManager.playWrongSound();
      setCombo(0);
      onUpdateStats(false, currentNote.id, currentNote.stringNumber);

      if (gameMode === 'survival') {
        setLives((l) => {
          const nextLives = l - 1;
          if (nextLives <= 0) {
            setGameState('gameover');
          }
          return nextLives;
        });
      }

      setTimeout(() => {
        pickNextNote();
      }, 700);
    }
  }, [combo, currentNote, gameMode, gameState, multiplier, onUpdateStats, pickNextNote]);

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState !== 'playing') return;
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.ctrlKey || e.metaKey || e.altKey) return;

      const key = e.key.toUpperCase();
      if (['A', 'B', 'C', 'D', 'E', 'F', 'G'].includes(key)) {
        e.preventDefault();
        handleGuess(key);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, handleGuess]);

  const noteButtons: ('A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G')[] = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Game State Screen */}
      {gameState === 'idle' ? (
        <div className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/90 p-8 text-center shadow-lg space-y-6">
          <div className="inline-flex p-4 rounded-2xl bg-amber-500/10 text-amber-500 ring-8 ring-amber-500/5">
            <Flame className="w-12 h-12" />
          </div>

          <div className="space-y-2 max-w-md mx-auto">
            <h2 className="text-2xl font-black tracking-tight text-zinc-900 dark:text-zinc-100">
              Guitar Note Arcade Rush
            </h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Build lightning-fast reflex recall. Test how many open-position notes you can recognize under pressure!
            </p>
          </div>

          {/* High Score Preview */}
          <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300">
            <Trophy className="w-5 h-5 text-amber-500" />
            <span className="text-sm font-semibold">Personal Best:</span>
            <span className="text-lg font-black">{stats.highScore} pts</span>
          </div>

          {/* Game Mode Pickers */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg mx-auto pt-2">
            <button
              id="start-timed-mode-btn"
              onClick={() => startGame('timed')}
              className="p-5 rounded-2xl border-2 border-amber-500 bg-amber-50 dark:bg-amber-950/30 hover:bg-amber-100 dark:hover:bg-amber-900/40 text-left transition-all active:scale-95 group shadow-sm"
            >
              <div className="flex items-center justify-between mb-2">
                <Timer className="w-6 h-6 text-amber-600 dark:text-amber-400 group-hover:scale-110 transition-transform" />
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500 text-zinc-950">
                  60s Rush
                </span>
              </div>
              <div className="font-bold text-zinc-900 dark:text-zinc-100">Time Attack</div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                Score maximum points in 60 seconds with combo streaks.
              </p>
            </button>

            <button
              id="start-survival-mode-btn"
              onClick={() => startGame('survival')}
              className="p-5 rounded-2xl border-2 border-rose-500/60 bg-rose-50 dark:bg-rose-950/20 hover:bg-rose-100 dark:hover:bg-rose-900/30 text-left transition-all active:scale-95 group shadow-sm"
            >
              <div className="flex items-center justify-between mb-2">
                <Heart className="w-6 h-6 text-rose-500 group-hover:scale-110 transition-transform fill-current" />
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-500 text-white">
                  3 Lives
                </span>
              </div>
              <div className="font-bold text-zinc-900 dark:text-zinc-100">Survival Mode</div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                No time limit! Keep guessing until you lose all 3 lives.
              </p>
            </button>
          </div>
        </div>
      ) : gameState === 'gameover' ? (
        <div className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/90 p-8 text-center shadow-lg space-y-6 animate-in zoom-in-95 duration-200">
          <div className="inline-flex p-4 rounded-2xl bg-amber-500/10 text-amber-500 ring-8 ring-amber-500/5">
            <Trophy className="w-12 h-12" />
          </div>

          <div>
            <h2 className="text-2xl font-black text-zinc-900 dark:text-zinc-100">Round Completed!</h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
              Great practice! Your brain is wiring instant recognition patterns.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto">
            <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700">
              <div className="text-xs font-bold uppercase tracking-wider text-zinc-400">Final Score</div>
              <div className="text-3xl font-black text-amber-500 mt-1">{score}</div>
            </div>
            <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700">
              <div className="text-xs font-bold uppercase tracking-wider text-zinc-400">High Score</div>
              <div className="text-3xl font-black text-zinc-800 dark:text-zinc-200 mt-1">
                {Math.max(score, stats.highScore)}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              id="retry-arcade-btn"
              onClick={() => startGame(gameMode)}
              className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 active:scale-95 font-bold text-zinc-950 shadow-md transition-all"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Play Again</span>
            </button>
            <button
              id="back-to-menu-btn"
              onClick={() => setGameState('idle')}
              className="px-6 py-3 rounded-2xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 font-semibold text-zinc-700 dark:text-zinc-300 transition-all"
            >
              Mode Menu
            </button>
          </div>
        </div>
      ) : (
        /* Active Game Arena */
        <div className="space-y-6">
          {/* Top Scoreboard HUD */}
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-zinc-900 text-white shadow-md items-center">
            {/* Score */}
            <div>
              <div className="text-[10px] uppercase font-bold text-stone-400">Score</div>
              <div className="text-2xl font-black text-amber-400">{score}</div>
            </div>

            {/* Timer or Lives */}
            {gameMode === 'timed' ? (
              <div>
                <div className="text-[10px] uppercase font-bold text-stone-400 flex items-center gap-1">
                  <Timer className="w-3 h-3 text-sky-400" /> Time Left
                </div>
                <div className={`text-2xl font-black ${timeLeft <= 10 ? 'text-rose-500 animate-pulse' : 'text-white'}`}>
                  {timeLeft}s
                </div>
              </div>
            ) : (
              <div>
                <div className="text-[10px] uppercase font-bold text-stone-400">Lives</div>
                <div className="flex items-center gap-1 mt-1">
                  {[1, 2, 3].map((l) => (
                    <Heart
                      key={l}
                      className={`w-5 h-5 ${
                        l <= lives ? 'text-rose-500 fill-rose-500' : 'text-stone-700 fill-stone-800'
                      }`}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Multiplier Combo */}
            <div>
              <div className="text-[10px] uppercase font-bold text-stone-400 flex items-center gap-1">
                <Flame className="w-3 h-3 text-amber-400" /> Multiplier
              </div>
              <div className="text-2xl font-black text-amber-400 flex items-baseline gap-1">
                <span>{multiplier}x</span>
                {combo > 0 && <span className="text-xs font-semibold text-stone-400">({combo} streak)</span>}
              </div>
            </div>

            {/* Quit Button */}
            <div className="hidden sm:flex justify-end">
              <button
                onClick={() => setGameState('gameover')}
                className="px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-xs font-semibold text-stone-300"
              >
                End Game
              </button>
            </div>
          </div>

          {/* Active Question Staff */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            <div className="md:col-span-7">
              <MusicStaff
                note={currentNote}
                feedbackState={feedback}
                subTitle={`Target Note (${currentNote.stringName})`}
                height={230}
              />
            </div>

            {/* Rapid Fire Buttons */}
            <div className="md:col-span-5 space-y-3">
              <div className="text-xs font-bold uppercase tracking-wider text-zinc-400 text-center md:text-left">
                Press or click the note:
              </div>

              <div className="grid grid-cols-4 gap-2.5">
                {noteButtons.map((letter) => {
                  const isSelected = selectedGuess === letter;
                  const isTarget = currentNote.name === letter;
                  let style = 'bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 hover:border-amber-400 hover:scale-105';

                  if (isAnsweredRef.current) {
                    if (isTarget) {
                      style = 'bg-emerald-600 text-white border-emerald-400 ring-2 ring-emerald-300 scale-105';
                    } else if (isSelected) {
                      style = 'bg-rose-600 text-white border-rose-400';
                    }
                  }

                  return (
                    <button
                      key={letter}
                      id={`arcade-guess-btn-${letter}`}
                      onClick={() => handleGuess(letter)}
                      className={`h-14 rounded-2xl border text-xl font-black flex items-center justify-center shadow-sm transition-all active:scale-95 ${style}`}
                    >
                      {letter}
                    </button>
                  );
                })}
              </div>

              <div className="text-center text-[11px] text-zinc-400 flex items-center justify-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Tip: Higher streaks multiply score up to 4x!</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
