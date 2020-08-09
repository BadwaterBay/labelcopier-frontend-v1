/**
 * General helper functions
 */

'use strict';

/**
 * Callback for comparator
 * @callback comparatorSortArray
 * @param {string} key
 * @param {boolean} ignoreCase
 * @param {boolean} descending True for descending order, false for
 * ascending order
 * @return {function}
 */
const comparatorLexic = (
  key = null,
  ignoreCase = false,
  descending = false
) => (a, b) => {
  let x = '';
  let y = '';

  if (key === null) {
    x = ignoreCase ? a.toUpperCase() : a;
    y = ignoreCase ? b.toUpperCase() : b;
  } else if (typeof key === 'string') {
    x = ignoreCase ? a[key].toUpperCase() : a[key];
    y = ignoreCase ? b[key].toUpperCase() : b[key];
  }
  // else if (Array.isArray(key)) {
  // }
  else {
    throw new TypeError("Invalid type of argument 'key'.");
  }

  if (descending) {
    return x < y ? 1 : -1;
  }
  // if ascending
  return x < y ? -1 : 1;
};

/**
 * Sort array with the given comparator function
 * @param {Array} arr Input array
 * @param {comparatorSortArray} comparatorSortArray
 * @return {Array}
 *
 * This sorting function eliminates the side effect of JavaScript's build-in
 * .sort() by returning a new array.
 *
 */
const sortArray = (arr, comparatorSortArray) => {
  return arr.slice(0).sort(comparatorSortArray);
};

export { comparatorLexic, sortArray };
