/** @module cscheid/debug */

let trace = [];
export function add(obj, attrs) {
  trace.push({obj: obj,
    attrs: attrs});
}

export function appendToD3(sel) {
  for (let i = 0; i < trace.length; ++i) {
    sel.append(trace[i].obj)
        .attrs(trace[i].attrs);
  }
}

export function clear() {
  trace = [];
}

// https://stackoverflow.com/questions/1382107/whats-a-good-way-to-extend-error-in-javascript
export function UnrecoverableError(message) {
  this.name = 'UnrecoverableError';
  this.message = message;
  this.stack = (new Error()).stack;
}

export function die(msg) {
  throw new UnrecoverableError(msg);
}

export function assert(cond, msg) {
  if (!cond) {
    die(msg);
  }
}

/*
 * Super ugly, but apparently the easiest way:
 * https://stackoverflow.com/a/44355041
 */
export function expose(obj, name) {
  window[name] = obj;
}
