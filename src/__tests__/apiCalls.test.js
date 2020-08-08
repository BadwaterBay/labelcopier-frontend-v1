/**
 * Test apiCalls
 */

'use strict';

import { makeBasicAuth } from '../js/apiCalls';

describe('Test apiCalls', () => {
  test('Test makeBasicAuth', () => {
    const input = [
      {
        gitHubUsername: 'BadwaterBay',
        personalAccessToken: 'abcdefg',
      },
      {
        gitHubUsername: 'githubUsername',
        personalAccessToken: '1234567890abcde1234567890abcde',
      },
    ];

    const output = input.map(makeBasicAuth);

    const answerKey = [
      'Basic QmFkd2F0ZXJCYXk6YWJjZGVmZw==',
      'Basic Z2l0aHViVXNlcm5hbWU6MTIzNDU2Nzg5MGFiY2RlMTIzNDU2Nzg5MGFiY2Rl',
    ];

    expect(output).toStrictEqual(answerKey);
  });
});
