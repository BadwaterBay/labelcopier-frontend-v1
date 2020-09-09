/**
 * Test base64Tool
 */

'use strict';

import base64Tool from '../js/base64Tool';

describe('Test base64Tool', () => {
  test('Test base64Tool encoder', () => {
    const input = [
      'abcdef',
      'BadwaterBay:labelcopier',
      'BadwaterBay:template-for-label-and-milestone-1',
    ];

    const output = input.map((e) => base64Tool.encode(e));

    const answerKey = [
      'YWJjZGVm',
      'QmFkd2F0ZXJCYXk6bGFiZWxjb3BpZXI=',
      'QmFkd2F0ZXJCYXk6dGVtcGxhdGUtZm9yLWxhYmVsLWFuZC1taWxlc3RvbmUtMQ==',
    ];

    expect(output).toStrictEqual(answerKey);
  });
});
