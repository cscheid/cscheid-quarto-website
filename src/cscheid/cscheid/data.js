/** @module cscheid/data */

// THIS IS ALL DEPRECATED

/* global numeric */

import * as cscheid from '../cscheid.js';

export function leastSquares(X, y, lambda) {
  let effdf = 0;
  const s = numeric.svd(X); let i;
  const dim = X[0].length;
  const UTy = numeric.dot(y, s.U); // U^T y = y^T U = dot(y, U)
  lambda = lambda || 0.0;
  for (i = 0; i < dim; ++i) {
    effdf += Math.pow(s.S[i], 2) / (Math.pow(s.S[i], 2) + lambda);
    if (s.S[i] > cscheid.math.eps) {
      UTy[i] /= (s.S[i] + lambda);
    }
  }
  const sigmaInvUTv = UTy;
  const betaHat = numeric.dot(s.V, sigmaInvUTv);
  return {
    beta: betaHat,
    effdf: effdf,
    predict: function(x) {
      return numeric.dot(x, betaHat);
    },
  };
}

// predict on normalized columns
export function normalizedLeastSquares(X, y, lambda) {
  const averages = []; const stdevs = [];
  const dim = X[0].length; let i; let j;
  for (i = 0; i < dim; ++i) {
    averages[i] = 0;
    stdevs[i] = 0;
  }
  for (i = 0; i < X.length; ++i) {
    for (j = 0; j < dim; ++j) {
      const v = X[i][j];
      averages[j] += v;
      stdevs[j] += v * v;
    }
  }
  for (j = 0; j < dim; ++j) {
    averages[j] /= X.length;
    stdevs[j] = Math.pow(stdevs[j] / X.length - Math.pow(averages[j], 2), 0.5);
  }
  const nX = [];
  for (i = 0; i < X.length; ++i) {
    const row = [];
    for (j = 0; j < dim; ++j) {
      if (stdevs[j] > cscheid.math.eps) {
        row.push((X[i][j] - averages[j]) / stdevs[j]);
      } else {
        row.push(1.0); // X[i][j] / averages[j]
      }
    }
    nX.push(row);
  }
  const lstSq = leastSquares(nX, y, lambda);
  return {
    beta: lstSq.beta,
    effdf: lstSq.effdf,
    predict: function(x) {
      const nX = []; let j;
      for (j = 0; j < dim; ++j) {
        if (stdevs[j] > cscheid.math.eps) {
          nX.push((x[j] - averages[j]) / stdevs[j]);
        } else {
          nX.push(x[j] / averages[j]);
        }
      }
      return lstSq.predict(nX);
    },
  };
}
