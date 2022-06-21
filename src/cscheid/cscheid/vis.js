/** @module cscheid/vis
 */

import * as cscheid from '../cscheid.js';

// ////////////////////////////////////////////////////////////////////////////
// Grand Tour

/* This is a grand tour implementation using the method
   of walking along a geodesic on the space of all rotations
   via Givens rotations

   To show a reduced-dimensionality plot, pick the first k
   coordinates.
*/

export function grandTour(d) {
  const givensRots = [];
  // Note! makeGivensRot functions mutate the vector.
  function makeGivensRot(i, j, speed) {
    return function(v, t) {
      const angle = speed * t;
      const v1 = v[i]; const v2 = v[j];
      const c = Math.cos(angle); const s = Math.sin(angle);
      const o1 = c * v1 - s * v2;
      const o2 = s * v1 + c * v2;
      v[i] = o1;
      v[j] = o2;
    };
  }
  for (let i = 0; i < d - 1; ++i) {
    for (let j = i + 1; j < d; ++j) {
      givensRots.push(makeGivensRot(i, j, Math.random() - 0.5));
    }
  }

  return function(v, t) {
    for (let i = 0; i < givensRots.length; ++i) {
      givensRots[i](v, t);
    }
    return v;
  };
}

// ////////////////////////////////////////////////////////////////////////////
// Classical MDS
//
// this expects squared distances or inner products!
export function CMDS(m) {
  const svd = cscheid.linalg.svd;
  const t = cscheid.linalg.transpose;
  const subtractRowAvg = cscheid.linalg.centerColumns;
  m = t(subtractRowAvg(m));
  m = t(subtractRowAvg(m));
  m = m.map(function(r) {
    return cscheid.linalg.scale(r, -1 / 2);
  });
  const result = svd(m);
  return t(t(result.u).map(function(r, i) {
    return cscheid.linalg.scale(r, Math.sqrt(result.q[i]));
  }));
}
