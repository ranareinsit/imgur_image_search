/**
 * Stores or updates key-value data in a JSON file.
 *
 * @param {string} filePath - The path to the JSON file.
 * @param {string} key - The key for the data.
 * @param {Array<Array>} variants - An array of variants,
 * each represented as an array with the variant string and its status.
 * @return {void} This function does not return a value.
 */
export const store = (filePath, key, variants) => {
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
};


/**
 * Loads and parses JSON data from a file, returning the parsed data.
 *
 * @param {string} filePath - The path to the JSON file.
 * @return {Object | null} The parsed JSON data, or null if file does not exist.
 */
export const load = (filePath) => {
  if (fs.existsSync(filePath)) {
    // Read file content synchronously
    const fileContent = fs.readFileSync(filePath, 'utf8');

    // Parse JSON content
    const jsonData = JSON.parse(fileContent);

    return jsonData;
  }

  // Return null if the file doesn't exist
  return null;
};
