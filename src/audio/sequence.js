import { delay } from "../utils/delay.js";
async function sequence(calls, delayAmount) {
  if (!window.player) {
    return;
  }
  for (const call of calls) {
    call();
    await delay(delayAmount);
  }
}
export {
  sequence
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsic2VxdWVuY2UudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImltcG9ydCB7IGRlbGF5IH0gZnJvbSBcIi4uL3V0aWxzL2RlbGF5LnRzXCI7XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBzZXF1ZW5jZShcbiAgY2FsbHM6ICgoKSA9PiB2b2lkKVtdLFxuICBkZWxheUFtb3VudDogbnVtYmVyLFxuKSB7XG4gIGlmICghKHdpbmRvdyBhcyBhbnkpLnBsYXllcikge1xuICAgIHJldHVybjtcbiAgfVxuICBmb3IgKGNvbnN0IGNhbGwgb2YgY2FsbHMpIHtcbiAgICBjYWxsKCk7XG4gICAgYXdhaXQgZGVsYXkoZGVsYXlBbW91bnQpO1xuICB9XG59XG4iXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUVBLHdCQUNFLE9BQ0EsYUFDQTtBQUNBLE1BQUksQ0FBRSxPQUFlLFFBQVE7QUFDM0I7QUFBQSxFQUNGO0FBQ0EsYUFBVyxRQUFRLE9BQU87QUFDeEIsU0FBSztBQUNMLFVBQU0sTUFBTSxXQUFXO0FBQUEsRUFDekI7QUFDRjsiLAogICJuYW1lcyI6IFtdCn0K
