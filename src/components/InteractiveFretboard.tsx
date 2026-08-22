import React from 'react';
import { GuitarNote } from '../types';
import { GUITAR_OPEN_NOTES } from '../data/notesData';
import { soundManager } from '../utils/audio';

interface InteractiveFretboardProps {
  highlightNote?: GuitarNote | null;
  selectedStringFret?: { stringNumber: number; fret: number } | null;
  targetNote?: GuitarNote | null;
  onSelectFret?: (stringNumber: number, fret: number) => void;
  interactive?: boolean;
  showAllNoteLabels?: boolean;
  filterString?: number | null; // 1-6 or null for all
  className?: string;
  feedbackState?: 'correct' | 'wrong' | 'idle';
}

export const InteractiveFretboard: React.FC<InteractiveFretboardProps> = ({
  highlightNote,
  selectedStringFret,
  targetNote,
  onSelectFret,
  interactive = false,
  showAllNoteLabels = false,
  filterString = null,
  className = '',
  feedbackState = 'idle',
}) => {
  const strings: (1 | 2 | 3 | 4 | 5 | 6)[] = [1, 2, 3, 4, 5, 6];
  const frets: (0 | 1 | 2 | 3)[] = [0, 1, 2, 3];

  // String gauges in pixels (string 1 thinnest, string 6 thickest)
  const stringThickness: Record<number, number> = {
    1: 1.5,
    2: 2.0,
    3: 2.6,
    4: 3.2,
    5: 3.8,
    6: 4.6,
  };

  const stringNames: Record<number, string> = {
    1: '1 (E)',
    2: '2 (B)',
    3: '3 (G)',
    4: '4 (D)',
    5: '5 (A)',
    6: '6 (E)',
  };

  const handleFretClick = (sNum: number, fNum: number) => {
    // Find note sound
    const matchNote = GUITAR_OPEN_NOTES.find(n => n.stringNumber === sNum && n.fret === fNum);
    if (matchNote) {
      soundManager.playGuitarNote(matchNote.frequency);
    }

    if (interactive && onSelectFret) {
      onSelectFret(sNum, fNum);
    }
  };

  return (
    <div
      id="guitar-fretboard-container"
      className={`relative w-full rounded-2xl bg-stone-900 border border-stone-800 p-4 shadow-xl select-none ${className}`}
    >
      {/* Top Header info */}
      <div className="flex items-center justify-between mb-3 px-1 text-xs text-stone-400">
        <span className="font-semibold uppercase tracking-wider text-amber-400/90">
          Guitar Fretboard (Open Position)
        </span>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-stone-400 inline-block"></span>
            Open Nut (Fret 0)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"></span>
            Frets 1 - 3
          </span>
        </div>
      </div>

      {/* Fretboard SVG / Grid */}
      <div className="overflow-x-auto pb-1">
        <div className="min-w-[480px]">
          {/* Fret number headers */}
          <div className="grid grid-cols-12 mb-1.5 text-center text-xs font-bold text-stone-400">
            <div className="col-span-2 text-stone-500 uppercase tracking-wide">String</div>
            <div className="col-span-2 text-amber-300">Open (0)</div>
            <div className="col-span-3 text-stone-300">Fret 1</div>
            <div className="col-span-2 text-stone-300">Fret 2</div>
            <div className="col-span-3 text-amber-400 flex items-center justify-center gap-1">
              Fret 3 <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-400"></span>
            </div>
          </div>

          {/* Wooden Fretboard surface */}
          <div className="relative rounded-xl border border-stone-700/80 bg-gradient-to-r from-stone-800 via-amber-950/40 to-stone-900 overflow-hidden shadow-inner py-1.5">
            {/* Position Marker Dot at 3rd fret (center between string 3 & 4) */}
            <div className="absolute right-[12%] top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-stone-300/20 border border-stone-200/30 shadow-inner pointer-events-none" />

            {/* Nut divider line (separates open fret 0 from fret 1) */}
            <div className="absolute left-[33.33%] top-0 bottom-0 w-2.5 bg-gradient-to-r from-amber-100 to-amber-200/90 shadow-md border-r border-stone-950 pointer-events-none" />
            {/* Fret 1 wire */}
            <div className="absolute left-[58.33%] top-0 bottom-0 w-1 bg-gradient-to-b from-stone-300 via-stone-400 to-stone-300 shadow pointer-events-none" />
            {/* Fret 2 wire */}
            <div className="absolute left-[75%] top-0 bottom-0 w-1 bg-gradient-to-b from-stone-300 via-stone-400 to-stone-300 shadow pointer-events-none" />

            {/* String Rows */}
            {strings.map((sNum) => {
              const isFiltered = filterString !== null && filterString !== sNum;
              const opacityClass = isFiltered ? 'opacity-35 pointer-events-none' : 'opacity-100';

              return (
                <div
                  key={`string-row-${sNum}`}
                  className={`relative grid grid-cols-12 items-center h-11 border-b border-stone-800/40 last:border-b-0 ${opacityClass}`}
                >
                  {/* String Gauge line going across the entire fretboard */}
                  <div
                    className="absolute left-[16.66%] right-0 top-1/2 -translate-y-1/2 pointer-events-none z-0"
                    style={{
                      height: `${stringThickness[sNum]}px`,
                      background:
                        sNum >= 4
                          ? 'repeating-linear-gradient(90deg, #d4d4d8, #a1a1aa 2px, #71717a 4px)' // wound strings (4, 5, 6)
                          : 'linear-gradient(180deg, #e4e4e7, #a1a1aa)', // plain steel/nylon (1, 2, 3)
                      boxShadow: '0 1px 2px rgba(0,0,0,0.6)',
                    }}
                  />

                  {/* String Label */}
                  <div className="col-span-2 flex items-center justify-start pl-3 z-10">
                    <span className="px-2 py-0.5 rounded-md bg-stone-900/90 border border-stone-700 text-xs font-mono font-bold text-stone-300">
                      {stringNames[sNum]}
                    </span>
                  </div>

                  {/* Fret 0 (Open) */}
                  <div className="col-span-2 flex items-center justify-center z-10 px-1">
                    {renderFretButton(sNum, 0)}
                  </div>

                  {/* Fret 1 */}
                  <div className="col-span-3 flex items-center justify-center z-10 px-1">
                    {renderFretButton(sNum, 1)}
                  </div>

                  {/* Fret 2 */}
                  <div className="col-span-2 flex items-center justify-center z-10 px-1">
                    {renderFretButton(sNum, 2)}
                  </div>

                  {/* Fret 3 */}
                  <div className="col-span-3 flex items-center justify-center z-10 px-1">
                    {renderFretButton(sNum, 3)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Helpful legend */}
      <div className="mt-3 flex flex-wrap items-center justify-between text-[11px] text-stone-400 px-1 gap-2">
        <div className="flex items-center gap-2">
          <span>💡 <strong>Standard Open Position:</strong> Only frets 0, 1, 2, 3 are used in open chord melody & basic sheet music.</span>
        </div>
        {interactive && (
          <span className="text-amber-400 font-medium animate-pulse">
            👆 Click any string & fret to answer or test sound
          </span>
        )}
      </div>
    </div>
  );

  function renderFretButton(sNum: number, fNum: number) {
    const noteData = GUITAR_OPEN_NOTES.find(n => n.stringNumber === sNum && n.fret === fNum);
    const isTarget = targetNote && targetNote.stringNumber === sNum && targetNote.fret === fNum;
    const isHighlighted = highlightNote && highlightNote.stringNumber === sNum && highlightNote.fret === fNum;
    const isSelected = selectedStringFret && selectedStringFret.stringNumber === sNum && selectedStringFret.fret === fNum;

    // Is this a valid standard open position note? (E.g. String 3 fret 1 isn't standard in basic C major scale open notes, though it exists)
    const hasNoteData = !!noteData;

    let buttonBg = 'bg-stone-900/60 hover:bg-stone-800 text-stone-400 border-stone-700/60';
    let ringEffect = '';

    if (isSelected) {
      if (feedbackState === 'correct') {
        buttonBg = 'bg-emerald-600 text-white border-emerald-400 font-bold';
        ringEffect = 'ring-4 ring-emerald-500/50 scale-110';
      } else if (feedbackState === 'wrong') {
        buttonBg = 'bg-rose-600 text-white border-rose-400 font-bold';
        ringEffect = 'ring-4 ring-rose-500/50 scale-110';
      } else {
        buttonBg = 'bg-amber-600 text-white border-amber-400 font-bold';
        ringEffect = 'ring-4 ring-amber-500/40 scale-105';
      }
    } else if (isHighlighted || (feedbackState === 'wrong' && isTarget)) {
      buttonBg = 'bg-emerald-600 text-white border-emerald-300 font-bold animate-bounce';
      ringEffect = 'ring-4 ring-emerald-400/60';
    }

    return (
      <button
        id={`fret-btn-s${sNum}-f${fNum}`}
        type="button"
        onClick={() => handleFretClick(sNum, fNum)}
        className={`w-9 h-7 rounded-lg border text-xs flex items-center justify-center transition-all duration-150 relative ${buttonBg} ${ringEffect} ${
          interactive ? 'cursor-pointer active:scale-95' : 'cursor-pointer'
        }`}
        title={noteData ? `${noteData.name} (String ${sNum}, Fret ${fNum})` : `String ${sNum}, Fret ${fNum}`}
      >
        {/* Label content */}
        {showAllNoteLabels && noteData ? (
          <div className="flex items-center gap-0.5">
            <span className="font-bold">{noteData.name}</span>
            {noteData.finger > 0 && (
              <span className="text-[9px] opacity-75 font-mono">f{noteData.finger}</span>
            )}
          </div>
        ) : isHighlighted || isSelected || (feedbackState === 'wrong' && isTarget) ? (
          <span className="font-extrabold text-sm">{noteData?.name || '?'}</span>
        ) : hasNoteData ? (
          <span className="w-2 h-2 rounded-full bg-stone-500/60 group-hover:bg-amber-400" />
        ) : (
          <span className="w-1.5 h-1.5 rounded-full bg-stone-700/30" />
        )}
      </button>
    );
  }
};
