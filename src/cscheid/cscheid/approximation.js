/** @module cscheid/approximation */

/* global d3*/
import * as cscheid from '../cscheid.js';

/**
 * Given a dataset of (x_i, y_i) observations and a 1D linear function
 * space (a list of f_j: R->R), compute the best functional
 * approximation in an L2 sense to the given observations.
 *
 * Concretely, we find the minimizer of
 *
 * E = ((\sum_i \sum_j beta_j f_j(x_i)) - y_i)^2 + \lambda \sum_j beta_j^2
 *
 * over all possible vectors c = (beta_j)
 *
 * If normalize is true, we first standardize (transform linearly into
 * a zero-mean, unit-variance vector) each of the j vectors f_j(x_i).
 * This allows the regularization to affect each vector proportionally
 * to their
 *
 * @param {Object} data - the input data
 * @param {Array} data.xs - array of x values
 * @param {Array} data.ys - array of y values
 * @param {Array} space - array of of R->R functions
 * @param {number} lambda - L^2 regularization
 * @param {boolean} standardize - if true, standardize input
 * @return {Object}
 *      beta: vector of best-fitting parameters
 *      averages: when standardize === true, returns column averages
 *      stdevs: when standardize === true, returns standard devs,
 *      effdf: effective degrees of freedom of the fit,
 *      predict: function to predict a single point
 */
export function leastSquaresLFS(data, space, lambda, standardize) {
  let i;
  const matrix = [];
  // compute column averages
  const averages = [];
  const stdevs = [];

  cscheid.debug.assert(data !== undefined, 'need data');
  cscheid.debug.assert(space !== undefined, 'need space');
  const degree = space.length - 1;
  cscheid.debug.assert(data.xs !== undefined, 'need data.xs');
  cscheid.debug.assert(data.ys !== undefined, 'need data.ys');
  lambda = lambda || 1e-10;

  if (standardize) {
    for (i = 0; i <= degree; ++i) {
      averages[i] = 0;
      stdevs[i] = 0;
    }
    stdevs[0] = 1;
    for (i = 0; i < data.xs.length; ++i) {
      for (let j = 1; j <= degree; ++j) {
        const v = space[j](data.xs[i]);
        averages[j] += v;
        stdevs[j] += v * v;
      }
    }
    for (i = 1; i <= degree; ++i) {
      averages[i] /= data.xs.length;
      const aa = Math.pow(averages[i], 2);
      stdevs[i] = Math.pow(stdevs[i] / data.xs.length - aa, 0.5);
    }
  } else {
    for (i = 0; i <= degree; ++i) {
      averages[i] = 0;
      stdevs[i] = 1;
    }
  }

  for (i = 0; i < data.xs.length; ++i) {
    const row = [];
    for (let j = 0; j <= degree; ++j) {
      row.push((space[j](data.xs[i]) - averages[j]) / stdevs[j]);
    }
    matrix.push(row);
  }

  const s = cscheid.linalg.svd(matrix);

  let effdf = 0;
  const sigmaCross = s.q.map(function(v) {
    effdf += v * v / (v * v + lambda);
    return 1 / (v + lambda);
  });

  const utv = cscheid.linalg.matVecMul(s.u, data.ys, true);
  const sigmaCrossUtv = cscheid.linalg.elementMul(sigmaCross, utv);
  const betaHat = cscheid.linalg.matVecMul(s.v, sigmaCrossUtv);

  const fit = {
    beta: betaHat,
    averages: averages,
    stdevs: stdevs,
    effdf: effdf,
    predict: function(x) {
      let result = 0;
      for (let i = 0; i < fit.beta.length; ++i) {
        const c = (space[i](x) - fit.averages[i]);
        result += (c / fit.stdevs[i]) * fit.beta[i];
      }
      return result;
    },
  };
  return fit;
}


/**
 * Find the best-fitting polynomial to a set of pointsusing the
 * monomial basis
 *
 * @param {Object} data - the input data
 * @param {Array}  data.xs - array of x values
 * @param {Array}  data.ys - vector of y values
 * @param {number} degree - the degree of the polynomial to fit
 * @param {number} lambda - regularization parameter
 * @param {boolean} standardize -input whether or not to standardize the columns
 * @return {Object} the resulting leastSquaresFLS object
 */
export function polynomial(data, degree, lambda, standardize) {
  return leastSquaresLFS(
      data,
      d3.range(0, degree + 1).map((d) => ((x) => Math.pow(x, d))),
      lambda, standardize);
}
