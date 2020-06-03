import {
  drumVAECheckpoint,
  drumRNNCheckpoint,
  melodyRNNCheckpoint,
  NUM_REPS,
  STEPS_PER_CHORD,
  STEPS_PER_BEAT,
} from "./constants";

import { map, range } from "ramda";
import { MusicVAE } from "@magenta/music/node/music_vae";
import { MusicRNN } from "@magenta/music/node/music_rnn";
import {
  sequences,
  chords as mmChords,
  sequenceProtoToMidi,
} from "@magenta/music/node/core";

const globalAny = global;
globalAny.performance = Date;
globalAny.fetch = require("node-fetch");

// Drum Models
const drum_vae = new MusicVAE(drumVAECheckpoint);
const drum_rnn = new MusicRNN(drumRNNCheckpoint);

// Melody Models
const melody_rnn = new MusicRNN(melodyRNNCheckpoint);

const initializeModels = async () => {
  await drum_vae.initialize();
  await drum_rnn.initialize();
  await melody_rnn.initialize();
};

const generateDrums = async (qpm) => {
  const drum_samples = await drum_vae.sample(1, 1, undefined, 2);
  const continuedSequence = await drum_rnn.continueSequence(
    drum_samples[0],
    STEPS_PER_BEAT + (NUM_REPS - 1) * STEPS_PER_BEAT,
    0.9
  );

  continuedSequence.notes = continuedSequence.notes.map((el) => {
    el.instrument = 1;
    el.program = 1;
    el.velocity = 100;
    return el;
  });

  return continuedSequence;
};

const generateMelody = async (
  chordProgression,
  program,
  instrument,
  velocity
) => {
  const melody_samples = {
    quantizationInfo: { stepsPerQuarter: 4 },
    notes: [],
    totalQuantizedSteps: 1,
  };
  const continuedSequence = await melody_rnn.continueSequence(
    melody_samples,
    STEPS_PER_BEAT + (NUM_REPS - 1) * STEPS_PER_BEAT,
    0.9,
    chordProgression
  );
  continuedSequence.notes.forEach((note) => {
    note.instrument = instrument;
    note.program = program;
    note.velocity = velocity;
  });

  return continuedSequence;
};

const mergeSequences = (generatedSequences) => {
  const sequence = sequences.clone(generatedSequences[0]);
  sequence.notes = [];

  const mergedTrack = generatedSequences.reduce((acc, el) => {
    acc.notes = [...acc.notes, ...el.notes];
    return acc;
  }, sequence);

  mergedTrack.notes = mergedTrack.notes.sort(
    (a, b) => a.quantizedStartStep - b.quantizedStartStep
  );

  return mergedTrack;
};

export const generateMusic = async (chordProgression, qpm = 120) => {
  await initializeModels();
  const drums = await generateDrums(qpm);
  const bass = await generateMelody(chordProgression, 32, 1, 75);

  bass.notes = bass.notes.map(note => {
    note.pitch = note.pitch - 32;
    note.instrument = 3;
    note.velocity = 100;
    note.program = 32;
    return note;
  });

  const melody = await generateMelody(chordProgression, 10, 2, 100);

  melody.notes = melody.notes.map(note => {
    note.instrument = 4;
    note.velocity = 100;
    note.program = 12;
    return note;
  });

  const chordSequence = createChordSequence(chordProgression, melody);
  const mergedSequences = mergeSequences([drums, chordSequence, bass, melody]);

  return mergedSequences;
};

const createChordSequence = (chords, melody) => {
  const seq = sequences.clone(melody);
  const notes = [];
  map((i) => {
    chords.forEach((chord, j) => {
      const root = mmChords.ChordSymbols.root(chord);
      notes.push({
        instrument: 1,
        program: 0,
        velocity: 100,
        pitch: 36 + root,
        quantizedStartStep: i * STEPS_PER_BEAT + j * STEPS_PER_CHORD,
        quantizedEndStep: i * STEPS_PER_BEAT + (j + 1) * STEPS_PER_CHORD,
      });

      mmChords.ChordSymbols.pitches(chord).forEach((pitch, k) => {
        notes.push({
          instrument: 2,
          program: 0,
          velocity: 100,
          pitch: 48 + pitch,
          quantizedStartStep: i * STEPS_PER_BEAT + j * STEPS_PER_CHORD,
          quantizedEndStep: i * STEPS_PER_BEAT + (j + 1) * STEPS_PER_CHORD,
        });
      });
    });
  }, range(0, NUM_REPS));

  seq.notes = notes;

  return seq;
};
