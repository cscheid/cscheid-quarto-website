import {
  addWave,
  baseSawTooth,
  baseSquare,
  changeFreq,
  expFadeInAt,
  expFadeOutAt,
  gain,
  then,
} from "./wave.js";

import { notes } from "./notes.js";

import { baseTrack, seqDelays } from "./track.js";

//////////////////////////////////////////////////////////////////////////////

export function ppinst(key, duration) {
  var baseWave = addWave(
    then(baseSawTooth, gain(0.25)),
    then(baseSquare, gain(0.75)),
  );
  var note = changeFreq(baseWave);

  return baseTrack(
    then(note(notes[key]),
      gain(0.75),
      expFadeOutAt(duration * 0.23, 95),
      expFadeInAt(0, 200)),
    duration,
  );
}

// the note
var gs = ppinst(24, 0.5);
var gs_n = ppinst(36, 0.5);
var cs_n = ppinst(29, 0.5);

var quarter_note = 0.225;

var d4 = quarter_note, d8 = quarter_note / 2;

export function playPppppp(player) {
  player.playTrack(seqDelays([
    [gs, d4],
    [gs_n, d8],
    [cs_n, d8],
    [gs, d4],
    [gs_n, d8],
    [cs_n, d8],
    [gs, d4],
    [gs_n, d8],
    [cs_n, d8],
    [gs, d4],
    [gs_n, d8],
    [cs_n, d8],
    [gs, d4],
    [gs_n, d8],
    [cs_n, d8],
    [gs, d4],
    [gs_n, d8],
    [cs_n, d8],
    [gs, d4],
    [gs_n, d8],
    [cs_n, d8],
    [gs, d4],
    [gs_n, d8],
    [cs_n, d8],
    [gs, d4],
  ]));
}
