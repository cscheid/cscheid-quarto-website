/** @module cscheid/dom */

/* global d3*/

/**
 * creates elements (by default divs) that are horizontally centered
 * on the webpage
 *
 * @param {Object} sel - d3 selection with parents
 * @param {string} el - element name, by default "div"
 * @return {Object} d3 selection containing created elements
 */
export function makeCenteredElement(sel, el) {
  // https://stackoverflow.com/questions/618097/how-do-you-easily-horizontally-center-a-div-using-css
  el = el || 'div';
  return sel.append('div')
      .style('text-align', 'center')
      .append(el)
      .style('display', 'inline-block');
}

/**
 * Creates canvas drawing context and sets up High-DPI rendering,
 * keeping the rendering coordinate systems consistent with the
 * low-DPI case
 *
 * @param {Object} canvas - canvas DOM element
 * @returns {Object} the newly created canvas drawing context
 */
// FIXME: should `canvas` be a d3 selection?
export function setupCanvas(canvas) {
  // https://www.html5rocks.com/en/tutorials/canvas/hidpi/
  const dpr = window.devicePixelRatio || 1;
  // Get the size of the canvas in CSS pixels.
  const rect = canvas.getBoundingClientRect();
  // Give the canvas pixel dimensions of their CSS
  // size * the device pixel ratio.
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;

  // cscheid adds: we need this as well;
  canvas.style.width = rect.width + 'px';
  canvas.style.height = rect.height + 'px';
  const ctx = canvas.getContext('2d');
  // Scale all drawing operations by the dpr, so you
  // don't have to worry about the difference.
  ctx.scale(dpr, dpr);

  // and this is just convenient for downstream calls;
  ctx.dpr = dpr;
  return ctx;
}

/**
 * Converts position from any CSS units to pixel units. This is
 * useful, for example, to determine the vertical center of a window
 * by calling it with '50vh', and so on.
 *
 * The code works by appending an actual element to the DOM and
 * inspecting its position; this means it's quite slow, so
 * make sure to use it sparingly.
 *
 * @param {string} size - size description, as a string
 * @return {number} size in CSS pixels
 */
export function convertToPixelUnits(size) {
  const d = d3.select('body')
      .append('div')
      .style('position', 'absolute')
      .style('left', size);
  const v1 = d.node().getBoundingClientRect().x;
  d.style('left', null);
  const v2 = d.node().getBoundingClientRect().x;
  d.remove();
  return v1 - v2;
}

/**
 * Sets up an animation callback loop with requestAnimationFrame.
 *
 * @param {function} fun - animation callback to be called at every
 * rendering tick.
 * @return {function} a callback that, when called, will stop the animation.
 */
export function animate(fun) {
  let stop = false;
  function tick() {
    fun();
    if (!stop) {
      window.requestAnimationFrame(tick);
    }
  }
  function stopAnimation() {
    stop = true;
  }
  window.requestAnimationFrame(tick);
  return stopAnimation;
}

/**
 * Loads a Javascript file from a given URL, returns a promise
 *
 * @param {string} url - The URL from which to load the script
 * @return {Promise} A promise that will resolve when the file loads
 */
export function loadScript(url) {
  return new Promise(function(resolve, reject) {
    const el = document.createElement('script');
    el.onload = resolve;
    el.onerror = reject;
    el.src = url;
    document.body.appendChild(el);
  });
}
