/** @module cscheid/object */

// ////////////////////////////////////////////////////////////////////////////
// bits of underscore that are generally useful go here
//
// from https://github.com/jashkenas/underscore/blob/master/underscore.js
//     Underscore.js 1.9.1
//     http://underscorejs.org
//     (c) 2009-2018 Jeremy Ashkenas, DocumentCloud and Investigative
//     Reporters & Editors

const createAssigner = function(keysFunc, defaults) {
  return function(obj) {
    const length = arguments.length;
    if (defaults) obj = Object(obj);
    if (length < 2 || obj == null) return obj;
    for (let index = 1; index < length; index++) {
      const source = arguments[index];
      const keys = keysFunc(source);
      const l = keys.length;
      for (let i = 0; i < l; i++) {
        const key = keys[i];
        if (!defaults || obj[key] === void 0) obj[key] = source[key];
      }
    }
    return obj;
  };
};

export function allKeys(obj) {
  if (!isObject(obj)) return [];
  const keys = [];
  for (const key in obj) keys.push(key);
  return keys;
}

export const extend = createAssigner(allKeys);
export const defaults = createAssigner(allKeys, true);

export function clone(obj) {
  if (!isObject(obj)) return obj;
  return Array.isArray(obj) ? obj.slice() : extend({}, obj);
}

// ////////////////////////////////////////////////////////////////////////////
// All I wanted was toArray; I got 50% of underscore instead, and
// it is all so very ugly.

const ObjProto = Object.prototype;
// let ArrayProto = Array.prototype;
const toString = ObjProto.toString;
// let slice = ArrayProto.slice;
// let push = ArrayProto.push;
function identity(v) {
  return v;
}

function shallowProperty(key) {
  return function(obj) {
    return obj == null ? void 0 : obj[key];
  };
}
const MAX_ARRAY_INDEX = Math.pow(2, 53) - 1;
const getLength = shallowProperty('length');

function isArrayLike(collection) {
  const length = getLength(collection);
  return typeof length == 'number' && length >= 0 && length <= MAX_ARRAY_INDEX;
}

function isMatch(object, attrs) {
  const ks = keys(attrs); const length = ks.length;
  if (object == null) return !length;
  const obj = Object(object);
  for (let i = 0; i < length; i++) {
    const key = ks[i];
    if (attrs[key] !== obj[key] || !(key in obj)) return false;
  }
  return true;
}

const extendOwn = createAssigner(keys);

function matcher(attrs) {
  attrs = extendOwn({}, attrs);
  return function(obj) {
    return isMatch(obj, attrs);
  };
}

function deepGet(obj, path) {
  const length = path.length;
  for (let i = 0; i < length; i++) {
    if (obj == null) return void 0;
    obj = obj[path[i]];
  }
  return length ? obj : void 0;
}

function property(path) {
  if (Array.isArray(path)) {
    return shallowProperty(path);
  }
  return function(obj) {
    return deepGet(obj, path);
  };
}

function cb(value, context, argCount) {
  if (value == null) return identity;
  if (isFunction(value)) return optimizeCb(value, context, argCount);
  if (isObject(value) && !Array.isArray(value)) return matcher(value);
  return property(value);
}

const optimizeCb = function(func, context, argCount) {
  if (context === void 0) return func;
  switch (argCount == null ? 3 : argCount) {
    case 1: return function(value) {
      return func.call(context, value);
    };
    // The 2-argument case is omitted because we’re not using it.
    case 3: return function(value, index, collection) {
      return func.call(context, value, index, collection);
    };
    case 4: return function(accumulator, value, index, collection) {
      return func.call(context, accumulator, value, index, collection);
    };
  }
  return function(...rest) {
    return func.apply(context, rest);
  };
};

export function keys(obj) {
  if (!isObject(obj)) {
    return [];
  }
  return Object.keys(obj);
}

export function values(obj) {
  const ks = keys(obj);
  const length = ks.length;
  const values = Array(length);
  for (let i = 0; i < length; i++) {
    values[i] = obj[ks[i]];
  }
  return values;
}

export function map(obj, iteratee, context) {
  iteratee = cb(iteratee, context);
  const ks = !isArrayLike(obj) && keys(obj);
  const length = (ks || obj).length;
  const results = Array(length);
  for (let index = 0; index < length; index++) {
    const currentKey = ks ? ks[index] : index;
    results[index] = iteratee(obj[currentKey], currentKey, obj);
  }
  return results;
}

export function isArguments(obj) {
  return toString.call(obj) === '[object Arguments]';
}
export function isFunction(obj) {
  return toString.call(obj) === '[object Function]';
}
export function isString(obj) {
  return toString.call(obj) === '[object String]';
}
export function isNumber(obj) {
  return toString.call(obj) === '[object Number]';
}
export function isDate(obj) {
  return toString.call(obj) === '[object Date]';
}
export function isRegExp(obj) {
  return toString.call(obj) === '[object RegExp]';
}
export function isError(obj) {
  return toString.call(obj) === '[object Error]';
}
export function isSymbol(obj) {
  return toString.call(obj) === '[object Symbol]';
}
export function isMap(obj) {
  return toString.call(obj) === '[object Map]';
}
export function isWeakMap(obj) {
  return toString.call(obj) === '[object WeakMap]';
}
export function isSet(obj) {
  return toString.call(obj) === '[object Set]';
}
export function isWeakSet(obj) {
  return toString.call(obj) === '[object WeakSet]';
}

export function isObject(obj) {
  const type = typeof obj;
  return type === 'function' || type === 'object' && !!obj;
}

const reStrSymbol =
      /[^\ud800-\udfff]|[\ud800-\udbff][\udc00-\udfff]|[\ud800-\udfff]/g;
/**
 * Safely create a real, live array from anything iterable.
 *
 * @param {Object} obj obj
 * @return {Array} an array containing the values in obj.
 */
export function toArray(obj) {
  if (!obj) {
    return [];
  }
  if (Array.isArray(obj)) {
    return obj.slice();
  }
  if (isString(obj)) {
    // Keep surrogate pair characters together
    return obj.match(reStrSymbol);
  }
  if (isArrayLike(obj)) {
    return map(obj, identity);
  }
  return values(obj);
}

/**
 * Returns true if all elements in obj pass the predicate
 *
 * @param {Object} obj the object
 * @param {function} predicate the predicate, or identity
 * @param {Object} context the context to be passed to the predicate,
 *   or nothing
 * @return {boolean} false if any of the elements in obj fail the
 *   predicate, true otherwise
 */
export function all(obj, predicate, context) {
  predicate = cb(predicate, context);
  const ks = !isArrayLike(obj) && keys(obj);
  const length = (ks || obj).length;
  for (let index = 0; index < length; index++) {
    const currentKey = ks ? ks[index] : index;
    if (!predicate(obj[currentKey], currentKey, obj)) {
      return false;
    }
  }
  return true;
}

/**
 * Returns true if any element in obj passes the predicate
 *
 * @param {Object} obj the object
 * @param {function} predicate the predicate, or identity
 * @param {Object} context the context to be passed to the predicate,
 *   or nothing
 * @return {boolean} false if none of the elements in obj pass the
 *   predicate, true otherwise
 */
export function any(obj, predicate, context) {
  predicate = cb(predicate, context);
  const ks = !isArrayLike(obj) && keys(obj);
  const length = (ks || obj).length;
  for (let index = 0; index < length; index++) {
    const currentKey = ks ? ks[index] : index;
    if (predicate(obj[currentKey], currentKey, obj)) {
      return true;
    }
  }
  return false;
}
