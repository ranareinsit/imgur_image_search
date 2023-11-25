/* eslint-disable max-len */
/* eslint-disable no-unused-vars */
import fs from 'node:fs';
import https from 'node:https';
/**
 * Checks if a given link is a valid image link with the expected content type and size.
 *
 * @param {string} link - The URL to check.
 * @return {Promise<boolean>} A promise that resolves to true if the link is valid, and false otherwise.
 */
export const checkLink = (link) => {
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
};

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
export const checkImgurImage = (clientId, imageHash) => {
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
};
