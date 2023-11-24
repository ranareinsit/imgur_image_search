/* eslint-disable max-len */
const fs = require('node:fs');
// const path = require('node:path');
const https = require('node:https');

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
 * Stores or updates key-value data in a JSON file.
 *
 * @param {string} filePath - The path to the JSON file.
 * @param {string} key - The key for the data.
 * @param {Array<Array>} variants - An array of variants,
 * each represented as an array with the variant string and its status.
 * @return {void} This function does not return a value.
 */
function store(filePath, key, variants) {
  try {
    // Read existing data from the file
    const jsonData = load(filePath) || {};
    jsonData[key] = variants;
    // Write the updated data back to the file
    fs.writeFileSync(filePath, JSON.stringify(jsonData, null, 2), 'utf8');
    console.log(`Data stored successfully for key: ${key}`);
  } catch (error) {
    console.error('Error storing data:', error.message);
  }
}


/**
 * Loads and parses JSON data from a file, returning the parsed data.
 *
 * @param {string} filePath - The path to the JSON file.
 * @return {Object | null} The parsed JSON data, or null if file does not exist.
 */
function load(filePath) {
  if (fs.existsSync(filePath)) {
    // Read file content synchronously
    const fileContent = fs.readFileSync(filePath, 'utf8');

    // Parse JSON content
    const jsonData = JSON.parse(fileContent);

    return jsonData;
  }

  // Return null if the file doesn't exist
  return null;
}


/**
 * Generates all possible combinations of elements from the provided sets.
 *
 * @param {Array<Array>} sets - array of sets, where each set is represented as an array of elements.
 * @return {Array<Array>} array containing all possible combinations of elements from the provided sets.
 */
function combinator(sets) {
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
}

/**
 * Checks if a given link is a valid image link with the expected content type and size.
 *
 * @param {string} link - The URL to check.
 * @return {Promise<boolean>} A promise that resolves to true if the link is valid, and false otherwise.
 */
function checkLink(link) {
  return new Promise((resolve, reject) => {
    https.get(link, (res) => {
      const {statusCode, headers} = res;

      if (statusCode !== 200) {
        const errorMessage = `Request Failed. Status Code: ${statusCode}`;
        console.error(errorMessage);
        res.resume();
        return resolve(false);
      }

      const contentType = headers['content-type'];
      if (!/^image\/png/.test(contentType)) {
        const errorMessage = `Invalid content-type. Expected image/png but received ${contentType}`;
        console.error(errorMessage);
        res.resume();
        return resolve(false);
      }

      res.setEncoding('binary');
      let rawData = '';

      res.on('data', (chunk) => {
        rawData += chunk;
      });

      res.on('end', () => {
        try {
          const size = rawData.length;
          const expectedSize = 503; // Adjust the expected size as needed

          if (size !== expectedSize) {
            resolve(true);
          } else {
            resolve(false);
          }
        } catch (error) {
          console.error(`Error processing response data: ${error.message}`);
          resolve(false);
        }
      });
    }).on('error', (error) => {
      console.error(`Got error: ${error.message}`);
      resolve(false);
    });
  });
}

/**
 * Checks Imgur image information using the Imgur API.
 *
 * @param {string} clientId - The client ID for Imgur API authorization.
 * @param {string} imageHash - The hash of the Imgur image to retrieve information.
 * @return {Promise<string | Object>} A promise that resolves to the response body, or rejects with an error.
 * @throws {Error} If there is an error in the request or response.
 *
 * @see {@link https://apidocs.imgur.com/|Imgur API Documentation}
 * @see {@link https://api.imgur.com/endpoints/image|Imgur Image Endpoint}
 *
 * @example
 * // Usage:
 * const clientId = 'your_client_id';
 * const imageHash = 'your_image_hash';
 *
 * try {
 *   const result = await check_imgur_image(clientId, imageHash);
 *   console.log(result);
 * } catch (error) {
 *   console.error(error);
 * }
 */
function checkImgurImage(clientId, imageHash) {
  return new Promise((resolve, reject) => {
    const options = {
      'method': 'GET',
      'hostname': 'api.imgur.com',
      'path': `/3/image/${imageHash}`,
      'headers': {
        'Authorization': `Client-ID ${clientId}`,
      },
      'maxRedirects': 20,
    };

    const req = https.request(options, (res) => {
      const chunks = [];

      res.on('data', (chunk) => {
        chunks.push(chunk);
      });

      res.on('end', () => {
        const body = Buffer.concat(chunks);
        resolve(body.toString());
      });

      res.on('error', (error) => {
        reject(error);
        console.error(error);
      });
    });

    req.end();
  });
}


/**
 * Generates permutations of a given array with a specified size restriction.
 *
 * @param {Array} arr - The array for which permutations need to be generated.
 * @param {number} size - The size restriction for each permutation.
 * @return {Array<Array>} An array containing all permutations of the input array with the specified size.
 */
const permutator = (arr, size) => {
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
  checkLink,
  combinator,
  permutator,
  checkImgurImage,
  propagatePersist,
  traversePersist,
};
