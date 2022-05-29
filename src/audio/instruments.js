import {
  addWave,
  chirpT,
  expChirpT,
  expFadeInAt,
  expFadeOut2At,
  gain,
  inverseSawTooth,
  sawTooth,
  sine,
  square,
  then,
  triangle,
} from "./wave.js";

import { baseKeyboard, notes } from "./notes.js";

import { baseTrack, overlappingSeq, parallel } from "./track.js";

export function instrument1(key) {
  return baseTrack(
    then(sine(notes[key]),
      gain(0.5),
      expFadeOut2At(0, 10),
      expFadeInAt(0, 100)),
    1,
  );
}

export function instrument2(key) {
  return baseTrack(
    then(sawTooth(notes[key]),
      gain(0.5),
      expFadeOut2At(0, 10),
      expFadeInAt(0, 50)),
    1,
  );
}

export function instrument3(key) {
  return baseTrack(
    then(triangle(notes[key]),
      gain(0.5),
      expFadeOut2At(0, 10),
      expFadeInAt(0, 50)),
    1,
  );
}

export function instrument4(key) {
  return baseTrack(
    then(square(notes[key]),
      gain(0.5),
      expFadeOut2At(0, 10),
      expFadeInAt(0, 50)),
    1,
  );
}

export function instrument5(key) {
  return baseTrack(
    then(inverseSawTooth(notes[key]),
      gain(0.5),
      expFadeOut2At(0, 10),
      expFadeInAt(0, 50)),
    1,
  );
}
