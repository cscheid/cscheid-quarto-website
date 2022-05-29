// our 'piano' has keyboard C mapping to piano C4;
//                          X mapping to       B3;
//                          F mapping to piano C#4;
// etc

import * as d3 from "https://cdn.skypack.dev/d3";

import { parallel } from "./track.js";

import { instrument2 } from "./instruments.js";

var pianoKeys = [
  { "note": 28 - 12, "kind": "white", "x": -7 - 7, "y": 0 },
  { "note": 30 - 12, "kind": "white", "x": -6 - 7, "y": 0 },
  { "note": 32 - 12, "kind": "white", "x": -5 - 7, "y": 0 },
  { "note": 33 - 12, "kind": "white", "x": -4 - 7, "y": 0 },
  { "note": 35 - 12, "kind": "white", "x": -3 - 7, "y": 0 },
  { "note": 37 - 12, "kind": "white", "x": -2 - 7, "y": 0 },
  { "note": 39 - 12, "kind": "white", "x": -1 - 7, "y": 0 },

  { "note": 28, "kind": "white", "x": -7, "y": 0 },
  { "note": 30, "kind": "white", "x": -6, "y": 0 },
  { "note": 32, "kind": "white", "x": -5, "y": 0 },
  { "note": 33, "kind": "white", "x": -4, "y": 0 },
  { "note": 35, "kind": "white", "x": -3, "y": 0 },
  { "note": 37, "kind": "white", "x": -2, "y": 0 },
  { "note": 39, "kind": "white", "x": -1, "y": 0 },

  { "note": 40, "kind": "white", "x": 0, "y": 0 },
  { "note": 42, "kind": "white", "x": 1, "y": 0 },
  { "note": 44, "kind": "white", "x": 2, "y": 0 },
  { "note": 45, "kind": "white", "x": 3, "y": 0 },
  { "note": 47, "kind": "white", "x": 4, "y": 0 },
  { "note": 49, "kind": "white", "x": 5, "y": 0 },
  { "note": 51, "kind": "white", "x": 6, "y": 0 },
  { "note": 52, "kind": "white", "x": 7, "y": 0 },

  // manual nudges on the x positions
  { "note": 29 - 12, "kind": "black", "x": 0.43 - 14, "y": 0 },
  { "note": 31 - 12, "kind": "black", "x": 1.57 - 14, "y": 0 },
  { "note": 34 - 12, "kind": "black", "x": 3.43 - 14, "y": 0 },
  { "note": 36 - 12, "kind": "black", "x": 4.5 - 14, "y": 0 },
  { "note": 38 - 12, "kind": "black", "x": 5.57 - 14, "y": 0 },

  { "note": 29, "kind": "black", "x": 0.43 - 7, "y": 0 },
  { "note": 31, "kind": "black", "x": 1.57 - 7, "y": 0 },
  { "note": 34, "kind": "black", "x": 3.43 - 7, "y": 0 },
  { "note": 36, "kind": "black", "x": 4.5 - 7, "y": 0 },
  { "note": 38, "kind": "black", "x": 5.57 - 7, "y": 0 },

  { "note": 41, "kind": "black", "x": 0.43, "y": 0 },
  { "note": 43, "kind": "black", "x": 1.57, "y": 0 },
  { "note": 46, "kind": "black", "x": 3.43, "y": 0 },
  { "note": 48, "kind": "black", "x": 4.5, "y": 0 },
  { "note": 50, "kind": "black", "x": 5.57, "y": 0 },
];

var miniPianoKeys = {
  "a": 36,
  "z": 37,
  "s": 38,
  "x": 39,

  "c": 40, // c
  "f": 41,
  "v": 42, // d
  "g": 43,
  "b": 44, // e
  "n": 45, // f
  "j": 46,
  "m": 47,
  "k": 48,
  ",": 49,
  "l": 50,
  ".": 51,
  "/": 52,

  "'": 53,

  "q": 23,
  "2": 24,
  "w": 25,
  "3": 26,
  "e": 27,
  "r": 28, // c
  "5": 29,
  "t": 30, // d
  "6": 31,
  "y": 32, // e
  "u": 33, // f
  "8": 34,
  "i": 35,
  "9": 36,
  "o": 37,
  "0": 38,
  "p": 39,
  "[": 40,
  "=": 41,
  "]": 42,
};

export function init()
{
  document.onkeydown = function (event) {
    var k = event.key.toLocaleLowerCase();
    if (miniPianoKeys[k] === undefined) {
      return;
    }
    var t = instrument2(miniPianoKeys[k]);
    player.playTrack(parallel([t]));
  };
  
  var xScale = d3.scaleLinear().domain([-10, 10]).range([0, 960]);
  
  // https://music.stackexchange.com/questions/53847/what-are-the-dimensions-of-piano-keys-in-inches
  
  var whiteKeyWidth = ~~(xScale(1) - xScale(0));
  var blackKeyWidth = ~~(whiteKeyWidth / (7 / 8) * (15 / 32));
  var whiteKeyHeight = ~~(whiteKeyWidth / (7 / 8) * 6);
  var blackKeyHeight = ~~(whiteKeyWidth / (7 / 8) * (3 + 15 / 16));
  
  d3.select("#piano")
    .append("svg")
    .attr("width", 960)
    .attr("shape-rendering", "sharpEdges")
    .attr("height", 400)
    .selectAll("rect")
    .data(pianoKeys)
    .enter()
    .append("rect")
    .attr(
      "x",
      (d) =>
        d.kind == "white"
          ? xScale(d.x)
          : xScale(d.x) + (whiteKeyWidth - blackKeyWidth) / 2,
    )
    .attr("y", (d) => 0) //
    .attr("stroke", (d) => d.kind == "white" ? "black" : null)
    .attr("fill", (d) => d.kind)
    .attr("height", (d) => d.kind == "white" ? whiteKeyHeight : blackKeyHeight)
    .attr("width", (d) => d.kind == "white" ? whiteKeyWidth : blackKeyWidth)
    .on("mousedown", (e, d) => player.playTrack(parallel([instrument2(d.note)]))); 
}

export function makePiano(ondown) {
  d3.select("#piano")
    .selectAll("rect")
    .on("mousedown", (e, d) => {
      ondown(d.note);
    });

  document.onkeydown = (e) => {
    var k = e.key.toLocaleLowerCase();
    if (miniPianoKeys[k] === undefined) {
      return;
    }
    ondown(miniPianoKeys[k]);
  };
}
