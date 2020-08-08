/**
 * Test makeApiCalls
 */

'use strict';

import { makeBasicAuth } from '../js/apiCall';

describe('Test apiCall', () => {
  test('Test makeBasicAuth', () => {
    const input = [
      {
        targetUsername: 'BadwaterBay',
        personalAccessToken: 'abcdefg',
      },
      {
        targetUsername: 'githubUsername',
        personalAccessToken: '1234567890abcde1234567890abcde',
      },
    ];

    const output = [];

    input.forEach((e) => {
      output.push(makeBasicAuth(e));
    });

    const answerKey = [
      'Basic QmFkd2F0ZXJCYXk6YWJjZGVmZw==',
      'Basic Z2l0aHViVXNlcm5hbWU6MTIzNDU2Nzg5MGFiY2RlMTIzNDU2Nzg5MGFiY2Rl',
    ];

    expect(output).toStrictEqual(answerKey);
  });
});
