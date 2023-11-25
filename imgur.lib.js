/* eslint-disable max-len */
/* eslint-disable no-unused-vars */
const fs = require('node:fs');
const https = require('node:https');
// const path = require('node:path');

const {checkLink, checkImgurImage} = require('./network');
const {load, store} = require('./fs');
const {permutator, combinator} = require('./arrangement');
// utils
/**
 * Delays the execution for a specified duration using asynchronous sleep.
 *
 * @param {number} [amount=1000] - The duration of the sleep in milliseconds.
 * Default is 1000 milliseconds (1 second).
 * @return {Promise<void>} A promise that resolves after the specified duration.
 * @example
 * // Sleep for 2 seconds
 * await sleep(2000);
 */
function sleep(amount = 1000) {
  return new Promise((resolve) => {
    setTimeout(resolve, amount);
  });
}

/**
 * Propagates and persists permutations of the characters in a hash.
 *
 * @param {string} hash - The input hash for which permutations need to be generated and persisted.
 * @return {void} The function does not return a value.
 *
 * @see {@link permutator} For the function used to generate permutations.
 * @see {@link store} For the function used to persist data to a JSON file.
 *
 * @example
 * // Usage:
 * const inputHash = 'your_hash';
 * propagate_persist(inputHash);
 */
function propagatePersist(hash) {
  /**
   * @type {Array} splitted - An array containing individual characters of the input hash.
   */
  const splitted = hash.split('');

  /**
   * @type {Array<Array>} permutations - An array containing all permutations of the input hash characters.
   */
  const permutations = permutator(splitted, splitted.length);

  /**
   * @type {Array<string>} result - An array containing permutations as strings.
   */
  const result = permutations.map((e) => e.join(''));

  // Persist the generated permutations to a JSON file
  store('./storage.json', hash, result);
}


/**
 * Asynchronously traverses and persists permutations of a hash, checking Imgur for corresponding images.
 *
 * @param {string} hash - The input hash for which permutations need to be traversed and checked.
 * @return {Promise<Array>} A promise that resolves to an array containing information about found images.
 *
 * @see {@link load} For the function used to load data from a JSON file.
 * @see {@link checkImgurImage} For the function used to check Imgur for image information.
 * @see {@link sleep} For the function used to introduce delays in asynchronous operations.
 * @see {@link store} For the function used to persist data to a JSON file.
 *
 * @example
 * // Usage:
 * const inputHash = 'your_hash';
 * const foundImages = await traverse_persist(inputHash);
 * console.log(foundImages);
 */
async function traversePersist(hash) {
  /**
   * @type {Array<string>} key - An array containing permutations of the input hash.
   */
  const key = load('./storage.json')[hash];

  /**
   * @type {Array<Object>} found - An array containing information about found images.
   */
  const found = [];

  /**
   * @type {Array<string>} queue - An array containing permutations to be processed.
   */
  const queue = key;

  // Iterate through the permutations in the queue
  while (queue.length > 0) {
    /**
     * @type {string} current - The current permutation being processed.
     */
    const current = queue.shift();

    /**
     * @type {string} query - The result of checking Imgur for information about the current permutation.
     */
    const query = await checkImgurImage('d1635d0854bdfbc', current); // FIXME

    /**
     * @type {Object|undefined} response - Parsed JSON response from Imgur, or undefined if an error occurs.
     */
    let response;

    try {
      response = JSON.parse(query);
      console.log(current, 'found!');
    } catch (error) {
      response = undefined;
      console.log(current, 'not found');
    }

    // Introduce a delay to avoid rate limiting
    await sleep();

    // If a response is available, add it to the found array
    if (response) {
      found.push(response);
    }

    // Persist the remaining permutations to a JSON file
    store('./storage.json', hash, queue);
  }

  // Return the array containing information about found images
  return found;
}

module.exports = {
  load,
  sleep,
  store,
  propagatePersist,
  traversePersist,
};
