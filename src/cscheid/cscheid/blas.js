/** @module cscheid/blas */

// BLAS-like basic linear algebra stuff
// emphasis on "like": many non-BLAS things here

// ////////////////////////////////////////////////////////////////////////
// level 1 blas
//
// FIXME: all of this is assuming inc* = 1

/**
 * Normalizes the given vector and returns its length. Mutates `v`.
 *
 * @param {Array} v - a vector
 * @return {number} the length of the vector prior to normalization
 */
export function normalize(v) {
  let s = 0;
  for (let i = 0; i < v.length; ++i) {
    s += v[i] * v[i];
  }
  s = Math.sqrt(s);
  scal(1.0 / s, v);

  return s;
}

/**
 * Scales given vector by alpha. Mutates `x`.
 *
 * @param {number} alpha - scaling factor
 * @param {Array} x - the vector
 */
export function scal(alpha, x) {
  const n = x.length;
  for (let i = 0; i < n; ++i) {
    x[i] *= alpha;
  }
}

/**
 * Assigns the values in x to y.
 *
 * @param {Array} x - the source vector
 * @param {Array} y - the target vector
 */
export function copy(x, y) {
  const n = x.length;
  for (let i = 0; i < n; ++i) {
    y[i] = x[i];
  }
}

/**
 * Assigns to each of `y[i]` the value `alpha * x[i] + y[i]`
 *
 * @param {number} alpha - a scaling factor
 * @param {Array} x - a vector
 * @param {Array} y - the output vector
 */
export function axpy(alpha, x, y) {
  const n = x.length;
  for (let i = 0; i < n; ++i) {
    y[i] = alpha * x[i] + y[i];
  }
}

/**
 * Assigns to y the value `b * y + a * x`
 *
 * @param {number} a - a number
 * @param {Array} x - a vector
 * @param {number} b - a number
 * @param {Array} y - a vector
 */
export function axby(a, x, b, y) {
  const n = x.length;
  for (let i = 0; i < n; ++i) {
    y[i] = a * x[i] + b * y[i];
  }
}

/**
 * Returns the dot product of x and y
 *
 * @param {Array} x - a vector
 * @param {Array} y - another vector
 * @return {number} the dot product
 */
export function dot(x, y) {
  const n = x.length;
  let r = 0;
  for (let i = 0; i < n; ++i) {
    r += x[i] * y[i];
  }
  return r;
}
