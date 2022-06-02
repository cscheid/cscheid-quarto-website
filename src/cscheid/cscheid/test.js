/** @module cscheid/test */

// ////////////////////////////////////////////////////////////////////////////
// Stuff that's useful to write good tests
//
// A bit of emphasis on property testing because that's particularly
// powerful
//

export function withGenerators(f, ...generators) {
  return function() {
    return f(...generators.map((fn) => fn()));
  };
}

export function repeat(n, f) {
  for (let i = 0; i < n; ++i) {
    f();
  }
}
