import React, { useState, useEffect, useRef } from 'react';
import { CHORD_EXERCISES, GUITAR_OPEN_NOTES } from '../data/notesData';
import { soundManager } from '../utils/audio';
import { Play, Square, Volume2, Sparkles, Music2, Disc } from 'lucide-react';

export const BassNoteExercise: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeChordIdx, setActiveChordIdx] = useState(0);
  const [currentBeat, setCurrentBeat] = useState(1); // 1, 2, 3, 4
  const [bpm, setBpm] = useState(76);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const currentChord = CHORD_EXERCISES[activeChordIdx];

  // Pluck bass note sound or gentle acoustic strum
  const playBeatSound = (beat: number, chordIdx: number) => {
    const chord = CHORD_EXERCISES[chordIdx];
    const bassNoteData = GUITAR_OPEN_NOTES.find(
      n => n.stringNumber === chord.stringNumber && n.fret === chord.fret
    );

    if (beat === 1 || beat === 3) {
      // Pick Bass note
      if (bassNoteData) {
        soundManager.playGuitarNote(bassNoteData.frequency, 1.4);
      }
    } else {
      // Gentle rhythm strum harmonic
      const rootFreq = bassNoteData ? bassNoteData.frequency : 130.81;
      [rootFreq * 1.5, rootFreq * 2, rootFreq * 2.5].forEach((f, i) => {
        setTimeout(() => soundManager.playGuitarNote(f, 0.8), i * 15);
      });
    }
  };

  useEffect(() => {
    if (isPlaying) {
      const beatIntervalMs = (60 / bpm) * 1000;
      timerRef.current = setInterval(() => {
        setCurrentBeat((prevBeat) => {
          let nextBeat = prevBeat + 1;
          let nextChordIdx = activeChordIdx;

          if (nextBeat > 4) {
            nextBeat = 1;
            nextChordIdx = (activeChordIdx + 1) % CHORD_EXERCISES.length;
            setActiveChordIdx(nextChordIdx);
          }

          playBeatSound(nextBeat, nextChordIdx);
          return nextBeat;
        });
      }, beatIntervalMs);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, bpm, activeChordIdx]);

  const togglePlay = () => {
    if (!isPlaying) {
      setCurrentBeat(1);
      playBeatSound(1, activeChordIdx);
      setIsPlaying(true);
    } else {
      setIsPlaying(false);
    }
  };

  const handleManualChordClick = (idx: number) => {
    setActiveChordIdx(idx);
    setCurrentBeat(1);
    playBeatSound(1, idx);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500 text-zinc-950">
              Exercise 18
            </span>
            <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
              Country "Pick-Strum" Bass Note Application
            </h2>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Apply your open note knowledge: Pick the root bass note on beats 1 & 3, then downstrum on beats 2 & 4.
          </p>
        </div>

        {/* Play / BPM controls */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white dark:bg-zinc-800 px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 text-xs font-medium">
            <span className="text-zinc-400">Tempo:</span>
            <span className="font-bold text-zinc-800 dark:text-zinc-200">{bpm} BPM</span>
            <input
              type="range"
              min="50"
              max="120"
              value={bpm}
              onChange={(e) => setBpm(Number(e.target.value))}
              className="w-20 accent-amber-500 cursor-pointer"
            />
          </div>

          <button
            id="toggle-pick-strum-audio-btn"
            onClick={togglePlay}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold shadow-md transition-all active:scale-95 ${
              isPlaying
                ? 'bg-rose-500 hover:bg-rose-600 text-white'
                : 'bg-amber-500 hover:bg-amber-600 text-zinc-950'
            }`}
          >
            {isPlaying ? (
              <>
                <Square className="w-4 h-4 fill-current" />
                <span>Stop</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>Play Loop</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 4 Chords Measure Flow (C -> Em -> F -> G) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {CHORD_EXERCISES.map((chord, idx) => {
          const isActive = idx === activeChordIdx;
          return (
            <div
              key={chord.chordName}
              id={`chord-card-${idx}`}
              onClick={() => handleManualChordClick(idx)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                isActive
                  ? 'bg-amber-500/10 border-amber-500 ring-2 ring-amber-500/30 shadow-md scale-102'
                  : 'bg-white dark:bg-zinc-900/60 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-lg font-black text-zinc-900 dark:text-zinc-100">
                  {chord.chordName}
                </span>
                <span className="px-2 py-0.5 rounded-md text-xs font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                  Measure {idx + 1}
                </span>
              </div>

              {/* Bass Note Detail */}
              <div className="space-y-1 text-xs">
                <div className="flex items-center justify-between text-zinc-600 dark:text-zinc-400">
                  <span>Bass Note:</span>
                  <span className="font-bold text-amber-600 dark:text-amber-400 text-sm">
                    {chord.bassNote}
                  </span>
                </div>
                <div className="flex items-center justify-between text-zinc-500">
                  <span>Guitar String:</span>
                  <span className="font-semibold text-zinc-700 dark:text-zinc-300">
                    String {chord.stringNumber} (Fret {chord.fret})
                  </span>
                </div>
                <div className="flex items-center justify-between text-zinc-500">
                  <span>Fingering:</span>
                  <span className="font-semibold text-zinc-700 dark:text-zinc-300">
                    {chord.finger === 0 ? 'Open' : `Finger ${chord.finger}`}
                  </span>
                </div>
              </div>

              {/* 4-Beat Visualizer */}
              <div className="grid grid-cols-4 gap-1 mt-3 pt-3 border-t border-zinc-100 dark:border-zinc-800">
                {[1, 2, 3, 4].map((b) => {
                  const isCurrentBeat = isActive && currentBeat === b && isPlaying;
                  const isBassBeat = b === 1 || b === 3;

                  return (
                    <div
                      key={b}
                      className={`text-center py-1.5 rounded-lg text-xs font-bold transition-all ${
                        isCurrentBeat
                          ? 'bg-amber-500 text-zinc-950 scale-110 shadow-sm'
                          : isBassBeat
                          ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
                          : 'bg-zinc-50 dark:bg-zinc-800/40 text-zinc-400'
                      }`}
                    >
                      <div>{b}</div>
                      <div className="text-[9px] font-normal uppercase">
                        {isBassBeat ? 'Bass' : 'Strum'}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Chord Detail Sheet */}
      <div className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/80 shadow-sm space-y-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <Music2 className="w-5 h-5 text-amber-500" />
              Focus: {currentChord.chordName} Bass Picking
            </h3>
            <p className="text-xs text-zinc-600 dark:text-zinc-400">
              {currentChord.tips}
            </p>
          </div>

          <button
            onClick={() => playBeatSound(1, activeChordIdx)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-xs font-semibold hover:text-amber-500 transition-colors"
          >
            <Volume2 className="w-4 h-4" />
            <span>Sample Bass Note ({currentChord.bassNote})</span>
          </button>
        </div>

        {/* Tab & Rhythm Guide Box */}
        <div className="p-4 rounded-xl bg-zinc-900 font-mono text-xs text-stone-300 space-y-1 border border-stone-800">
          <div className="text-amber-400 font-bold mb-1">
            {currentChord.chordName} Measure Pattern:
          </div>
          <div className="text-stone-400">Count: &nbsp; 1 &nbsp; &nbsp; &nbsp; &nbsp; 2 &nbsp; &nbsp; &nbsp; 3 &nbsp; &nbsp; &nbsp; &nbsp; 4</div>
          <div className="text-stone-200">Action: Pick Bass &nbsp; Strum &nbsp; Pick Bass &nbsp; Strum</div>
          <div className="text-stone-400">Notes: &nbsp;{currentChord.bassNote} (Str {currentChord.stringNumber}) &nbsp; [V] &nbsp; &nbsp; {currentChord.bassNote} (Str {currentChord.stringNumber}) &nbsp; [V]</div>
        </div>
      </div>
    </div>
  );
};
