import * as d3 from "https://cdn.skypack.dev/d3";

import { then, expFadeInAt, expFadeOut2At, gain, sine } from "./wave.js";

import { makePlayer } from "./audio.js";

import { baseTrack, parallel } from "./track.js";

import { overlappingSeq } from "./track.js";

//////////////////////////////////////////////////////////////////////////////

let player;

export function instrument(freq, gainAmount) {
  return baseTrack(
    then(sine(freq),
      gain(gainAmount || 0.5),
      expFadeOut2At(0, 10),
      expFadeInAt(0, 100)),
    2,
  );
}

export function init() {
  d3.select("#start")
  .append("button")
  .text("Start")
  .on("click", () => {
    player = makePlayer();
  });
  d3.select("#go").append("button").text("just").on("click", () => {
    player.playTrack(overlappingSeq(
      [
        makeNote(261.63, 0),
        makeNote(261.63, ratioToCents(4 / 3)), // just major third
        makeNote(261.63, ratioToCents(3 / 2)),
      ],
      0.025,
    )); // just perfect fifth
  });
  
  d3.select("#go").append("button").text("equal").on("click", () => {
    player.playTrack(overlappingSeq(
      [
        makeNote(261.63, 0),
        makeNote(261.63, 500), // equal major third
        makeNote(261.63, 700),
      ],
      0.025,
    )); // equal perfect fifth
  });
  
  d3.select("#go").append("button").text("just major third").on("click", () => {
    player.playTrack(overlappingSeq(
      [makeNote(261.63, ratioToCents(4 / 3))],
      0.05,
    )); // just perfect fifth
  });
  
  d3.select("#go").append("button").text("equal major third").on("click", () => {
    player.playTrack(overlappingSeq(
      [makeNote(261.63, 500)],
      0.05,
    )); // equal perfect fifth
  });
  
  d3.select("#go").append("button").text("chromatic scale in quartertones").on(
    "click",
    () => {
      let seq = [];
      for (let i = 0; i <= 12; ++i) {
        seq.push(makeNote(261.63, (1200 / 12) * i, { gain: 1, count: 1 }));
      }
      player.playTrack(overlappingSeq(seq, 0.3));
    },
  );
  
  d3.select("#go").append("button").text("Microchromatic scale in quartertones")
    .on("click", () => {
      let seq = [];
      for (let i = 0; i <= 24; ++i) {
        seq.push(makeNote(261.63, (1200 / 24) * i, { gain: 1, count: 1 }));
      }
      player.playTrack(overlappingSeq(seq, 0.3));
    });
  
  d3.select("#go").append("button").text("C minor equal").on("click", () => {
    player.playTrack(
      overlappingSeq([0, 300, 700].map((cent) => makeNote(261.63, cent)), 0.05),
    );
  });
  
  d3.select("#go").append("button").text("C major equal").on("click", () => {
    player.playTrack(
      overlappingSeq([0, 400, 700].map((cent) => makeNote(261.63, cent)), 0.05),
    );
  });
  
  d3.select("#go").append("button").text("C neutral 350c").on("click", () => {
    player.playTrack(
      overlappingSeq([0, 350, 700].map((cent) => makeNote(261.63, cent)), 0.05),
    );
  });
  
  makeChart();
}

export function exp2(v) {
  return Math.exp(v * Math.log(2));
}

export function instrument2(freq, opts) {
  function inner({ decay, count, gain }) {
    let result = [];
    gain = gain || 0.5;
    decay = decay || 0.5;
    count = count || 6;
    for (let i = 1; i <= count; ++i) {
      result.push(instrument(freq * i, Math.pow(0.5, i)));
    }
    return parallel(result);
  }
  return inner(opts || {});
}

export function makeNote(baseFreq, centsAdjustment, opts) {
  centsAdjustment = centsAdjustment || 0;
  let freqMult = exp2(centsAdjustment / 1200);
  return instrument2(baseFreq * freqMult, opts);
}

export function ratioToCents(v) {
  return Math.log2(v) * 1200;
}

export function centsToRatio(cents) {
  return exp2(cents / 1200);
}


export function getHarmonicFreqs(baseNote, count) {
  return d3.range(count).map((count) => baseNote * (count + 1));
}

function makeChart() {
  let svg = d3.select("#chart")
    .append("svg")
    .attr("width", 1400)
    .attr("height", 600);
  let aG = svg.append("g");
  let nG = svg.append("g");

  let xScale = d3.scaleLinear()
    .domain([0, 1200])
    .range([50, 1250]);
  let yScale = d3.scaleLinear()
    .domain([0, 5])
    .range([550, 50]);

  let octaveLines = d3.range(6);
  let chromaticLines = d3.range(13);
  aG.append("g")
    .selectAll("line")
    .data(chromaticLines)
    .enter()
    .append("line")
    .attr("x1", (d) => xScale(d * 100))
    .attr("x2", (d) => xScale(d * 100))
    .attr("y1", yScale(-0.1))
    .attr("y2", yScale(5.1))
    .attr("stroke", d3.lab(80, 0, 0))
    .attr("fill", "none");
  aG.append("g")
    .selectAll("line")
    .data(octaveLines)
    .enter()
    .append("line")
    .attr("x1", xScale(-10))
    .attr("x2", xScale(1210))
    .attr("y1", (d) => yScale(d))
    .attr("y2", (d) => yScale(d))
    .attr("stroke", d3.lab(60))
    .attr("fill", "none");
  aG.append("g")
    .selectAll("text")
    .data(octaveLines)
    .enter()
    .append("text")
    .text((d) => `+${d} octaves`)
    .attr("dominant-baseline", "middle")
    .attr("x", xScale(1220))
    .attr("y", (d) => yScale(d));

  let chromaticNotes = [
    "C",
    "C#",
    "D",
    "D#",
    "E",
    "F",
    "F#",
    "G",
    "G#",
    "A",
    "Bb",
    "B",
    "C",
  ];
  aG.append("g")
    .selectAll("text")
    .data(chromaticNotes)
    .enter()
    .append("text")
    .text((d) => d)
    .attr("x", (d, i) => xScale(i * 100))
    .attr("y", yScale(-0.2))
    .attr("dominant-baseline", "hanging")
    .attr("text-anchor", "middle");

  let colorScale = d3.scaleOrdinal(d3.schemeCategory10);
  function addNoteAndHarmonics(baseFreq, count, color, offset) {
    // plot note and harmonics on the multiple-cover chart
    let harmonics = getHarmonicFreqs(baseFreq, count);

    nG.append("g") // group for the note
      .selectAll("g") // group for each octave
      .data(d3.range(6))
      .enter()
      .append("g")
      .selectAll("circle")
      .data((d) =>
        harmonics.map((freq, i) => {
          return {
            octaveLine: d,
            whichHarmonic: i,
            centOffset: (Math.log2(freq) - (Math.log2(261.63) + d)) * 1200,
          };
        })
      )
      .enter()
      .append("circle")
      .attr("r", 6)
      .attr("fill", colorScale(color))
      .attr("fill-opacity", (d) => 1 / (d.whichHarmonic + 1))
      .attr("stroke", colorScale(color))
      .attr("cx", (d) => xScale(d.centOffset))
      .attr("cy", (d) => yScale(d.octaveLine) + offset);
  }

  // addNoteAndHarmonics(261.63                    ,  10, 1, -6.5);
  // addNoteAndHarmonics(261.63 * centsToRatio(400),  10, 2,  6.5);
  // addNoteAndHarmonics(261.63 * centsToRatio(700),  10, 3,  13);
  // addNoteAndHarmonics(261.63 * centsToRatio(1000), 10, 4, -13);
  addNoteAndHarmonics(261.63, 11, 1, 0);
  addNoteAndHarmonics(261.63 * centsToRatio(200), 11, 2, 0);
  // addNoteAndHarmonics(261.63 * centsToRatio(600),  11, 2, 0);
  // addNoteAndHarmonics(261.63 * centsToRatio(400),  11, 3, 0);
  // addNoteAndHarmonics(261.63 * centsToRatio(400),  11, 2, 0);
  // addNoteAndHarmonics(261.63 * centsToRatio(700),  11, 3, 0);
  // addNoteAndHarmonics(261.63 * centsToRatio(1000), 11, 4, 0);
}
