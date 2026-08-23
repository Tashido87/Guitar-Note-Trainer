import React, { useState, useEffect, useRef } from 'react';
import { PICK_STRUM_SONGS } from '../data/pickStrumSongs';
import { GUITAR_OPEN_NOTES } from '../data/notesData';
import { soundManager } from '../utils/audio';
import { PickStrumScoreSheet } from './PickStrumScoreSheet';
import { 
  Play, 
  Square, 
  Volume2, 
  Music2, 
  BookOpen, 
  LayoutGrid, 
  Sparkles, 
  ChevronRight,
  Info,
  Layers,
  RotateCcw
} from 'lucide-react';

interface BassNoteExerciseProps {
  initialBpm?: number;
  onBpmChange?: (bpm: number) => void;
}

export const BassNoteExercise: React.FC<BassNoteExerciseProps> = ({
  initialBpm = 88,
  onBpmChange,
}) => {
  const [selectedSongId, setSelectedSongId] = useState<string>(PICK_STRUM_SONGS[0].id);
  const [viewMode, setViewMode] = useState<'score' | 'cards'>('score');
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeMeasureIdx, setActiveMeasureIdx] = useState(0); // 0 to 7 (8 measures)
  const [currentBeat, setCurrentBeat] = useState(1); // 1, 2, 3, 4
  const [bpm, setBpm] = useState(initialBpm);

  const selectedSong = PICK_STRUM_SONGS.find(s => s.id === selectedSongId) || PICK_STRUM_SONGS[0];
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Synchronize initial BPM with selected song default
  useEffect(() => {
    setBpm(selectedSong.defaultBpm);
  }, [selectedSongId]);

  const handleBpmChange = (newBpm: number) => {
    setBpm(newBpm);
    if (onBpmChange) {
      onBpmChange(newBpm);
    }
  };

  // Play beat sound according to score data
  const playBeatSound = (measureIdx: number, beatNum: number) => {
    const currentMeasure = selectedSong.measures[measureIdx];
    if (!currentMeasure) return;

    const beatData = currentMeasure.beats.find(b => b.beatNumber === beatNum);
    if (!beatData) return;

    if (beatData.type === 'bass') {
      // Pluck single bass string
      if (beatData.frequency) {
        soundManager.playGuitarNote(beatData.frequency, 1.4);
      } else {
        // Fallback search in guitar notes
        const matched = GUITAR_OPEN_NOTES.find(
          n => n.stringNumber === beatData.stringNumber && n.fret === beatData.fret
        );
        soundManager.playGuitarNote(matched ? matched.frequency : 130.81, 1.4);
      }
    } else {
      // Downstrum chord
      soundManager.playChordStrum(currentMeasure.chordName, 0.9);
    }
  };

  useEffect(() => {
    if (isPlaying) {
      const beatIntervalMs = (60 / bpm) * 1000;
      timerRef.current = setInterval(() => {
        setCurrentBeat((prevBeat) => {
          let nextBeat = prevBeat + 1;
          let nextMeasureIdx = activeMeasureIdx;

          if (nextBeat > 4) {
            nextBeat = 1;
            nextMeasureIdx = (activeMeasureIdx + 1) % selectedSong.measures.length;
            setActiveMeasureIdx(nextMeasureIdx);
          }

          playBeatSound(nextMeasureIdx, nextBeat);
          return nextBeat;
        });
      }, beatIntervalMs);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, bpm, activeMeasureIdx, selectedSong]);

  const togglePlay = () => {
    if (!isPlaying) {
      setActiveMeasureIdx(0);
      setCurrentBeat(1);
      playBeatSound(0, 1);
      setIsPlaying(true);
    } else {
      setIsPlaying(false);
    }
  };

  const handleManualBeatClick = (measureIdx: number, beatNum: number) => {
    setActiveMeasureIdx(measureIdx);
    setCurrentBeat(beatNum);
    playBeatSound(measureIdx, beatNum);
  };

  const handleSongSelect = (songId: string) => {
    setIsPlaying(false);
    setSelectedSongId(songId);
    setActiveMeasureIdx(0);
    setCurrentBeat(1);
  };

  const currentMeasure = selectedSong.measures[activeMeasureIdx] || selectedSong.measures[0];
  const currentMeasureBassBeats = currentMeasure.beats.filter(b => b.type === 'bass');

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* 1. Header Banner & Song Selector Bar */}
      <div className="p-4 sm:p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
        {/* Top title and playback control row */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-amber-500 text-zinc-950 shadow-sm">
                Exercise {selectedSong.exerciseNumber}
              </span>
              <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                Key of {selectedSong.key}
              </span>
              <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20">
                {selectedSong.timeSignature} Time
              </span>
            </div>
            <h2 className="text-xl font-black text-zinc-900 dark:text-zinc-100 mt-1">
              {selectedSong.title}
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              {selectedSong.subtitle} &bull; {selectedSong.description}
            </p>
          </div>

          {/* Controls: Tempo slider + Play/Stop + Mode toggle */}
          <div className="flex items-center gap-2.5 flex-wrap">
            {/* View Mode Toggle */}
            <div className="flex items-center bg-white dark:bg-zinc-800 p-1 rounded-xl border border-zinc-200 dark:border-zinc-700 text-xs font-semibold">
              <button
                id="view-mode-score-btn"
                onClick={() => setViewMode('score')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                  viewMode === 'score'
                    ? 'bg-amber-500 text-zinc-950 font-bold shadow-sm'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Book Score + TAB</span>
              </button>
              <button
                id="view-mode-cards-btn"
                onClick={() => setViewMode('cards')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                  viewMode === 'cards'
                    ? 'bg-amber-500 text-zinc-950 font-bold shadow-sm'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Measure Cards</span>
              </button>
            </div>

            {/* Tempo Slider */}
            <div className="flex items-center gap-2 bg-white dark:bg-zinc-800 px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 text-xs font-medium">
              <span className="text-zinc-400">Tempo:</span>
              <span className="font-bold text-zinc-800 dark:text-zinc-200 min-w-[50px]">{bpm} BPM</span>
              <input
                type="range"
                min="50"
                max="130"
                value={bpm}
                onChange={(e) => handleBpmChange(Number(e.target.value))}
                className="w-20 accent-amber-500 cursor-pointer"
              />
            </div>

            {/* Play Button */}
            <button
              id="toggle-pick-strum-audio-btn"
              onClick={togglePlay}
              className={`flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-bold shadow-md transition-all active:scale-95 ${
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
                  <span>Play Score</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Multi-Song Picker Tabs */}
        <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800">
          <div className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-2 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-amber-500" />
            <span>Select Guitar Method Song ({PICK_STRUM_SONGS.length} Studies Available):</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
            {PICK_STRUM_SONGS.map((song) => {
              const isSelected = song.id === selectedSongId;
              return (
                <button
                  key={song.id}
                  id={`select-song-${song.id}`}
                  onClick={() => handleSongSelect(song.id)}
                  className={`flex flex-col text-left p-2.5 rounded-xl border text-xs transition-all ${
                    isSelected
                      ? 'bg-amber-500/10 border-amber-500 ring-2 ring-amber-500/20 text-zinc-900 dark:text-zinc-100 font-bold shadow-sm'
                      : 'bg-white dark:bg-zinc-800/60 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="font-mono text-[10px] text-amber-600 dark:text-amber-400 font-black">
                      Ex. {song.exerciseNumber}
                    </span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-zinc-100 dark:bg-zinc-700 text-zinc-500 dark:text-zinc-400">
                      {song.key}
                    </span>
                  </div>
                  <span className="font-semibold truncate mt-0.5 text-zinc-800 dark:text-zinc-200">
                    {song.title}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 2. Main Practice Score View */}
      {viewMode === 'score' ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-amber-500" />
              <span className="text-sm font-bold text-zinc-800 dark:text-zinc-200">
                Standard Musical Notation & Guitar TAB Engraving
              </span>
            </div>
            <div className="text-xs text-zinc-500">
              Click any note or beat to play and jump cursor
            </div>
          </div>

          <PickStrumScoreSheet
            song={selectedSong}
            activeMeasureIdx={activeMeasureIdx}
            activeBeat={currentBeat}
            isPlaying={isPlaying}
            onBeatClick={handleManualBeatClick}
          />
        </div>
      ) : (
        /* Measure Cards View (Breakout of all 8 measures) */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {selectedSong.measures.map((measure, idx) => {
            const isActive = idx === activeMeasureIdx;
            const bassBeats = measure.beats.filter(b => b.type === 'bass');

            return (
              <div
                key={`measure-card-${idx}`}
                id={`chord-card-${idx}`}
                onClick={() => handleManualBeatClick(idx, 1)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                  isActive
                    ? 'bg-amber-500/10 border-amber-500 ring-2 ring-amber-500/30 shadow-md scale-102'
                    : 'bg-white dark:bg-zinc-900/60 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-lg font-black text-zinc-900 dark:text-zinc-100">
                    {measure.chordName}
                  </span>
                  <span className="px-2 py-0.5 rounded-md text-xs font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                    Measure {measure.measureNumber}
                  </span>
                </div>

                {/* Bass Notes Breakdown */}
                <div className="space-y-1.5 text-xs">
                  {bassBeats.map((bb, bIdx) => (
                    <div key={bIdx} className="flex items-center justify-between text-zinc-600 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-800/40 px-2 py-1 rounded-lg">
                      <span>Beat {bb.beatNumber} Bass:</span>
                      <span className="font-bold text-amber-600 dark:text-amber-400">
                        {bb.noteName} (Str {bb.stringNumber}, Fret {bb.fret})
                      </span>
                    </div>
                  ))}
                </div>

                {/* 4-Beat Visualizer */}
                <div className="grid grid-cols-4 gap-1 mt-3 pt-3 border-t border-zinc-100 dark:border-zinc-800">
                  {measure.beats.map((b) => {
                    const isCurrentBeat = isActive && currentBeat === b.beatNumber && isPlaying;
                    const isBassBeat = b.type === 'bass';

                    return (
                      <div
                        key={b.beatNumber}
                        className={`text-center py-1.5 rounded-lg text-xs font-bold transition-all ${
                          isCurrentBeat
                            ? 'bg-amber-500 text-zinc-950 scale-110 shadow-sm'
                            : isBassBeat
                            ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
                            : 'bg-zinc-50 dark:bg-zinc-800/40 text-zinc-400'
                        }`}
                      >
                        <div>{b.beatNumber}</div>
                        <div className="text-[9px] font-normal uppercase">
                          {isBassBeat ? b.noteName || 'Bass' : 'Strum'}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 3. Technique Master Guide & Audio Sample */}
      <div className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/80 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-0.5">
            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <Music2 className="w-5 h-5 text-amber-500" />
              <span>Measure {currentMeasure.measureNumber} Focus: {currentMeasure.chordName} Alternating Bass</span>
            </h3>
            <p className="text-xs text-zinc-600 dark:text-zinc-400">
              {selectedSong.techniqueTip}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="sample-strum-btn"
              onClick={() => soundManager.playChordStrum(currentMeasure.chordName, 1.2)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-xs font-semibold hover:text-amber-500 transition-colors"
            >
              <Volume2 className="w-4 h-4" />
              <span>Sample {currentMeasure.chordName} Strum</span>
            </button>
          </div>
        </div>

        {/* Measure Rhythm & Fret Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 font-mono text-xs">
          {currentMeasure.beats.map((beat) => (
            <div
              key={`technique-beat-${beat.beatNumber}`}
              className={`p-3 rounded-xl border transition-all ${
                currentBeat === beat.beatNumber && isPlaying
                  ? 'bg-amber-500/10 border-amber-500 text-zinc-900 dark:text-zinc-100'
                  : 'bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-amber-500">Beat {beat.beatNumber}</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-zinc-200 dark:bg-zinc-800">
                  {beat.type === 'bass' ? 'PICK BASS' : 'DOWNSTRUM'}
                </span>
              </div>
              {beat.type === 'bass' ? (
                <div className="space-y-0.5 text-[11px]">
                  <div>Note: <span className="font-bold text-sky-600 dark:text-sky-400">{beat.noteName}</span></div>
                  <div>Guitar: String {beat.stringNumber} (Fret {beat.fret})</div>
                  <div>Finger: {beat.finger === 0 ? 'Open String' : `Finger ${beat.finger}`}</div>
                </div>
              ) : (
                <div className="space-y-0.5 text-[11px] text-zinc-500">
                  <div>Action: Down-Bow (V)</div>
                  <div>Strum: Higher strings</div>
                  <div>Chord: {currentMeasure.chordName}</div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
