import React, { useState } from 'react';
import { GUITAR_OPEN_NOTES } from '../data/notesData';
import { GuitarNote } from '../types';
import { MusicStaff } from './MusicStaff';
import { InteractiveFretboard } from './InteractiveFretboard';
import { soundManager } from '../utils/audio';
import { Play, Sparkles, BookOpen, Lightbulb, Music } from 'lucide-react';

export const ReferenceChart: React.FC = () => {
  const [selectedNote, setSelectedNote] = useState<GuitarNote>(GUITAR_OPEN_NOTES[0]);
  const [activeStringFilter, setActiveStringFilter] = useState<number | null>(null);
  const [isPlayingAll, setIsPlayingAll] = useState(false);

  const filteredNotes = activeStringFilter === null
    ? GUITAR_OPEN_NOTES
    : GUITAR_OPEN_NOTES.filter(n => n.stringNumber === activeStringFilter);

  const handlePlaySequence = async () => {
    if (isPlayingAll) return;
    setIsPlayingAll(true);
    for (let i = 0; i < GUITAR_OPEN_NOTES.length; i++) {
      const n = GUITAR_OPEN_NOTES[i];
      setSelectedNote(n);
      soundManager.playGuitarNote(n.frequency, 0.7);
      await new Promise((res) => setTimeout(res, 550));
    }
    setIsPlayingAll(false);
  };

  const handleSelectNote = (n: GuitarNote) => {
    setSelectedNote(n);
    soundManager.playGuitarNote(n.frequency);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-amber-500" />
            Note Summary: Open Position
          </h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
            The fundamental 17 notes across all 6 guitar strings in 1st position (Frets 0–3)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="play-all-sequence-btn"
            type="button"
            onClick={handlePlaySequence}
            disabled={isPlayingAll}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-amber-500 hover:bg-amber-600 active:scale-95 text-zinc-950 shadow-sm transition-all disabled:opacity-50"
          >
            <Play className={`w-4 h-4 ${isPlayingAll ? 'animate-spin' : 'fill-current'}`} />
            {isPlayingAll ? 'Playing Scale...' : 'Play Ascending Scale'}
          </button>
        </div>
      </div>

      {/* String Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mr-1">Filter:</span>
        <button
          id="filter-all-strings"
          onClick={() => setActiveStringFilter(null)}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
            activeStringFilter === null
              ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 shadow-sm'
              : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200'
          }`}
        >
          All 6 Strings (17 Notes)
        </button>
        {[6, 5, 4, 3, 2, 1].map((sNum) => {
          const stringNames: Record<number, string> = {
            6: '6th (Low E)',
            5: '5th (A)',
            4: '4th (D)',
            3: '3rd (G)',
            2: '2nd (B)',
            1: '1st (High E)',
          };
          return (
            <button
              key={`filter-str-${sNum}`}
              id={`filter-str-btn-${sNum}`}
              onClick={() => setActiveStringFilter(sNum)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                activeStringFilter === sNum
                  ? 'bg-amber-500 text-zinc-950 font-bold shadow-sm'
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
              }`}
            >
              {stringNames[sNum]}
            </button>
          );
        })}
      </div>

      {/* Note Ribbon (The Sequential Table from User's Book) */}
      <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/70 p-4 shadow-sm overflow-x-auto">
        <div className="min-w-[700px]">
          <div className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2 flex items-center justify-between">
            <span>Ascending Open Position Progression (Low to High)</span>
            <span className="text-[11px] font-normal text-zinc-400">Click any note to preview</span>
          </div>

          <div className="grid grid-cols-17 gap-1.5 items-stretch">
            {GUITAR_OPEN_NOTES.map((n) => {
              const isSelected = selectedNote.id === n.id;
              const isDimmed = activeStringFilter !== null && n.stringNumber !== activeStringFilter;

              return (
                <button
                  key={n.id}
                  id={`note-ribbon-${n.id}`}
                  onClick={() => handleSelectNote(n)}
                  className={`flex flex-col items-center py-2 px-1 rounded-xl border transition-all ${
                    isDimmed
                      ? 'opacity-30 border-transparent bg-zinc-50 dark:bg-zinc-800/40'
                      : isSelected
                      ? 'bg-amber-500/15 border-amber-500 ring-2 ring-amber-500/30 scale-105 shadow-md z-10'
                      : 'bg-zinc-50 dark:bg-zinc-800/60 border-zinc-200 dark:border-zinc-700/60 hover:border-amber-400 hover:bg-amber-50/50 dark:hover:bg-zinc-800'
                  }`}
                >
                  <span className={`text-base font-extrabold ${isSelected ? 'text-amber-600 dark:text-amber-400' : 'text-zinc-800 dark:text-zinc-200'}`}>
                    {n.name}
                  </span>
                  <span className="text-[10px] text-zinc-400 font-mono mt-0.5">
                    Str {n.stringNumber}
                  </span>
                  <span className="text-[10px] font-semibold text-zinc-600 dark:text-zinc-300">
                    Fret {n.fret}
                  </span>
                  <span className="text-[9px] text-zinc-400">
                    {n.finger === 0 ? 'Open' : `Fing ${n.finger}`}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Focused Note Inspector Split View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left: Musical Staff for Focused Note */}
        <div className="lg:col-span-5 flex flex-col">
          <MusicStaff
            note={selectedNote}
            showHelperLabels={true}
            showNoteName={true}
            showStringFretBadge={true}
            subTitle="Sheet Music Notation"
            className="flex-1"
          />
        </div>

        {/* Right: Fretboard highlight & Mnemonic Card */}
        <div className="lg:col-span-7 flex flex-col justify-between gap-4">
          <InteractiveFretboard
            highlightNote={selectedNote}
            filterString={activeStringFilter}
            interactive={true}
            showAllNoteLabels={true}
            onSelectFret={(s, f) => {
              const matched = GUITAR_OPEN_NOTES.find(n => n.stringNumber === s && n.fret === f);
              if (matched) setSelectedNote(matched);
            }}
          />

          {/* Mnemonic & Technique Card */}
          <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-amber-50/50 dark:bg-amber-950/20 p-4">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                <Lightbulb className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                  Memory Trick for Note {selectedNote.name}
                  <span className="text-xs font-normal px-2 py-0.5 rounded-full bg-amber-200/60 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200">
                    {selectedNote.stringName}
                  </span>
                </h4>
                <p className="text-xs text-zinc-600 dark:text-zinc-300">
                  {selectedNote.mnemonicHint}
                </p>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 pt-0.5">
                  <strong>Staff Location:</strong> {selectedNote.staffDescription}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Memory Rules Cheat Sheet */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60">
          <div className="flex items-center gap-2 text-sm font-bold text-zinc-900 dark:text-zinc-100 mb-2">
            <Music className="w-4 h-4 text-emerald-500" />
            5 Staff Lines (Bottom to Top)
          </div>
          <p className="text-xs text-zinc-600 dark:text-zinc-400 font-mono font-semibold mb-1">
            E - G - B - D - F
          </p>
          <p className="text-xs text-zinc-500">
            Mnemonic: <em>"<strong>E</strong>very <strong>G</strong>ood <strong>B</strong>oy <strong>D</strong>oes <strong>F</strong>ine"</em>
          </p>
        </div>

        <div className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60">
          <div className="flex items-center gap-2 text-sm font-bold text-zinc-900 dark:text-zinc-100 mb-2">
            <Sparkles className="w-4 h-4 text-sky-500" />
            4 Staff Spaces (Bottom to Top)
          </div>
          <p className="text-xs text-zinc-600 dark:text-zinc-400 font-mono font-semibold mb-1">
            F - A - C - E
          </p>
          <p className="text-xs text-zinc-500">
            Mnemonic: Spells the word <em>"<strong>FACE</strong>"</em>
          </p>
        </div>

        <div className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60">
          <div className="flex items-center gap-2 text-sm font-bold text-zinc-900 dark:text-zinc-100 mb-2">
            <BookOpen className="w-4 h-4 text-amber-500" />
            Bass Ledger Lines (Below Staff)
          </div>
          <ul className="text-xs text-zinc-600 dark:text-zinc-400 space-y-0.5">
            <li>• <strong>1 line:</strong> Middle C (String 5, Fret 3)</li>
            <li>• <strong>2 lines:</strong> A (Open 5th string)</li>
            <li>• <strong>3 lines:</strong> Low F & E (String 6)</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
