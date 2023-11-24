### description:



### usage cases:


1. check link existance
```javascript
const {
  checkLink,
  check_imgur_image,
} = require('./imgur.lib');

let hash = '6jsoy8D'

```

2. lookup similar links by permutation
```javascript
const {
  permutator
} = require('./imgur.lib');

let hash = '6jsoy8D'
const result = permutator([...hash]);

```
3. lookup similar links by combination
```javascript
const {
  permutator,
  combinator,
} = require('./imgur.lib');

let hash = '6jsoy8D'
const permutations = permutator(sets);
const result = combinator(permutations.slice(0,10)); 

```
