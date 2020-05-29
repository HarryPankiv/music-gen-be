import {
  drumVAECheckpoint,
  drumRNNCheckpoint,
  melodyRNNCheckpoint,
} from "./constants";

import { MusicVAE } from "@magenta/music/node/music_vae";
import { MusicRNN } from "@magenta/music/node/music_rnn";
import { sequences } from "@magenta/music/node/core";

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

const generateDrums = async () => {
  const drum_samples = await drum_vae.sample(1);
  const continuedSequence = await drum_rnn.continueSequence(
    drum_samples[0],
    200,
    0.1
  );

  return continuedSequence;
};

const generateMelody = async (
  chordProgression,
  program,
  instrument,
  velocity
) => {
  await melody_rnn.initialize();
  const melody_samples = {
    quantizationInfo: { stepsPerQuarter: 4 },
    notes: [],
    totalQuantizedSteps: 1,
  };
  const continuedSequence = await melody_rnn.continueSequence(
    melody_samples,
    200,
    1,
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

export const generateMusic = async (chordProgression) => {
  await initializeModels();
  const drums = await generateDrums();
  const bass = await generateMelody(chordProgression, 32, 1, 75);
  bass.notes.forEach((note, index) => {
    bass.notes[index].pitch = note.pitch - 32;
  });
  const melody = await generateMelody(chordProgression, 9, 2);

  return mergeSequences([drums, bass, melody]);
};
