/**
 *
 */

'use strict';

import base64 from './base64';

const assignNameForEntry = (entryObject, kind) => {
  let nameOfEntry = '';
  if (kind === 'labels') {
    nameOfEntry = entryObject.name;
  } else if (kind === 'milestones') {
    nameOfEntry = entryObject.title;
  } else {
    nameOfEntry = "There's a bug in function assignAPICallSign!";
  }
  return nameOfEntry;
};

const makeBasicAuth = (LOGIN_INFO) => {
  return (
    'Basic ' +
    base64.encode(
      `${LOGIN_INFO.targetUsername}:${LOGIN_INFO.personalAccessToken}`
    )
  );
};

export { assignNameForEntry, makeBasicAuth };
