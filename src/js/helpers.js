/**
 * General helper functions
 */

'use strict';

/**
 * Returns the value of an object provided keys and/or indices
 * an array of keys and indices
 * @param {Object | Array} obj Object, array or a combination
 * @param {string | number | Array} k A key, an index or an array of keys and
 * indices pointing to the value
 * @return {*}
 * For example, given obj = {name: 'Tom'}, use key = 'name' to fetch 'Tom'.
 * Given obj = { key0: [{ key1: [3.142, 6.626,] },] }, to fetch 6.626,
 * use k = ['key0', 0, 'key', 1].
 */
const valOfKeysAndIndices = (obj, k) => {
  if (!(typeof k === 'string' || typeof k === 'number' || Array.isArray(k))) {
    throw new Error("Invalid argument 'k'.");
  }
  if (typeof k === 'string' || typeof k === 'number' || k.length === 1) {
    return obj[k];
  }
  return valOfKeysAndIndices(obj[k[0]], k.slice(1));
};

/**
 * Comparator for lexigraphical order
 * @callback compareFunction
 * @param {null | string | number | Array} key A string, a number or an array
 * of keys, indicies or a combination that points to a value for comparison.
 * See valOfKeysAndIndices for more details. For example, if x = {name: 'Tom'},
 * use key = 'name' to fetch value 'Tom' for comparison. If
 * x = { key0: [{ key1: [3.142, 6.626,] },] }, to fetch 6.626 for comparison,
 * use key = ['key0', 0, 'key', 1].
 * @param {boolean} ignoreCase
 * @param {boolean} descending True for descending order, false for
 * ascending order
 * @return {function}
 */
const comparatorLexic = ({
  key = null,
  ignoreCase = false,
  descending = false,
}) => (x, y) => {
  let a = '';
  let b = '';

  if (key === null) {
    a = x;
    b = y;
  } else if (
    typeof key === 'string' ||
    typeof key === 'number' ||
    Array.isArray(key)
  ) {
    a = valOfKeysAndIndices(x, key);
    b = valOfKeysAndIndices(y, key);
  } else {
    throw new Error("Invalid argument 'key'.");
  }

  if (ignoreCase) {
    a = a.toUpperCase();
    b = b.toUpperCase();
  }

  if (descending) {
    if (a < b) return 1;
    if (a > b) return -1;
    return 0;
  }
  // if ascending
  if (a < b) return -1;
  if (a > b) return 1;
  return 0;
};

/**
 * Sort array with the given comparator function
 * @param {Array} arr Input array
 * @param {compareFunction} comparator
 * @return {Array}
 *
 * This sorting function eliminates the side effect of JavaScript's build-in
 * .sort() by returning a new array.
 *
 */
const sortArray = (arr, comparator) => arr.slice(0).sort(comparator);

/**
 * Bubble sort
 * Stable: yes
 * @param {Array} arr Array to be sorted
 * @param {*} comparator Callback
 * @return {Array}
 */
const bubbleSort = (arr, comparator) => {
  const ans = arr; // Eliminate side effects

  for (let i = ans.length - 1; i >= 0; --i) {
    for (let j = 0; j < i; ++j) {
      const cmp = comparator(ans[j], ans[j + 1]);
      if (cmp > 0) {
        const swap = ans[j + 1];
        ans[j + 1] = ans[j];
        ans[j] = swap;
      }
    }
  }

  return ans;
};

/**
 * Run an array of functions with the same set of argument(s)
 * @param {Array} funcs An array of functions.
 * @param {Array} args An array of arguments. Each element of the array will
 * be presented to each function.
 * @param {boolean} spread If 'args' is an array of arrays, you can choose to
 * expand each sub-array with the spread operator. Default is false.
 * @return {*}
 */
const runFuncsWithArgs = (funcs, args = null, spread = false) =>
  args.map((a) =>
    funcs.map((f) => (spread && Array.isArray(a) ? f(...a) : f(a)))
  );

export {
  valOfKeysAndIndices,
  comparatorLexic,
  sortArray,
  bubbleSort,
  runFuncsWithArgs,
};
