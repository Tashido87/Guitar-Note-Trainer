import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GUITAR_OPEN_NOTES } from '../data/notesData';
import { GuitarNote, GameStats } from '../types';
import { MusicStaff } from './MusicStaff';
import { InteractiveFretboard } from './InteractiveFretboard';
import { soundManager } from '../utils/audio';
import confetti from 'canvas-confetti';
import { Crosshair, RotateCcw, Lightbulb, CheckCircle2, XCircle, Volume2 } from 'lucide-react';

interface FretboardFindModeProps {
  stats: GameStats;
  onUpdateStats: (isCorrect: boolean, noteId: string, stringNum: number) => void;
  onUpdateSessionBest?: (mode: 'fretboard', streak: number) => void;
}

export const FretboardFindMode: React.FC<FretboardFindModeProps> = ({
  stats,
  onUpdateStats,
  onUpdateSessionBest,
}) => {
  const [currentNote, setCurrentNote] = useState<GuitarNote>(GUITAR_OPEN_NOTES[0]);
  const [selectedFret, setSelectedFret] = useState<{ stringNumber: number; fret: number } | null>(null);
  const [feedback, setFeedback] = useState<'idle' | 'correct' | 'wrong'>('idle');
  const [showHint, setShowHint] = useState(false);
  const [streak, setStreak] = useState(0);
  const [sessionBestStreak, setSessionBestStreak] = useState(() => stats.fretboardSessionBest || 0);

  const answeredRef = useRef(false);

  const nextQuestion = useCallback(() => {
    answeredRef.current = false;
    setSelectedFret(null);
    setFeedback('idle');
    setShowHint(false);

    const pool = GUITAR_OPEN_NOTES.filter(n => n.id !== currentNote.id);
    const chosen = pool[Math.floor(Math.random() * pool.length)] || GUITAR_OPEN_NOTES[0];
    setCurrentNote(chosen);
    soundManager.playGuitarNote(chosen.frequency);
  }, [currentNote.id]);

  useEffect(() => {
    nextQuestion();
  }, []);

  const handleSelectFret = (sNum: number, fNum: number) => {
    if (answeredRef.current) return;
    answeredRef.current = true;
    setSelectedFret({ stringNumber: sNum, fret: fNum });

    const isMatch = currentNote.stringNumber === sNum && currentNote.fret === fNum;

    if (isMatch) {
      setFeedback('correct');
      soundManager.playCorrectSound();
      soundManager.playGuitarNote(currentNote.frequency);

      const nextStreak = streak + 1;
      setStreak(nextStreak);
      if (nextStreak > sessionBestStreak) {
        setSessionBestStreak(nextStreak);
        if (onUpdateSessionBest) {
          onUpdateSessionBest('fretboard', nextStreak);
        }
      }

      if (nextStreak > 0 && nextStreak % 8 === 0) {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 },
        });
      }

      onUpdateStats(true, currentNote.id, currentNote.stringNumber);

      setTimeout(() => {
        nextQuestion();
      }, 1000);
    } else {
      setFeedback('wrong');
      soundManager.playWrongSound();
      setStreak(0);
      onUpdateStats(false, currentNote.id, currentNote.stringNumber);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
            <Crosshair className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
              Locate on Fretboard (Physical Finger Pluck)
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Look at the sheet music note below, then click its exact String and Fret on the guitar fretboard.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3.5 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center">
            <div className="text-[10px] uppercase font-bold text-amber-600 dark:text-amber-400">
              Streak
            </div>
            <div className="text-base font-extrabold text-amber-700 dark:text-amber-300">
              🎯 {streak}
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

      {/* Main split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Left: Target Staff */}
        <div className="lg:col-span-5 flex flex-col items-center">
          <MusicStaff
            note={currentNote}
            showHelperLabels={showHint}
            feedbackState={feedback}
            subTitle="Find This Note on Guitar"
            className="w-full"
            height={220}
          />

          <div className="w-full mt-3 flex items-center justify-between text-xs">
            <button
              onClick={() => setShowHint(prev => !prev)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:text-amber-600"
            >
              <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
              <span>{showHint ? 'Hide Hint' : 'Show Hint'}</span>
            </button>
            <button
              onClick={() => soundManager.playGuitarNote(currentNote.frequency)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:text-amber-600"
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>Listen</span>
            </button>
          </div>

          {showHint && (
            <div className="w-full mt-2 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 text-xs text-amber-900 dark:text-amber-200">
              <p>💡 <strong>Target Note:</strong> {currentNote.name} ({currentNote.staffDescription})</p>
              <p className="mt-0.5">It is on the <strong>{currentNote.stringName}</strong>!</p>
            </div>
          )}
        </div>

        {/* Right: Interactive Fretboard */}
        <div className="lg:col-span-7 space-y-4">
          <InteractiveFretboard
            interactive={true}
            targetNote={currentNote}
            selectedStringFret={selectedFret}
            feedbackState={feedback}
            onSelectFret={handleSelectFret}
          />

          {feedback === 'wrong' && (
            <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-xs text-rose-800 dark:text-rose-200 flex items-center justify-between gap-3 animate-in fade-in">
              <div>
                <div className="font-bold flex items-center gap-1.5 mb-1">
                  <XCircle className="w-4 h-4 text-rose-600" />
                  Not quite! Target is: {currentNote.name} on String {currentNote.stringNumber}, Fret {currentNote.fret} {currentNote.fret === 0 ? '(Open)' : `(Finger ${currentNote.finger})`}
                </div>
                <p className="text-zinc-600 dark:text-zinc-400">
                  Notice the highlighted green target on the fretboard above.
                </p>
              </div>

              <button
                id="fret-next-btn"
                onClick={nextQuestion}
                className="px-4 py-2 rounded-xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-bold whitespace-nowrap shadow-sm hover:bg-zinc-800"
              >
                Next Note
              </button>
            </div>
          )}

          {feedback === 'correct' && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 text-xs text-emerald-800 dark:text-emerald-200 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>
                Perfect! Note <strong>{currentNote.name}</strong> played on String {currentNote.stringNumber}, Fret {currentNote.fret}.
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
