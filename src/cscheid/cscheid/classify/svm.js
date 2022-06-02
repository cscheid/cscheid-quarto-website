/** @module cscheid/classify/svm */

import * as blas from '../blas.js';

// essentially an implementation of
// Algorithm 22 in http://ciml.info/dl/v0_99/ciml-v0_99-ch07.pdf
// except that we add a momentum term, literally by following eq1 of
// https://distill.pub/2017/momentum/

// expects data to be array of objects with keys x and y.
//
// Note also that we set the learning rate as a function of the regularization
// to avoid exploding gradients over a large range of regularization values.
export function svmTrain(data, lambda, learningRate, momentum) {
  if (data.length === 0) {
    throw new Error('Expected data to be non-empty');
  }

  const alpha = (learningRate || 0.01) / (data.length * lambda);
  const beta = momentum || 0.9;

  const maxIter = 10000;
  const l = data[0].x.length;
  const w = new Float64Array(l);
  const wz = new Float64Array(l); // memory for w

  let b = 0;
  let bz = 0; // memory for b

  let loss;
  let gVec;
  let i;
  for (i = 0; i < maxIter; ++i) {
    loss = 0;
    gVec = new Float64Array(l);
    let g = 0;
    data.forEach((p) => {
      const {x, y} = p;
      const v = y * (blas.dot(w, x) + b);
      if (v <= 1) {
        loss += 1 - v;
        blas.axby(-y, x, 1, gVec);
        g = g - y;
      }
    });
    loss += blas.dot(w, w) * lambda;
    blas.axby(-lambda, w, 1, gVec);

    // no-momentum update
    // blas.axby(-alpha, gVec, 1, w);
    // b = b - alpha * g;

    // momentum update
    blas.axby(1, gVec, beta, wz);
    blas.axby(-alpha, wz, 1, w);
    bz = g + beta * bz;
    b = -alpha * bz + b;
  }
  console.log(`Loss after gen ${i}: ${loss}. `);
  console.log(`Gradient magnitude: ${blas.dot(gVec, gVec)}`);

  const result = {
    classify: function(x) {
      return blas.dot(w, x) + b;
    },
    isSupport: function(point) {
      const v = result.classify(point.x) * point.y;
      return v <= 1;
    },
  };

  return result;
}
