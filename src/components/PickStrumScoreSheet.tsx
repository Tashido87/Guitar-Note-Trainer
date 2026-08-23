import React from 'react';
import { PickStrumSong, ScoreMeasure, ScoreBeat } from '../types';

interface PickStrumScoreSheetProps {
  song: PickStrumSong;
  activeMeasureIdx: number;
  activeBeat: number;
  isPlaying: boolean;
  onBeatClick?: (measureIdx: number, beatNumber: number) => void;
}

export const PickStrumScoreSheet: React.FC<PickStrumScoreSheetProps> = ({
  song,
  activeMeasureIdx,
  activeBeat,
  isPlaying,
  onBeatClick,
}) => {
  // Split measures into 2 systems (4 measures per system)
  const system1Measures = song.measures.slice(0, 4);
  const system2Measures = song.measures.slice(4, 8);

  // SVG Dimension Metrics
  const svgWidth = 920;
  const systemHeight = 220;
  const leftMargin = 64;
  const rightMargin = 20;
  const usableWidth = svgWidth - leftMargin - rightMargin;
  const measureWidth = usableWidth / 4;

  // Vertical Staff Metrics
  // Staff 1 (Standard Notation)
  const staffTopY = 48;
  const lineSpacing = 10;
  const staffBottomY = staffTopY + 4 * lineSpacing; // 88

  // Staff 2 (TAB)
  const tabTopY = 120;
  const tabLineSpacing = 10;
  const tabBottomY = tabTopY + 5 * tabLineSpacing; // 170

  // Calculate note Y position based on staffYStep (0 = E4 bottom line)
  // Step 0 -> y = staffBottomY (88)
  // Step 1 -> y = staffBottomY - 5 (83)
  // Step 2 -> y = staffBottomY - 10 (78)
  // Step -1 -> y = staffBottomY + 5 (93)
  // Step -2 (Middle C) -> y = staffBottomY + 10 (98)
  // Step -3 (B3) -> y = staffBottomY + 15 (103)
  // Step -4 (A3) -> y = staffBottomY + 20 (108)
  // Step -5 (G3/G2) -> y = staffBottomY + 25 (113)
  // Step -7 (Low E) -> y = staffBottomY + 35 (123)
  const getNoteY = (step: number = 0) => {
    return staffBottomY - step * (lineSpacing / 2);
  };

  // TAB string Y position (String 1 high E = tabTopY, String 6 low E = tabBottomY)
  const getTabStringY = (stringNum: number = 1) => {
    return tabTopY + (stringNum - 1) * tabLineSpacing;
  };

  // Render a Single System (4 measures)
  const renderSystem = (
    measures: ScoreMeasure[],
    systemIdx: number,
    startMeasureNum: number
  ) => {
    const isSystem2 = systemIdx === 1;

    return (
      <svg
        key={`system-${systemIdx}`}
        viewBox={`0 0 ${svgWidth} ${systemHeight}`}
        className="w-full h-auto select-none overflow-visible"
        aria-label={`Score system ${systemIdx + 1}`}
      >
        <defs>
          <filter id={`neon-glow-beat-${systemIdx}`} x="-40%" y="-40%" width="180%" height="180%">
            <feDropShadow dx="0" dy="0" stdDeviation="3.5" floodColor="#0284c7" floodOpacity="0.9" />
            <feDropShadow dx="0" dy="0" stdDeviation="1" floodColor="#38bdf8" floodOpacity="1" />
          </filter>
        </defs>

        {/* --- Background Guide Frame --- */}
        <rect
          x="2"
          y="6"
          width={svgWidth - 4}
          height={systemHeight - 12}
          rx="12"
          className="fill-stone-50/70 dark:fill-stone-900/40 stroke-stone-200/60 dark:stroke-stone-800/60"
        />

        {/* --- 1. Standard Notation 5-Lines Staff --- */}
        {[0, 1, 2, 3, 4].map((i) => {
          const y = staffTopY + i * lineSpacing;
          return (
            <line
              key={`staff-line-${i}`}
              x1={leftMargin}
              y1={y}
              x2={svgWidth - rightMargin}
              y2={y}
              className="stroke-stone-700 dark:stroke-stone-400"
              strokeWidth="1.2"
            />
          );
        })}

        {/* Treble Clef at start of system */}
        <g transform={`translate(${leftMargin - 46}, ${staffTopY + 36})`}>
          <text
            x="0"
            y="0"
            fontFamily="'Times New Roman', serif"
            fontSize="46"
            className="fill-stone-900 dark:fill-stone-100 select-none font-bold"
          >
            𝄞
          </text>
        </g>

        {/* Time Signature (4/4) only on System 1 */}
        {!isSystem2 && (
          <g transform={`translate(${leftMargin - 16}, ${staffTopY + 16})`}>
            <text
              x="0"
              y="0"
              fontFamily="'Times New Roman', serif"
              fontSize="20"
              fontWeight="bold"
              className="fill-stone-900 dark:fill-stone-100"
            >
              4
            </text>
            <text
              x="0"
              y="20"
              fontFamily="'Times New Roman', serif"
              fontSize="20"
              fontWeight="bold"
              className="fill-stone-900 dark:fill-stone-100"
            >
              4
            </text>
          </g>
        )}

        {/* --- 2. TAB 6-Lines Staff --- */}
        {[0, 1, 2, 3, 4, 5].map((i) => {
          const y = tabTopY + i * tabLineSpacing;
          return (
            <line
              key={`tab-line-${i}`}
              x1={leftMargin}
              y1={y}
              x2={svgWidth - rightMargin}
              y2={y}
              className="stroke-stone-500 dark:stroke-stone-500"
              strokeWidth="1.0"
            />
          );
        })}

        {/* TAB Vertical Text Header */}
        <g transform={`translate(${leftMargin - 36}, ${tabTopY + 10})`}>
          <text x="0" y="0" fontFamily="sans-serif" fontSize="13" fontWeight="900" className="fill-stone-800 dark:fill-stone-200">T</text>
          <text x="0" y="16" fontFamily="sans-serif" fontSize="13" fontWeight="900" className="fill-stone-800 dark:fill-stone-200">A</text>
          <text x="0" y="32" fontFamily="sans-serif" fontSize="13" fontWeight="900" className="fill-stone-800 dark:fill-stone-200">B</text>
        </g>

        {/* Initial Left Barline Connecting Standard Staff and TAB */}
        <line
          x1={leftMargin}
          y1={staffTopY}
          x2={leftMargin}
          y2={tabBottomY}
          className="stroke-stone-700 dark:stroke-stone-400"
          strokeWidth="1.6"
        />

        {/* --- 3. Measure Columns & Notes --- */}
        {measures.map((measure, mIdx) => {
          const globalMeasureIdx = systemIdx * 4 + mIdx;
          const measureX = leftMargin + mIdx * measureWidth;
          const isMeasureActive = isPlaying && activeMeasureIdx === globalMeasureIdx;

          return (
            <g key={`measure-${measure.measureNumber}`}>
              {/* Measure Highlight background when active */}
              {isMeasureActive && (
                <rect
                  x={measureX}
                  y={staffTopY - 26}
                  width={measureWidth}
                  height={tabBottomY - staffTopY + 44}
                  rx="6"
                  className="fill-sky-500/10 dark:fill-sky-400/15 stroke-sky-500/30 stroke-1"
                />
              )}

              {/* Chord Name Header above Measure */}
              <text
                x={measureX + measureWidth * 0.48}
                y={staffTopY - 14}
                textAnchor="middle"
                className={`font-sans font-black text-base select-none transition-colors ${
                  isMeasureActive
                    ? 'fill-sky-600 dark:fill-sky-400 scale-105'
                    : 'fill-stone-900 dark:fill-stone-100'
                }`}
              >
                {measure.chordName}
              </text>

              {/* Measure Number Badge */}
              <text
                x={measureX + 8}
                y={staffTopY - 14}
                className="font-mono text-[10px] font-bold fill-stone-400 dark:fill-stone-500"
              >
                M{measure.measureNumber}
              </text>

              {/* Measure Barlines */}
              {/* Right measure barline */}
              {mIdx < 3 ? (
                <line
                  x1={measureX + measureWidth}
                  y1={staffTopY}
                  x2={measureX + measureWidth}
                  y2={staffBottomY}
                  className="stroke-stone-600 dark:stroke-stone-400"
                  strokeWidth="1.2"
                />
              ) : null}
              {mIdx < 3 ? (
                <line
                  x1={measureX + measureWidth}
                  y1={tabTopY}
                  x2={measureX + measureWidth}
                  y2={tabBottomY}
                  className="stroke-stone-600 dark:stroke-stone-400"
                  strokeWidth="1.2"
                />
              ) : null}

              {/* End of System Barline / Repeat Sign */}
              {mIdx === 3 && (
                <>
                  {isSystem2 && song.hasRepeat ? (
                    // Double barline with repeat dots (:||)
                    <g transform={`translate(${svgWidth - rightMargin}, 0)`}>
                      <line x1="-8" y1={staffTopY} x2="-8" y2={staffBottomY} className="stroke-stone-700 dark:stroke-stone-300" strokeWidth="1.5" />
                      <line x1="-2" y1={staffTopY} x2="-2" y2={staffBottomY} className="stroke-stone-700 dark:stroke-stone-300" strokeWidth="3.5" />
                      {/* Repeat dots on Staff */}
                      <circle cx="-13" cy={staffTopY + 1.5 * lineSpacing} r="2.2" className="fill-stone-900 dark:fill-stone-100" />
                      <circle cx="-13" cy={staffTopY + 2.5 * lineSpacing} r="2.2" className="fill-stone-900 dark:fill-stone-100" />

                      {/* TAB repeat */}
                      <line x1="-8" y1={tabTopY} x2="-8" y2={tabBottomY} className="stroke-stone-700 dark:stroke-stone-300" strokeWidth="1.5" />
                      <line x1="-2" y1={tabTopY} x2="-2" y2={tabBottomY} className="stroke-stone-700 dark:stroke-stone-300" strokeWidth="3.5" />
                      <circle cx="-13" cy={tabTopY + 2 * tabLineSpacing} r="2.2" className="fill-stone-900 dark:fill-stone-100" />
                      <circle cx="-13" cy={tabTopY + 3 * tabLineSpacing} r="2.2" className="fill-stone-900 dark:fill-stone-100" />
                    </g>
                  ) : (
                    // Regular end-of-system barline
                    <g transform={`translate(${svgWidth - rightMargin}, 0)`}>
                      <line x1="0" y1={staffTopY} x2="0" y2={staffBottomY} className="stroke-stone-700 dark:stroke-stone-400" strokeWidth="1.5" />
                      <line x1="0" y1={tabTopY} x2="0" y2={tabBottomY} className="stroke-stone-700 dark:stroke-stone-400" strokeWidth="1.5" />
                    </g>
                  )}
                </>
              )}

              {/* 4 Beats per Measure */}
              {measure.beats.map((beat) => {
                const beatSlotX = measureX + (beat.beatNumber - 0.5) * (measureWidth / 4);
                const isBeatActive = isMeasureActive && activeBeat === beat.beatNumber;

                return (
                  <g
                    key={`beat-${beat.beatNumber}`}
                    className="cursor-pointer group"
                    onClick={() => onBeatClick && onBeatClick(globalMeasureIdx, beat.beatNumber)}
                  >
                    {/* Active Beat Glow Pillar */}
                    {isBeatActive && (
                      <rect
                        x={beatSlotX - measureWidth / 8 + 2}
                        y={staffTopY - 6}
                        width={measureWidth / 4 - 4}
                        height={tabBottomY - staffTopY + 16}
                        rx="4"
                        className="fill-sky-500/20 dark:fill-sky-400/25 transition-all"
                      />
                    )}

                    {/* --- A. STANDARD NOTATION ITEM --- */}
                    {beat.type === 'bass' ? (
                      // BASS QUARTER NOTE ON STAFF
                      (() => {
                        const noteY = getNoteY(beat.staffYStep || 0);
                        const isHighNote = (beat.staffYStep || 0) >= 4;
                        const stemUp = !isHighNote; // stems point up for lower guitar notes
                        const stemLength = 26;

                        return (
                          <g filter={isBeatActive ? `url(#neon-glow-beat-${systemIdx})` : undefined}>
                            {/* Ledger Lines below staff (for Middle C, Bass G, B, etc.) */}
                            {beat.ledgerLinesBelow && beat.ledgerLinesBelow > 0 && (
                              <g>
                                {[1, 2, 3].slice(0, beat.ledgerLinesBelow).map((lNum) => {
                                  const lY = staffBottomY + lNum * lineSpacing;
                                  return (
                                    <line
                                      key={`ledger-${lNum}`}
                                      x1={beatSlotX - 9}
                                      y1={lY}
                                      x2={beatSlotX + 9}
                                      y2={lY}
                                      className={isBeatActive ? 'stroke-sky-600 dark:stroke-sky-300' : 'stroke-stone-700 dark:stroke-stone-300'}
                                      strokeWidth="1.4"
                                    />
                                  );
                                })}
                              </g>
                            )}

                            {/* Note Head: Rotated Ellipse */}
                            <ellipse
                              cx={beatSlotX}
                              cy={noteY}
                              rx={5.4}
                              ry={3.8}
                              transform={`rotate(-22 ${beatSlotX} ${noteY})`}
                              className={`transition-colors ${
                                isBeatActive
                                  ? 'fill-sky-600 dark:fill-sky-300'
                                  : 'fill-stone-900 dark:fill-stone-100 group-hover:fill-sky-600'
                              }`}
                            />

                            {/* Quarter Note Stem */}
                            {stemUp ? (
                              <line
                                x1={beatSlotX + 5.0}
                                y1={noteY - 1}
                                x2={beatSlotX + 5.0}
                                y2={noteY - stemLength}
                                className={`transition-colors ${
                                  isBeatActive
                                    ? 'stroke-sky-600 dark:stroke-sky-300'
                                    : 'stroke-stone-900 dark:stroke-stone-100 group-hover:stroke-sky-600'
                                }`}
                                strokeWidth="1.6"
                              />
                            ) : (
                              <line
                                x1={beatSlotX - 5.0}
                                y1={noteY + 1}
                                x2={beatSlotX - 5.0}
                                y2={noteY + stemLength}
                                className={`transition-colors ${
                                  isBeatActive
                                    ? 'stroke-sky-600 dark:stroke-sky-300'
                                    : 'stroke-stone-900 dark:stroke-stone-100 group-hover:stroke-sky-600'
                                }`}
                                strokeWidth="1.6"
                              />
                            )}
                          </g>
                        );
                      })()
                    ) : (
                      // STRUM SYMBOL ON STAFF ("V" Downstrum Sign)
                      <g
                        transform={`translate(${beatSlotX}, ${staffTopY + 2 * lineSpacing})`}
                        filter={isBeatActive ? `url(#neon-glow-beat-${systemIdx})` : undefined}
                      >
                        <text
                          x="0"
                          y="6"
                          textAnchor="middle"
                          fontFamily="sans-serif"
                          fontSize="18"
                          fontWeight="900"
                          className={`select-none transition-colors ${
                            isBeatActive
                              ? 'fill-sky-600 dark:fill-sky-300'
                              : 'fill-stone-800 dark:fill-stone-200 group-hover:fill-amber-500'
                          }`}
                        >
                          V
                        </text>
                      </g>
                    )}

                    {/* --- B. GUITAR TAB ITEM --- */}
                    {beat.type === 'bass' ? (
                      // FRET NUMBER ON TAB STRING
                      (() => {
                        const stringY = getTabStringY(beat.stringNumber || 5);
                        return (
                          <g filter={isBeatActive ? `url(#neon-glow-beat-${systemIdx})` : undefined}>
                            {/* White/Dark Background Patch behind number */}
                            <rect
                              x={beatSlotX - 6}
                              y={stringY - 6.5}
                              width="12"
                              height="13"
                              rx="2"
                              className="fill-stone-50 dark:fill-stone-900"
                            />
                            <text
                              x={beatSlotX}
                              y={stringY + 4}
                              textAnchor="middle"
                              fontFamily="monospace"
                              fontSize="13"
                              fontWeight="900"
                              className={`transition-colors select-none ${
                                isBeatActive
                                  ? 'fill-sky-600 dark:fill-sky-300'
                                  : 'fill-stone-900 dark:fill-stone-100 group-hover:fill-sky-600'
                              }`}
                            >
                              {beat.fret}
                            </text>
                          </g>
                        );
                      })()
                    ) : (
                      // DOWNSTRUM "V" ON TAB
                      <g
                        transform={`translate(${beatSlotX}, ${tabTopY + 2.5 * tabLineSpacing})`}
                        filter={isBeatActive ? `url(#neon-glow-beat-${systemIdx})` : undefined}
                      >
                        <rect
                          x="-6"
                          y="-7"
                          width="12"
                          height="14"
                          rx="2"
                          className="fill-stone-50 dark:fill-stone-900"
                        />
                        <text
                          x="0"
                          y="4"
                          textAnchor="middle"
                          fontFamily="sans-serif"
                          fontSize="13"
                          fontWeight="900"
                          className={`transition-colors select-none ${
                            isBeatActive
                              ? 'fill-sky-600 dark:fill-sky-300'
                              : 'fill-stone-800 dark:fill-stone-200 group-hover:fill-amber-500'
                          }`}
                        >
                          V
                        </text>
                      </g>
                    )}
                  </g>
                );
              })}

              {/* Count label below Measure 1 on System 1 */}
              {!isSystem2 && mIdx === 0 && (
                <g transform={`translate(${measureX}, ${tabBottomY + 22})`}>
                  <text x="0" y="0" fontFamily="sans-serif" fontSize="11" fontWeight="bold" className="fill-stone-600 dark:fill-stone-400">
                    COUNT
                  </text>
                  <text x={measureWidth * 0.22} y="0" fontFamily="sans-serif" fontSize="11" fontWeight="bold" className="fill-stone-900 dark:fill-stone-100">1</text>
                  <text x={measureWidth * 0.44} y="0" fontFamily="sans-serif" fontSize="11" fontWeight="bold" className="fill-stone-900 dark:fill-stone-100">2</text>
                  <text x={measureWidth * 0.68} y="0" fontFamily="sans-serif" fontSize="11" fontWeight="bold" className="fill-stone-900 dark:fill-stone-100">3</text>
                  <text x={measureWidth * 0.90} y="0" fontFamily="sans-serif" fontSize="11" fontWeight="bold" className="fill-stone-900 dark:fill-stone-100">4</text>
                </g>
              )}
            </g>
          );
        })}
      </svg>
    );
  };

  return (
    <div className="space-y-6">
      {/* System 1 (Measures 1 - 4) */}
      <div className="p-3 sm:p-4 rounded-2xl bg-white dark:bg-stone-900/90 border border-stone-200 dark:border-stone-800 shadow-sm overflow-x-auto">
        <div className="min-w-[640px]">
          {renderSystem(system1Measures, 0, 1)}
        </div>
      </div>

      {/* System 2 (Measures 5 - 8) */}
      <div className="p-3 sm:p-4 rounded-2xl bg-white dark:bg-stone-900/90 border border-stone-200 dark:border-stone-800 shadow-sm overflow-x-auto">
        <div className="min-w-[640px]">
          {renderSystem(system2Measures, 1, 5)}
        </div>
      </div>
    </div>
  );
};
