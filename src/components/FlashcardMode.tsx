import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GUITAR_OPEN_NOTES } from '../data/notesData';
import { GuitarNote, GameStats } from '../types';
import { MusicStaff } from './MusicStaff';
import { soundManager } from '../utils/audio';
import confetti from 'canvas-confetti';
import { 
  Zap, 
  RotateCcw, 
  Lightbulb, 
  CheckCircle2, 
  XCircle, 
  Volume2, 
  Keyboard, 
  Trophy,
  Filter
} from 'lucide-react';

interface FlashcardModeProps {
  stats: GameStats;
  onUpdateStats: (isCorrect: boolean, noteId: string, stringNum: number) => void;
}

export const FlashcardMode: React.FC<FlashcardModeProps> = ({
  stats,
  onUpdateStats,
}) => {
  const [activeStringFilter, setActiveStringFilter] = useState<number | null>(null);
  const [currentNote, setCurrentNote] = useState<GuitarNote>(GUITAR_OPEN_NOTES[0]);
  const [showHint, setShowHint] = useState(false);
  const [feedback, setFeedback] = useState<'idle' | 'correct' | 'wrong'>('idle');
  const [selectedGuess, setSelectedGuess] = useState<string | null>(null);
  const [reactionTime, setReactionTime] = useState<number | null>(null);
  const [sessionStreak, setSessionStreak] = useState(0);
  const [sessionBestStreak, setSessionBestStreak] = useState(0);
  const [history, setHistory] = useState<{ note: GuitarNote; correct: boolean; timeMs: number }[]>([]);

  const startTimeRef = useRef<number>(Date.now());
  const answeredRef = useRef<boolean>(false);

  // Available notes filtered by string
  const availableNotes = activeStringFilter === null
    ? GUITAR_OPEN_NOTES
    : GUITAR_OPEN_NOTES.filter(n => n.stringNumber === activeStringFilter);

  // Pick a new random note (different from previous)
  const nextRandomNote = useCallback(() => {
    answeredRef.current = false;
    setSelectedGuess(null);
    setFeedback('idle');
    setShowHint(false);
    startTimeRef.current = Date.now();

    const pool = availableNotes.length > 1
      ? availableNotes.filter(n => n.id !== currentNote.id)
      : availableNotes;
    
    const randomIdx = Math.floor(Math.random() * pool.length);
    const chosen = pool[randomIdx] || GUITAR_OPEN_NOTES[0];
    setCurrentNote(chosen);
    // Play sound of new question
    soundManager.playGuitarNote(chosen.frequency);
  }, [availableNotes, currentNote.id]);

  // Initialize first note
  useEffect(() => {
    nextRandomNote();
  }, [activeStringFilter]);

  // Handle guessing a letter (A - G)
  const handleGuess = useCallback((letter: string) => {
    if (answeredRef.current) return;
    answeredRef.current = true;

    const timeSpent = Date.now() - startTimeRef.current;
    setReactionTime(timeSpent);
    setSelectedGuess(letter);

    const isCorrect = letter === currentNote.name;

    if (isCorrect) {
      setFeedback('correct');
      soundManager.playCorrectSound();
      soundManager.playGuitarNote(currentNote.frequency);

      const newStreak = sessionStreak + 1;
      setSessionStreak(newStreak);
      if (newStreak > sessionBestStreak) {
        setSessionBestStreak(newStreak);
      }

      if (newStreak > 0 && newStreak % 10 === 0) {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 },
        });
      }

      onUpdateStats(true, currentNote.id, currentNote.stringNumber);
      setHistory(prev => [{ note: currentNote, correct: true, timeMs: timeSpent }, ...prev.slice(0, 7)]);

      // Auto advance on correct answer
      setTimeout(() => {
        nextRandomNote();
      }, 900);
    } else {
      setFeedback('wrong');
      soundManager.playWrongSound();
      setSessionStreak(0);
      onUpdateStats(false, currentNote.id, currentNote.stringNumber);
      setHistory(prev => [{ note: currentNote, correct: false, timeMs: timeSpent }, ...prev.slice(0, 7)]);
    }
  }, [currentNote, nextRandomNote, onUpdateStats, sessionBestStreak, sessionStreak]);

  // Keyboard shortcut listener for physical typing: A, B, C, D, E, F, G
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore when typing inside input fields or modifiers
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.ctrlKey || e.metaKey || e.altKey) return;

      const key = e.key.toUpperCase();
      if (['A', 'B', 'C', 'D', 'E', 'F', 'G'].includes(key)) {
        e.preventDefault();
        handleGuess(key);
      } else if (e.code === 'Space' || e.key === 'Enter') {
        // If wrong, spacebar advances to next
        if (answeredRef.current && feedback === 'wrong') {
          e.preventDefault();
          nextRandomNote();
        }
      } else if (e.key === 'h' || e.key === 'H') {
        setShowHint(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleGuess, feedback, nextRandomNote]);

  const noteButtons: ('A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G')[] = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Status & Filter Ribbon */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
              Instant Note Recognition
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Break sequential counting! Train instant sight-reading from staff to note name.
            </p>
          </div>
        </div>

        {/* Streak Badges */}
        <div className="flex items-center gap-3">
          <div className="px-3.5 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center">
            <div className="text-[10px] uppercase font-bold text-amber-600 dark:text-amber-400">
              Streak
            </div>
            <div className="text-base font-extrabold text-amber-700 dark:text-amber-300">
              🔥 {sessionStreak}
            </div>
          </div>
          <div className="px-3.5 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-center">
            <div className="text-[10px] uppercase font-bold text-zinc-400">
              Session Best
            </div>
            <div className="text-base font-bold text-zinc-700 dark:text-zinc-200">
              ⭐ {sessionBestStreak}
            </div>
          </div>
        </div>
      </div>

      {/* String Target Selector */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        <span className="text-xs font-semibold text-zinc-400 flex items-center gap-1 mr-1">
          <Filter className="w-3.5 h-3.5" /> Filter:
        </span>
        <button
          onClick={() => setActiveStringFilter(null)}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
            activeStringFilter === null
              ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 shadow-sm'
              : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200'
          }`}
        >
          All Strings (17 Notes)
        </button>
        {[
          { num: 1, label: '1st (High E)' },
          { num: 2, label: '2nd (B)' },
          { num: 3, label: '3rd (G)' },
          { num: 4, label: '4th (D)' },
          { num: 5, label: '5th (A)' },
          { num: 6, label: '6th (Low E)' },
        ].map((s) => (
          <button
            key={s.num}
            onClick={() => setActiveStringFilter(s.num)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
              activeStringFilter === s.num
                ? 'bg-amber-500 text-zinc-950 font-bold shadow-sm'
                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Main Flashcard Card */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        {/* Left: Musical Staff Flashcard */}
        <div className="md:col-span-7 flex flex-col items-center">
          <div className="w-full relative">
            <MusicStaff
              note={currentNote}
              showHelperLabels={showHint}
              feedbackState={feedback}
              subTitle={`Target Note • ${currentNote.stringName}`}
              className="w-full"
              height={220}
            />

            {/* Reaction Speed Badge */}
            {reactionTime !== null && feedback === 'correct' && (
              <div className="absolute bottom-3 left-4 px-2.5 py-1 rounded-md text-xs font-mono font-bold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                ⚡ {(reactionTime / 1000).toFixed(2)}s
              </div>
            )}
          </div>

          {/* Hint & Mnemonic Bar */}
          <div className="w-full mt-3 flex items-center justify-between text-xs">
            <button
              type="button"
              onClick={() => setShowHint(prev => !prev)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:text-amber-600 transition-colors"
            >
              <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
              <span>{showHint ? 'Hide Hint' : 'Show Hint / Mnemonic (Key: H)'}</span>
            </button>

            <button
              type="button"
              onClick={() => soundManager.playGuitarNote(currentNote.frequency)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:text-amber-600 transition-colors"
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>Replay Audio</span>
            </button>
          </div>

          {showHint && (
            <div className="w-full mt-2 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 text-xs text-amber-900 dark:text-amber-200 animate-in fade-in duration-200">
              <p>💡 <strong>Position:</strong> {currentNote.staffDescription}</p>
              <p className="mt-0.5 text-amber-800 dark:text-amber-300"><strong>Guitar Fret:</strong> String {currentNote.stringNumber}, Fret {currentNote.fret} {currentNote.fret === 0 ? '(Open string)' : `(Finger ${currentNote.finger})`}</p>
            </div>
          )}
        </div>

        {/* Right: Answer Choices & Instant Keyboard Input */}
        <div className="md:col-span-5 flex flex-col justify-center space-y-4">
          <div className="text-center md:text-left">
            <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              What note is this?
            </h3>
            <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5 flex items-center justify-center md:justify-start gap-1">
              <Keyboard className="w-3.5 h-3.5" /> Press A, B, C, D, E, F, or G on keyboard
            </p>
          </div>

          {/* Letter Answer Buttons */}
          <div className="grid grid-cols-4 gap-2.5">
            {noteButtons.map((letter) => {
              const isSelected = selectedGuess === letter;
              const isCorrectTarget = currentNote.name === letter;
              let btnStyle = 'bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-100 hover:border-amber-400 hover:bg-amber-50 dark:hover:bg-zinc-700/80';

              if (answeredRef.current) {
                if (isCorrectTarget) {
                  btnStyle = 'bg-emerald-600 text-white border-emerald-500 font-extrabold shadow-md ring-2 ring-emerald-400/50';
                } else if (isSelected && !isCorrectTarget) {
                  btnStyle = 'bg-rose-600 text-white border-rose-500 font-extrabold shadow-md';
                } else {
                  btnStyle = 'opacity-40 bg-zinc-100 dark:bg-zinc-800/40 border-zinc-200 dark:border-zinc-700 text-zinc-400';
                }
              }

              return (
                <button
                  key={letter}
                  id={`guess-btn-${letter}`}
                  onClick={() => handleGuess(letter)}
                  disabled={answeredRef.current && feedback === 'correct'}
                  className={`h-14 rounded-2xl border text-xl font-bold flex flex-col items-center justify-center transition-all duration-150 active:scale-95 shadow-sm ${btnStyle}`}
                >
                  <span>{letter}</span>
                </button>
              );
            })}

            {/* Next Button for wrong answer correction */}
            {feedback === 'wrong' && (
              <button
                id="next-note-after-wrong-btn"
                onClick={nextRandomNote}
                className="col-span-4 h-12 rounded-xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-bold text-sm flex items-center justify-center gap-2 shadow-md hover:bg-zinc-800 active:scale-95 transition-all"
              >
                <span>Continue to Next Note</span>
                <RotateCcw className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Feedback Explanation Card */}
          {feedback === 'wrong' && (
            <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-xs text-rose-800 dark:text-rose-200 space-y-1">
              <div className="font-bold flex items-center gap-1.5">
                <XCircle className="w-4 h-4 text-rose-600" />
                Correct Answer: {currentNote.name}
              </div>
              <p>
                <strong>Guitar Location:</strong> {currentNote.stringName}, Fret {currentNote.fret} {currentNote.fret === 0 ? '(Open)' : `(Finger ${currentNote.finger})`}
              </p>
              <p className="text-zinc-600 dark:text-zinc-400 text-[11px]">
                {currentNote.mnemonicHint}
              </p>
            </div>
          )}

          {feedback === 'correct' && (
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 text-xs text-emerald-800 dark:text-emerald-200 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                Spot on! Note <strong>{currentNote.name}</strong> on String {currentNote.stringNumber}, Fret {currentNote.fret}.
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Recent History Ribbon */}
      {history.length > 0 && (
        <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800">
          <div className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2">
            Recent Flashcards
          </div>
          <div className="flex items-center gap-2 overflow-x-auto">
            {history.map((h, i) => (
              <div
                key={i}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border ${
                  h.correct
                    ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300 text-emerald-700 dark:text-emerald-300'
                    : 'bg-rose-50 dark:bg-rose-950/30 border-rose-300 text-rose-700 dark:text-rose-300'
                }`}
              >
                <span>{h.note.name}</span>
                <span className="text-[10px] opacity-75">(Str {h.note.stringNumber})</span>
                {h.correct ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <XCircle className="w-3.5 h-3.5 text-rose-600" />
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
