/** @module cscheid/caliper */

import * as cscheid from '../cscheid.js';

// caliper is entirely inspired by gage http://teem.sourceforge.net/gage/
//
// all of caliper's reconstruction kernels are uniformly spaced, so
// these are uniform b-splines

/**
 * returns a function that evaluates the n-th order uniform
 * b-spline.
 * @param {number} order order of the b-spline
 * @return {function} that evaluates the n-th order b-spline at a
 * given point
 */
function bSpline(order) {
  const n = order;
  const result = function(x) {
    // http://bigwww.epfl.ch/publications/unser9301.pdf, eq 2.6
    let t1 = 1 / cscheid.math.fact(n);
    let result = 0;
    for (let j = 0; j <= n + 1; ++j) {
      const u = x + (n + 1) / 2 - j;
      if (u < 0) {
        continue;
      }
      const t2 = cscheid.math.choose(n + 1, j);
      const t3 = Math.pow(u, n);
      result += t1 * t2 * t3;
      t1 *= -1;
    }
    return result;
  };
  // as a hack, we make the order-0 kernel support artificially larger,
  // so that the centering trick we use in makeFunction below works.
  // this will be a little inefficient, but oh well.
  if (order === 0) {
    result.support = [-1, 1];
  } else {
    result.support = [-0.5 * (order + 1), 0.5 * (order + 1)];
  }
  return result;
}

/**
 * object storing the supported reconstruction kernels. Currently,
 * only bSplines are supported.
 */
export const kernels = {};
kernels.bSpline = bSpline;

// assumes data has been sampled at integer values
// also fairly inefficient.
/**
 * creates a function given an array of weights and a
 * reconstruction kernel.
 *
 * @param {Array} array the array of weights
 * @param {function} kernel the reconstruction kernel
 * @return {function} the function
 */
export function makeFunction(array, kernel) {
  return function(s) {
    const ix = ~~s;
    let u;
    let j;
    let result = 0;
    for (j = Math.min(ix, array.length - 1), u = s - j;
      j >= 0 && u <= kernel.support[1];
      --j, ++u) {
      result += array[j] * kernel(u);
    }
    for (j = Math.max(ix + 1, 0), u = s - j;
      j < array.length && u >= kernel.support[0];
      ++j, --u) {
      result += array[j] * kernel(u);
    }
    return result;
  };
}

// creates a function from two separable filters
//
// FIXME I should be writing this generically, so that I have a
// makeNDFunction that just works.
export function make2DFunction(array, dims, kernelX, kernelY) {
  function sampleArray(x, y) {
    if (x >= dims[0] && x < 0) {
      return 0;
    }
    const ix = y * dims[0] + x;
    if (ix < 0 || ix >= array.length) {
      return 0;
    }
    return array[ix];
  }
  return function(s, t) {
    const ixX = ~~s; const ixY = ~~t; let uX; let jX;
    let result = 0;

    // FIXME
    // this inner loop is almost adversarially cache-line unfriendly
    function innerLoop(jX, uX) {
      let uY; let jY;
      const kx = kernelX(uX);
      for (jY = Math.min(ixY, dims[1] - 1), uY = t - jY;
        jY >= 0 && uY <= kernelY.support[1];
        --jY, ++uY) {
        result += sampleArray(jX, jY) * kx * kernelY(uY);
      }
      for (jY = Math.max(ixY + 1, 0), uY = t - jY;
        jY < dims[1] && uY >= kernelY.support[0];
        ++jY, --uY) {
        result += sampleArray(jX, jY) * kx * kernelY(uY);
      }
    }
    for (jX = Math.min(ixX, dims[0] - 1), uX = s - jX;
      jX >= 0 && uX <= kernelX.support[1];
      --jX, ++uX) {
      innerLoop(jX, uX);
    }
    for (jX = Math.max(ixX + 1, 0), uX = s - jX;
      jX < dims[0] && uX >= kernelX.support[0];
      ++jX, --uX) {
      innerLoop(jX, uX);
    }

    return result;
  };
}
