/** @module cscheid/time */

// import * as cscheid from "../cscheid.js";

const epoch = Date.now();

/**
 * Returns wall-clock time in seconds since beginning of program
 * @return {number} number of seconds since program started
 */
export function elapsed() {
  return (Date.now() - epoch) / 1000;
}
