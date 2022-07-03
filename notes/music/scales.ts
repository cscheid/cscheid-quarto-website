import { playNote } from "../../src/audio/karplus-strong.js";
import { notes } from "../../src/audio/notes.js";
import { sequence } from "../../src/audio/sequence.ts";

export function playScale(scale: number[]) {
  const calls = scale
    .map((n: number) => notes[n + 30])
    .map((pitch) => () => playNote(pitch, 1, 0.25));
  sequence(calls, 300);
}
