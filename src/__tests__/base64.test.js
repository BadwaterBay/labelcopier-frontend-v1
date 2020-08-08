/**
 * Test base64
 */

'use strict';

import base64 from '../js/base64';

describe('Test base64', () => {
  test('Test base64 encoder', () => {
    // Input:
    const input = [
      'abcdef',
      'BadwaterBay:github-label-manager-plus',
      'BadwaterBay:template-for-label-and-milestone-1',
    ];

    // Output:
    const output = input.map((e) => base64.encode(e));

    // Answer key:
    const answerKey = [
      'YWJjZGVm',
      'QmFkd2F0ZXJCYXk6Z2l0aHViLWxhYmVsLW1hbmFnZXItcGx1cw==',
      'QmFkd2F0ZXJCYXk6dGVtcGxhdGUtZm9yLWxhYmVsLWFuZC1taWxlc3RvbmUtMQ==',
    ];

    // Expect:
    expect(output).toStrictEqual(answerKey);
  });
});
