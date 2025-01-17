export const drumVAECheckpoint =
  "https://storage.googleapis.com/magentadata/js/checkpoints/music_vae/drums_2bar_lokl_small";
export const drumRNNCheckpoint =
  "https://storage.googleapis.com/magentadata/js/checkpoints/music_rnn/drum_kit_rnn";
export const melodyRNNCheckpoint =
  "https://storage.googleapis.com/magentadata/js/checkpoints/music_rnn/chord_pitches_improv";

export const NUM_REPS = 7;
export const STEPS_PER_CHORD = 16;
export const STEPS_PER_BEAT = 4 * STEPS_PER_CHORD;

export const QUANTIZED_LENGTH = (NUM_REPS - 1) * 16 - 4