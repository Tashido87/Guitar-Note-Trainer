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
  Filter,
  Play,
  Layers,
  ArrowRight,
  Delete
} from 'lucide-react';

interface FlashcardModeProps {
  stats: GameStats;
  onUpdateStats: (isCorrect: boolean, noteId: string, stringNum: number, reactionMs?: number) => void;
  onUpdateSessionBest?: (mode: 'flashcards', streak: number) => void;
  initialStringFilter?: number | null;
  onFilterChange?: (filter: number | null) => void;
  initialNoteCount?: 1 | 2 | 4;
  onNoteCountChange?: (count: 1 | 2 | 4) => void;
}

export const FlashcardMode: React.FC<FlashcardModeProps> = ({
  stats,
  onUpdateStats,
  onUpdateSessionBest,
  initialStringFilter = null,
  onFilterChange,
  initialNoteCount = 1,
  onNoteCountChange,
}) => {
  const [noteCount, setNoteCount] = useState<1 | 2 | 4>(initialNoteCount);
  const [activeStringFilter, setActiveStringFilter] = useState<number | null>(initialStringFilter);
  const [currentNotes, setCurrentNotes] = useState<GuitarNote[]>([GUITAR_OPEN_NOTES[0]]);
  const [activeSlotIndex, setActiveSlotIndex] = useState<number>(0);
  const [userGuesses, setUserGuesses] = useState<(string | null)[]>([null]);
  const [slotFeedbacks, setSlotFeedbacks] = useState<('idle' | 'correct' | 'wrong')[]>(['idle']);
  const [showHint, setShowHint] = useState(false);
  const [feedback, setFeedback] = useState<'idle' | 'correct' | 'wrong'>('idle');
  const [reactionTime, setReactionTime] = useState<number | null>(null);
  const [sessionStreak, setSessionStreak] = useState(0);
  const [sessionBestStreak, setSessionBestStreak] = useState(() => stats.flashcardSessionBest || 0);
  const [history, setHistory] = useState<{ 
    notes: GuitarNote[]; 
    guesses: (string | null)[]; 
    correct: boolean; 
    timeMs: number 
  }[]>([]);

  const startTimeRef = useRef<number>(Date.now());
  const answeredRef = useRef<boolean>(false);
  const currentNotesRef = useRef<GuitarNote[]>(currentNotes);
  currentNotesRef.current = currentNotes;
  const userGuessesRef = useRef<(string | null)[]>(userGuesses);
  userGuessesRef.current = userGuesses;
  const activeSlotIndexRef = useRef<number>(activeSlotIndex);
  activeSlotIndexRef.current = activeSlotIndex;

  // Available notes filtered by string
  const availableNotes = activeStringFilter === null
    ? GUITAR_OPEN_NOTES
    : GUITAR_OPEN_NOTES.filter(n => n.stringNumber === activeStringFilter);

  // Generate random notes for chosen noteCount
  const generateNewNotes = useCallback((count: 1 | 2 | 4) => {
    answeredRef.current = false;
    setFeedback('idle');
    setShowHint(false);
    setActiveSlotIndex(0);
    setUserGuesses(new Array(count).fill(null));
    setSlotFeedbacks(new Array(count).fill('idle'));
    startTimeRef.current = Date.now();

    const pool = availableNotes.length > 0 ? availableNotes : GUITAR_OPEN_NOTES;
    const generated: GuitarNote[] = [];

    for (let i = 0; i < count; i++) {
      // Avoid immediate duplicate if possible
      const prevNote = generated[i - 1];
      const eligible = pool.length > 1 && prevNote
        ? pool.filter(n => n.id !== prevNote.id)
        : pool;
      
      const randomIdx = Math.floor(Math.random() * eligible.length);
      generated.push(eligible[randomIdx] || pool[0]);
    }

    setCurrentNotes(generated);

    // Audio cue
    if (count === 1) {
      soundManager.playGuitarNote(generated[0].frequency);
    } else {
      soundManager.playGuitarSequence(generated.map(n => n.frequency));
    }
  }, [availableNotes]);

  // Handle noteCount change
  const handleNoteCountChange = (count: 1 | 2 | 4) => {
    setNoteCount(count);
    if (onNoteCountChange) {
      onNoteCountChange(count);
    }
    generateNewNotes(count);
  };

  // Re-generate when string filter changes
  useEffect(() => {
    generateNewNotes(noteCount);
  }, [activeStringFilter, noteCount]);

  // Play full current sequence
  const handlePlaySequence = () => {
    if (currentNotes.length === 1) {
      soundManager.playGuitarNote(currentNotes[0].frequency);
    } else {
      soundManager.playGuitarSequence(currentNotes.map(n => n.frequency));
    }
  };

  // Handle guessing a letter (A - G)
  const handleGuess = useCallback((letter: string) => {
    if (answeredRef.current) return;

    const currentCount = currentNotesRef.current.length;
    const currentIdx = activeSlotIndexRef.current;
    const currentList = currentNotesRef.current;
    const currentTargetNote = currentList[currentIdx];

    // Play guitar pitch for the note at this slot
    if (currentTargetNote) {
      soundManager.playGuitarNote(currentTargetNote.frequency, 1.2);
    }

    const nextGuesses = [...userGuessesRef.current];
    nextGuesses[currentIdx] = letter;
    setUserGuesses(nextGuesses);

    // Single Note Flow
    if (currentCount === 1) {
      answeredRef.current = true;
      const timeSpent = Date.now() - startTimeRef.current;
      setReactionTime(timeSpent);

      const isCorrect = letter === currentTargetNote.name;

      if (isCorrect) {
        setFeedback('correct');
        setSlotFeedbacks(['correct']);
        soundManager.playCorrectSound();

        const newStreak = sessionStreak + 1;
        setSessionStreak(newStreak);
        if (newStreak > sessionBestStreak) {
          setSessionBestStreak(newStreak);
          if (onUpdateSessionBest) {
            onUpdateSessionBest('flashcards', newStreak);
          }
        }

        if (newStreak > 0 && newStreak % 10 === 0) {
          confetti({
            particleCount: 50,
            spread: 60,
            origin: { y: 0.7 },
          });
        }

        onUpdateStats(true, currentTargetNote.id, currentTargetNote.stringNumber, timeSpent);
        setHistory(prev => [
          { notes: currentList, guesses: nextGuesses, correct: true, timeMs: timeSpent },
          ...prev.slice(0, 7)
        ]);

        setTimeout(() => {
          generateNewNotes(1);
        }, 900);
      } else {
        setFeedback('wrong');
        setSlotFeedbacks(['wrong']);
        soundManager.playWrongSound();
        setSessionStreak(0);
        onUpdateStats(false, currentTargetNote.id, currentTargetNote.stringNumber, timeSpent);
        setHistory(prev => [
          { notes: currentList, guesses: nextGuesses, correct: false, timeMs: timeSpent },
          ...prev.slice(0, 7)
        ]);
      }
      return;
    }

    // Multi-Note Flow (2 or 4 notes)
    // Check if there is a next unfilled slot
    const nextSlot = currentIdx + 1;

    if (nextSlot < currentCount) {
      // Advance cursor to next slot
      setActiveSlotIndex(nextSlot);
    } else {
      // All slots filled! Evaluate full sequence
      answeredRef.current = true;
      const timeSpent = Date.now() - startTimeRef.current;
      setReactionTime(timeSpent);

      const feedbacks: ('correct' | 'wrong')[] = currentList.map((n, idx) => {
        return nextGuesses[idx] === n.name ? 'correct' : 'wrong';
      });
      setSlotFeedbacks(feedbacks);

      const allCorrect = feedbacks.every(f => f === 'correct');

      // Update individual stats for each note
      currentList.forEach((n, idx) => {
        const isThisCorrect = feedbacks[idx] === 'correct';
        onUpdateStats(isThisCorrect, n.id, n.stringNumber, Math.round(timeSpent / currentCount));
      });

      if (allCorrect) {
        setFeedback('correct');
        soundManager.playCorrectSound();
        soundManager.playGuitarSequence(currentList.map(n => n.frequency));

        const newStreak = sessionStreak + 1;
        setSessionStreak(newStreak);
        if (newStreak > sessionBestStreak) {
          setSessionBestStreak(newStreak);
          if (onUpdateSessionBest) {
            onUpdateSessionBest('flashcards', newStreak);
          }
        }

        if (newStreak > 0 && newStreak % 5 === 0) {
          confetti({
            particleCount: 60,
            spread: 70,
            origin: { y: 0.7 },
          });
        }

        setHistory(prev => [
          { notes: currentList, guesses: nextGuesses, correct: true, timeMs: timeSpent },
          ...prev.slice(0, 7)
        ]);

        setTimeout(() => {
          generateNewNotes(currentCount as 1 | 2 | 4);
        }, 1200);
      } else {
        setFeedback('wrong');
        soundManager.playWrongSound();
        setSessionStreak(0);

        setHistory(prev => [
          { notes: currentList, guesses: nextGuesses, correct: false, timeMs: timeSpent },
          ...prev.slice(0, 7)
        ]);
      }
    }
  }, [generateNewNotes, onUpdateSessionBest, onUpdateStats, sessionBestStreak, sessionStreak]);

  // Backspace / Undo previous slot
  const handleUndoSlot = () => {
    if (answeredRef.current) return;
    if (activeSlotIndex > 0) {
      const prevIdx = activeSlotIndex - 1;
      const nextGuesses = [...userGuesses];
      nextGuesses[prevIdx] = null;
      setUserGuesses(nextGuesses);
      setActiveSlotIndex(prevIdx);
    } else {
      const nextGuesses = [...userGuesses];
      nextGuesses[0] = null;
      setUserGuesses(nextGuesses);
    }
  };

  // Keyboard shortcut listener for typing A-G, backspace, enter, spacebar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.ctrlKey || e.metaKey || e.altKey) return;

      const key = e.key.toUpperCase();
      if (['A', 'B', 'C', 'D', 'E', 'F', 'G'].includes(key)) {
        e.preventDefault();
        handleGuess(key);
      } else if (e.key === 'Backspace') {
        e.preventDefault();
        handleUndoSlot();
      } else if (e.code === 'Space' || e.key === 'Enter') {
        if (answeredRef.current && feedback === 'wrong') {
          e.preventDefault();
          generateNewNotes(noteCount);
        } else if (!answeredRef.current && noteCount > 1) {
          e.preventDefault();
          handlePlaySequence();
        }
      } else if (e.key === 'h' || e.key === 'H') {
        setShowHint(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleGuess, feedback, generateNewNotes, noteCount, activeSlotIndex, userGuesses]);

  const handleFilterSelect = (filterVal: number | null) => {
    setActiveStringFilter(filterVal);
    if (onFilterChange) {
      onFilterChange(filterVal);
    }
  };

  const noteButtons: ('A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G')[] = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];

  const activeTargetNote = currentNotes[activeSlotIndex] || currentNotes[0];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Status & Mode Ribbon */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <span>Flashcard Sight Reading</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                {noteCount === 1 ? '1 Note' : noteCount === 2 ? '2 Notes' : '4 Notes'}
              </span>
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              {noteCount === 1 
                ? 'Instant single note recognition. Name the note on the staff.' 
                : noteCount === 2 
                ? '2-Note interval sequence. Read and name both notes in order.' 
                : '4-Note measure drill. Sight-read the full 4-beat musical phrase.'}
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

      {/* Mode Controls Bar: Note Count (1, 2, 4) & String Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 shadow-xs">
        {/* 1, 2, 4 Notes Option Selector */}
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1 mr-1">
            <Layers className="w-3.5 h-3.5 text-amber-500" /> Flashcard:
          </span>
          <div className="inline-flex p-1 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
            {[
              { count: 1 as const, label: '1 Note', badge: 'Single' },
              { count: 2 as const, label: '2 Notes', badge: 'Interval' },
              { count: 4 as const, label: '4 Notes', badge: '4/4 Bar' },
            ].map((opt) => (
              <button
                key={opt.count}
                id={`flashcard-mode-${opt.count}-notes`}
                onClick={() => handleNoteCountChange(opt.count)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  noteCount === opt.count
                    ? 'bg-amber-500 text-zinc-950 shadow-xs font-black'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-200/60 dark:hover:bg-zinc-700/60'
                }`}
              >
                <span>{opt.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* String Target Filter Selector */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <span className="text-xs font-semibold text-zinc-400 flex items-center gap-1 mr-1 shrink-0">
            <Filter className="w-3.5 h-3.5" /> String:
          </span>
          <button
            onClick={() => handleFilterSelect(null)}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all shrink-0 ${
              activeStringFilter === null
                ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 shadow-xs font-bold'
                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200'
            }`}
          >
            All (17 Notes)
          </button>
          {[
            { num: 1, label: '1st (E)' },
            { num: 2, label: '2nd (B)' },
            { num: 3, label: '3rd (G)' },
            { num: 4, label: '4th (D)' },
            { num: 5, label: '5th (A)' },
            { num: 6, label: '6th (E)' },
          ].map((s) => (
            <button
              key={s.num}
              onClick={() => handleFilterSelect(s.num)}
              className={`px-2 py-1 rounded-lg text-xs font-medium transition-all whitespace-nowrap shrink-0 ${
                activeStringFilter === s.num
                  ? 'bg-amber-500 text-zinc-950 font-bold shadow-xs'
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Flashcard Card */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        {/* Left: Musical Staff Flashcard */}
        <div className="md:col-span-7 flex flex-col items-center">
          <div className="w-full relative">
            <MusicStaff
              notes={currentNotes}
              activeNoteIndex={noteCount > 1 && !answeredRef.current ? activeSlotIndex : undefined}
              noteFeedbacks={answeredRef.current ? slotFeedbacks : undefined}
              showHelperLabels={showHint}
              feedbackState={feedback}
              subTitle={
                noteCount === 1 
                  ? `Target Note • ${currentNotes[0].stringName}` 
                  : `${noteCount}-Note Flashcard Sequence`
              }
              timeSignature={noteCount === 2 ? '2/4' : noteCount === 4 ? '4/4' : undefined}
              className="w-full"
              height={230}
              onNoteClick={(clickedNote, idx) => {
                if (!answeredRef.current && noteCount > 1) {
                  setActiveSlotIndex(idx);
                }
              }}
            />

            {/* Reaction Speed Badge */}
            {reactionTime !== null && feedback === 'correct' && (
              <div className="absolute bottom-3 left-4 px-2.5 py-1 rounded-md text-xs font-mono font-bold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                ⚡ {(reactionTime / 1000).toFixed(2)}s
              </div>
            )}
          </div>

          {/* Hint & Audio Toolbar */}
          <div className="w-full mt-3 flex items-center justify-between text-xs gap-2">
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
              onClick={handlePlaySequence}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:text-amber-600 transition-colors"
            >
              {noteCount > 1 ? <Play className="w-3.5 h-3.5 fill-current" /> : <Volume2 className="w-3.5 h-3.5" />}
              <span>{noteCount > 1 ? 'Replay Sequence (Space)' : 'Replay Sound'}</span>
            </button>
          </div>

          {/* Hint Card */}
          {showHint && (
            <div className="w-full mt-2 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 text-xs text-amber-900 dark:text-amber-200 animate-in fade-in duration-200 space-y-2">
              {noteCount === 1 ? (
                <div>
                  <p>💡 <strong>Position:</strong> {currentNotes[0].staffDescription}</p>
                  {currentNotes[0].mnemonicHint && (
                    <p className="text-amber-700 dark:text-amber-300 font-medium">
                      <strong>Memory Trick:</strong> {currentNotes[0].mnemonicHint}
                    </p>
                  )}
                  <p className="text-amber-800 dark:text-amber-400">
                    <strong>Guitar Fret:</strong> String {currentNotes[0].stringNumber}, Fret {currentNotes[0].fret} {currentNotes[0].fret === 0 ? '(Open)' : `(Finger ${currentNotes[0].finger})`}
                  </p>
                </div>
              ) : (
                <div className="space-y-1.5">
                  <div className="font-bold text-amber-800 dark:text-amber-300">
                    Notes in this {noteCount}-note phrase:
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    {currentNotes.map((n, i) => (
                      <div key={i} className="p-1.5 rounded-lg bg-amber-100/60 dark:bg-amber-900/30 text-[11px]">
                        <strong>Note #{i + 1}:</strong> {n.staffDescription} (Str {n.stringNumber}, Fret {n.fret})
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right: Answer Input & Multi-Note Answer Slots */}
        <div className="md:col-span-5 flex flex-col justify-center space-y-4">
          <div className="text-center md:text-left">
            <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              {noteCount === 1 
                ? 'What note is this?' 
                : `Enter the ${noteCount} notes in sequence:`}
            </h3>
            <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5 flex items-center justify-center md:justify-start gap-1">
              <Keyboard className="w-3.5 h-3.5" /> Type A, B, C, D, E, F, or G on keyboard
            </p>
          </div>

          {/* Multi-Note Slot Sequence Visualizer (For 2 or 4 notes) */}
          {noteCount > 1 && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs text-zinc-400">
                <span>Sequence Slots:</span>
                {!answeredRef.current && activeSlotIndex > 0 && (
                  <button
                    onClick={handleUndoSlot}
                    className="text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1 text-[11px] font-medium"
                  >
                    <Delete className="w-3 h-3" /> Backspace / Undo
                  </button>
                )}
              </div>

              <div className={`grid ${noteCount === 2 ? 'grid-cols-2' : 'grid-cols-4'} gap-2`}>
                {currentNotes.map((targetNote, idx) => {
                  const guess = userGuesses[idx];
                  const isActive = !answeredRef.current && activeSlotIndex === idx;
                  const itemFeedback = slotFeedbacks[idx];

                  let slotClass = 'border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200';
                  if (isActive) {
                    slotClass = 'border-blue-700 dark:border-blue-400 ring-2 ring-blue-600/30 bg-blue-50/80 dark:bg-blue-950/40 text-blue-900 dark:text-blue-200 font-black scale-102';
                  } else if (itemFeedback === 'correct') {
                    slotClass = 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 font-extrabold';
                  } else if (itemFeedback === 'wrong') {
                    slotClass = 'border-rose-500 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 font-extrabold';
                  }

                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => !answeredRef.current && setActiveSlotIndex(idx)}
                      className={`p-2.5 rounded-xl border text-center transition-all flex flex-col items-center justify-center relative ${slotClass}`}
                    >
                      <div className="text-[10px] uppercase font-bold text-zinc-400">
                        #{idx + 1}
                      </div>
                      <div className="text-xl font-black mt-0.5 min-h-[28px] flex items-center justify-center">
                        {guess || (isActive ? '?' : '—')}
                      </div>
                      {answeredRef.current && itemFeedback === 'wrong' && (
                        <div className="text-[10px] font-bold text-rose-500 mt-0.5">
                          ✓ {targetNote.name}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Letter Answer Buttons (A - G) */}
          <div className="grid grid-cols-4 gap-2.5">
            {noteButtons.map((letter) => {
              const isSelected = noteCount === 1 
                ? userGuesses[0] === letter 
                : userGuesses[activeSlotIndex] === letter;

              let btnStyle = 'bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-100 hover:border-amber-400 hover:bg-amber-50 dark:hover:bg-zinc-700/80';

              if (answeredRef.current && noteCount === 1) {
                const isCorrectTarget = currentNotes[0].name === letter;
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
                  className={`h-14 rounded-2xl border text-xl font-bold flex flex-col items-center justify-center transition-all duration-150 active:scale-95 shadow-xs ${btnStyle}`}
                >
                  <span>{letter}</span>
                </button>
              );
            })}

            {/* Next Button for wrong answer correction */}
            {feedback === 'wrong' && (
              <button
                id="next-note-after-wrong-btn"
                onClick={() => generateNewNotes(noteCount)}
                className="col-span-4 h-12 rounded-xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-bold text-sm flex items-center justify-center gap-2 shadow-md hover:bg-zinc-800 active:scale-95 transition-all"
              >
                <span>Continue to Next Card (Space / Enter)</span>
                <RotateCcw className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Feedback Explanation Card */}
          {feedback === 'wrong' && (
            <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-xs text-rose-800 dark:text-rose-200 space-y-1.5">
              <div className="font-bold flex items-center gap-1.5">
                <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>
                  Correct Sequence:{' '}
                  <strong>{currentNotes.map(n => n.name).join(' - ')}</strong>
                </span>
              </div>
              <div className="text-[11px] text-zinc-600 dark:text-zinc-400">
                {currentNotes.map((n, i) => (
                  <span key={i} className="inline-block mr-3">
                    #{i + 1}: {n.name} ({n.stringName}, Fret {n.fret})
                  </span>
                ))}
              </div>
            </div>
          )}

          {feedback === 'correct' && (
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 text-xs text-emerald-800 dark:text-emerald-200 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                {noteCount === 1 ? (
                  <>Spot on! Note <strong>{currentNotes[0].name}</strong> on {currentNotes[0].stringName}, Fret {currentNotes[0].fret}.</>
                ) : (
                  <>Perfect! Correct sequence <strong>{currentNotes.map(n => n.name).join(' - ')}</strong>!</>
                )}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Recent History Ribbon */}
      {history.length > 0 && (
        <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800">
          <div className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2">
            Recent Flashcards History
          </div>
          <div className="flex items-center gap-2 overflow-x-auto">
            {history.map((h, i) => (
              <div
                key={i}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border shrink-0 ${
                  h.correct
                    ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300 text-emerald-700 dark:text-emerald-300'
                    : 'bg-rose-50 dark:bg-rose-950/30 border-rose-300 text-rose-700 dark:text-rose-300'
                }`}
              >
                <span>{h.notes.map(n => n.name).join('-')}</span>
                <span className="text-[10px] opacity-75">
                  ({h.notes.length === 1 ? `Str ${h.notes[0].stringNumber}` : `${h.notes.length} notes`})
                </span>
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
