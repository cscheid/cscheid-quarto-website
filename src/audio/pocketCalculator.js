import { notes } from "./notes.js";

import { expFadeInAt, expFadeOut2At, sawTooth, then } from "./wave.js";

import { baseTrack, seqDelays } from "./track.js";

function pocketCalculatorInst(key) {
  return baseTrack(
    then(sawTooth(notes[key]),
      expFadeOut2At(0, 10),
      expFadeInAt(0, 50)),
    1,
  );
}

var pocketCalcNotes = [
  [36, 1],
  [38, 1],
  [45, 2],
  [45, 3],
  [43, 1],
  [36, 1],
  [38, 1],
  [43, 2],
  [43, 1],
  [42, 2],
  [40, 1],
];

var quarterNote = 0.215;
export function playPocketCalculator(player) {
  player.playTrack(seqDelays(pocketCalcNotes.map((desc) => [
    pocketCalculatorInst(desc[0], 0.0),
    quarterNote * desc[1],
  ])));
}
