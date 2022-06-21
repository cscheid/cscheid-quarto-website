/** @module cscheid/krylov */

import * as blas from './blas.js';
import * as linalg from './linalg.js';
import * as random from './random.js';
import * as math from './math.js';

// higher-level linalg routines for sparse matrices. more generally
// speaking, for Krylov subspace methods. Most of these functions take
// a linear operator

/**
 * powerIteration: finds the dominant eigenvector of A through
 * power iteration. uses math.eps as the threshold value
 *
 * @param {function} avFun a function that satisfies v -> A . v
 * @param {number} d the dimension of the vector to use
 * @return {Array} the eigenvector corresponding to the largest eigenvalue
 **/

export function powerIteration(avFun, d) {
  let v = [];
  for (let i = 0; i < d; ++i) {
    v.push(random.normalVariate());
  }

  v = new Float64Array(v);
  linalg.normalize(v);
  let val;
  let delta;
  do {
    const newV = avFun(v);
    val = linalg.normalize(newV);
    delta = linalg.distance2(newV, v);
    v = newV;
  } while (delta > math.eps);

  return {
    vec: v,
    val: val,
  };
}

/**
 * inversePowerIteration: finds the eigenvector of A corresponding to
 * the smallest eigenvalue (in magnitude) through inverse power
 * iteration. uses math.eps as the threshold value.
 *
 * The current version assumes a symmetric matrix (which is
 * unnecessary) and uses LSQR to solve Ax = b (which is inefficient
 * for the case of symmetric matrices). This will be replaced in the
 * future with appropriate methods for unsymmetric (GMRES) and
 * symmetric (MINRES) solvers.
 *
 * @param {AvFun} input a function that satisfies v -> A . v
 * @param {d} input the dimension of the vector to use
 * @returns {v} the eigenvector corresponding to the smallest eigenvalue
 **/

export function inversePowerIteration(AvFun, d) {
  function inverseSolve(b) {
    return lsqr(AvFun, AvFun, b);
  }
  const result = powerIteration(inverseSolve, d);
  result.val = 1.0 / result.val;
  return result;
}

/**
 * LSQR: A least-squares solver for sparse matrices (really, a Krylov
 * subspace-like least-squares solver)
 *
 * Returns the vector that minimizes ||Ax - b||_2
 *
 * @param {function} avFun a function that satisfies v -> A . v
 * @param {function} aTvFun a function that satisfies v -> A^T . v
 * @param {Array} b the vector b
 * @return {Array} the vector that minimizes ||Ax - b||_2
 */
export function lsqr(avFun, aTvFun, b) {
  // direct transcription of LSQR on https://web.stanford.edu/class/cme324/paige-saunders2.pdf
  // FIXME: This does _not_ solve the ridge-regression version

  const atol = 1e-4;
  b = new Float64Array(b);

  // (1) (Initialize.)
  let beta = blas.normalize(b); let u = b;
  const ATu = aTvFun(u);
  let alpha = blas.normalize(ATu);
  let v = ATu;
  const x = new Float64Array(b.length);
  let phiBar = beta;
  let rhoBar = alpha;
  const w = new Float64Array(v);

  let BkF = 0;
  let nIter = 0; const maxIter = 100;
  let stoppingCriterion;

  do { // (for i = 1,2,3,...) repeat steps 3--6.
    // (3) (Continue the bidiagonalization)
    let tmp = avFun(v);
    blas.axby(-alpha, u, 1, tmp);
    beta = blas.normalize(tmp);
    u = tmp;
    tmp = aTvFun(u);
    blas.axby(-beta, v, 1, tmp);
    alpha = blas.normalize(tmp);
    v = tmp;

    BkF += alpha * alpha + beta * beta; // from last paragraph of 5.3

    // (4) (Construct and apply next orthogonal transformation)
    const rho = Math.sqrt(rhoBar * rhoBar + beta * beta);
    const c = rhoBar / rho;
    const s = beta / rho;
    const theta = s * alpha;
    rhoBar = -c * alpha;
    const phi = c * phiBar;
    phiBar = s * phiBar;

    // (5) (Update x, w)
    blas.axby(phi / rho, w, 1, x);
    blas.axby(1, v, -theta / rho, w);

    // (6) (Test for convergence.)

    // we're using this for least squares, so we assume an incompatible system,
    // which asks for stopping criterion 2, namely that
    // || A^T r_k || / ||A|| ||r_k|| <= atol
    // || r_k || = phiBar   (5.2)
    // || A || = BkF
    // || A^T r_k || = phiBar alpha |c|
    //
    // var rkNorm = phiBar;
    // var ANorm = BkF;
    // var ATrkNorm = phiBar * alpha * Math.abs(c);

    stoppingCriterion = alpha * Math.abs(c) / BkF; // phiBar cancels out
    ++nIter;
  } while (stoppingCriterion > atol && nIter < maxIter);

  return x;
}
