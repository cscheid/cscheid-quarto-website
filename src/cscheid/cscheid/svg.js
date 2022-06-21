/** @module cscheid/svg */

/* global d3*/
/**
 * Returns a CSS transform string corresponding to the translation by v.x, v.y
 *
 * @param {Object} v - the vector
 * @param {number} v.x - x coordinate
 * @param {number} v.y - y coordinate
 * @return {string} the CSS transform string
 */
export function translateVec(v) {
  return translate(v.x, v.y);
}

/**
 * Returns a CSS transform string corresponding to the translation by x and y
 * If given a vector object, returns the string corresponding to v.x, v.y
 *
 * @param {(number|Object)} x - either the vector or the x coordinate
 * @param {(number|undefined)} y - the y coordinate
 * @return {string} the CSS transform string
 */
export function translate(x, y) {
  if (y === undefined) {
    return `translate(${x.x}, ${x.y})`;
  } else {
    return `translate(${x}, ${y})`;
  }
}

/**
 * Returns a CSS transform string corresponding to the rotation by r degrees
 * If given parameters x and y, the rotation is performed around (x, y)
 *
 * @param {number} r - rotation amount
 * @param {(number|undefined)} x - if present, rotate around this x coordinate
 * @param {(number|undefined)} y - if present, rotate around this y coordinate
 * @return {string} the CSS transform string
 */
export function rotate(r, x, y) {
  if (x === undefined) {
    return `rotate(${r})`;
  } else {
    return `rotate(${r}, ${x}, ${y})`;
  }
}

export function useClipPath(clipEl) {
  return function(sel) {
    const id = clipEl.attr('id');
    sel.attr('clip-path', `url(#${id})`);
  };
}

// use this when you need to rotate an object around
// its own position. (useful for text, for example)
//
// call it like this:
// .attr("transform", cscheid.svg.centeredTextRotate(-90))

export function centeredTextRotate(r) {
  return centeredRotate(
      function() {
        return this.getAttribute('x') || 0;
      },
      function() {
        return this.getAttribute('y') || 0;
      },
      r);
}

export function centeredRotate(xAccessor, yAccessor, r) {
  return function(d) {
    const x = xAccessor.call(this, d);
    const y = yAccessor.call(this, d);
    return `rotate(${r}, ${x}, ${y})`;
  };
}

export const categoricalColorScheme =
  ['rgb(2, 195, 219)', 'rgb(255, 200, 0)', 'rgb(244, 68, 82)',
    'rgb(186, 216, 60)', 'rgb(216, 145, 205)', 'rgb(222, 222, 222)'];

// ////////////////////////////////////////////////////////////////////////
// extra methods for the selection prototype

let setup = false;
export function setupD3Prototype() {
  if (setup) return;
  if (d3 !== undefined) {
    setup = true;
    // return a selection with the parent nodes of the current
    // selection's nodes.
    //
    // FIXME: this destroys the nesting structure of the selection,
    // which could be a problem.
    d3.selection.prototype.parents = function() {
      return d3.selectAll(this.nodes().map(d => d.parentNode));
    };
    
    // http://stackoverflow.com/questions/14167863/how-can-i-bring-a-circle-to-the-front-with-d3
    d3.selection.prototype.moveToFront = function() {
      return this.each(function() {
        this.parentNode.appendChild(this);
      });
    };
  
    // http://bl.ocks.org/eesur/4e0a69d57d3bfc8a82c2
    d3.selection.prototype.moveToBack = function() {
      return this.each(function() {
        const firstChild = this.parentNode.firstChild;
        if (firstChild) {
          this.parentNode.insertBefore(this, firstChild);
        }
      });
    };
  
    d3.selection.prototype.callReturn = function(callable) {
      return callable(this);
    };
  
    d3.selection.prototype.enterMany = function(data) {
      return this.selectAll('.c :not(.c)')
          .data(data)
          .enter();
    };
  }  
}
