// our 'mini-harpeggi' has keyboard C mapping to piano C4;
//                          X mapping to       B3;
//                          F mapping to piano C#4;
// etc

import * as d3 from "https://cdn.skypack.dev/d3";

import { instrument3 } from "./main.js";

import { parallel } from "./track.js";

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

var baseOffset = 32;

var miniHarpejjiKeys = {
  "z": 0,
  "x": 2,
  "c": 4,
  "v": 6,
  "b": 8,
  "n": 10,
  "m": 12,
  ",": 14,
  ".": 16,
  "/": 18,

  "a": 1,
  "s": 3,
  "d": 5,
  "f": 7,
  "g": 9,
  "h": 11,
  "j": 13,
  "k": 15,
  "l": 17,
  ";": 19,
  "'": 21,

  "q": 2,
  "w": 4,
  "e": 6,
  "r": 8,
  "t": 10,
  "y": 12,
  "u": 14,
  "i": 16,
  "o": 18,
  "p": 20,
  "[": 22,
  "]": 24,

  "`": 1,
  "1": 3,
  "2": 5,
  "3": 7,
  "4": 9,
  "5": 11,
  "6": 13,
  "7": 15,
  "8": 17,
  "9": 19,
  "0": 21,
  "-": 23,
  "=": 25,
};

export function init()
{
  document.onkeydown = function (event) {
    var k = event.key.toLocaleLowerCase();
    if (k.slice(0, 5) === "arrow") {
      let map = {
        arrowright: 2,
        arrowleft: -2,
        arrowup: 1,
        arrowdown: -1,
      };
      baseOffset += map[k];
      updateKeys();
    } else if (miniHarpejjiKeys[k] !== undefined) {
      var t = instrument3(miniHarpejjiKeys[k] + baseOffset);
      console.log(t);
      player.playTrack(parallel([t]));
    }
  };
  
  d3.select("#layout")
    .selectAll("button")
    .data([
      { label: "left", offset: -2 },
      { label: "right", offset: 2 },
      { label: "up", offset: 1 },
      { label: "down", offset: -1 },
    ]).enter()
    .append("button")
    .text((d) => d.label)
    .on("click", (e, d) => {
      baseOffset += d.offset;
      updateKeys();
    });
  
  let harpejjiButtons = [];
  let xScale = d3.scaleLinear().domain([0, 12]).range([0, 600]);
  let yScale = d3.scaleLinear().domain([0, 12]).range([600, 0]);
  for (let x = 0; x < 12; ++x) {
    for (let y = 0; y < 12; ++y) {
      harpejjiButtons.push({
        x,
        y,
        key: 2 * x + y,
      });
    }
  }

  d3.select("#harpejji-board")
  .selectAll("div")
  .data(harpejjiButtons)
  .enter()
  .append("div")
  .on("mousedown", (e, d) => {
    player.playTrack(parallel([instrument3(d.key + baseOffset)]));
    d3.select("#latest-key").text(d.key + baseOffset);
  });
  updateKeys();
}

export function updateKeys() {
  let sel = d3.select("#harpejji-board")
    .selectAll("div")
    .style("position", "absolute")
    .style("width", 48)
    .style("height", 48)
    .style("top", (d) => `${yScale(d.y) - 50}px`)
    .style("left", (d) => `${xScale(d.x)}px`)
    .style("border", "1px solid lightgray")
    .style("background-color", (d) => {
      let which = (d.key + baseOffset - 4) % 12;
      let blackKeys = {
        1: true,
        3: true,
        6: true,
        8: true,
        10: true,
      };
      if (blackKeys[which]) {
        return "black";
      } else {
        return "white";
      }
    });

  sel.selectAll("span").remove();
  sel.filter((d) => ((d.key + baseOffset - 4) % 12 === 0))
    .append("span").text("C");
}
