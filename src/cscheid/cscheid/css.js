/** @module cscheid/css */

import {centeredTextRotate} from './svg.js';

/**
 * Centers text horizontally
 * @param {Object} sel - d3 selection with text
 */
export function centerHorizontalText(sel) {
  sel.attr('text-anchor', 'middle');
}

/**
 * Centers text, then rotates it by -90 degrees around its center
 * @param {Object} sel - d3 selection with text
 */
export function centerVerticalText(sel) {
  sel.attr('text-anchor', 'middle')
      .attr('transform', centeredTextRotate(-90));
}
