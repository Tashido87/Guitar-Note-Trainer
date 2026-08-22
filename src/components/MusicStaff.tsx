import React from 'react';
import { GuitarNote } from '../types';
import { soundManager } from '../utils/audio';
import { Volume2 } from 'lucide-react';

interface MusicStaffProps {
  note: GuitarNote | null;
  showHelperLabels?: boolean;
  showNoteName?: boolean;
  showStringFretBadge?: boolean;
  feedbackState?: 'correct' | 'wrong' | 'idle';
  interactive?: boolean;
  onStaffClick?: () => void;
  width?: number;
  height?: number;
  className?: string;
  subTitle?: string;
}

export const MusicStaff: React.FC<MusicStaffProps> = ({
  note,
  showHelperLabels = false,
  showNoteName = false,
  showStringFretBadge = false,
  feedbackState = 'idle',
  interactive = true,
  onStaffClick,
  width = 380,
  height = 230,
  className = '',
  subTitle,
}) => {
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
  const noteX = width / 2;
  const noteY = note ? staffBottomY - note.staffYStep * stepSize : 0;

  // Stem calculation: if step >= 4 (B4 middle line or above), stem goes down from left of head.
  // If step < 4, stem goes up from right of head.
  const stemDirection = note && note.staffYStep >= 4 ? 'down' : 'up';
  const stemLength = 36;
  const noteRadiusX = 8.5;
  const noteRadiusY = 6.2;

  // Ledger lines logic
  // For notes below staff:
  // Step -2 (C4): 1 ledger line at y = staffBottomY + 1 * lineSpacing (150)
  // Step -3 (B3): 1 ledger line at y = 150 (note hangs below it)
  // Step -4 (A3): 2 ledger lines at y = 150, 166
  // Step -5 (G3): 2 ledger lines at y = 150, 166 (note hangs below 2nd)
  // Step -6 (F3): 3 ledger lines at y = 150, 166, 182
  // Step -7 (E3): 3 ledger lines at y = 150, 166, 182 (note hangs below 3rd)
  const ledgerLines: number[] = [];
  if (note) {
    if (note.staffYStep <= -2) {
      ledgerLines.push(staffBottomY + lineSpacing); // 1st ledger line below
    }
    if (note.staffYStep <= -4) {
      ledgerLines.push(staffBottomY + 2 * lineSpacing); // 2nd ledger line below
    }
    if (note.staffYStep <= -6) {
      ledgerLines.push(staffBottomY + 3 * lineSpacing); // 3rd ledger line below
    }
  }

  const handlePlaySound = () => {
    if (note) {
      soundManager.playGuitarNote(note.frequency);
    }
    if (onStaffClick) {
      onStaffClick();
    }
  };

  const getBorderColor = () => {
    if (feedbackState === 'correct') return 'border-emerald-500 ring-2 ring-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-950/20';
    if (feedbackState === 'wrong') return 'border-rose-500 ring-2 ring-rose-500/30 bg-rose-50/50 dark:bg-rose-950/20';
    return 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/90';
  };

  return (
    <div
      id={`music-staff-card-${note?.id || 'empty'}`}
      onClick={interactive ? handlePlaySound : undefined}
      className={`relative flex flex-col items-center rounded-2xl border shadow-sm transition-all duration-200 select-none ${getBorderColor()} ${
        interactive ? 'cursor-pointer hover:shadow-md hover:border-zinc-300 dark:hover:border-zinc-700' : ''
      } ${className}`}
    >
      {/* Audio hint indicator */}
      {interactive && note && (
        <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800/80 rounded-full hover:text-amber-600 dark:hover:text-amber-400 transition-colors">
          <Volume2 className="w-3.5 h-3.5" />
          <span>Click to hear</span>
        </div>
      )}

      {subTitle && (
        <div className="absolute top-3 left-4 text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
          {subTitle}
        </div>
      )}

      {/* SVG Canvas for Treble Clef and Staff */}
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        className="overflow-visible"
        aria-label={note ? `Musical staff displaying note ${note.name}` : 'Empty musical staff'}
      >
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
              {/* Optional helper text on left */}
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

        {/* Ledger Lines for this Note */}
        {ledgerLines.map((ly, idx) => (
          <line
            key={`ledger-${idx}`}
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

        {/* The Musical Note */}
        {note && (
          <g>
            {/* Note Head: rotated ellipse */}
            <ellipse
              cx={noteX}
              cy={noteY}
              rx={noteRadiusX}
              ry={noteRadiusY}
              transform={`rotate(-22 ${noteX} ${noteY})`}
              className={`${
                feedbackState === 'correct'
                  ? 'fill-emerald-600 dark:fill-emerald-400'
                  : feedbackState === 'wrong'
                  ? 'fill-rose-600 dark:fill-rose-400'
                  : 'fill-zinc-900 dark:fill-zinc-100'
              } transition-colors duration-200`}
            />

            {/* Note Stem */}
            {stemDirection === 'up' ? (
              <line
                x1={noteX + noteRadiusX - 1.5}
                y1={noteY - 2}
                x2={noteX + noteRadiusX - 1.5}
                y2={noteY - stemLength}
                stroke="currentColor"
                className={`${
                  feedbackState === 'correct'
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : feedbackState === 'wrong'
                    ? 'text-rose-600 dark:text-rose-400'
                    : 'text-zinc-900 dark:text-zinc-100'
                } transition-colors duration-200`}
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
                className={`${
                  feedbackState === 'correct'
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : feedbackState === 'wrong'
                    ? 'text-rose-600 dark:text-rose-400'
                    : 'text-zinc-900 dark:text-zinc-100'
                } transition-colors duration-200`}
                strokeWidth="2.2"
                strokeLinecap="round"
              />
            )}
          </g>
        )}
      </svg>

      {/* Optional Note Name & Guitar Info Card Footer */}
      {(showNoteName || showStringFretBadge) && note && (
        <div className="w-full px-4 pb-3.5 pt-1 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between gap-2 mt-auto">
          {showNoteName && (
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                {note.name}
              </span>
              <span className="text-xs font-semibold text-zinc-400 dark:text-zinc-500">
                (Octave {note.octave})
              </span>
            </div>
          )}

          {showStringFretBadge && (
            <div className="flex items-center gap-2 text-xs">
              <span className="px-2 py-0.5 rounded-md font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                String {note.stringNumber}
              </span>
              <span className="px-2 py-0.5 rounded-md font-semibold bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
                Fret {note.fret} {note.fret === 0 ? '(Open)' : `(Finger ${note.finger})`}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
