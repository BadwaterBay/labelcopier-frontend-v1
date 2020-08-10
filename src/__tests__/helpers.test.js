/**
 * Test helper functions in helpers.js
 */

'use strict';

import {
  valOfKeysAndIndices,
  comparatorLexic,
  bubbleSort,
} from '../js/helpers';

describe('Test helper function in helpers.js,', () => {
  test('Test valOfKeysAndIndices.', () => {
    const input = [
      [{ key0: [{ key1: [3.142, 6.626] }] }, ['key0', 0, 'key1', 0]],
      [
        {
          key0: {
            key1: [{ key2: [3.142, 6.626, 'pie'] }],
          },
        },
        ['key0', 'key1', 0, 'key2', 2],
      ],
    ];

    const output = input.map((e) => valOfKeysAndIndices(...e));
    const answerKey = [3.142, 'pie'];
    expect(output).toStrictEqual(answerKey);
  });

  test('Test bubbleSort on ascending order.', () => {
    const input = [
      ['Volvo', 'Ford', 'BMW', 'Mazda'],
      ['one', 'two', 'three', 'four', 'five', 'five'],
    ];

    const output = input.map((e) =>
      bubbleSort(e, comparatorLexic({ ignoreCase: true }))
    );

    const answerKey = [
      ['BMW', 'Ford', 'Mazda', 'Volvo'],
      ['five', 'five', 'four', 'one', 'three', 'two'],
    ];

    expect(output).toStrictEqual(answerKey);
  });
});
