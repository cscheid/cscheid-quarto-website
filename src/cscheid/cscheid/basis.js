/** @module cscheid/basis */

import * as cscheid from '../cscheid.js';


/**
 * Returns one of the basis functions on the bernstein basis:
 *
 * @param {number} n - n
 * @param {number} v - v
 * @return {function(number):number} the corresponding bernstein
 * basis function
 */
export function bernstein(n, v) {
  const c = cscheid.math.choose(n, v);
  return function(x) {
    return c * Math.pow(x, v) * Math.pow(1 - x, n - v);
  };
}
