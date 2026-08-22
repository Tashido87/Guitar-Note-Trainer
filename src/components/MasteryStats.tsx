import React, { useState, useRef } from 'react';
import { GameStats } from '../types';
import { GUITAR_OPEN_NOTES } from '../data/notesData';
import { 
  Trophy, 
  Target, 
  Award, 
  RotateCcw, 
  CheckCircle2, 
  Flame, 
  Calendar, 
  Zap, 
  Crosshair, 
  Download, 
  Upload, 
  Clock, 
  HardDrive,
  Heart,
  Timer
} from 'lucide-react';
import { exportDataAsJson, StoredGameStats, UserPreferences } from '../utils/storage';

interface MasteryStatsProps {
  stats: GameStats;
  preferences: UserPreferences;
  onResetStats: () => void;
  onImportData: (importedStats: StoredGameStats, importedPrefs?: UserPreferences) => void;
}

export const MasteryStats: React.FC<MasteryStatsProps> = ({
  stats,
  preferences,
  onResetStats,
  onImportData,
}) => {
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const accuracyPercent = stats.totalAnswered > 0
    ? Math.round((stats.correctAnswered / stats.totalAnswered) * 100)
    : 0;

  // Compute accuracy per string (1 to 6)
  const stringStats = [1, 2, 3, 4, 5, 6].map((sNum) => {
    const stringNotes = GUITAR_OPEN_NOTES.filter(n => n.stringNumber === sNum);
    let total = 0;
    let correct = 0;

    stringNotes.forEach(n => {
      const data = stats.noteAccuracy[n.id];
      if (data) {
        total += data.total;
        correct += data.correct;
      }
    });

    const percent = total > 0 ? Math.round((correct / total) * 100) : 0;
    return { stringNumber: sNum, total, correct, percent };
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImportError(null);
    setImportSuccess(false);
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const text = evt.target?.result as string;
        const parsed = JSON.parse(text);
        
        const importedStats: StoredGameStats = parsed.stats || parsed;
        const importedPrefs: UserPreferences | undefined = parsed.preferences;

        if (typeof importedStats.totalAnswered !== 'number') {
          throw new Error('Invalid backup file format');
        }

        onImportData(importedStats, importedPrefs);
        setImportSuccess(true);
        setTimeout(() => setImportSuccess(false), 4000);
      } catch (err: any) {
        setImportError(err.message || 'Failed to read backup file');
      }
    };
    reader.readAsText(file);
    // Reset file input value so same file can be uploaded again if needed
    e.target.value = '';
  };

  // Generate last 7 days representation for activity tracker
  const getRecentDays = () => {
    const days = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const dayStr = String(d.getDate()).padStart(2, '0');
      const dateKey = `${y}-${m}-${dayStr}`;
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
      const record = stats.dailyHistory?.[dateKey];
      days.push({
        dateKey,
        dayName,
        drills: record?.drills || 0,
        correct: record?.correct || 0,
        isToday: i === 0,
      });
    }
    return days;
  };

  const recentDays = getRecentDays();
  const todayRecord = recentDays[recentDays.length - 1];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Overview Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/80 shadow-xs">
          <div className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
            <Target className="w-3.5 h-3.5 text-amber-500" /> Total Drills
          </div>
          <div className="text-2xl font-black text-zinc-900 dark:text-zinc-100 mt-1">
            {stats.totalAnswered}
          </div>
          <div className="text-[11px] text-zinc-500 mt-0.5">{stats.correctAnswered} correct notes</div>
        </div>

        <div className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/80 shadow-xs">
          <div className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
            <Award className="w-3.5 h-3.5 text-emerald-500" /> Accuracy
          </div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
            {accuracyPercent}%
          </div>
          <div className="text-[11px] text-zinc-500 mt-0.5">Overall precision</div>
        </div>

        <div className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/80 shadow-xs">
          <div className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
            <Flame className="w-3.5 h-3.5 text-amber-500" /> Best Streak
          </div>
          <div className="text-2xl font-black text-amber-500 mt-1">
            🔥 {stats.bestStreak}
          </div>
          <div className="text-[11px] text-zinc-500 mt-0.5">Current: {stats.currentStreak} in a row</div>
        </div>

        <div className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/80 shadow-xs">
          <div className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-sky-500" /> Daily Streak
          </div>
          <div className="text-2xl font-black text-sky-600 dark:text-sky-400 mt-1">
            📅 {stats.dailyStreak || 0} {stats.dailyStreak === 1 ? 'day' : 'days'}
          </div>
          <div className="text-[11px] text-zinc-500 mt-0.5">
            {todayRecord.drills > 0 ? 'Practiced today' : 'Ready for practice'}
          </div>
        </div>
      </div>

      {/* High Scores & Mode Records */}
      <div className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/80 shadow-sm space-y-4">
        <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
          <Trophy className="w-5 h-5 text-amber-500" />
          Personal Best Records & High Scores
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-xl bg-amber-500/5 border border-amber-500/20">
            <div className="text-[11px] font-bold text-amber-700 dark:text-amber-400 flex items-center gap-1">
              <Timer className="w-3.5 h-3.5" /> Arcade Time Attack
            </div>
            <div className="text-xl font-black text-amber-600 dark:text-amber-400 mt-1">
              {stats.highScore || 0} pts
            </div>
            <div className="text-[10px] text-stone-500">60-second rush high score</div>
          </div>

          <div className="p-3.5 rounded-xl bg-rose-500/5 border border-rose-500/20">
            <div className="text-[11px] font-bold text-rose-700 dark:text-rose-400 flex items-center gap-1">
              <Heart className="w-3.5 h-3.5" /> Arcade Survival
            </div>
            <div className="text-xl font-black text-rose-600 dark:text-rose-400 mt-1">
              {stats.survivalHighScore || 0} pts
            </div>
            <div className="text-[10px] text-stone-500">3-lives high score</div>
          </div>

          <div className="p-3.5 rounded-xl bg-amber-500/5 border border-amber-500/20">
            <div className="text-[11px] font-bold text-amber-700 dark:text-amber-400 flex items-center gap-1">
              <Zap className="w-3.5 h-3.5" /> Flashcard Best
            </div>
            <div className="text-xl font-black text-amber-600 dark:text-amber-400 mt-1">
              ⭐ {stats.flashcardSessionBest || 0}
            </div>
            <div className="text-[10px] text-stone-500">Session best streak</div>
          </div>

          <div className="p-3.5 rounded-xl bg-sky-500/5 border border-sky-500/20">
            <div className="text-[11px] font-bold text-sky-700 dark:text-sky-400 flex items-center gap-1">
              <Crosshair className="w-3.5 h-3.5" /> Fretboard Best
            </div>
            <div className="text-xl font-black text-sky-600 dark:text-sky-400 mt-1">
              🎯 {stats.fretboardSessionBest || 0}
            </div>
            <div className="text-[10px] text-stone-500">Pluck streak record</div>
          </div>
        </div>
      </div>

      {/* 7-Day Activity Tracker */}
      <div className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/80 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-sky-500" />
              Daily Practice Activity
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Consistency builds subconscious muscle memory. Practice a few minutes every day.
            </p>
          </div>

          <div className="text-xs font-semibold px-3 py-1 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300">
            Today: <span className="font-bold text-amber-500">{todayRecord.drills}</span> drills
          </div>
        </div>

        {/* 7-day visual bar trail */}
        <div className="grid grid-cols-7 gap-2 pt-2">
          {recentDays.map((day) => {
            const hasPracticed = day.drills > 0;
            return (
              <div
                key={day.dateKey}
                className={`p-3 rounded-xl border text-center transition-all ${
                  day.isToday
                    ? 'border-amber-500 bg-amber-500/10 ring-2 ring-amber-500/20'
                    : hasPracticed
                    ? 'border-emerald-500/30 bg-emerald-500/5'
                    : 'border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/40'
                }`}
              >
                <div className="text-[11px] font-semibold text-zinc-400">{day.dayName}</div>
                <div className="my-1.5 flex items-center justify-center">
                  {hasPracticed ? (
                    <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-bold">
                      ✓
                    </div>
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-zinc-200 dark:bg-zinc-700 text-zinc-400 flex items-center justify-center text-xs">
                      •
                    </div>
                  )}
                </div>
                <div className="text-[10px] font-mono text-zinc-500">
                  {day.drills} {day.drills === 1 ? 'drill' : 'drills'}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* String-by-String Mastery Bars */}
      <div className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/80 shadow-sm space-y-4">
        <div>
          <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <Target className="w-5 h-5 text-amber-500" />
            Mastery by Guitar String
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Check which strings you know instantly and which ones need more training.
          </p>
        </div>

        <div className="space-y-3 pt-2">
          {stringStats.map((item) => {
            const stringNames: Record<number, string> = {
              1: '1st String (High E)',
              2: '2nd String (B)',
              3: '3rd String (G)',
              4: '4th String (D)',
              5: '5th String (A)',
              6: '6th String (Low E)',
            };

            return (
              <div key={item.stringNumber} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-zinc-700 dark:text-zinc-300">
                    {stringNames[item.stringNumber]}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-zinc-400">
                      {item.correct}/{item.total} drills
                    </span>
                    <span className={`font-bold ${item.percent >= 80 ? 'text-emerald-500' : item.percent >= 50 ? 'text-amber-500' : 'text-zinc-400'}`}>
                      {item.percent}%
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full h-2.5 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      item.percent >= 80
                        ? 'bg-emerald-500'
                        : item.percent >= 50
                        ? 'bg-amber-500'
                        : 'bg-zinc-400'
                    }`}
                    style={{ width: `${Math.max(item.percent, 3)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Individual Note Breakdown Table */}
      <div className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/80 shadow-sm space-y-4">
        <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
          <Award className="w-5 h-5 text-amber-500" />
          17 Open-Position Notes Individual Accuracy
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 pt-1">
          {GUITAR_OPEN_NOTES.map((n) => {
            const data = stats.noteAccuracy[n.id] || { correct: 0, total: 0 };
            const pct = data.total > 0 ? Math.round((data.correct / data.total) * 100) : null;

            return (
              <div
                key={n.id}
                className="p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50 flex flex-col justify-between"
              >
                <div className="flex items-center justify-between">
                  <span className="text-lg font-black text-zinc-900 dark:text-zinc-100">
                    {n.name}
                  </span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300">
                    Str {n.stringNumber}
                  </span>
                </div>

                <div className="text-[11px] text-zinc-500 mt-1">
                  Fret {n.fret} {n.fret === 0 ? '(Open)' : `(f${n.finger})`}
                </div>

                <div className="mt-2 pt-2 border-t border-zinc-200/60 dark:border-zinc-700/60 flex items-center justify-between text-xs">
                  <span className="text-zinc-400 text-[10px]">{data.correct}/{data.total}</span>
                  {pct !== null ? (
                    <span className={`font-bold ${pct >= 80 ? 'text-emerald-500' : pct >= 50 ? 'text-amber-500' : 'text-rose-500'}`}>
                      {pct}%
                    </span>
                  ) : (
                    <span className="text-zinc-400 text-[10px]">Untested</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Sessions History (if available) */}
      {stats.recentSessions && stats.recentSessions.length > 0 && (
        <div className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/80 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-500" />
            Recent Training Rounds Log
          </h3>

          <div className="divide-y divide-zinc-100 dark:divide-zinc-800 overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="text-zinc-400 uppercase text-[10px] pb-2">
                  <th className="py-2">Time</th>
                  <th className="py-2">Mode</th>
                  <th className="py-2">Score / Drills</th>
                  <th className="py-2">Accuracy</th>
                  <th className="py-2">Max Streak</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {stats.recentSessions.slice(0, 6).map((session) => (
                  <tr key={session.id} className="text-zinc-700 dark:text-zinc-300">
                    <td className="py-2 text-zinc-400 text-[11px]">
                      {new Date(session.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="py-2 font-semibold">{session.mode}</td>
                    <td className="py-2 font-mono">
                      {session.score !== undefined ? `${session.score} pts` : `${session.correctAnswers}/${session.totalQuestions}`}
                    </td>
                    <td className="py-2">
                      <span className={`font-bold ${session.accuracy >= 80 ? 'text-emerald-500' : session.accuracy >= 50 ? 'text-amber-500' : 'text-rose-500'}`}>
                        {session.accuracy}%
                      </span>
                    </td>
                    <td className="py-2 text-amber-600 dark:text-amber-400 font-bold">
                      🔥 {session.streak}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Local Storage & Backup Management Section */}
      <div className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <HardDrive className="w-5 h-5 text-emerald-500" />
              <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                Local Browser Storage
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[11px] font-bold border border-emerald-500/20 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Auto-Saved
              </span>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Your streaks, high scores, session bests, and note accuracy are automatically preserved in this browser.
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-2 pt-2 sm:pt-0">
            {/* Export JSON button */}
            <button
              id="export-data-btn"
              onClick={() => exportDataAsJson(stats as StoredGameStats, preferences)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors shadow-xs"
              title="Download your progress as a JSON backup file"
            >
              <Download className="w-3.5 h-3.5 text-amber-500" />
              <span>Export Backup</span>
            </button>

            {/* Import JSON button */}
            <button
              id="import-data-btn"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors shadow-xs"
              title="Import and restore progress from a JSON backup file"
            >
              <Upload className="w-3.5 h-3.5 text-sky-500" />
              <span>Import Backup</span>
            </button>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".json"
              className="hidden"
            />

            {/* Reset Button */}
            <button
              id="reset-stats-btn"
              onClick={onResetStats}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Data</span>
            </button>
          </div>
        </div>

        {importSuccess && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-medium flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>Backup data successfully imported and synced!</span>
          </div>
        )}

        {importError && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-700 dark:text-rose-300 text-xs font-medium">
            Error: {importError}
          </div>
        )}
      </div>
    </div>
  );
};
