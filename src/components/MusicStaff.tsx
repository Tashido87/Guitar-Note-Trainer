import React from 'react';
import { GuitarNote } from '../types';
import { soundManager } from '../utils/audio';
import { Volume2, Play } from 'lucide-react';

interface MusicStaffProps {
  note?: GuitarNote | null;
  notes?: GuitarNote[];
  activeNoteIndex?: number;
  noteFeedbacks?: ('idle' | 'correct' | 'wrong')[];
  showHelperLabels?: boolean;
  showNoteName?: boolean;
  showStringFretBadge?: boolean;
  feedbackState?: 'correct' | 'wrong' | 'idle';
  interactive?: boolean;
  onStaffClick?: () => void;
  onNoteClick?: (note: GuitarNote, index: number) => void;
  width?: number;
  height?: number;
  className?: string;
  subTitle?: string;
  timeSignature?: '2/4' | '4/4';
}

export const MusicStaff: React.FC<MusicStaffProps> = ({
  note,
  notes,
  activeNoteIndex,
  noteFeedbacks,
  showHelperLabels = false,
  showNoteName = false,
  showStringFretBadge = false,
  feedbackState = 'idle',
  interactive = true,
  onStaffClick,
  onNoteClick,
  width = 440,
  height = 230,
  className = '',
  subTitle,
  timeSignature,
}) => {
  // Normalize notes list
  const notesList: GuitarNote[] = notes && notes.length > 0 
    ? notes 
    : (note ? [note] : []);

  // Staff geometry
  // 5 lines: lines at y = 70, 86, 102, 118, 134 (top line 5 at y=70, bottom line 1 at y=134)
  const lineSpacing = 16;
  const staffTopY = 70; // Line 5 (top line = F5)
  const staffBottomY = staffTopY + 4 * lineSpacing; // Line 1 = 134 (bottom line = E4)
  const staffLeft = 40;
  const staffRight = width - 40;

  // Step 0 = Bottom line (E4, y = 134)
  // Each step is lineSpacing / 2 = 8px
  // Note Y = staffBottomY - (step * (lineSpacing / 2))
  const stepSize = lineSpacing / 2;
  const noteRadiusX = 8.5;
  const noteRadiusY = 6.2;
  const stemLength = 36;

  // Calculate note positions
  const getNoteX = (index: number, total: number) => {
    if (total <= 1) {
      return width / 2 + 10;
    }
    if (total === 2) {
      const startX = staffLeft + 115;
      const endX = staffRight - 65;
      return startX + index * (endX - startX);
    }
    // 4 notes (or other count)
    const clefOffset = (timeSignature || total >= 2) ? 100 : 80;
    const startX = staffLeft + clefOffset;
    const availableWidth = staffRight - startX - 35;
    const step = availableWidth / (total - 1);
    return startX + index * step;
  };

  // Determine time signature to display if not explicitly provided
  const derivedTimeSignature = timeSignature || (notesList.length === 2 ? '2/4' : notesList.length === 4 ? '4/4' : undefined);

  const handleGlobalStaffClick = () => {
    if (notesList.length === 1) {
      soundManager.playGuitarNote(notesList[0].frequency);
    } else if (notesList.length > 1) {
      soundManager.playGuitarSequence(notesList.map(n => n.frequency));
    }
    if (onStaffClick) {
      onStaffClick();
    }
  };

  const handleSingleNoteClick = (e: React.MouseEvent, n: GuitarNote, idx: number) => {
    e.stopPropagation();
    soundManager.playGuitarNote(n.frequency);
    if (onNoteClick) {
      onNoteClick(n, idx);
    }
  };

  const getBorderColor = () => {
    if (feedbackState === 'correct') return 'border-emerald-500 ring-2 ring-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-950/20';
    if (feedbackState === 'wrong') return 'border-rose-500 ring-2 ring-rose-500/30 bg-rose-50/50 dark:bg-rose-950/20';
    return 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/90';
  };

  return (
    <div
      id={`music-staff-card-${notesList.map(n => n.id).join('-') || 'empty'}`}
      onClick={interactive ? handleGlobalStaffClick : undefined}
      className={`relative flex flex-col items-center rounded-2xl border shadow-sm transition-all duration-200 select-none ${getBorderColor()} ${
        interactive ? 'cursor-pointer hover:shadow-md hover:border-zinc-300 dark:hover:border-zinc-700' : ''
      } ${className}`}
    >
      {/* Audio hint indicator */}
      {interactive && notesList.length > 0 && (
        <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800/80 rounded-full hover:text-amber-600 dark:hover:text-amber-400 transition-colors">
          {notesList.length > 1 ? (
            <>
              <Play className="w-3 h-3 fill-current" />
              <span>Play Sequence</span>
            </>
          ) : (
            <>
              <Volume2 className="w-3.5 h-3.5" />
              <span>Click to hear</span>
            </>
          )}
        </div>
      )}

      {subTitle && (
        <div className="absolute top-3 left-4 text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
          <span>{subTitle}</span>
        </div>
      )}

      {/* SVG Canvas for Treble Clef and Staff */}
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        className="overflow-visible w-full max-w-full"
        aria-label="Musical staff displaying guitar notes"
      >
        <defs>
          {/* Subtle neon glow for selected active note */}
          <filter id="neon-glow-active" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#0284c7" floodOpacity="0.8" />
            <feDropShadow dx="0" dy="0" stdDeviation="1.5" floodColor="#38bdf8" floodOpacity="0.95" />
          </filter>
        </defs>

        {/* 5 Staff Lines */}
        {[0, 1, 2, 3, 4].map((i) => {
          const y = staffTopY + i * lineSpacing;
          return (
            <g key={`staff-line-${i}`}>
              <line
                x1={staffLeft}
                y1={y}
                x2={staffRight}
                y2={y}
                stroke="currentColor"
                className="text-zinc-700 dark:text-zinc-300"
                strokeWidth="1.6"
                shapeRendering="geometricPrecision"
              />
              {/* Helper text on left */}
              {showHelperLabels && (
                <text
                  x={staffLeft - 8}
                  y={y + 3.5}
                  textAnchor="end"
                  className="fill-zinc-400 dark:fill-zinc-500 text-[10px] font-mono font-medium select-none"
                >
                  {i === 4 ? 'E (L1)' : i === 3 ? 'G (L2)' : i === 2 ? 'B (L3)' : i === 1 ? 'D (L4)' : 'F (L5)'}
                </text>
              )}
            </g>
          );
        })}

        {/* Start barline */}
        <line
          x1={staffLeft}
          y1={staffTopY}
          x2={staffLeft}
          y2={staffBottomY}
          stroke="currentColor"
          className="text-zinc-700 dark:text-zinc-300"
          strokeWidth="2"
        />

        {/* Treble Clef symbol */}
        <text
          x={staffLeft + 6}
          y={staffBottomY - 6}
          className="fill-zinc-800 dark:fill-zinc-200 select-none pointer-events-none font-serif text-[56px]"
          textAnchor="start"
        >
          𝄞
        </text>

        {/* Time signature (2/4 or 4/4) */}
        {derivedTimeSignature && (
          <g className="fill-zinc-800 dark:fill-zinc-200 font-bold select-none pointer-events-none text-center">
            <text
              x={staffLeft + 52}
              y={staffTopY + 20}
              fontSize="20"
              fontWeight="900"
              fontFamily="sans-serif"
              textAnchor="middle"
            >
              {derivedTimeSignature.split('/')[0]}
            </text>
            <text
              x={staffLeft + 52}
              y={staffTopY + 52}
              fontSize="20"
              fontWeight="900"
              fontFamily="sans-serif"
              textAnchor="middle"
            >
              {derivedTimeSignature.split('/')[1]}
            </text>
          </g>
        )}

        {/* End double barline */}
        <line
          x1={staffRight - 4}
          y1={staffTopY}
          x2={staffRight - 4}
          y2={staffBottomY}
          stroke="currentColor"
          className="text-zinc-700 dark:text-zinc-300"
          strokeWidth="1.5"
        />
        <line
          x1={staffRight}
          y1={staffTopY}
          x2={staffRight}
          y2={staffBottomY}
          stroke="currentColor"
          className="text-zinc-700 dark:text-zinc-300"
          strokeWidth="3.5"
        />

        {/* Render Each Note in NotesList */}
        {notesList.map((n, idx) => {
          const noteX = getNoteX(idx, notesList.length);
          const noteY = staffBottomY - n.staffYStep * stepSize;
          const stemDirection = n.staffYStep >= 4 ? 'down' : 'up';

          // Specific note feedback
          const itemFeedback = noteFeedbacks && noteFeedbacks[idx] !== undefined
            ? noteFeedbacks[idx]
            : feedbackState;

          const isActive = activeNoteIndex === idx;

          // Ledger lines logic for this note
          const ledgerLines: number[] = [];
          if (n.staffYStep <= -2) {
            ledgerLines.push(staffBottomY + lineSpacing); // 1st ledger line below
          }
          if (n.staffYStep <= -4) {
            ledgerLines.push(staffBottomY + 2 * lineSpacing); // 2nd ledger line below
          }
          if (n.staffYStep <= -6) {
            ledgerLines.push(staffBottomY + 3 * lineSpacing); // 3rd ledger line below
          }

          // Fill and stroke colors
          let noteColorClass = 'fill-zinc-900 dark:fill-zinc-100 text-zinc-900 dark:text-zinc-100';
          if (itemFeedback === 'correct') {
            noteColorClass = 'fill-emerald-600 dark:fill-emerald-400 text-emerald-600 dark:text-emerald-400';
          } else if (itemFeedback === 'wrong') {
            noteColorClass = 'fill-rose-600 dark:fill-rose-400 text-rose-600 dark:text-rose-400';
          } else if (isActive) {
            noteColorClass = 'fill-blue-900 dark:fill-sky-300 text-blue-900 dark:text-sky-300';
          }

          return (
            <g 
              key={`note-${n.id}-${idx}`}
              onClick={(e) => interactive && handleSingleNoteClick(e, n, idx)}
              className={interactive ? 'cursor-pointer' : ''}
            >
              {/* Active Note Step Indicator Pointer (above staff) */}
              {isActive && (
                <g transform={`translate(${noteX}, ${staffTopY - 26})`}>
                  <rect
                    x="-11"
                    y="0"
                    width="22"
                    height="16"
                    rx="4"
                    className="fill-blue-800 dark:fill-sky-500 shadow-xs"
                  />
                  <text
                    x="0"
                    y="12"
                    textAnchor="middle"
                    className="fill-white font-bold text-[10px]"
                  >
                    {idx + 1}
                  </text>
                  <polygon
                    points="-4,16 4,16 0,20"
                    className="fill-blue-800 dark:fill-sky-500"
                  />
                </g>
              )}

              {/* Ledger Lines for this Note */}
              {ledgerLines.map((ly, lIdx) => (
                <line
                  key={`ledger-${idx}-${lIdx}`}
                  x1={noteX - 16}
                  y1={ly}
                  x2={noteX + 16}
                  y2={ly}
                  stroke="currentColor"
                  className="text-zinc-700 dark:text-zinc-300"
                  strokeWidth="1.8"
                  shapeRendering="geometricPrecision"
                />
              ))}

              {/* Note Head & Stem with optional Neon Glow on selection */}
              <g filter={isActive ? 'url(#neon-glow-active)' : undefined}>
                {/* Note Head: rotated ellipse */}
                <ellipse
                  cx={noteX}
                  cy={noteY}
                  rx={noteRadiusX}
                  ry={noteRadiusY}
                  transform={`rotate(-22 ${noteX} ${noteY})`}
                  className={`${noteColorClass} transition-colors duration-200`}
                />

                {/* Note Stem */}
                {stemDirection === 'up' ? (
                  <line
                    x1={noteX + noteRadiusX - 1.5}
                    y1={noteY - 2}
                    x2={noteX + noteRadiusX - 1.5}
                    y2={noteY - stemLength}
                    stroke="currentColor"
                    className={`${noteColorClass} transition-colors duration-200`}
                    strokeWidth="2.2"
                    strokeLinecap="round"
                  />
                ) : (
                  <line
                    x1={noteX - noteRadiusX + 1.5}
                    y1={noteY + 2}
                    x2={noteX - noteRadiusX + 1.5}
                    y2={noteY + stemLength}
                    stroke="currentColor"
                    className={`${noteColorClass} transition-colors duration-200`}
                    strokeWidth="2.2"
                    strokeLinecap="round"
                  />
                )}
              </g>

              {/* Note Index label under note for multi-note cards */}
              {notesList.length > 1 && (
                <text
                  x={noteX}
                  y={staffBottomY + 36}
                  textAnchor="middle"
                  className={`text-[11px] font-mono font-bold select-none ${
                    isActive
                      ? 'fill-blue-800 dark:fill-sky-400 font-black text-xs'
                      : itemFeedback === 'correct'
                      ? 'fill-emerald-600 dark:fill-emerald-400'
                      : itemFeedback === 'wrong'
                      ? 'fill-rose-600 dark:fill-rose-400'
                      : 'fill-zinc-400 dark:fill-zinc-500'
                  }`}
                >
                  #{idx + 1}
                </text>
              )}
            </g>
          );
        })}
      </svg>

      {/* Optional Note Name & Guitar Info Card Footer (Single note view) */}
      {(showNoteName || showStringFretBadge) && notesList.length === 1 && (
        <div className="w-full px-4 pb-3.5 pt-1 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between gap-2 mt-auto">
          {showNoteName && (
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                {notesList[0].name}
              </span>
              <span className="text-xs font-semibold text-zinc-400 dark:text-zinc-500">
                (Octave {notesList[0].octave})
              </span>
            </div>
          )}

          {showStringFretBadge && (
            <div className="flex items-center gap-2 text-xs">
              <span className="px-2 py-0.5 rounded-md font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                String {notesList[0].stringNumber}
              </span>
              <span className="px-2 py-0.5 rounded-md font-semibold bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
                Fret {notesList[0].fret} {notesList[0].fret === 0 ? '(Open)' : `(Finger ${notesList[0].finger})`}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
