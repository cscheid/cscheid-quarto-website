import { initPlayer } from "../src/audio/audio.js";
import { playNote } from "../src/audio/karplus-strong.js";
import { notes } from "../src/audio/notes.js";
function processAbcJs() {
  const nodes = Array.from(document.querySelectorAll("code.abc"));
  for (const node of nodes) {
    const text = node.innerText;
    const pre = node.parentElement;
    const div = pre.parentElement;
    div.removeChild(pre);
    div.classList.remove("sourceCode");
    const clickListener = (abcelem, _tuneNumber, _classes, _analysis, _drag, _mouseEvent) => {
      for (const pitch of abcelem.pitches.map((pitch2) => pitch2.pitch)) {
        initPlayer();
        playNote(notes[pitch + 24], 1, 0.25);
      }
    };
    const abcobj = window.ABCJS.renderAbc(div.id, text, {
      clickListener
    });
    debugger;
  }
}
export {
  processAbcJs
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiYWJjanMudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImltcG9ydCB7IGluaXRQbGF5ZXIgfSBmcm9tIFwiLi4vc3JjL2F1ZGlvL2F1ZGlvLmpzXCI7XG5pbXBvcnQgeyBwbGF5Tm90ZSB9IGZyb20gXCIuLi9zcmMvYXVkaW8va2FycGx1cy1zdHJvbmcuanNcIjtcbmltcG9ydCB7IG5vdGVzIH0gZnJvbSBcIi4uL3NyYy9hdWRpby9ub3Rlcy5qc1wiO1xuXG5leHBvcnQgZnVuY3Rpb24gcHJvY2Vzc0FiY0pzKCkge1xuICBjb25zdCBub2RlcyA9IEFycmF5LmZyb20oZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChcImNvZGUuYWJjXCIpKTtcbiAgZm9yIChjb25zdCBub2RlIG9mIG5vZGVzKSB7XG4gICAgY29uc3QgdGV4dCA9IChub2RlIGFzIEhUTUxFbGVtZW50KS5pbm5lclRleHQ7XG4gICAgY29uc3QgcHJlID0gbm9kZS5wYXJlbnRFbGVtZW50ITtcbiAgICBjb25zdCBkaXYgPSBwcmUucGFyZW50RWxlbWVudCE7XG4gICAgZGl2LnJlbW92ZUNoaWxkKHByZSk7XG4gICAgZGl2LmNsYXNzTGlzdC5yZW1vdmUoXCJzb3VyY2VDb2RlXCIpO1xuICAgIGNvbnN0IGNsaWNrTGlzdGVuZXIgPSAoXG4gICAgICBhYmNlbGVtOiBhbnksXG4gICAgICBfdHVuZU51bWJlcjogYW55LFxuICAgICAgX2NsYXNzZXM6IGFueSxcbiAgICAgIF9hbmFseXNpczogYW55LFxuICAgICAgX2RyYWc6IGFueSxcbiAgICAgIF9tb3VzZUV2ZW50OiBhbnksXG4gICAgKSA9PiB7XG4gICAgICBmb3IgKFxuICAgICAgICBjb25zdCBwaXRjaCBvZiBhYmNlbGVtLnBpdGNoZXMubWFwKChwaXRjaDogYW55KSA9PlxuICAgICAgICAgIHBpdGNoLnBpdGNoXG4gICAgICAgICkgYXMgbnVtYmVyW11cbiAgICAgICkge1xuICAgICAgICBpbml0UGxheWVyKCk7XG4gICAgICAgIHBsYXlOb3RlKG5vdGVzW3BpdGNoICsgMjRdLCAxLCAwLjI1KTtcbiAgICAgIH1cbiAgICB9O1xuICAgIGNvbnN0IGFiY29iaiA9ICgod2luZG93IGFzIGFueSkuQUJDSlMgYXMgYW55KS5yZW5kZXJBYmMoZGl2LmlkLCB0ZXh0LCB7XG4gICAgICBjbGlja0xpc3RlbmVyLFxuICAgIH0pO1xuICAgIGRlYnVnZ2VyO1xuICB9XG59XG4iXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUNBO0FBQ0E7QUFFTyx3QkFBd0I7QUFDN0IsUUFBTSxRQUFRLE1BQU0sS0FBSyxTQUFTLGlCQUFpQixVQUFVLENBQUM7QUFDOUQsYUFBVyxRQUFRLE9BQU87QUFDeEIsVUFBTSxPQUFRLEtBQXFCO0FBQ25DLFVBQU0sTUFBTSxLQUFLO0FBQ2pCLFVBQU0sTUFBTSxJQUFJO0FBQ2hCLFFBQUksWUFBWSxHQUFHO0FBQ25CLFFBQUksVUFBVSxPQUFPLFlBQVk7QUFDakMsVUFBTSxnQkFBZ0IsQ0FDcEIsU0FDQSxhQUNBLFVBQ0EsV0FDQSxPQUNBLGdCQUNHO0FBQ0gsaUJBQ1EsU0FBUyxRQUFRLFFBQVEsSUFBSSxDQUFDLFdBQ2xDLE9BQU0sS0FDUixHQUNBO0FBQ0EsbUJBQVc7QUFDWCxpQkFBUyxNQUFNLFFBQVEsS0FBSyxHQUFHLElBQUk7QUFBQSxNQUNyQztBQUFBLElBQ0Y7QUFDQSxVQUFNLFNBQVcsT0FBZSxNQUFjLFVBQVUsSUFBSSxJQUFJLE1BQU07QUFBQSxNQUNwRTtBQUFBLElBQ0YsQ0FBQztBQUNEO0FBQUEsRUFDRjtBQUNGOyIsCiAgIm5hbWVzIjogW10KfQo=
