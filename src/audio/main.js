import * as d3 from "https://cdn.skypack.dev/d3@7";

import { makePlayer } from "./audio.js";

import { baseKeyboard, notes } from "./notes.js";

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

import { baseTrack, overlappingSeq, parallel } from "./track.js";

import { playPppppp } from "./pppppp.js";

import { playPocketCalculator } from "./pocketCalculator.js";

import {
  instrument1,
  instrument2,
  instrument3,
  instrument4,
  instrument5,
} from "./instruments.js";

//////////////////////////////////////////////////////////////////////////////

export function init()
{
  d3.select("#start")
  .append("button")
  .text("Start")
  .on("click", () => {
    let player = makePlayer();
    window.player = player;
  });
  var i = instrument4;
  var seq = parallel([
    i(baseKeyboard["D"]),
    i(baseKeyboard["Gb"]),
    i(baseKeyboard["A"]),
  ]);
  var seq2 = overlappingSeq(
    [i(baseKeyboard["D"]), i(baseKeyboard["Gb"]), i(baseKeyboard["A"])],
    0.05,
  );
  
  var buttons = [
    { name: "Sine", instrument: instrument1 },
    { name: "Triangle", instrument: instrument3 },
    { name: "Square", instrument: instrument4 },
    { name: "Sawtooth", instrument: instrument2 },
  ];
  
  d3.select("#buttons")
    .selectAll("button")
    .data(buttons)
    .enter()
    .append("button")
    .text((d) => d.name)
    .on("click", (e, d) => {
      var i = d.instrument;
      var seq = overlappingSeq([
        i(baseKeyboard["D"]),
        i(baseKeyboard["Gb"]),
        i(baseKeyboard["A"]),
      ], 0.05);
      player.playTrack(seq);
    });
  
  d3.select("#songs")
    .selectAll("button")
    .data([{ "name": "pushing onwards", "fun": () => playPppppp(player) }, {
      "name": "pocket calculator",
      "fun": () => playPocketCalculator(player),
    }])
    .enter()
    .append("button")
    .text((d) => d.name)
    .on("click", (e, d) => d.fun());
  
  ////////////////////////////////////////////////////////////////////////////////
  
  var weirdStuff = [
    {
      "name": "chirpChord",
      "fun": (d) =>
        player.playWave(
          then(addWave(chirpT(200), chirpT(200 * 1.41), chirpT(400)), gain(0.05)),
          [2, 2.5],
        ),
    },
    {
      "name": "expChirpChord",
      "fun": (d) =>
        player.playWave(
          then(addWave(expChirpT(10), expChirpT(20), expChirpT(40)), gain(0.05)),
          [1, 3],
        ),
    },
  ];
  
  d3.select("#weird-stuff")
    .selectAll("button")
    .data(weirdStuff)
    .enter()
    .append("button")
    .text((d) => d.name)
    .on("click", (e, d) => d.fun());
  
}
