import React from 'react';
import { GameStats } from '../types';
import { GUITAR_OPEN_NOTES } from '../data/notesData';
import { Trophy, Target, Award, RotateCcw, CheckCircle, AlertCircle } from 'lucide-react';

interface MasteryStatsProps {
  stats: GameStats;
  onResetStats: () => void;
}

export const MasteryStats: React.FC<MasteryStatsProps> = ({
  stats,
  onResetStats,
}) => {
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

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Overview Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/80">
          <div className="text-xs font-bold uppercase tracking-wider text-zinc-400">Total Drills</div>
          <div className="text-2xl font-black text-zinc-900 dark:text-zinc-100 mt-1">
            {stats.totalAnswered}
          </div>
          <div className="text-[11px] text-zinc-500 mt-0.5">Notes reviewed</div>
        </div>

        <div className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/80">
          <div className="text-xs font-bold uppercase tracking-wider text-zinc-400">Accuracy</div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
            {accuracyPercent}%
          </div>
          <div className="text-[11px] text-zinc-500 mt-0.5">{stats.correctAnswered} correct</div>
        </div>

        <div className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/80">
          <div className="text-xs font-bold uppercase tracking-wider text-zinc-400">Best Streak</div>
          <div className="text-2xl font-black text-amber-500 mt-1">
            🔥 {stats.bestStreak}
          </div>
          <div className="text-[11px] text-zinc-500 mt-0.5">Consecutive correct</div>
        </div>

        <div className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/80">
          <div className="text-xs font-bold uppercase tracking-wider text-zinc-400">Arcade High Score</div>
          <div className="text-2xl font-black text-sky-600 dark:text-sky-400 mt-1">
            🏆 {stats.highScore}
          </div>
          <div className="text-[11px] text-zinc-500 mt-0.5">Points record</div>
        </div>
      </div>

      {/* String-by-String Mastery Bars */}
      <div className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/80 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <Target className="w-5 h-5 text-amber-500" />
              Mastery by Guitar String
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Check which strings you know instantly and which ones need more training.
            </p>
          </div>

          <button
            id="reset-stats-btn"
            onClick={onResetStats}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-zinc-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Progress</span>
          </button>
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
    </div>
  );
};
