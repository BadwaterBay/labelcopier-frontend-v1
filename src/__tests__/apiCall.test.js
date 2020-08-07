/**
 * Test makeApiCalls
 */

'use strict';

import { assignNameForEntry, makeBasicAuth } from '../js/apiCall';

describe('Test apiCall', () => {
  test('Test assignNameForEntry on successful cases', () => {
    const input = [
      [{ name: 'help wanted' }, 'labels'],
      [{ name: 'good first issue' }, 'labels'],
      [{ title: 'On Deck' }, 'milestones'],
      [{ title: 'Version 1.0' }, 'milestones'],
      [{ title: 'Invalid case' }, 'invalid-kind'],
    ];

    const output = [];

    input.forEach((e) => {
      output.push(assignNameForEntry(...e));
    });

    const answerKey = [
      'help wanted',
      'good first issue',
      'On Deck',
      'Version 1.0',
      'Default name',
    ];

    expect(output).toStrictEqual(answerKey);
  });

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
