const {describe, it} = require('node:test');
const assert = require('node:assert');
const {
  checkLink,
} = require('./imgur.lib');
const {
  permutator,
  combinator,
} = require('./arrangement');

describe('combinator', () => {
  it('should generate combinations for sets with different lengths', () => {
    const sets = [['a', 'b'], ['1', '2', '3']];
    const result = combinator(sets);
    const expected = [
      ['a', '1'],
      ['a', '2'],
      ['a', '3'],
      ['b', '1'],
      ['b', '2'],
      ['b', '3'],
    ];
    assert.deepEqual(result.sort(), expected.sort());
  });

  it('should handle sets with a single element', () => {
    const sets = [['x']];
    const result = combinator(sets);
    const expected = [['x']];
    assert.deepStrictEqual(result, expected);
  });

  it('should handle empty sets', () => {
    const sets = [];
    const result = combinator(sets);
    const expected = [];
    assert.deepStrictEqual(result, expected);
  });

  it('should generate combinations for sets with the same elements', () => {
    const sets = [['a', 'b'], ['a', 'b']];
    const result = combinator(sets);
    const expected = [
      ['a', 'a'],
      ['a', 'b'],
      ['b', 'a'],
      ['b', 'b'],
    ];
    assert.deepEqual(result.sort(), expected.sort());
  });
});


describe('checkLink', () => {
  it('should return true for a valid image link', async () => {
    const link = 'https://i.imgur.com/VWTkvqj.png';
    const isValid = await checkLink(link);
    assert.strictEqual(isValid, true);
  });

  it('should return false for an invalid image link', async () => {
    const link = 'https://i.imgur.com/VWTkvqj-notvalid.png'; // Replace with an invalid link
    const isValid = await checkLink(link);
    assert.strictEqual(isValid, false);
  });
});

describe('/api.imgur.com/endpoints/image', () => {
  it('Get information about an image.', async () => {
    const result = await check_imgur_image('d1635d0854bdfbc', 'vEdyJfO');
    console.log(result);
    assert.ok(result);
  });
});

describe('permutator', () => {
  it('should generate all permutations for an array', () => {
    const arr = ['a', 'b', 'c'];
    const result = permutator(arr, 3);
    // Expected result for the given array
    const expected = [
      ['a', 'b', 'c'],
      ['a', 'c', 'b'],
      ['b', 'a', 'c'],
      ['b', 'c', 'a'],
      ['c', 'a', 'b'],
      ['c', 'b', 'a'],
    ];
    assert.deepEqual(result.sort(), expected.sort());
  });

  it('should handle an empty array', () => {
    const arr = [];
    const result = permutator(arr);
    const expected = [];

    assert.deepEqual(result.sort(), expected.sort());
  });

  it('should handle an array with a single element', () => {
    const arr = ['a'];
    const result = permutator(arr);
    const expected = [['a']];

    assert.deepEqual(result.sort(), expected.sort());
  });
});
