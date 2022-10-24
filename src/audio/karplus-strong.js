import { init as initAll } from "./init.js";
import { makePiano } from "./piano.js";
import { makePlayer } from "./audio.js";

import { notes } from "./notes.js";

import * as d3 from "https://cdn.skypack.dev/d3";

export function karplusStrong(
  sampleRate,
  pitchInHertz,
  duration,
  amplitude = 1,
) {
  const period = 1 / pitchInHertz;

  const circularBufferSize = sampleRate * period;
  const bufferSize = sampleRate * duration;

  // for now, we will round off the bufferSize and will be pitching
  // this wrong, especially for large buffers
  //
  // TODO estimate how bad this is in 48KHz sampling

  const circularBuffer = new Float32Array(circularBufferSize);

  let outputBuffer = new Float32Array(bufferSize);

  let circularBufferCursor = 0;
  for (let i = 0; i < circularBuffer.length; ++i) {
    const r = Math.random() < 0.5 ? -amplitude : amplitude;
    circularBuffer[i] = r;
  }
  for (let i = 0; i < outputBuffer.length; ++i) {
    const l = circularBufferCursor === 0
      ? circularBuffer.length - 1
      : circularBufferCursor - 1;
    const r = circularBufferCursor;
    const v = (circularBuffer[l] + circularBuffer[r]) / 2;
    circularBuffer[l] = v;
    circularBufferCursor = (circularBufferCursor + 1) % circularBuffer.length;

    // artificially dampen it linearly to zero
    outputBuffer[i] = v * (outputBuffer.length - i) / outputBuffer.length;
  }

  return {
    waveForm: outputBuffer,
    window: [0, duration],
  };
}

export function playNote(pitch, duration, amplitude) {
  const track = karplusStrong(48000, pitch, duration, amplitude);
  if (window.player === undefined) {
    return;
  } else {
    window.player.playTrack(track);
  }
}

export function init(k) {
  initAll();
  makePiano((note, d, el) => {
    d3.select(el)
      .attr("fill", "steelblue")
      .interrupt()
      .transition()
      .duration(3000)
      .ease(d3.easeExpOut)
      .attr("fill", (d) => {
        if (d.kind === "white") {
          return "white";
        } else {
          return "black";
        }
      });
    if (window.player === undefined) {
      let player = makePlayer();
      window.player = player;
      k && k();
    }
    const track = karplusStrong(48000, notes[note], 3, 0.5);
    player.playTrack(track);
  });
}
