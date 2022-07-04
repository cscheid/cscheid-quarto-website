import { initPlayer } from "../src/audio/audio.js";
import { playNote } from "../src/audio/karplus-strong.js";
import { notes } from "../src/audio/notes.js";

export function processAbcJs() {
  const nodes = Array.from(document.querySelectorAll("code.abc"));
  for (const node of nodes) {
    const text = (node as HTMLElement).innerText;
    const pre = node.parentElement!;
    const div = pre.parentElement!;
    div.removeChild(pre);
    div.classList.remove("sourceCode");
    const clickListener = (
      abcelem: any,
      _tuneNumber: any,
      _classes: any,
      _analysis: any,
      _drag: any,
      _mouseEvent: any,
    ) => {
      for (
        const pitch of abcelem.pitches.map((pitch: any) =>
          pitch.pitch
        ) as number[]
      ) {
        initPlayer();
        playNote(notes[pitch + 24], 1, 0.25);
      }
    };
    const abcobj = ((window as any).ABCJS as any).renderAbc(div.id, text, {
      clickListener,
    });
    debugger;
  }
}
