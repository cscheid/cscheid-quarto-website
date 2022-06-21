/** @module cscheid/array */

/**
 * returns the concatenation of the arrays. Eg
 * `concat([[1,2,3],[4]]) => [1,2,3,4]`
 * This is _not_ "flatten": it won't work on nested structures.
 *
 * @param {Array} lst - the array of arrays
 * @return {Array} the concatenated array
 **/
export function concat(lst) {
  return [].concat(...lst);
}

/**
 * returns the prefix sum of the array (or the "discrete definite
 * integral to to i")
 *
 * @param {Array} lst - array of numbers
 * @return {Float64Array} the resulting prefix sum
*/
export function prefixSum(lst) {
  const result = new Float64Array(lst.length + 1);
  for (let i = 1; i <= lst.length; ++i) {
    result[i] = result[i - 1] + lst[i - 1];
  }
  return result;
}

/**
 * returns the array of discrete differences
 *
 * @param {Array} lst - array of numbers
 * @return {Float64Array} `result[i] = lst[i+1] - lst[i]`, with length
 *   being one less than that of lst
 */
export function discreteDifferences(lst) {
  const result = new Float64Array(lst.length - 1);
  for (let i = 0; i < lst.length - 1; ++i) {
    result[i] = lst[i + 1] - lst[i];
  }
  return result;
}

/**
 * returns the least index such that `lst[index] > target`
 *
 * This assumes lst is sorted and numeric.
 * this returns an invalid index if `max(lst) <= target` or `min(lst) > target`
 *
 * @param {Array} lst - array
 * @param {number} target - target
 * @return {boolean} the least index such that `lst[index] > target`
 */
export function lowerBound(lst, target) {
  let lo = 0; let hi = lst.length - 1;
  while (hi - lo > 1) {
    const mid = ~~((lo + hi) / 2);
    const vMid = lst[mid];
    if (vMid === target) {
      // this is the only difference between lowerBound and upperBound
      lo = mid;
    } else if (vMid > target) {
      hi = mid;
    } else if (vMid < target) {
      lo = mid;
    }
  }
  if (target >= lst[lst.length - 1]) {
    return lst.length;
  }
  if (target < lst[0]) {
    return 0;
  }
  return hi;
}

/**
 * returns the greatest index such that lst[index] < target
 *
 * This assumes lst is sorted and numeric.
 * this returns an invalid index if max(lst) < target or min(lst) >= target
 *
 * @param {Array} lst - array
 * @param {number} target - target
 * @return {boolean} the greatest index such that lst[index] < target
 */
export function upperBound(lst, target) {
  let lo = 0; let hi = lst.length - 1;
  while (hi - lo > 1) {
    const mid = ~~((lo + hi) / 2);
    const vMid = lst[mid];
    if (vMid === target) {
      // this is the only difference between lowerBound and upperBound
      hi = mid;
    } else if (vMid > target) {
      hi = mid;
    } else if (vMid < target) {
      lo = mid;
    }
  }
  if (target > lst[lst.length - 1]) {
    return lst.length - 1;
  }
  if (target <= lst[0]) {
    return 0;
  }
  return lo;
}

/**
 * Returns the discrete histogram of the array
 *
 * @param {Array} lst - the array to be processed
 * @param {Function} funP - the function that sends array values to
 * histogram bins
 * @return {Map} the histogram, represented as a map of bin keys to
 * counts
 */
export function histogram(lst, funP) {
  const fun = funP ? funP : ((d) => d);
  const result = new Map();
  lst.forEach((k) => {
    k = fun(k);
    const v = result.get(k) || 0;
    result.set(k, v + 1);
  });
  return result;
}

/**
 * Returns the sum of the values in the array
 *
 * Assumes values are numeric
 *
 * @param {Array} a - the array
 * @return {number} the sum of the values
 */
export function sum(a) {
  const n = a.length;
  let result = 0;
  for (let i = 0; i < n; ++i) {
    result += a[i];
  }
  return result;
}

/**
 * Returns the max of the values in the array
 *
 * Assumes values are numeric
 *
 * @param {Array} a - the array
 * @return {Number} the max of the values
 */
export function max(a) {
  return Math.max.apply(null, a);
}

/**
 * Returns the min of the values in the array
 *
 * Assumes values are numeric
 *
 * @param {Array} a - the array
 * @return {Number} the min of the values
 */
export function min(a) {
  return Math.min.apply(null, a);
}
