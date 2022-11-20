import { playNote } from "../../src/audio/karplus-strong.js";
import { notes } from "../../src/audio/notes.js";
import { sequence } from "../../src/audio/sequence.js";
function playScale(scale) {
  const calls = scale.map((n) => notes[n + 30]).map((pitch) => () => playNote(pitch, 1, 0.25));
  sequence(calls, 300);
}
export {
  playScale
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsic2NhbGVzLnRzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyJpbXBvcnQgeyBwbGF5Tm90ZSB9IGZyb20gXCIuLi8uLi9zcmMvYXVkaW8va2FycGx1cy1zdHJvbmcuanNcIjtcbmltcG9ydCB7IG5vdGVzIH0gZnJvbSBcIi4uLy4uL3NyYy9hdWRpby9ub3Rlcy5qc1wiO1xuaW1wb3J0IHsgc2VxdWVuY2UgfSBmcm9tIFwiLi4vLi4vc3JjL2F1ZGlvL3NlcXVlbmNlLnRzXCI7XG5cbmV4cG9ydCBmdW5jdGlvbiBwbGF5U2NhbGUoc2NhbGU6IG51bWJlcltdKSB7XG4gIGNvbnN0IGNhbGxzID0gc2NhbGVcbiAgICAubWFwKChuOiBudW1iZXIpID0+IG5vdGVzW24gKyAzMF0pXG4gICAgLm1hcCgocGl0Y2gpID0+ICgpID0+IHBsYXlOb3RlKHBpdGNoLCAxLCAwLjI1KSk7XG4gIHNlcXVlbmNlKGNhbGxzLCAzMDApO1xufVxuIl0sCiAgIm1hcHBpbmdzIjogIkFBQUEsU0FBUyxnQkFBZ0I7QUFDekIsU0FBUyxhQUFhO0FBQ3RCLFNBQVMsZ0JBQWdCO0FBRWxCLFNBQVMsVUFBVSxPQUFpQjtBQUN6QyxRQUFNLFFBQVEsTUFDWCxJQUFJLENBQUMsTUFBYyxNQUFNLElBQUksR0FBRyxFQUNoQyxJQUFJLENBQUMsVUFBVSxNQUFNLFNBQVMsT0FBTyxHQUFHLElBQUksQ0FBQztBQUNoRCxXQUFTLE9BQU8sR0FBRztBQUNyQjsiLAogICJuYW1lcyI6IFtdCn0K
