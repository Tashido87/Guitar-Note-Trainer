import React, { useState } from 'react';
import { GUITAR_OPEN_NOTES } from '../data/notesData';
import { GuitarNote } from '../types';
import { MusicStaff } from './MusicStaff';
import { InteractiveFretboard } from './InteractiveFretboard';
import { soundManager } from '../utils/audio';
import { 
  Lightbulb, 
  Sparkles, 
  Zap, 
  Target, 
  Music, 
  CheckCircle2, 
  XCircle, 
  ArrowRight, 
  RotateCcw, 
  Volume2, 
  Layers, 
  Compass, 
  BookOpen,
  Award
} from 'lucide-react';

type TrickCategory = 
  | 'landmarks'
  | 'line-notes'
  | 'space-notes'
  | 'ledger-lines'
  | 'half-steps'
  | 'open-strings';

interface QuickQuizQuestion {
  prompt: string;
  note: GuitarNote;
  trickExplanation: string;
  options: ('A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G')[];
}

export const MemoryTricksMode: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<TrickCategory>('landmarks');
  const [selectedNote, setSelectedNote] = useState<GuitarNote>(() => {
    // default to Middle C (String 5, Fret 3: 's5-f3')
    return GUITAR_OPEN_NOTES.find(n => n.id === 's5-f3') || GUITAR_OPEN_NOTES[0];
  });

  // Interactive Mini-Quiz state
  const [quizActive, setQuizActive] = useState(false);
  const [quizQuestionIndex, setQuizQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [quizScore, setQuizScore] = useState(0);
  const [quizQuestions, setQuizQuestions] = useState<QuickQuizQuestion[]>([]);

  const handleSelectCategory = (category: TrickCategory) => {
    setActiveCategory(category);
    setQuizActive(false);
    setSelectedAnswer(null);

    // Set a sensible default selected note for that category
    if (category === 'landmarks') {
      const c4 = GUITAR_OPEN_NOTES.find(n => n.id === 's5-f3');
      if (c4) setSelectedNote(c4);
    } else if (category === 'line-notes') {
      const e4 = GUITAR_OPEN_NOTES.find(n => n.id === 's4-f2');
      if (e4) setSelectedNote(e4);
    } else if (category === 'space-notes') {
      const f4 = GUITAR_OPEN_NOTES.find(n => n.id === 's4-f3');
      if (f4) setSelectedNote(f4);
    } else if (category === 'ledger-lines') {
      const a3 = GUITAR_OPEN_NOTES.find(n => n.id === 's5-f0');
      if (a3) setSelectedNote(a3);
    } else if (category === 'half-steps') {
      const b3 = GUITAR_OPEN_NOTES.find(n => n.id === 's2-f0');
      if (b3) setSelectedNote(b3);
    } else if (category === 'open-strings') {
      const e2 = GUITAR_OPEN_NOTES.find(n => n.id === 's6-f0');
      if (e2) setSelectedNote(e2);
    }
  };

  const playNote = (note: GuitarNote) => {
    setSelectedNote(note);
    soundManager.playGuitarNote(note.frequency);
  };

  // Start a category-targeted quick quiz
  const startCategoryQuiz = (category: TrickCategory) => {
    let pool: GuitarNote[] = [];
    if (category === 'landmarks') {
      pool = GUITAR_OPEN_NOTES.filter(n => 
        n.id === 's6-f0' || 
        n.id === 's5-f3' || 
        n.id === 's4-f2' || 
        n.id === 's1-f0' || 
        n.id === 's1-f3'
      );
    } else if (category === 'line-notes') {
      // Lines: E4 (step 0), G4 (step 2), B4 (step 4), D5 (step 6), F5 (step 8)
      pool = GUITAR_OPEN_NOTES.filter(n => [0, 2, 4, 6, 8].includes(n.staffYStep));
    } else if (category === 'space-notes') {
      // Spaces: F4 (step 1), A4 (step 3), C5 (step 5), E5 (step 7)
      pool = GUITAR_OPEN_NOTES.filter(n => [1, 3, 5, 7].includes(n.staffYStep));
    } else if (category === 'ledger-lines') {
      // Ledger notes below staff
      pool = GUITAR_OPEN_NOTES.filter(n => n.staffYStep < 0);
    } else if (category === 'half-steps') {
      // B, C, E, F notes
      pool = GUITAR_OPEN_NOTES.filter(n => ['B', 'C', 'E', 'F'].includes(n.name));
    } else {
      // Open strings
      pool = GUITAR_OPEN_NOTES.filter(n => n.fret === 0);
    }

    // Shuffle and pick 4-5 questions
    const shuffled = [...pool].sort(() => 0.5 - Math.random()).slice(0, 5);
    const questions: QuickQuizQuestion[] = shuffled.map((note) => {
      const allNames: ('A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G')[] = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
      const wrongNames = allNames.filter(n => n !== note.name).sort(() => 0.5 - Math.random()).slice(0, 3);
      const options = [...wrongNames, note.name].sort(() => 0.5 - Math.random());
      
      let explanation = note.mnemonicHint || `This is note ${note.name} (${note.staffDescription}).`;
      if (category === 'landmarks') {
        explanation = `🌟 Landmark Trick: ${note.name} at ${note.staffDescription}. No counting needed!`;
      } else if (category === 'line-notes') {
        explanation = `🎼 Line Mnemonic: "Every Good Boy Does Fine" — ${note.staffDescription} is ${note.name}!`;
      } else if (category === 'space-notes') {
        explanation = `🔤 Space Mnemonic: "F-A-C-E" in the spaces — ${note.staffDescription} spells ${note.name}!`;
      } else if (category === 'ledger-lines') {
        explanation = `⚓ Ledger Trick: ${note.ledgerLinesBelow} ledger lines below — note is ${note.name}.`;
      }

      return {
        prompt: `Identify this note using the ${category.replace('-', ' ')} memory trick:`,
        note,
        trickExplanation: explanation,
        options,
      };
    });

    setQuizQuestions(questions);
    setQuizQuestionIndex(0);
    setQuizScore(0);
    setSelectedAnswer(null);
    setQuizActive(true);
    if (questions.length > 0) {
      soundManager.playGuitarNote(questions[0].note.frequency);
    }
  };

  const handleQuizAnswer = (ans: string) => {
    if (selectedAnswer !== null) return;
    setSelectedAnswer(ans);
    const currentQ = quizQuestions[quizQuestionIndex];
    const isCorrect = ans === currentQ.note.name;

    if (isCorrect) {
      soundManager.playCorrectSound();
      setQuizScore(prev => prev + 1);
    } else {
      soundManager.playWrongSound();
      soundManager.playGuitarNote(currentQ.note.frequency);
    }
  };

  const handleNextQuizQuestion = () => {
    if (quizQuestionIndex < quizQuestions.length - 1) {
      const nextIdx = quizQuestionIndex + 1;
      setQuizQuestionIndex(nextIdx);
      setSelectedAnswer(null);
      soundManager.playGuitarNote(quizQuestions[nextIdx].note.frequency);
    } else {
      setQuizQuestionIndex(quizQuestions.length);
    }
  };

  // Landmark notes list
  const landmarkNotes = [
    {
      title: 'Low E (Deep Anchor)',
      note: GUITAR_OPEN_NOTES.find(n => n.id === 's6-f0') || GUITAR_OPEN_NOTES[0],
      badge: '6th String Open',
      desc: 'Hangs right underneath the 3rd ledger line. The absolute lowest note on guitar.',
      keyTrick: '3 lines down + hanging under = Low E (6th string open)',
    },
    {
      title: 'Middle C (The Planet Note)',
      note: GUITAR_OPEN_NOTES.find(n => n.id === 's5-f3') || GUITAR_OPEN_NOTES[0],
      badge: '5th String Fret 3',
      desc: 'Has exactly 1 ledger line slicing through its middle like the ring of Saturn.',
      keyTrick: '1 line through = Middle C! Your main bridge between bass and treble.',
    },
    {
      title: 'Bottom Line E (Line 1)',
      note: GUITAR_OPEN_NOTES.find(n => n.id === 's4-f2') || GUITAR_OPEN_NOTES[0],
      badge: '4th String Fret 2',
      desc: 'The ground floor line of the 5-line staff. The "E" in "Every Good Boy Does Fine".',
      keyTrick: 'Lowest staff line = E. Remember: E is the "Earth/Ground Floor".',
    },
    {
      title: 'Top Space E (High Anchor)',
      note: GUITAR_OPEN_NOTES.find(n => n.id === 's1-f0') || GUITAR_OPEN_NOTES[0],
      badge: '1st String Open',
      desc: 'Space 4 (the top space right below Line 5). Open 1st string High E.',
      keyTrick: 'Top space = E. Notice all 3 guitar E’s (Low E, Line 1 E, Top Space E)!',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner / Hero Introduction */}
      <div className="rounded-3xl bg-gradient-to-br from-amber-500/15 via-amber-400/5 to-stone-900 border border-amber-500/30 p-5 sm:p-7 shadow-lg relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-800 dark:text-amber-300 text-xs font-bold uppercase tracking-wider border border-amber-500/30">
              <Lightbulb className="w-3.5 h-3.5" />
              <span>Sight-Reading Speed Accelerator</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-stone-900 dark:text-white tracking-tight">
              How to Memorize Notes Instantly
            </h2>
            <p className="text-stone-600 dark:text-stone-300 text-sm sm:text-base leading-relaxed">
              Beginners often struggle with sight-reading by counting one note at a time (<span className="font-mono font-semibold">A... B... C...</span>). 
              Professional guitarists use <strong>Landmark Anchors</strong>, <strong>Mnemonic Rhymes</strong>, and <strong>Fretboard Symmetry</strong> to identify notes in under 100 milliseconds.
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5 sm:self-center">
            <button
              id="start-tips-quiz-btn"
              onClick={() => startCategoryQuiz(activeCategory)}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-sm transition-all shadow-md active:scale-95 cursor-pointer"
            >
              <Zap className="w-4 h-4 fill-stone-950" />
              <span>Test This Trick (Quiz)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Category Pills Navigation */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {[
          { id: 'landmarks', label: '1. The 4 Landmark Anchors', icon: Target, tag: 'Must Learn' },
          { id: 'line-notes', label: '2. Lines: "Every Good Boy"', icon: Layers, tag: 'E-G-B-D-F' },
          { id: 'space-notes', label: '3. Spaces: "F - A - C - E"', icon: Sparkles, tag: 'FACE' },
          { id: 'ledger-lines', label: '4. Sub-Staff Ledger Lines', icon: AnchorIcon, tag: 'Bass Strings' },
          { id: 'half-steps', label: '5. B-C & E-F Half-Steps', icon: Compass, tag: 'Fretboard Key' },
          { id: 'open-strings', label: '6. Open Strings Tuning', icon: Music, tag: '6 to 1' },
        ].map(cat => {
          const Icon = cat.icon;
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              id={`trick-tab-${cat.id}`}
              onClick={() => handleSelectCategory(cat.id as TrickCategory)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap border cursor-pointer ${
                isActive
                  ? 'bg-amber-500 text-stone-950 border-amber-400 shadow-md scale-[1.02]'
                  : 'bg-white dark:bg-stone-900 text-stone-600 dark:text-stone-300 border-stone-200 dark:border-stone-800 hover:bg-stone-50 dark:hover:bg-stone-800/80'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{cat.label}</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-md font-mono ${
                isActive ? 'bg-stone-950/15 text-stone-950' : 'bg-stone-100 dark:bg-stone-800 text-stone-400'
              }`}>
                {cat.tag}
              </span>
            </button>
          );
        })}
      </div>

      {/* Active Interactive Quiz Card (If Active) */}
      {quizActive && (
        <div className="rounded-3xl bg-stone-900 border-2 border-amber-500/60 p-6 shadow-2xl text-white animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-center justify-between border-b border-stone-800 pb-4 mb-5">
            <div className="flex items-center gap-2.5">
              <span className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
                <Zap className="w-5 h-5" />
              </span>
              <div>
                <h3 className="text-base font-bold text-white">
                  Quick Trick Practice: {activeCategory.toUpperCase().replace('-', ' ')}
                </h3>
                <p className="text-xs text-stone-400">
                  Question {Math.min(quizQuestionIndex + 1, quizQuestions.length)} of {quizQuestions.length}
                </p>
              </div>
            </div>

            <button
              onClick={() => setQuizActive(false)}
              className="text-xs text-stone-400 hover:text-white px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 cursor-pointer"
            >
              Exit Quiz
            </button>
          </div>

          {quizQuestionIndex < quizQuestions.length ? (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              {/* Staff Display */}
              <div className="md:col-span-6 flex flex-col items-center justify-center p-4 rounded-2xl bg-white/95 text-stone-900 shadow-inner">
                <MusicStaff
                  note={quizQuestions[quizQuestionIndex].note}
                  width={340}
                  height={190}
                  showHelperLabels={false}
                />
                <button
                  type="button"
                  onClick={() => soundManager.playGuitarNote(quizQuestions[quizQuestionIndex].note.frequency)}
                  className="mt-2 inline-flex items-center gap-1.5 text-xs text-stone-600 hover:text-stone-900 font-semibold px-3 py-1 rounded-full bg-stone-200/80 cursor-pointer"
                >
                  <Volume2 className="w-3.5 h-3.5" /> Replay Sound
                </button>
              </div>

              {/* Question & Choices */}
              <div className="md:col-span-6 space-y-4">
                <div className="space-y-1">
                  <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                    {quizQuestions[quizQuestionIndex].note.stringName}
                  </span>
                  <h4 className="text-lg font-black">Which note is this on the staff?</h4>
                  <p className="text-xs text-stone-300">
                    Use the trick: look for landmark anchors, lines, or spaces!
                  </p>
                </div>

                {/* Option Buttons */}
                <div className="grid grid-cols-2 gap-3">
                  {quizQuestions[quizQuestionIndex].options.map(opt => {
                    const isAnswered = selectedAnswer !== null;
                    const isCorrect = opt === quizQuestions[quizQuestionIndex].note.name;
                    const isSelected = selectedAnswer === opt;

                    let btnStyle = 'bg-stone-800 border-stone-700 hover:bg-stone-750 text-white';
                    if (isAnswered) {
                      if (isCorrect) {
                        btnStyle = 'bg-emerald-600 border-emerald-500 text-white font-bold ring-2 ring-emerald-400';
                      } else if (isSelected) {
                        btnStyle = 'bg-rose-600 border-rose-500 text-white font-bold';
                      } else {
                        btnStyle = 'bg-stone-800/40 border-stone-800 text-stone-500';
                      }
                    }

                    return (
                      <button
                        key={opt}
                        id={`quiz-opt-${opt}`}
                        disabled={isAnswered}
                        onClick={() => handleQuizAnswer(opt)}
                        className={`h-14 rounded-2xl border text-xl font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${btnStyle}`}
                      >
                        <span>{opt}</span>
                        {isAnswered && isCorrect && <CheckCircle2 className="w-5 h-5 text-emerald-300" />}
                        {isAnswered && isSelected && !isCorrect && <XCircle className="w-5 h-5 text-rose-300" />}
                      </button>
                    );
                  })}
                </div>

                {/* Feedback Box & Next Button */}
                {selectedAnswer && (
                  <div className="p-3.5 rounded-xl bg-stone-800/90 border border-stone-700 space-y-2 animate-in fade-in duration-150">
                    <p className="text-xs text-amber-300 leading-relaxed font-medium">
                      💡 {quizQuestions[quizQuestionIndex].trickExplanation}
                    </p>
                    <button
                      onClick={handleNextQuizQuestion}
                      className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow cursor-pointer"
                    >
                      <span>{quizQuestionIndex < quizQuestions.length - 1 ? 'Next Question' : 'View Results'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Quiz Completed View */
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto ring-4 ring-amber-500/30">
                <Award className="w-8 h-8" />
              </div>
              <div>
                <h4 className="text-xl font-black">Trick Practice Complete!</h4>
                <p className="text-stone-300 text-sm mt-1">
                  You scored <span className="font-extrabold text-amber-400 text-base">{quizScore}</span> out of {quizQuestions.length} correct using this memory technique!
                </p>
              </div>
              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => startCategoryQuiz(activeCategory)}
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Try Again
                </button>
                <button
                  onClick={() => setQuizActive(false)}
                  className="px-5 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-white font-bold text-xs cursor-pointer"
                >
                  Back to Lesson
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 1. THE 4 LANDMARK ANCHORS */}
      {activeCategory === 'landmarks' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-3">
              <span className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                <Target className="w-6 h-6" />
              </span>
              <div>
                <h3 className="text-lg sm:text-xl font-black text-stone-900 dark:text-white">
                  The 4 Visual Landmark Anchors
                </h3>
                <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400">
                  Instead of counting line by line from the bottom, lock these 4 distinct visual anchors into your brain:
                </p>
              </div>
            </div>

            {/* 4 Landmark Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 pt-2">
              {landmarkNotes.map((lm, idx) => {
                const isSelected = selectedNote.id === lm.note.id;
                return (
                  <button
                    key={lm.title}
                    id={`landmark-card-${idx}`}
                    onClick={() => playNote(lm.note)}
                    className={`text-left p-4 rounded-2xl border transition-all relative overflow-hidden flex flex-col justify-between cursor-pointer ${
                      isSelected
                        ? 'bg-amber-500/10 border-amber-500 dark:border-amber-400 shadow-md ring-2 ring-amber-500/20'
                        : 'bg-stone-50 dark:bg-stone-800/60 border-stone-200 dark:border-stone-700/70 hover:border-amber-400/50'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-stone-200 dark:bg-stone-700 text-stone-700 dark:text-stone-300">
                          Anchor #{idx + 1}
                        </span>
                        <span className="w-7 h-7 rounded-lg bg-amber-500 text-stone-950 font-black text-sm flex items-center justify-center">
                          {lm.note.name}
                        </span>
                      </div>
                      <h4 className="text-sm font-black text-stone-900 dark:text-white mb-1">
                        {lm.title}
                      </h4>
                      <p className="text-xs text-stone-600 dark:text-stone-300 leading-snug">
                        {lm.desc}
                      </p>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-stone-200 dark:border-stone-700/60 flex items-center justify-between text-[11px] font-mono font-bold text-amber-700 dark:text-amber-400">
                      <span>{lm.badge}</span>
                      <Volume2 className="w-3.5 h-3.5" />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Interactive Inspection Workspace */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Staff Visualizer */}
            <div className="lg:col-span-6 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-5 shadow-sm flex flex-col items-center justify-center">
              <div className="w-full flex items-center justify-between mb-3 px-1">
                <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">
                  Staff Visual Position
                </span>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-400">
                  Note: {selectedNote.name} ({selectedNote.stringName})
                </span>
              </div>
              <MusicStaff
                note={selectedNote}
                width={360}
                height={200}
                showHelperLabels={true}
              />
              <div className="mt-3 text-center">
                <p className="text-xs text-stone-600 dark:text-stone-400 font-medium">
                  {selectedNote.staffDescription}
                </p>
              </div>
            </div>

            {/* Fretboard & Memory Rule */}
            <div className="lg:col-span-6 space-y-4">
              <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-5 shadow-sm space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                  Fretboard Location
                </h4>
                <InteractiveFretboard
                  highlightNote={selectedNote}
                  interactive={false}
                  showAllNoteLabels={true}
                  filterString={selectedNote.stringNumber}
                />
              </div>

              {/* Memory Rule Box */}
              <div className="bg-gradient-to-r from-amber-500/15 to-amber-400/5 border border-amber-500/30 rounded-2xl p-4">
                <div className="flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300">
                      Reflex Trigger Rule
                    </h5>
                    <p className="text-xs sm:text-sm text-stone-700 dark:text-stone-300 font-medium mt-1">
                      {selectedNote.mnemonicHint || "Notice how this note is positioned relative to the staff lines!"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. LINE NOTES ("EVERY GOOD BOY DOES FINE") */}
      {activeCategory === 'line-notes' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-3">
              <span className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                <Layers className="w-6 h-6" />
              </span>
              <div>
                <h3 className="text-lg sm:text-xl font-black text-stone-900 dark:text-white">
                  The 5 Line Notes: "Every Good Boy Does Fine"
                </h3>
                <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400">
                  Staff lines are numbered from <strong>bottom (Line 1) to top (Line 5)</strong>. The line passes directly through the note head center.
                </p>
              </div>
            </div>

            {/* Interactive Line Selector Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2">
              {[
                { line: 1, word: 'Every', noteChar: 'E', id: 's4-f2', fret: 'Str 4, Fret 2' },
                { line: 2, word: 'Good', noteChar: 'G', id: 's3-f0', fret: 'Str 3, Open' },
                { line: 3, word: 'Boy', noteChar: 'B', id: 's2-f0', fret: 'Str 2, Open' },
                { line: 4, word: 'Does', noteChar: 'D', id: 's2-f3', fret: 'Str 2, Fret 3' },
                { line: 5, word: 'Fine', noteChar: 'F', id: 's1-f1', fret: 'Str 1, Fret 1' },
              ].map((item) => {
                const noteObj = GUITAR_OPEN_NOTES.find(n => n.id === item.id);
                if (!noteObj) return null;
                const isSelected = selectedNote.id === noteObj.id;

                return (
                  <button
                    key={item.line}
                    id={`line-note-btn-${item.line}`}
                    onClick={() => playNote(noteObj)}
                    className={`p-3.5 rounded-2xl border text-center transition-all flex flex-col items-center justify-between cursor-pointer ${
                      isSelected
                        ? 'bg-amber-500 text-stone-950 border-amber-400 shadow-md font-bold'
                        : 'bg-stone-50 dark:bg-stone-800 border-stone-200 dark:border-stone-700 hover:border-amber-400'
                    }`}
                  >
                    <span className="text-[10px] uppercase font-bold opacity-80">Line {item.line}</span>
                    <span className="text-2xl font-black my-1">{item.noteChar}</span>
                    <span className="text-xs font-semibold">"{item.word}"</span>
                    <span className="text-[10px] mt-2 font-mono opacity-70">{item.fret}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Demonstration Canvas */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-6 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-5 shadow-sm flex flex-col items-center justify-center">
              <span className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">
                Line Note on Treble Staff
              </span>
              <MusicStaff
                note={selectedNote}
                width={360}
                height={200}
                showHelperLabels={true}
              />
              <p className="mt-2 text-xs text-stone-600 dark:text-stone-400">
                Notice the horizontal line passing cleanly through the note body.
              </p>
            </div>

            <div className="lg:col-span-6 space-y-4">
              <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-5 shadow-sm">
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 mb-2">
                  Guitar String & Fret
                </h4>
                <InteractiveFretboard
                  highlightNote={selectedNote}
                  interactive={false}
                  showAllNoteLabels={true}
                  filterString={selectedNote.stringNumber}
                />
              </div>

              <div className="bg-stone-900 text-white rounded-2xl p-4 border border-stone-800 space-y-1.5">
                <span className="text-xs font-bold text-amber-400 uppercase">Alternative Memory Acronyms</span>
                <ul className="text-xs space-y-1 text-stone-300 list-disc list-inside">
                  <li><strong>Elvis' Guitar Broke Down Friday</strong></li>
                  <li><strong>Every Green Bus Drives Fast</strong></li>
                  <li><strong>Empty Garbage Before Dad Flips</strong></li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. SPACE NOTES ("F-A-C-E") */}
      {activeCategory === 'space-notes' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-3">
              <span className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                <Sparkles className="w-6 h-6" />
              </span>
              <div>
                <h3 className="text-lg sm:text-xl font-black text-stone-900 dark:text-white">
                  The 4 Space Notes: "F - A - C - E"
                </h3>
                <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400">
                  The spaces between the 5 lines spell the English word <strong>FACE</strong> from bottom (Space 1) to top (Space 4).
                </p>
              </div>
            </div>

            {/* Interactive Space Selector */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 pt-2">
              {[
                { space: 1, letter: 'F', word: 'F in Space 1', id: 's4-f3', fret: 'Str 4, Fret 3 (Ring finger)' },
                { space: 2, letter: 'A', word: 'A in Space 2', id: 's3-f2', fret: 'Str 3, Fret 2 (Middle finger)' },
                { space: 3, letter: 'C', word: 'C in Space 3', id: 's2-f1', fret: 'Str 2, Fret 1 (Index finger)' },
                { space: 4, letter: 'E', word: 'E in Space 4', id: 's1-f0', fret: 'Str 1, Open (High E)' },
              ].map((item) => {
                const noteObj = GUITAR_OPEN_NOTES.find(n => n.id === item.id);
                if (!noteObj) return null;
                const isSelected = selectedNote.id === noteObj.id;

                return (
                  <button
                    key={item.space}
                    id={`space-note-btn-${item.space}`}
                    onClick={() => playNote(noteObj)}
                    className={`p-4 rounded-2xl border text-center transition-all flex flex-col items-center justify-between cursor-pointer ${
                      isSelected
                        ? 'bg-amber-500 text-stone-950 border-amber-400 shadow-md font-bold'
                        : 'bg-stone-50 dark:bg-stone-800 border-stone-200 dark:border-stone-700 hover:border-amber-400'
                    }`}
                  >
                    <span className="text-[10px] uppercase font-bold opacity-80">Space {item.space}</span>
                    <span className="text-3xl font-black my-1">{item.letter}</span>
                    <span className="text-xs font-semibold">{item.word}</span>
                    <span className="text-[10px] mt-2 font-mono opacity-70">{item.fret}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-6 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-5 shadow-sm flex flex-col items-center justify-center">
              <span className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">
                Space Note (Nestled Between Lines)
              </span>
              <MusicStaff
                note={selectedNote}
                width={360}
                height={200}
                showHelperLabels={true}
              />
              <p className="mt-2 text-xs text-stone-600 dark:text-stone-400">
                Space notes touch the lines above and below, but no line cuts through them.
              </p>
            </div>

            <div className="lg:col-span-6 space-y-4">
              <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-5 shadow-sm">
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 mb-2">
                  Guitar Fretboard Position
                </h4>
                <InteractiveFretboard
                  highlightNote={selectedNote}
                  interactive={false}
                  showAllNoteLabels={true}
                  filterString={selectedNote.stringNumber}
                />
              </div>

              <div className="bg-gradient-to-r from-amber-500/15 to-amber-400/5 border border-amber-500/30 rounded-2xl p-4">
                <h5 className="text-xs font-bold uppercase text-amber-800 dark:text-amber-300">
                  Catchy Mnemonic Rhyme
                </h5>
                <p className="text-sm font-semibold text-stone-800 dark:text-stone-200 mt-1">
                  "F - A - C - E spells FACE in the SPACE!"
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. SUB-STAFF LEDGER LINES (BASS STRINGS) */}
      {activeCategory === 'ledger-lines' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-3">
              <span className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                <Compass className="w-6 h-6" />
              </span>
              <div>
                <h3 className="text-lg sm:text-xl font-black text-stone-900 dark:text-white">
                  Sub-Staff Ledger Lines: The "C - A - F" Rule
                </h3>
                <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400">
                  The thick 6th and 5th guitar strings produce notes below the 5-line staff. They use extra small lines called <strong>Ledger Lines</strong>.
                </p>
              </div>
            </div>

            {/* Visual 3-2-1 Breakdown */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black px-2 py-0.5 rounded bg-amber-500/20 text-amber-700 dark:text-amber-400">
                    1 Ledger Line
                  </span>
                  <span className="text-xs font-bold text-stone-400">Middle C & D</span>
                </div>
                <p className="text-xs text-stone-600 dark:text-stone-300">
                  <strong>Middle C</strong> has 1 line through it. <strong>D</strong> rests on top of that line (just below the staff).
                </p>
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => {
                      const note = GUITAR_OPEN_NOTES.find(n => n.id === 's5-f3');
                      if (note) playNote(note);
                    }}
                    className="flex-1 py-1.5 rounded-lg bg-stone-200 dark:bg-stone-700 text-xs font-bold hover:bg-amber-400 hover:text-stone-950 transition-colors cursor-pointer"
                  >
                    Play C
                  </button>
                  <button
                    onClick={() => {
                      const note = GUITAR_OPEN_NOTES.find(n => n.id === 's4-f0');
                      if (note) playNote(note);
                    }}
                    className="flex-1 py-1.5 rounded-lg bg-stone-200 dark:bg-stone-700 text-xs font-bold hover:bg-amber-400 hover:text-stone-950 transition-colors cursor-pointer"
                  >
                    Play D
                  </button>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black px-2 py-0.5 rounded bg-amber-500/20 text-amber-700 dark:text-amber-400">
                    2 Ledger Lines
                  </span>
                  <span className="text-xs font-bold text-stone-400">A & B (5th String)</span>
                </div>
                <p className="text-xs text-stone-600 dark:text-stone-300">
                  <strong>Open 5th String A</strong> has 2 lines through it. <strong>B</strong> rests above the 2nd line.
                </p>
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => {
                      const note = GUITAR_OPEN_NOTES.find(n => n.id === 's5-f0');
                      if (note) playNote(note);
                    }}
                    className="flex-1 py-1.5 rounded-lg bg-stone-200 dark:bg-stone-700 text-xs font-bold hover:bg-amber-400 hover:text-stone-950 transition-colors cursor-pointer"
                  >
                    Play A
                  </button>
                  <button
                    onClick={() => {
                      const note = GUITAR_OPEN_NOTES.find(n => n.id === 's5-f2');
                      if (note) playNote(note);
                    }}
                    className="flex-1 py-1.5 rounded-lg bg-stone-200 dark:bg-stone-700 text-xs font-bold hover:bg-amber-400 hover:text-stone-950 transition-colors cursor-pointer"
                  >
                    Play B
                  </button>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black px-2 py-0.5 rounded bg-amber-500/20 text-amber-700 dark:text-amber-400">
                    3 Ledger Lines
                  </span>
                  <span className="text-xs font-bold text-stone-400">Low E, F, G (6th String)</span>
                </div>
                <p className="text-xs text-stone-600 dark:text-stone-300">
                  <strong>F</strong> has 3 lines through it. <strong>Low E</strong> hangs below 3 lines. <strong>G</strong> sits above line 3.
                </p>
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => {
                      const note = GUITAR_OPEN_NOTES.find(n => n.id === 's6-f0');
                      if (note) playNote(note);
                    }}
                    className="flex-1 py-1.5 rounded-lg bg-stone-200 dark:bg-stone-700 text-xs font-bold hover:bg-amber-400 hover:text-stone-950 transition-colors cursor-pointer"
                  >
                    Play Low E
                  </button>
                  <button
                    onClick={() => {
                      const note = GUITAR_OPEN_NOTES.find(n => n.id === 's6-f1');
                      if (note) playNote(note);
                    }}
                    className="flex-1 py-1.5 rounded-lg bg-stone-200 dark:bg-stone-700 text-xs font-bold hover:bg-amber-400 hover:text-stone-950 transition-colors cursor-pointer"
                  >
                    Play F
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-6 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-5 shadow-sm flex flex-col items-center justify-center">
              <span className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">
                Ledger Line Note on Staff
              </span>
              <MusicStaff
                note={selectedNote}
                width={360}
                height={200}
                showHelperLabels={true}
              />
              <p className="mt-2 text-xs text-stone-600 dark:text-stone-400">
                {selectedNote.staffDescription}
              </p>
            </div>

            <div className="lg:col-span-6 space-y-4">
              <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-5 shadow-sm">
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 mb-2">
                  Bass String Placement
                </h4>
                <InteractiveFretboard
                  highlightNote={selectedNote}
                  interactive={false}
                  showAllNoteLabels={true}
                  filterString={selectedNote.stringNumber}
                />
              </div>

              <div className="bg-stone-900 text-white rounded-2xl p-4 border border-stone-800">
                <h5 className="text-xs font-bold text-amber-400 uppercase">The "C - A - F" Secret</h5>
                <p className="text-xs text-stone-300 mt-1 leading-relaxed">
                  The line notes going down below the staff count down by two letters:
                  <br />
                  <strong>Line 1: Middle C</strong> (1 line) ➔ <strong>Line 2: Low A</strong> (2 lines) ➔ <strong>Line 3: Low F</strong> (3 lines)!
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. FRETBOARD HALF-STEPS (B-C & E-F) */}
      {activeCategory === 'half-steps' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-3">
              <span className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                <Zap className="w-6 h-6" />
              </span>
              <div>
                <h3 className="text-lg sm:text-xl font-black text-stone-900 dark:text-white">
                  The Half-Step Rule: Only "B-C" and "E-F" Touch!
                </h3>
                <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400">
                  In Western music, almost all natural notes are 2 frets apart (whole step). The ONLY two pairs with <strong>zero frets between them</strong> (half-step) are:
                </p>
              </div>
            </div>

            {/* Two Golden Pairs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-black text-emerald-800 dark:text-emerald-300">
                    Pair #1: B and C
                  </span>
                  <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-700 dark:text-emerald-300">
                    1 Fret (Half Step)
                  </span>
                </div>
                <p className="text-xs text-stone-700 dark:text-stone-300 leading-relaxed">
                  On the 2nd String: Open B ➔ <strong>Fret 1 is immediately C!</strong>
                  <br />
                  On the 5th String: Fret 2 B ➔ <strong>Fret 3 is immediately C!</strong>
                </p>
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => {
                      const note = GUITAR_OPEN_NOTES.find(n => n.id === 's2-f0');
                      if (note) playNote(note);
                    }}
                    className="flex-1 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-500 transition-colors cursor-pointer"
                  >
                    Play Open B
                  </button>
                  <button
                    onClick={() => {
                      const note = GUITAR_OPEN_NOTES.find(n => n.id === 's2-f1');
                      if (note) playNote(note);
                    }}
                    className="flex-1 py-1.5 rounded-lg bg-emerald-700 text-white text-xs font-bold hover:bg-emerald-600 transition-colors cursor-pointer"
                  >
                    Play Fret 1 C
                  </button>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-black text-amber-800 dark:text-amber-300">
                    Pair #2: E and F
                  </span>
                  <span className="text-xs font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-700 dark:text-amber-300">
                    1 Fret (Half Step)
                  </span>
                </div>
                <p className="text-xs text-stone-700 dark:text-stone-300 leading-relaxed">
                  On the 1st String: Open High E ➔ <strong>Fret 1 is immediately F!</strong>
                  <br />
                  On the 6th String: Open Low E ➔ <strong>Fret 1 is immediately F!</strong>
                </p>
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => {
                      const note = GUITAR_OPEN_NOTES.find(n => n.id === 's1-f0');
                      if (note) playNote(note);
                    }}
                    className="flex-1 py-1.5 rounded-lg bg-amber-600 text-white text-xs font-bold hover:bg-amber-500 transition-colors cursor-pointer"
                  >
                    Play Open High E
                  </button>
                  <button
                    onClick={() => {
                      const note = GUITAR_OPEN_NOTES.find(n => n.id === 's1-f1');
                      if (note) playNote(note);
                    }}
                    className="flex-1 py-1.5 rounded-lg bg-amber-700 text-white text-xs font-bold hover:bg-amber-600 transition-colors cursor-pointer"
                  >
                    Play Fret 1 F
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                Full Open Position Fretboard Overview
              </h4>
              <span className="text-xs text-stone-500">
                Notice: All other notes have a 1-fret gap (e.g. Fret 1 to Fret 3, or Open to Fret 2)
              </span>
            </div>
            <InteractiveFretboard
              interactive={true}
              showAllNoteLabels={true}
            />
          </div>
        </div>
      )}

      {/* 6. OPEN STRINGS TUNING */}
      {activeCategory === 'open-strings' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-3">
              <span className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                <Music className="w-6 h-6" />
              </span>
              <div>
                <h3 className="text-lg sm:text-xl font-black text-stone-900 dark:text-white">
                  The 6 Open Strings: "Eddie Ate Dynamite, Good Bye Eddie"
                </h3>
                <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400">
                  Memorize the 6 guitar strings from thickest (6th string Low E) to thinnest (1st string High E).
                </p>
              </div>
            </div>

            {/* 6 String Interactive Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-2">
              {[
                { strNum: 6, word: 'Eddie', note: 'E', id: 's6-f0', tag: 'Thickest' },
                { strNum: 5, word: 'Ate', note: 'A', id: 's5-f0', tag: 'Bass' },
                { strNum: 4, word: 'Dynamite', note: 'D', id: 's4-f0', tag: 'Mid-bass' },
                { strNum: 3, word: 'Good', note: 'G', id: 's3-f0', tag: 'Treble' },
                { strNum: 2, word: 'Bye', note: 'B', id: 's2-f0', tag: 'Treble' },
                { strNum: 1, word: 'Eddie', note: 'E', id: 's1-f0', tag: 'Thinnest' },
              ].map(item => {
                const noteObj = GUITAR_OPEN_NOTES.find(n => n.id === item.id);
                if (!noteObj) return null;
                const isSelected = selectedNote.id === noteObj.id;

                return (
                  <button
                    key={item.strNum}
                    id={`open-str-btn-${item.strNum}`}
                    onClick={() => playNote(noteObj)}
                    className={`p-3.5 rounded-2xl border text-center transition-all flex flex-col items-center justify-between cursor-pointer ${
                      isSelected
                        ? 'bg-amber-500 text-stone-950 border-amber-400 shadow-md font-bold'
                        : 'bg-stone-50 dark:bg-stone-800 border-stone-200 dark:border-stone-700 hover:border-amber-400'
                    }`}
                  >
                    <span className="text-[10px] uppercase font-bold opacity-75">String {item.strNum}</span>
                    <span className="text-2xl font-black my-1">{item.note}</span>
                    <span className="text-xs font-semibold">"{item.word}"</span>
                    <span className="text-[10px] mt-2 font-mono opacity-70">{item.tag}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-6 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-5 shadow-sm flex flex-col items-center justify-center">
              <span className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">
                Open String Note on Staff
              </span>
              <MusicStaff
                note={selectedNote}
                width={360}
                height={200}
                showHelperLabels={true}
              />
              <p className="mt-2 text-xs text-stone-600 dark:text-stone-400">
                {selectedNote.stringName} • Fret 0 (Open)
              </p>
            </div>

            <div className="lg:col-span-6 space-y-4">
              <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-5 shadow-sm">
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 mb-2">
                  Open Nut Position
                </h4>
                <InteractiveFretboard
                  highlightNote={selectedNote}
                  interactive={false}
                  showAllNoteLabels={true}
                  filterString={selectedNote.stringNumber}
                />
              </div>

              <div className="bg-stone-900 text-white rounded-2xl p-4 border border-stone-800 space-y-1">
                <h5 className="text-xs font-bold text-amber-400 uppercase">Alternative String Acronyms</h5>
                <p className="text-xs text-stone-300">
                  <strong>Elephants And Donkeys Grow Big Ears</strong> (6 to 1)
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cheat Sheet Quick Summary Card at bottom */}
      <div className="rounded-3xl bg-stone-900 border border-stone-800 p-6 text-white space-y-4 shadow-xl">
        <div className="flex items-center gap-2.5">
          <BookOpen className="w-5 h-5 text-amber-400" />
          <h4 className="text-base font-black">Speed Recall Cheat-Sheet</h4>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div className="p-3.5 rounded-xl bg-stone-800/80 border border-stone-700/60 space-y-1">
            <span className="font-bold text-amber-400">Lines (1 to 5)</span>
            <p className="text-stone-300 font-mono text-sm">E - G - B - D - F</p>
            <p className="text-[11px] text-stone-400">Every Good Boy Does Fine</p>
          </div>
          <div className="p-3.5 rounded-xl bg-stone-800/80 border border-stone-700/60 space-y-1">
            <span className="font-bold text-amber-400">Spaces (1 to 4)</span>
            <p className="text-stone-300 font-mono text-sm">F - A - C - E</p>
            <p className="text-[11px] text-stone-400">Spells FACE in the space</p>
          </div>
          <div className="p-3.5 rounded-xl bg-stone-800/80 border border-stone-700/60 space-y-1">
            <span className="font-bold text-amber-400">Ledger Lines (Below)</span>
            <p className="text-stone-300 font-mono text-sm">C (1) - A (2) - F (3)</p>
            <p className="text-[11px] text-stone-400">Counts down by thirds</p>
          </div>
          <div className="p-3.5 rounded-xl bg-stone-800/80 border border-stone-700/60 space-y-1">
            <span className="font-bold text-amber-400">Half-Step Neighbors</span>
            <p className="text-stone-300 font-mono text-sm">B-C & E-F</p>
            <p className="text-[11px] text-stone-400">Adjacent frets (0 fret gap)</p>
          </div>
        </div>
      </div>
    </div>
  );
};

function AnchorIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="5" r="3" />
      <line x1="12" y1="22" x2="12" y2="8" />
      <path d="M5 12H2a10 10 0 0 0 20 0h-3" />
    </svg>
  );
}
