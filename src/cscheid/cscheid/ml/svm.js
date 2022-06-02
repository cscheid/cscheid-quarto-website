/** @module cscheid/ml/svm */

import * as blas from '../blas.js';

// straight-forward implementation of
// Algorithm 22 in http://ciml.info/dl/v0_99/ciml-v0_99-ch07.pdf

// expects data to be array of objects with keys x and y.
export function svmTrain(data, lambda, learningRate) {
  if (data.length === 0) {
    throw new Error('Expected data to be non-empty');
  }

  const maxIter = 100;
  const l = data[0].x.length;
  const w = new Float64Array(l);
  let b = 0;

  for (let i = 0; i < maxIter; ++i) {
    let loss = 0;
    const gVec = new Float64Array(l); let g = 0;
    data.forEach((p) => {
      const {x, y} = p;
      const v = y * (blas.dot(w, x) + b);
      if (v <= 1) {
        loss += 1 - v;
        blas.axby(1, gVec, y, x);
        g = g + y;
      }
    });
    loss += blas.dot(w, w) * lambda;
    blas.axby(1, gVec, -lambda, w);
    blas.axby(1, w, learningRate, gVec);
    b = b + learningRate * g;
    console.log(`Loss after gen ${i}: ${loss}. `);
    console.log(`Gradient magnitude: ${blas.dot(gVec, gVec)}`);
  }

  const result = {
    classify: function(x) {
      return blas.dot(x, w) + b;
    },
  };

  return result;
}
