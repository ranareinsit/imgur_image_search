/* eslint-disable max-len */
/* eslint-disable no-unused-vars */
/**
 * Generates all possible combinations of elements from the provided sets.
 *
 * @param {Array<Array>} sets - array of sets, where each set is represented as an array of elements.
 * @return {Array<Array>} array containing all possible combinations of elements from the provided sets.
 */
export const combinator = (sets) => {
  /**
       * @type {Array<Array>} result - An array to store the generated combinations.
       */
  const result = [];

  /**
       * @type {Array<Array>} stack - An array acting as a stack to keep track of combinations in progress.
       */
  const stack = [];

  // Handle edge case: empty sets
  if (sets.length === 0) {
    return [];
  }

  // Initial push to the stack with the first set
  for (let i = 0; i < sets[0].length; i++) {
    stack.push([sets[0][i]]);
  }

  // Iterative logic to replace recursion
  while (stack.length > 0) {
    /**
             * @type {Array} last - The last combination in progress, popped from the stack.
             */
    const last = stack.pop();

    // Check if the combination is complete
    if (last.length === sets.length) {
      result.push(last);
      continue;
    }

    /**
             * @type {Array} nextSet - The next set to be added to the combination.
             */
    const nextSet = sets[last.length];

    // Iterate over the elements of nextSet and push new combinations onto the stack
    for (let i = 0; i < nextSet.length; i++) {
      stack.push([...last, nextSet[i]]);
    }
  }

  return result;
};


/**
 * Generates permutations of a given array with a specified size restriction.
 *
 * @param {Array} arr - The array for which permutations need to be generated.
 * @param {number} size - The size restriction for each permutation.
 * @return {Array<Array>} An array containing all permutations of the input array with the specified size.
 */
export const permutator = (arr, size) => {
  const result = [];
  const stack = [];
  if (arr.length == 0) return [];
  if (!size) size = arr[0].length;

  // Initial push to the stack with the first element and an empty array representing the permutation
  for (let i = 0; i < arr.length; ++i) {
    stack.push({current: [arr[i]], remaining: arr.slice(0, i).concat(arr.slice(i + 1))});
  }

  while (stack.length > 0) {
    const {current, remaining} = stack.pop();

    // Check if the permutation has reached the specified size
    if (current.length === size) {
      result.push([...current]);
      continue;
    }

    // Iterate over the remaining array elements
    for (let i = 0; i < remaining.length; ++i) {
      const nextChar = remaining[i];

      const nextRemaining = remaining.slice(0, i).concat(remaining.slice(i + 1));
      const nextCurrent = [...current, nextChar];

      stack.push({current: nextCurrent, remaining: nextRemaining});
    }
  }

  return result;
};
