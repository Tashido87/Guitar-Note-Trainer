import { PickStrumSong } from '../types';

export const PICK_STRUM_SONGS: PickStrumSong[] = [
  {
    id: 'ex-18-country-classic',
    exerciseNumber: 18,
    title: 'Country "Pick-Strum" Classic',
    subtitle: 'Hal Leonard / Mel Bay Method - Alternating Bass in C',
    timeSignature: '4/4',
    defaultBpm: 88,
    key: 'C Major',
    level: 'Beginner',
    description: 'The foundational country alternating bass pattern. Pick the root bass note on beat 1, downstrum on beat 2, pick the secondary bass note on beat 3, and downstrum on beat 4.',
    techniqueTip: 'Keep your chord fingers firmly in position while your pick alternates between the two bass strings. Downstrum (V) cleanly across the higher 3-4 strings.',
    hasRepeat: true,
    measures: [
      // Measure 1: C Major (C root -> E alternating)
      {
        measureNumber: 1,
        chordName: 'C',
        beats: [
          { beatNumber: 1, type: 'bass', noteName: 'C', octave: 3, staffYStep: -2, ledgerLinesBelow: 1, stringNumber: 5, fret: 3, finger: 3, frequency: 130.81 },
          { beatNumber: 2, type: 'strum', isDownstrum: true },
          { beatNumber: 3, type: 'bass', noteName: 'E', octave: 3, staffYStep: 0, ledgerLinesBelow: 0, stringNumber: 4, fret: 2, finger: 2, frequency: 164.81 },
          { beatNumber: 4, type: 'strum', isDownstrum: true },
        ],
      },
      // Measure 2: F Major (F root -> Open D alternating)
      {
        measureNumber: 2,
        chordName: 'F',
        beats: [
          { beatNumber: 1, type: 'bass', noteName: 'F', octave: 3, staffYStep: 1, ledgerLinesBelow: 0, stringNumber: 4, fret: 3, finger: 3, frequency: 174.61 },
          { beatNumber: 2, type: 'strum', isDownstrum: true },
          { beatNumber: 3, type: 'bass', noteName: 'D', octave: 3, staffYStep: -1, ledgerLinesBelow: 0, stringNumber: 4, fret: 0, finger: 0, frequency: 146.83 },
          { beatNumber: 4, type: 'strum', isDownstrum: true },
        ],
      },
      // Measure 3: C Major (C root -> E alternating)
      {
        measureNumber: 3,
        chordName: 'C',
        beats: [
          { beatNumber: 1, type: 'bass', noteName: 'C', octave: 3, staffYStep: -2, ledgerLinesBelow: 1, stringNumber: 5, fret: 3, finger: 3, frequency: 130.81 },
          { beatNumber: 2, type: 'strum', isDownstrum: true },
          { beatNumber: 3, type: 'bass', noteName: 'E', octave: 3, staffYStep: 0, ledgerLinesBelow: 0, stringNumber: 4, fret: 2, finger: 2, frequency: 164.81 },
          { beatNumber: 4, type: 'strum', isDownstrum: true },
        ],
      },
      // Measure 4: G7 (Bass G -> B alternating)
      {
        measureNumber: 4,
        chordName: 'G7',
        beats: [
          { beatNumber: 1, type: 'bass', noteName: 'G', octave: 2, staffYStep: -5, ledgerLinesBelow: 2, stringNumber: 6, fret: 3, finger: 3, frequency: 98.00 },
          { beatNumber: 2, type: 'strum', isDownstrum: true },
          { beatNumber: 3, type: 'bass', noteName: 'B', octave: 2, staffYStep: -3, ledgerLinesBelow: 1, stringNumber: 5, fret: 2, finger: 2, frequency: 123.47 },
          { beatNumber: 4, type: 'strum', isDownstrum: true },
        ],
      },
      // Measure 5: C Major (System 2 start)
      {
        measureNumber: 5,
        chordName: 'C',
        beats: [
          { beatNumber: 1, type: 'bass', noteName: 'C', octave: 3, staffYStep: -2, ledgerLinesBelow: 1, stringNumber: 5, fret: 3, finger: 3, frequency: 130.81 },
          { beatNumber: 2, type: 'strum', isDownstrum: true },
          { beatNumber: 3, type: 'bass', noteName: 'E', octave: 3, staffYStep: 0, ledgerLinesBelow: 0, stringNumber: 4, fret: 2, finger: 2, frequency: 164.81 },
          { beatNumber: 4, type: 'strum', isDownstrum: true },
        ],
      },
      // Measure 6: F Major
      {
        measureNumber: 6,
        chordName: 'F',
        beats: [
          { beatNumber: 1, type: 'bass', noteName: 'F', octave: 3, staffYStep: 1, ledgerLinesBelow: 0, stringNumber: 4, fret: 3, finger: 3, frequency: 174.61 },
          { beatNumber: 2, type: 'strum', isDownstrum: true },
          { beatNumber: 3, type: 'bass', noteName: 'D', octave: 3, staffYStep: -1, ledgerLinesBelow: 0, stringNumber: 4, fret: 0, finger: 0, frequency: 146.83 },
          { beatNumber: 4, type: 'strum', isDownstrum: true },
        ],
      },
      // Measure 7: G7
      {
        measureNumber: 7,
        chordName: 'G7',
        beats: [
          { beatNumber: 1, type: 'bass', noteName: 'G', octave: 2, staffYStep: -5, ledgerLinesBelow: 2, stringNumber: 6, fret: 3, finger: 3, frequency: 98.00 },
          { beatNumber: 2, type: 'strum', isDownstrum: true },
          { beatNumber: 3, type: 'bass', noteName: 'B', octave: 2, staffYStep: -3, ledgerLinesBelow: 1, stringNumber: 5, fret: 2, finger: 2, frequency: 123.47 },
          { beatNumber: 4, type: 'strum', isDownstrum: true },
        ],
      },
      // Measure 8: C Major (Final measure with triple strum ending)
      {
        measureNumber: 8,
        chordName: 'C',
        beats: [
          { beatNumber: 1, type: 'bass', noteName: 'C', octave: 3, staffYStep: -2, ledgerLinesBelow: 1, stringNumber: 5, fret: 3, finger: 3, frequency: 130.81 },
          { beatNumber: 2, type: 'strum', isDownstrum: true },
          { beatNumber: 3, type: 'strum', isDownstrum: true },
          { beatNumber: 4, type: 'strum', isDownstrum: true },
        ],
      },
    ],
  },

  {
    id: 'ex-19-folk-campfire',
    exerciseNumber: 19,
    title: 'Folk Campfire Strummer',
    subtitle: 'Classic Key of G - Alternating Bass in G, C, and D7',
    timeSignature: '4/4',
    defaultBpm: 92,
    key: 'G Major',
    level: 'Beginner',
    description: 'One of the most essential folk chord progressions. Move effortlessly between Low G (6th string 3rd fret), Middle C (5th string 3rd fret), and Open D (4th string).',
    techniqueTip: 'On the G chord, alternate between 6th string (Root G) and 4th string (Open D). On D7, alternate between 4th string (Open D) and 5th string (Open A).',
    hasRepeat: true,
    measures: [
      // Measure 1: G Major
      {
        measureNumber: 1,
        chordName: 'G',
        beats: [
          { beatNumber: 1, type: 'bass', noteName: 'G', octave: 2, staffYStep: -5, ledgerLinesBelow: 2, stringNumber: 6, fret: 3, finger: 3, frequency: 98.00 },
          { beatNumber: 2, type: 'strum', isDownstrum: true },
          { beatNumber: 3, type: 'bass', noteName: 'D', octave: 3, staffYStep: -1, ledgerLinesBelow: 0, stringNumber: 4, fret: 0, finger: 0, frequency: 146.83 },
          { beatNumber: 4, type: 'strum', isDownstrum: true },
        ],
      },
      // Measure 2: C Major
      {
        measureNumber: 2,
        chordName: 'C',
        beats: [
          { beatNumber: 1, type: 'bass', noteName: 'C', octave: 3, staffYStep: -2, ledgerLinesBelow: 1, stringNumber: 5, fret: 3, finger: 3, frequency: 130.81 },
          { beatNumber: 2, type: 'strum', isDownstrum: true },
          { beatNumber: 3, type: 'bass', noteName: 'E', octave: 3, staffYStep: 0, ledgerLinesBelow: 0, stringNumber: 4, fret: 2, finger: 2, frequency: 164.81 },
          { beatNumber: 4, type: 'strum', isDownstrum: true },
        ],
      },
      // Measure 3: G Major
      {
        measureNumber: 3,
        chordName: 'G',
        beats: [
          { beatNumber: 1, type: 'bass', noteName: 'G', octave: 2, staffYStep: -5, ledgerLinesBelow: 2, stringNumber: 6, fret: 3, finger: 3, frequency: 98.00 },
          { beatNumber: 2, type: 'strum', isDownstrum: true },
          { beatNumber: 3, type: 'bass', noteName: 'D', octave: 3, staffYStep: -1, ledgerLinesBelow: 0, stringNumber: 4, fret: 0, finger: 0, frequency: 146.83 },
          { beatNumber: 4, type: 'strum', isDownstrum: true },
        ],
      },
      // Measure 4: D7
      {
        measureNumber: 4,
        chordName: 'D7',
        beats: [
          { beatNumber: 1, type: 'bass', noteName: 'D', octave: 3, staffYStep: -1, ledgerLinesBelow: 0, stringNumber: 4, fret: 0, finger: 0, frequency: 146.83 },
          { beatNumber: 2, type: 'strum', isDownstrum: true },
          { beatNumber: 3, type: 'bass', noteName: 'A', octave: 2, staffYStep: -4, ledgerLinesBelow: 2, stringNumber: 5, fret: 0, finger: 0, frequency: 110.00 },
          { beatNumber: 4, type: 'strum', isDownstrum: true },
        ],
      },
      // Measure 5: G Major
      {
        measureNumber: 5,
        chordName: 'G',
        beats: [
          { beatNumber: 1, type: 'bass', noteName: 'G', octave: 2, staffYStep: -5, ledgerLinesBelow: 2, stringNumber: 6, fret: 3, finger: 3, frequency: 98.00 },
          { beatNumber: 2, type: 'strum', isDownstrum: true },
          { beatNumber: 3, type: 'bass', noteName: 'D', octave: 3, staffYStep: -1, ledgerLinesBelow: 0, stringNumber: 4, fret: 0, finger: 0, frequency: 146.83 },
          { beatNumber: 4, type: 'strum', isDownstrum: true },
        ],
      },
      // Measure 6: C Major
      {
        measureNumber: 6,
        chordName: 'C',
        beats: [
          { beatNumber: 1, type: 'bass', noteName: 'C', octave: 3, staffYStep: -2, ledgerLinesBelow: 1, stringNumber: 5, fret: 3, finger: 3, frequency: 130.81 },
          { beatNumber: 2, type: 'strum', isDownstrum: true },
          { beatNumber: 3, type: 'bass', noteName: 'E', octave: 3, staffYStep: 0, ledgerLinesBelow: 0, stringNumber: 4, fret: 2, finger: 2, frequency: 164.81 },
          { beatNumber: 4, type: 'strum', isDownstrum: true },
        ],
      },
      // Measure 7: D7
      {
        measureNumber: 7,
        chordName: 'D7',
        beats: [
          { beatNumber: 1, type: 'bass', noteName: 'D', octave: 3, staffYStep: -1, ledgerLinesBelow: 0, stringNumber: 4, fret: 0, finger: 0, frequency: 146.83 },
          { beatNumber: 2, type: 'strum', isDownstrum: true },
          { beatNumber: 3, type: 'bass', noteName: 'A', octave: 2, staffYStep: -4, ledgerLinesBelow: 2, stringNumber: 5, fret: 0, finger: 0, frequency: 110.00 },
          { beatNumber: 4, type: 'strum', isDownstrum: true },
        ],
      },
      // Measure 8: G Major Ending
      {
        measureNumber: 8,
        chordName: 'G',
        beats: [
          { beatNumber: 1, type: 'bass', noteName: 'G', octave: 2, staffYStep: -5, ledgerLinesBelow: 2, stringNumber: 6, fret: 3, finger: 3, frequency: 98.00 },
          { beatNumber: 2, type: 'strum', isDownstrum: true },
          { beatNumber: 3, type: 'strum', isDownstrum: true },
          { beatNumber: 4, type: 'strum', isDownstrum: true },
        ],
      },
    ],
  },

  {
    id: 'ex-20-bluegrass-walk',
    exerciseNumber: 20,
    title: 'Bluegrass Mountain Walk',
    subtitle: 'Traditional Progression - G, Em, C, D',
    timeSignature: '4/4',
    defaultBpm: 96,
    key: 'G Major / E Minor',
    level: 'Intermediate',
    description: 'A classic 4-chord progression featuring the deep open low E string bass for the E Minor chord.',
    techniqueTip: 'Notice the transition to E Minor: pick the open 6th string (Low E), followed by the 5th string 2nd fret (B).',
    hasRepeat: true,
    measures: [
      // Measure 1: G Major
      {
        measureNumber: 1,
        chordName: 'G',
        beats: [
          { beatNumber: 1, type: 'bass', noteName: 'G', octave: 2, staffYStep: -5, ledgerLinesBelow: 2, stringNumber: 6, fret: 3, finger: 3, frequency: 98.00 },
          { beatNumber: 2, type: 'strum', isDownstrum: true },
          { beatNumber: 3, type: 'bass', noteName: 'B', octave: 2, staffYStep: -3, ledgerLinesBelow: 1, stringNumber: 5, fret: 2, finger: 2, frequency: 123.47 },
          { beatNumber: 4, type: 'strum', isDownstrum: true },
        ],
      },
      // Measure 2: E Minor (Em)
      {
        measureNumber: 2,
        chordName: 'Em',
        beats: [
          { beatNumber: 1, type: 'bass', noteName: 'E', octave: 2, staffYStep: -7, ledgerLinesBelow: 3, stringNumber: 6, fret: 0, finger: 0, frequency: 82.41 },
          { beatNumber: 2, type: 'strum', isDownstrum: true },
          { beatNumber: 3, type: 'bass', noteName: 'B', octave: 2, staffYStep: -3, ledgerLinesBelow: 1, stringNumber: 5, fret: 2, finger: 2, frequency: 123.47 },
          { beatNumber: 4, type: 'strum', isDownstrum: true },
        ],
      },
      // Measure 3: C Major
      {
        measureNumber: 3,
        chordName: 'C',
        beats: [
          { beatNumber: 1, type: 'bass', noteName: 'C', octave: 3, staffYStep: -2, ledgerLinesBelow: 1, stringNumber: 5, fret: 3, finger: 3, frequency: 130.81 },
          { beatNumber: 2, type: 'strum', isDownstrum: true },
          { beatNumber: 3, type: 'bass', noteName: 'E', octave: 3, staffYStep: 0, ledgerLinesBelow: 0, stringNumber: 4, fret: 2, finger: 2, frequency: 164.81 },
          { beatNumber: 4, type: 'strum', isDownstrum: true },
        ],
      },
      // Measure 4: D Major
      {
        measureNumber: 4,
        chordName: 'D',
        beats: [
          { beatNumber: 1, type: 'bass', noteName: 'D', octave: 3, staffYStep: -1, ledgerLinesBelow: 0, stringNumber: 4, fret: 0, finger: 0, frequency: 146.83 },
          { beatNumber: 2, type: 'strum', isDownstrum: true },
          { beatNumber: 3, type: 'bass', noteName: 'A', octave: 2, staffYStep: -4, ledgerLinesBelow: 2, stringNumber: 5, fret: 0, finger: 0, frequency: 110.00 },
          { beatNumber: 4, type: 'strum', isDownstrum: true },
        ],
      },
      // Measure 5: G Major
      {
        measureNumber: 5,
        chordName: 'G',
        beats: [
          { beatNumber: 1, type: 'bass', noteName: 'G', octave: 2, staffYStep: -5, ledgerLinesBelow: 2, stringNumber: 6, fret: 3, finger: 3, frequency: 98.00 },
          { beatNumber: 2, type: 'strum', isDownstrum: true },
          { beatNumber: 3, type: 'bass', noteName: 'B', octave: 2, staffYStep: -3, ledgerLinesBelow: 1, stringNumber: 5, fret: 2, finger: 2, frequency: 123.47 },
          { beatNumber: 4, type: 'strum', isDownstrum: true },
        ],
      },
      // Measure 6: E Minor
      {
        measureNumber: 6,
        chordName: 'Em',
        beats: [
          { beatNumber: 1, type: 'bass', noteName: 'E', octave: 2, staffYStep: -7, ledgerLinesBelow: 3, stringNumber: 6, fret: 0, finger: 0, frequency: 82.41 },
          { beatNumber: 2, type: 'strum', isDownstrum: true },
          { beatNumber: 3, type: 'bass', noteName: 'B', octave: 2, staffYStep: -3, ledgerLinesBelow: 1, stringNumber: 5, fret: 2, finger: 2, frequency: 123.47 },
          { beatNumber: 4, type: 'strum', isDownstrum: true },
        ],
      },
      // Measure 7: C Major
      {
        measureNumber: 7,
        chordName: 'C',
        beats: [
          { beatNumber: 1, type: 'bass', noteName: 'C', octave: 3, staffYStep: -2, ledgerLinesBelow: 1, stringNumber: 5, fret: 3, finger: 3, frequency: 130.81 },
          { beatNumber: 2, type: 'strum', isDownstrum: true },
          { beatNumber: 3, type: 'bass', noteName: 'D', octave: 3, staffYStep: -1, ledgerLinesBelow: 0, stringNumber: 4, fret: 0, finger: 0, frequency: 146.83 },
          { beatNumber: 4, type: 'strum', isDownstrum: true },
        ],
      },
      // Measure 8: G Major Ending
      {
        measureNumber: 8,
        chordName: 'G',
        beats: [
          { beatNumber: 1, type: 'bass', noteName: 'G', octave: 2, staffYStep: -5, ledgerLinesBelow: 2, stringNumber: 6, fret: 3, finger: 3, frequency: 98.00 },
          { beatNumber: 2, type: 'strum', isDownstrum: true },
          { beatNumber: 3, type: 'strum', isDownstrum: true },
          { beatNumber: 4, type: 'strum', isDownstrum: true },
        ],
      },
    ],
  },

  {
    id: 'ex-21-spanish-minor',
    exerciseNumber: 21,
    title: 'Spanish Minor Ballad',
    subtitle: 'Expressive A Minor - Am, Dm, E7, Am',
    timeSignature: '4/4',
    defaultBpm: 84,
    key: 'A Minor',
    level: 'Intermediate',
    description: 'An emotional minor key study teaching bass notes for the 3 fundamental minor chords: Open A (Am), Open D (Dm), and Open Low E (E7).',
    techniqueTip: 'For the Am chord, pick 5th string open A, then 4th string 2nd fret E. For Dm, pick 4th string open D, then 5th string open A.',
    hasRepeat: true,
    measures: [
      // Measure 1: Am
      {
        measureNumber: 1,
        chordName: 'Am',
        beats: [
          { beatNumber: 1, type: 'bass', noteName: 'A', octave: 2, staffYStep: -4, ledgerLinesBelow: 2, stringNumber: 5, fret: 0, finger: 0, frequency: 110.00 },
          { beatNumber: 2, type: 'strum', isDownstrum: true },
          { beatNumber: 3, type: 'bass', noteName: 'E', octave: 3, staffYStep: 0, ledgerLinesBelow: 0, stringNumber: 4, fret: 2, finger: 2, frequency: 164.81 },
          { beatNumber: 4, type: 'strum', isDownstrum: true },
        ],
      },
      // Measure 2: Dm
      {
        measureNumber: 2,
        chordName: 'Dm',
        beats: [
          { beatNumber: 1, type: 'bass', noteName: 'D', octave: 3, staffYStep: -1, ledgerLinesBelow: 0, stringNumber: 4, fret: 0, finger: 0, frequency: 146.83 },
          { beatNumber: 2, type: 'strum', isDownstrum: true },
          { beatNumber: 3, type: 'bass', noteName: 'A', octave: 2, staffYStep: -4, ledgerLinesBelow: 2, stringNumber: 5, fret: 0, finger: 0, frequency: 110.00 },
          { beatNumber: 4, type: 'strum', isDownstrum: true },
        ],
      },
      // Measure 3: E7
      {
        measureNumber: 3,
        chordName: 'E7',
        beats: [
          { beatNumber: 1, type: 'bass', noteName: 'E', octave: 2, staffYStep: -7, ledgerLinesBelow: 3, stringNumber: 6, fret: 0, finger: 0, frequency: 82.41 },
          { beatNumber: 2, type: 'strum', isDownstrum: true },
          { beatNumber: 3, type: 'bass', noteName: 'B', octave: 2, staffYStep: -3, ledgerLinesBelow: 1, stringNumber: 5, fret: 2, finger: 2, frequency: 123.47 },
          { beatNumber: 4, type: 'strum', isDownstrum: true },
        ],
      },
      // Measure 4: Am
      {
        measureNumber: 4,
        chordName: 'Am',
        beats: [
          { beatNumber: 1, type: 'bass', noteName: 'A', octave: 2, staffYStep: -4, ledgerLinesBelow: 2, stringNumber: 5, fret: 0, finger: 0, frequency: 110.00 },
          { beatNumber: 2, type: 'strum', isDownstrum: true },
          { beatNumber: 3, type: 'bass', noteName: 'E', octave: 3, staffYStep: 0, ledgerLinesBelow: 0, stringNumber: 4, fret: 2, finger: 2, frequency: 164.81 },
          { beatNumber: 4, type: 'strum', isDownstrum: true },
        ],
      },
      // Measure 5: Am
      {
        measureNumber: 5,
        chordName: 'Am',
        beats: [
          { beatNumber: 1, type: 'bass', noteName: 'A', octave: 2, staffYStep: -4, ledgerLinesBelow: 2, stringNumber: 5, fret: 0, finger: 0, frequency: 110.00 },
          { beatNumber: 2, type: 'strum', isDownstrum: true },
          { beatNumber: 3, type: 'bass', noteName: 'E', octave: 3, staffYStep: 0, ledgerLinesBelow: 0, stringNumber: 4, fret: 2, finger: 2, frequency: 164.81 },
          { beatNumber: 4, type: 'strum', isDownstrum: true },
        ],
      },
      // Measure 6: Dm
      {
        measureNumber: 6,
        chordName: 'Dm',
        beats: [
          { beatNumber: 1, type: 'bass', noteName: 'D', octave: 3, staffYStep: -1, ledgerLinesBelow: 0, stringNumber: 4, fret: 0, finger: 0, frequency: 146.83 },
          { beatNumber: 2, type: 'strum', isDownstrum: true },
          { beatNumber: 3, type: 'bass', noteName: 'A', octave: 2, staffYStep: -4, ledgerLinesBelow: 2, stringNumber: 5, fret: 0, finger: 0, frequency: 110.00 },
          { beatNumber: 4, type: 'strum', isDownstrum: true },
        ],
      },
      // Measure 7: E7
      {
        measureNumber: 7,
        chordName: 'E7',
        beats: [
          { beatNumber: 1, type: 'bass', noteName: 'E', octave: 2, staffYStep: -7, ledgerLinesBelow: 3, stringNumber: 6, fret: 0, finger: 0, frequency: 82.41 },
          { beatNumber: 2, type: 'strum', isDownstrum: true },
          { beatNumber: 3, type: 'bass', noteName: 'B', octave: 2, staffYStep: -3, ledgerLinesBelow: 1, stringNumber: 5, fret: 2, finger: 2, frequency: 123.47 },
          { beatNumber: 4, type: 'strum', isDownstrum: true },
        ],
      },
      // Measure 8: Am Ending
      {
        measureNumber: 8,
        chordName: 'Am',
        beats: [
          { beatNumber: 1, type: 'bass', noteName: 'A', octave: 2, staffYStep: -4, ledgerLinesBelow: 2, stringNumber: 5, fret: 0, finger: 0, frequency: 110.00 },
          { beatNumber: 2, type: 'strum', isDownstrum: true },
          { beatNumber: 3, type: 'strum', isDownstrum: true },
          { beatNumber: 4, type: 'strum', isDownstrum: true },
        ],
      },
    ],
  },

  {
    id: 'ex-22-blues-boogie',
    exerciseNumber: 22,
    title: 'Blues Pick-Strum Shuffle',
    subtitle: 'Classic 12-Bar Blues Roots in A - A7, D7, E7',
    timeSignature: '4/4',
    defaultBpm: 90,
    key: 'A Mixolydian',
    level: 'Intermediate',
    description: 'Learn the driving rhythmic engine of acoustic blues! Pick the open low root bass notes on beats 1 & 3 with swinging downstrums.',
    techniqueTip: 'Let the bass note ring out strongly to establish the acoustic blues groove before clipping into the downstrum.',
    hasRepeat: true,
    measures: [
      // Measure 1: A7
      {
        measureNumber: 1,
        chordName: 'A7',
        beats: [
          { beatNumber: 1, type: 'bass', noteName: 'A', octave: 2, staffYStep: -4, ledgerLinesBelow: 2, stringNumber: 5, fret: 0, finger: 0, frequency: 110.00 },
          { beatNumber: 2, type: 'strum', isDownstrum: true },
          { beatNumber: 3, type: 'bass', noteName: 'E', octave: 3, staffYStep: 0, ledgerLinesBelow: 0, stringNumber: 4, fret: 2, finger: 2, frequency: 164.81 },
          { beatNumber: 4, type: 'strum', isDownstrum: true },
        ],
      },
      // Measure 2: D7
      {
        measureNumber: 2,
        chordName: 'D7',
        beats: [
          { beatNumber: 1, type: 'bass', noteName: 'D', octave: 3, staffYStep: -1, ledgerLinesBelow: 0, stringNumber: 4, fret: 0, finger: 0, frequency: 146.83 },
          { beatNumber: 2, type: 'strum', isDownstrum: true },
          { beatNumber: 3, type: 'bass', noteName: 'A', octave: 2, staffYStep: -4, ledgerLinesBelow: 2, stringNumber: 5, fret: 0, finger: 0, frequency: 110.00 },
          { beatNumber: 4, type: 'strum', isDownstrum: true },
        ],
      },
      // Measure 3: A7
      {
        measureNumber: 3,
        chordName: 'A7',
        beats: [
          { beatNumber: 1, type: 'bass', noteName: 'A', octave: 2, staffYStep: -4, ledgerLinesBelow: 2, stringNumber: 5, fret: 0, finger: 0, frequency: 110.00 },
          { beatNumber: 2, type: 'strum', isDownstrum: true },
          { beatNumber: 3, type: 'bass', noteName: 'E', octave: 3, staffYStep: 0, ledgerLinesBelow: 0, stringNumber: 4, fret: 2, finger: 2, frequency: 164.81 },
          { beatNumber: 4, type: 'strum', isDownstrum: true },
        ],
      },
      // Measure 4: E7
      {
        measureNumber: 4,
        chordName: 'E7',
        beats: [
          { beatNumber: 1, type: 'bass', noteName: 'E', octave: 2, staffYStep: -7, ledgerLinesBelow: 3, stringNumber: 6, fret: 0, finger: 0, frequency: 82.41 },
          { beatNumber: 2, type: 'strum', isDownstrum: true },
          { beatNumber: 3, type: 'bass', noteName: 'B', octave: 2, staffYStep: -3, ledgerLinesBelow: 1, stringNumber: 5, fret: 2, finger: 2, frequency: 123.47 },
          { beatNumber: 4, type: 'strum', isDownstrum: true },
        ],
      },
      // Measure 5: D7
      {
        measureNumber: 5,
        chordName: 'D7',
        beats: [
          { beatNumber: 1, type: 'bass', noteName: 'D', octave: 3, staffYStep: -1, ledgerLinesBelow: 0, stringNumber: 4, fret: 0, finger: 0, frequency: 146.83 },
          { beatNumber: 2, type: 'strum', isDownstrum: true },
          { beatNumber: 3, type: 'bass', noteName: 'A', octave: 2, staffYStep: -4, ledgerLinesBelow: 2, stringNumber: 5, fret: 0, finger: 0, frequency: 110.00 },
          { beatNumber: 4, type: 'strum', isDownstrum: true },
        ],
      },
      // Measure 6: A7
      {
        measureNumber: 6,
        chordName: 'A7',
        beats: [
          { beatNumber: 1, type: 'bass', noteName: 'A', octave: 2, staffYStep: -4, ledgerLinesBelow: 2, stringNumber: 5, fret: 0, finger: 0, frequency: 110.00 },
          { beatNumber: 2, type: 'strum', isDownstrum: true },
          { beatNumber: 3, type: 'bass', noteName: 'E', octave: 3, staffYStep: 0, ledgerLinesBelow: 0, stringNumber: 4, fret: 2, finger: 2, frequency: 164.81 },
          { beatNumber: 4, type: 'strum', isDownstrum: true },
        ],
      },
      // Measure 7: E7
      {
        measureNumber: 7,
        chordName: 'E7',
        beats: [
          { beatNumber: 1, type: 'bass', noteName: 'E', octave: 2, staffYStep: -7, ledgerLinesBelow: 3, stringNumber: 6, fret: 0, finger: 0, frequency: 82.41 },
          { beatNumber: 2, type: 'strum', isDownstrum: true },
          { beatNumber: 3, type: 'bass', noteName: 'B', octave: 2, staffYStep: -3, ledgerLinesBelow: 1, stringNumber: 5, fret: 2, finger: 2, frequency: 123.47 },
          { beatNumber: 4, type: 'strum', isDownstrum: true },
        ],
      },
      // Measure 8: A7 Ending
      {
        measureNumber: 8,
        chordName: 'A7',
        beats: [
          { beatNumber: 1, type: 'bass', noteName: 'A', octave: 2, staffYStep: -4, ledgerLinesBelow: 2, stringNumber: 5, fret: 0, finger: 0, frequency: 110.00 },
          { beatNumber: 2, type: 'strum', isDownstrum: true },
          { beatNumber: 3, type: 'strum', isDownstrum: true },
          { beatNumber: 4, type: 'strum', isDownstrum: true },
        ],
      },
    ],
  },
];
