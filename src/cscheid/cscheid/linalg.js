/** @module cscheid/linalg */

import * as blas from './blas.js';
import * as cscheid from '../cscheid.js';

/**
 * higher-level linalg interface that doesn't care too much about
 * memory allocations.
 */

/**
 * returns v1 + v2
 * @param {Array} v1 - v1
 * @param {Array} v2 - v2
 * @return {Float64Array} v1 + v2
 */
export function add(v1, v2) {
  const n = v1.length;
  const result = new Float64Array(v1.length);
  for (let i = 0; i < n; ++i) {
    result[i] = v1[i] + v2[i];
  }
  return result;
}

/**
 * returns v1 - v2
 * @param {Array} v1 - v1
 * @param {Array} v2 - v2
 * @return {Float64Array} v1 - v2
 */
export function sub(v1, v2) {
  const n = v1.length;
  const result = new Float64Array(n);
  for (let i = 0; i < n; ++i) {
    result[i] = v1[i] - v2[i];
  }
  return result;
}

/**
 * returns v * k
 * @param {Array} v - v
 * @param {number} k - k
 * @return {Float64Array} v * k
 */
export function scale(v, k) {
  const n = v.length;
  const result = new Float64Array(n);
  for (let i = 0; i < n; ++i) {
    result[i] = v[i] * k;
  }
  return result;
}

/**
 * returns a * b
 * @param {Array} a - matrix a, m x k
 * @param {Array} b - matrix b, k x n
 * @param {boolean} transa - if true, use a^T instead of a
 * @param {boolean} transb - if true, use b^T instead of b
 *
 * @return {Array} an m x n matrix that equals a * b
 */
export function matMatMul(a, b, transa, transb) {
  // we've paid no attention to cache locality...
  const result = [];
  let i; let j; let l;
  let k; let m; let n;

  if (!transa && !transb) {
    m = a.length;
    k = b.length;
    n = b[0].length;
    if (a[0].length !== k) {
      throw new Error('Matrix dimensions do not match');
    }
    for (i = 0; i < m; ++i) {
      result.push(new Float64Array(n));
    }
    for (i = 0; i < m; ++i) {
      for (j = 0; j < n; ++j) {
        for (l = 0; l < k; ++l) {
          result[i][j] += a[i][l] * b[l][j];
        }
      }
    }
  } else if (transa && !transb) {
    // a^T is k x m
    // b   is k x n
    m = a[0].length;
    k = a.length;
    n = b[0].length;
    if (b.length !== k) {
      throw new Error('Matrix dimensions do not match');
    }
    for (i = 0; i < m; ++i) {
      result.push(new Float64Array(n));
    }
    for (i = 0; i < m; ++i) {
      for (j = 0; j < n; ++j) {
        for (l = 0; l < k; ++l) {
          result[i][j] += a[l][i] * b[l][j];
        }
      }
    }
  } else if (!transa && transb) {
    // a   is m x k
    // b^T is n x k
    m = a.length;
    k = a[0].length;
    n = b.length;
    if (b[0].length !== k) {
      throw new Error('Matrix dimensions do not match');
    }
    for (i = 0; i < m; ++i) {
      result.push(new Float64Array(n));
    }
    for (i = 0; i < m; ++i) {
      for (j = 0; j < n; ++j) {
        for (l = 0; l < k; ++l) {
          result[i][j] += a[i][l] * b[j][l];
        }
      }
    }
  } else {
    // transa && transb
    // a^T is k x m
    // b^T is n x k
    m = a[0].length;
    k = a.length;
    n = b.length;
    if (b[0].length !== k) {
      throw new Error('Matrix dimensions do not match');
    }
    for (i = 0; i < m; ++i) {
      result.push(new Float64Array(n));
    }
    for (i = 0; i < m; ++i) {
      for (j = 0; j < n; ++j) {
        for (l = 0; l < k; ++l) {
          result[i][j] += a[l][i] * b[j][l];
        }
      }
    }
  }
  return result;
}

/**
 * returns the squared 2-norm of v
 * @param {Array} v - v
 * @return {number} ||v||_2^2
 */
export function norm2(v) {
  return blas.dot(v, v);
}

/**
 * returns the squared distance between v1 and v2
 * @param {Array} v1 - v1
 * @param {Array} v2 - v2
 * @return {number} ||v1 - v2||_2^2
 */
export function distance2(v1, v2) {
  return norm2(sub(v1, v2));
}

/**
 * true if v1 and v2 are relatively close to one another:
 * if their distance is inside (eps/2 * (|v1|^2 + |v2|^2))-ball
 *
 * NOTE: Unclear to me right now if we should take square of eps
 * instead...
 *
 * @param {Array} v1 - v1
 * @param {Array} v2 - v2
 * @return {bool} whether v1 and v2 are "relatively-within" eps of
 * one another
 */
export function vecWithinEpsRel(v1, v2) {
  const n1 = norm2(v1);
  const n2 = norm2(v2);
  const d = distance2(v1, v2);
  const diameter = (cscheid.math.eps / 2) * (n1 + n2);
  return d < diameter;
}

/**
 * normalizes the passed vector v. This mutates v!
 *
 * @param {Array} v - v
 * @return {number} length of vector prior to normalization
 */
export function normalize(v) {
  const n = Math.sqrt(blas.dot(v, v));
  blas.scal(1.0 / n, v);
  return n;
}

/**
 * multiplies a matrix by a vector. Assumes matrix
 * is stored as an array of appropriately-sized row vectors
 *
 * @param {Array} m - the matrix m
 * @param {Array} v - the vector v
 * @return {Float64Array} m * v
 */
export function matVecMult(m, v) {
  const result = new Float64Array(m.length);
  for (let i = 0; i < m.length; ++i) {
    result[i] = blas.dot(m[i], v);
  }
  return result;
}

export function matVecMul(a, v, transm) {
  // a is m x n
  let result; let i; let j;
  const m = a.length;
  const n = a[0].length;
  if (!transm) {
    // a is m x n
    // v has n entries
    if (v.length !== n) {
      throw new Error('Matrix and vector have incompatible sizes');
    }
    result = new Float64Array(m);
    for (i = 0; i < a.length; ++i) {
      result[i] = blas.dot(a[i], v);
    }
  } else {
    // a^T is n x m
    // v   has m entries
    if (v.length !== m) {
      throw new Error('Matrix and vector have incompatible sizes');
    }
    result = new Float64Array(n);
    for (i = 0; i < m; ++i) {
      for (j = 0; j < n; ++j) {
        result[j] += a[i][j] * v[i];
      }
    }
  }
  return result;
}

/**
 * returns the transpose of a matrix. Assumes
 * matrix is represented as an array of appropriately-sized row vectors
 *
 * @param {Array} m - the matrix m
 * @return {Array} m^T
 */
export function transpose(m) {
  const result = [];
  const nrows = m.length;
  const ncols = m[0].length;
  let i; let j;
  for (i = 0; i < ncols; ++i) {
    result.push(new Float64Array(nrows));
  }
  for (j = 0; j < ncols; ++j) {
    for (i = 0; i < nrows; ++i) {
      result[j][i] = m[i][j];
    }
  }
  return result;
}

/**
 * returns the elementwise product of two vectors
 *
 * @param {Array} v1 - v1
 * @param {Array} v2 -v2
 * @return {Array} v_i = ( v1_i * v2_i )
 */
export function elementMul(v1, v2) {
  const n = v1.length;
  const result = new Float64Array(n);
  let i;
  for (i = 0; i < n; ++i) {
    result[i] = v1[i] * v2[i];
  }
  return result;
}

/**
 * returns the Schur (elementwise) product of two matrices
 *
 * @param {Array} m1 - m1
 * @param {Array} m2 - m2
 * @return {Array} v_ij = ( v1_ij * v2_ij )
 */
export function schurProduct(m1, m2) {
  return m1.map((row, i) => elementMul(row, m2[i]));
}

/**
 * subtracts the row-wise average from every row. in other words, this
 * centers each column in the matrix
 *
 * @param {Array} m - the matrix m
 * @return {Array} centered matrix
 */
export function centerColumns(m) {
  const n = m.length;
  const z = new Float64Array(m[0].length);
  m.forEach((r) => {
    blas.axpy(1 / n, r, z);
  });
  return m.map((r) => sub(r, z));
}

/** Singular Value Decomposition (c) Danilo Salvati,
 *
 * https://github.com/danilosalvati/svd-js/blob/master/LICENSE
 *
 * Note: we make only minor changes to the code from above
 *
 * SVD procedure as explained in "Singular Value Decomposition and
 * Least Squares Solutions. By G.H. Golub et al."
 *
 * This procedure computes the singular values and complete orthogonal
 * decomposition of a real rectangular matrix A:
 *    A = U * diag(q) * V(t), U(t) * U = V(t) * V = I
 * where the arrays a, u, v, q represent A, U, V, q respectively. The
 * actual parameters corresponding to a, u, v may all be identical
 * unless withu = withv = {true}. In this case, the actual parameters
 * corresponding to u and v must differ. m >= n is assumed (with m =
 * a.length and n = a[0].length)
 *
 * Editor's note: this would have been a straightforward copy
 * but eslint did its thing :(
 *
 *  @param {Array} a - Represents the matrix A to be decomposed
 *  @param {bool} [withu] {true} if U is desired {false} otherwise
 *  @param {bool} [withv] {true} if U is desired {false} otherwise
 *  @param {Number} [eps] A constant used in the test for convergence;
 *  should not be smaller than the machine precision
 *  @param {Number} [tol] A machine dependent constant which should be
 *    set equal to B/eps0 where B is the smallest positive number
 *    representable in the computer
 *
 *  @return {Object} An object containing:
 *    q: A vector holding the singular values of A; they are
 *      non-negative but not necessarily ordered in decreasing
 *      sequence
 *    u: Represents the matrix U with orthonormalized columns (if
 *      withu is {true} otherwise u is used as a working storage)
 *    v: Represents the orthogonal matrix V (if withv is {true},
 *    otherwise v is not used)
 *
 */
export function svd(a, withu, withv, eps, tol) {
  // Define default parameters
  withu = withu !== undefined ? withu : true;
  withv = withv !== undefined ? withv : true;
  eps = eps || Math.pow(2, -52);
  tol = 1e-64 / eps;

  // throw error if a is not defined
  if (!a) {
    throw new TypeError('Matrix a is not defined');
  }

  // Householder's reduction to bidiagonal form

  const n = a[0].length;
  const m = a.length;

  if (m < n) {
    throw new TypeError('Invalid matrix: m < n');
  }

  let i; let j; let k; let l; let l1; let c;
  let f; let g; let h; let s; let x; let y; let z;

  g = 0;
  x = 0;
  const e = [];

  const u = [];
  const v = [];

  // Initialize u
  for (i = 0; i < m; i++) {
    u[i] = new Float64Array(n);
  }

  // Initialize v
  for (i = 0; i < n; i++) {
    v[i] = new Float64Array(n);
  }

  // Initialize q
  const q = new Float64Array(n);

  // Copy array a in u
  for (i = 0; i < m; i++) {
    for (j = 0; j < n; j++) {
      u[i][j] = a[i][j];
    }
  }

  for (i = 0; i < n; i++) {
    e[i] = g;
    s = 0;
    l = i + 1;
    for (j = i; j < m; j++) {
      s += Math.pow(u[j][i], 2);
    }
    if (s < tol) {
      g = 0;
    } else {
      f = u[i][i];
      g = f < 0 ? Math.sqrt(s) : -Math.sqrt(s);
      h = f * g - s;
      u[i][i] = f - g;
      for (j = l; j < n; j++) {
        s = 0;
        for (k = i; k < m; k++) {
          s += u[k][i] * u[k][j];
        }
        f = s / h;
        for (k = i; k < m; k++) {
          u[k][j] = u[k][j] + f * u[k][i];
        }
      }
    }
    q[i] = g;
    s = 0;
    for (j = l; j < n; j++) {
      s += Math.pow(u[i][j], 2);
    }
    if (s < tol) {
      g = 0;
    } else {
      f = u[i][i + 1];
      g = f < 0 ? Math.sqrt(s) : -Math.sqrt(s);
      h = f * g - s;
      u[i][i + 1] = f - g;
      for (j = l; j < n; j++) {
        e[j] = u[i][j] / h;
      }
      for (j = l; j < m; j++) {
        s = 0;
        for (k = l; k < n; k++) {
          s += u[j][k] * u[i][k];
        }
        for (k = l; k < n; k++) {
          u[j][k] = u[j][k] + s * e[k];
        }
      }
    }
    y = Math.abs(q[i]) + Math.abs(e[i]);
    if (y > x) {
      x = y;
    }
  }

  // Accumulation of right-hand transformations
  if (withv) {
    for (i = n - 1; i >= 0; i--) {
      if (g !== 0) {
        h = u[i][i + 1] * g;
        for (j = l; j < n; j++) {
          v[j][i] = u[i][j] / h;
        }
        for (j = l; j < n; j++) {
          s = 0;
          for (k = l; k < n; k++) {
            s += u[i][k] * v[k][j];
          }
          for (k = l; k < n; k++) {
            v[k][j] = v[k][j] + s * v[k][i];
          }
        }
      }
      for (j = l; j < n; j++) {
        v[i][j] = 0;
        v[j][i] = 0;
      }
      v[i][i] = 1;
      g = e[i];
      l = i;
    }
  }

  // Accumulation of left-hand transformations
  if (withu) {
    for (i = n - 1; i >= 0; i--) {
      l = i + 1;
      g = q[i];
      for (j = l; j < n; j++) {
        u[i][j] = 0;
      }
      if (g !== 0) {
        h = u[i][i] * g;
        for (j = l; j < n; j++) {
          s = 0;
          for (k = l; k < m; k++) {
            s += u[k][i] * u[k][j];
          }
          f = s / h;
          for (k = i; k < m; k++) {
            u[k][j] = u[k][j] + f * u[k][i];
          }
        }
        for (j = i; j < m; j++) {
          u[j][i] = u[j][i] / g;
        }
      } else {
        for (j = i; j < m; j++) {
          u[j][i] = 0;
        }
      }
      u[i][i] = u[i][i] + 1;
    }
  }

  // Diagonalization of the bidiagonal form
  eps = eps * x;
  let testConvergence;
  for (k = n - 1; k >= 0; k--) {
    for (let iteration = 0; iteration < 50; iteration++) {
      // test-f-splitting
      testConvergence = false;
      for (l = k; l >= 0; l--) {
        if (Math.abs(e[l]) <= eps) {
          testConvergence = true;
          break;
        }
        if (Math.abs(q[l - 1]) <= eps) {
          break;
        }
      }

      if (!testConvergence) { // cancellation of e[l] if l>0
        c = 0;
        s = 1;
        l1 = l - 1;
        for (i = l; i < k + 1; i++) {
          f = s * e[i];
          e[i] = c * e[i];
          if (Math.abs(f) <= eps) {
            break; // goto test-f-convergence
          }
          g = q[i];
          q[i] = Math.sqrt(f * f + g * g);
          h = q[i];
          c = g / h;
          s = -f / h;
          if (withu) {
            for (j = 0; j < m; j++) {
              y = u[j][l1];
              z = u[j][i];
              u[j][l1] = y * c + (z * s);
              u[j][i] = -y * s + (z * c);
            }
          }
        }
      }

      // test f convergence
      z = q[k];
      if (l === k) { // convergence
        if (z < 0) {
          // q[k] is made non-negative
          q[k] = -z;
          if (withv) {
            for (j = 0; j < n; j++) {
              v[j][k] = -v[j][k];
            }
          }
        }
        break; // break out of iteration loop and move on to next k value
      }

      // Shift from bottom 2x2 minor
      x = q[l];
      y = q[k - 1];
      g = e[k - 1];
      h = e[k];
      f = ((y - z) * (y + z) + (g - h) * (g + h)) / (2 * h * y);
      g = Math.sqrt(f * f + 1);
      f = ((x - z) * (x + z) + h * (y / (f < 0 ? (f - g) : (f + g)) - h)) / x;

      // Next QR transformation
      c = 1;
      s = 1;
      for (i = l + 1; i < k + 1; i++) {
        g = e[i];
        y = q[i];
        h = s * g;
        g = c * g;
        z = Math.sqrt(f * f + h * h);
        e[i - 1] = z;
        c = f / z;
        s = h / z;
        f = x * c + g * s;
        g = -x * s + g * c;
        h = y * s;
        y = y * c;
        if (withv) {
          for (j = 0; j < n; j++) {
            x = v[j][i - 1];
            z = v[j][i];
            v[j][i - 1] = x * c + z * s;
            v[j][i] = -x * s + z * c;
          }
        }
        z = Math.sqrt(f * f + h * h);
        q[i - 1] = z;
        c = f / z;
        s = h / z;
        f = c * g + s * y;
        x = -s * g + c * y;
        if (withu) {
          for (j = 0; j < m; j++) {
            y = u[j][i - 1];
            z = u[j][i];
            u[j][i - 1] = y * c + z * s;
            u[j][i] = -y * s + z * c;
          }
        }
      }
      e[l] = 0;
      e[k] = f;
      q[k] = x;
    }
  }

  // Number below eps should be zero
  for (i = 0; i < n; i++) {
    if (q[i] < eps) q[i] = 0;
  }

  return {u, q, v};
}

/**
 * Returns a r x c zero matrix
 *
 * @param {number} rows - number of rows in the matrix
 * @param {number} cols - number of columns in the matrix
 * @return {Array} result
 */
export function zeros(rows, cols) {
  const result = [];
  for (let i = 0; i < rows; ++i) {
    result.push(new Float64Array(cols));
  }
  return result;
}

/**
 * map each element of a matrix through a function, returns
 * new matrix
 *
 * @param {Array} m - the matrix
 * @param {function} f - the function
 * @return {Array} the new matrix
 */
export function matMap(m, f) {
  return m.map((r) => r.map(f));
}

/**
 * scale each row of matrix by entries of vector v.
 *
 * @param {Array} m - the matrix with dimensions r x c
 * @param {Array} v - the vector with dimension r
 * @return {Array} the new matrix with dimensions r x c
 */
export function scaleRows(m, v) {
  return m.map((row, r) => scale(row, v[r]));
}

/**
 * scale each column of matrix by entries of vector v.
 *
 * equivalently, replaces each row by element-wise vector
 * multiplication by v.
 *
 * @param {Array} m - the matrix with dimensions r x c
 * @param {Array} v - the vector with dimensions c
 * @return {Array} the new matrix with dimensions r x c
 */
export function scaleCols(m, v) {
  return m.map((row) => elementMul(row, v));
}

/**
 * lerps from v1 to v2 as t goes from 0 to 1
 *
 * @param {Array} v1 - v1
 * @param {Array} v2 - v2
 * @param {number} t - t
 * @return {Float64Array} (1-t) * v1 + t * v2
 */
export function lerp(v1, v2, t) {
  return v1.map((v, i) => (1 - t) * v + t * v2[i]);
}
