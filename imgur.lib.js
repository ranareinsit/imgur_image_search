const fs = require('node:fs')
const path = require('node:path')
const https = require('node:https')

// utils
function sleep(amount = 1000) {
  return new Promise((ok) => {
    setTimeout(ok, amount)
  })
}

/**
 * Stores or updates key-value data in a JSON file.
 *
 * @param {string} key - The key for the data.
 * @param {Array<Array>} variants - An array of variants, each represented as an array with the variant string and its status.
 * @param {string} filePath - The path to the JSON file.
 */
function store(filePath, key, variants) {
  try {
    // Read existing data from the file
    let jsonData = load(filePath) || {};
    jsonData[key] = variants;
    // Write the updated data back to the file
    fs.writeFileSync(filePath, JSON.stringify(jsonData, null, 2), 'utf8');
    console.log(`Data stored successfully for key: ${key}`);
  } catch (error) {
    console.error('Error storing data:', error.message);
  }
}

function load(filePath) {
  if (fs.existsSync(filePath)) {
    const fileContent = fs.readFileSync(filePath, 'utf8');
    jsonData = JSON.parse(fileContent);
    return jsonData
  }
}

/**
 * Generates all possible combinations of elements from the provided sets.
 *
 * @param {Array<Array>} sets - An array of sets, where each set is represented as an array of elements.
 * @returns {Array<Array>} An array containing all possible combinations of elements from the provided sets.
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
 * @returns {Promise<boolean>} A promise that resolves to true if the link is valid, and false otherwise.
 */
function checkLink(link) {
  return new Promise((resolve, reject) => {
    https.get(link, (res) => {
      const { statusCode, headers } = res;

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
Image
GET
Image
https://api.imgur.com/3/image/{{imageHash}}
Get information about an image.
---
https://apidocs.imgur.com/
https://api.imgur.com/endpoints/image
HEADERS
Authorization
Client-ID {{clientId}}
 */
function check_imgur_image(clientId, imageHash) {
  return new Promise((resolve, reject) => {
    let options = {
      'method': 'GET',
      'hostname': 'api.imgur.com',
      'path': `/3/image/${imageHash}`,
      'headers': {
        'Authorization': `Client-ID ${clientId}`
      },
      'maxRedirects': 20
    };

    const req = https.request(options, (res) => {
      let chunks = [];

      res.on("data", (chunk) => {
        chunks.push(chunk);
      });

      res.on("end", (chunk) => {
        let body = Buffer.concat(chunks);
        resolve(body.toString())
      });

      res.on("error", (error) => {
        resolve(error)
        console.error(error);
      });
    });

    req.end();

  })
}

/**
 * Generates permutations of a given array with a specified size restriction.
 *
 * @param {Array} arr - The array for which permutations need to be generated.
 * @param {number} size - The size restriction for each permutation.
 * @returns {Array<Array>} An array containing all permutations of the input array with the specified size.
 */
const permutator = (arr, size) => {
  const result = [];
  const stack = [];
  if (arr.length == 0) return []
  if (!size) size = arr[0].length

  // Initial push to the stack with the first element and an empty array representing the permutation
  for (let i = 0; i < arr.length; ++i) {
    stack.push({ current: [arr[i]], remaining: arr.slice(0, i).concat(arr.slice(i + 1)) });
  }

  while (stack.length > 0) {
    const { current, remaining } = stack.pop();

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

      stack.push({ current: nextCurrent, remaining: nextRemaining });
    }
  }

  return result;
};

function propagate_persist(hash) {
  let splitted = hash.split('')
  let permutations = permutator(splitted, splitted.length)
  let result = permutations.map(e => e.join(''))
  store('./storage.json', hash, result)
}

async function traverse_persist(hash) {
  let key = load('./storage.json')[hash]
  let found = []
  let queue = key
  while (queue.length > 0) {
    let current = queue.shift()
    let query = await check_imgur_image('d1635d0854bdfbc', current)
    let response
    try {
      response = JSON.parse(query)
      console.log(current, 'found!')

    } catch (error) {
      response = undefined
      console.log(current, 'not found')
    }
    await sleep()
    // console.log(current, response, found)
    if (response) {
      found.push(response)
    }
    store('./storage.json', hash, queue)
  }

  return found

}

// let test = propagate_persist('M1LiUrf')
// console.log(test)
// let test2 = traverse_persist('M1LiUrf')

module.exports = {
  load,
  sleep,
  store,
  checkLink,
  combinator,
  permutator,
  check_imgur_image,
  propagate_persist,
  traverse_persist,
}
