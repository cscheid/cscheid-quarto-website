import * as d3 from "https://cdn.skypack.dev/d3@7";

import { makePlayer } from "./audio.js";

export function init(sel) {
  sel = sel || d3.select("#start");
  sel.append("button")
    .text("Start")
    .on("click", () => {
      let player = makePlayer();
      window.player = player;
    });
}
