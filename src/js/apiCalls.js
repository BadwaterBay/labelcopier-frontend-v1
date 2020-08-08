/**
 * Communicate with GitHub API
 */

'use strict';

import base64 from './base64';
import { getLoginInfo, validateKind } from './dataValidation';
import createNewLabelEntry from './createNewLabelEntry';
import { createNewMilestoneEntry } from './createNewMilestoneEntry';

const makeBasicAuth = (loginInfo) =>
  'Basic ' +
  base64.encode(
    `${loginInfo.gitHubUsername}:` + `${loginInfo.personalAccessToken}`
  );

const writeLog = (string) => {
  const logNode = document.createElement('p');
  logNode.innerHTML = string;
  const modalNode = document.querySelector('#loadingModal .modal-body');
  modalNode.appendChild(logNode);
};

const formatDate = (node) => {
  const date = node.value;
  const time = node.getAttribute('data-orig-time');

  if (!date) {
    return null;
  }

  const dt = {};
  [dt.year, dt.month, dt.dayOfMonth] = date.split('-').map((e) => +e);
  [dt.hour, dt.minute, dt.second] = time ? time.split(':') : [0, 0, 0];

  const dateObject = new Date(
    dt.year,
    dt.month - 1,
    dt.dayOfMonth,
    dt.hour,
    dt.minute,
    dt.second
  );

  return dateObject.toISOString().replace('.000Z', 'Z');
};

/**
 * Serialize entries for API calls
 * @param {HTMLElement} node
 * @param {string} kind
 * @return {Object | null} Serialized object
 */
const serializeEntry = (node, kind) => {
  try {
    validateKind(kind);
  } catch (err) {
    console.error(err);
    alert(err);
    return;
  }

  if (kind === 'labels') {
    return {
      name: node.querySelector('[name="name"]').value,
      originalName: node
        .querySelector('[name="name"]')
        .getAttribute('data-orig-val'),
      color: node.querySelector('[name="color"]').value.slice(1),
      description: node.querySelector('[name="description"]').value,
    };
  } else {
    // milestones
    if (node.getAttribute('data-number') !== 'null') {
      return {
        title: node.querySelector('[name="title"]').value,
        originalTitle: node
          .querySelector('[name="title"]')
          .getAttribute('data-orig-val'),
        state: node.querySelector('[name="state"]').value,
        description: node.querySelector('[name="description"]').value,
        due_on: formatDate(node.querySelector('[name="due-date"]')),
        number: +node.getAttribute('data-number'),
      };
    } else {
      if (node.querySelector('[name="due-date"]').value !== '') {
        return {
          title: node.querySelector('[name="title"]').value,
          state: node.querySelector('[name="state"]').value,
          description: node.querySelector('[name="description"]').value,
          due_on: formatDate(node.querySelector('[name="due-date"]')),
        };
      } else {
        return {
          title: node.querySelector('[name="title"]').value,
          state: node.querySelector('[name="state"]').valie,
          description: node.querySelector('[name="description"]').value,
        };
      }
    }
  }
};

const packEntry = (serializedEntry, kind) => {
  const entryObjectCopy = serializedEntry; // Avoid side effects
  const entryPackage = {};

  if (kind === 'labels') {
    entryPackage.originalName = entryObjectCopy.originalName;
    entryPackage.newName = entryObjectCopy.name;
    entryPackage.apiCallSign = entryObjectCopy.originalName;
    delete entryObjectCopy.originalName;
  } else {
    // Milestone
    entryPackage.originalName = entryObjectCopy.originalTitle;
    entryPackage.newName = entryObjectCopy.title;
    entryPackage.apiCallSign = entryObjectCopy.number;
    delete entryObjectCopy.originalTitle;
  }

  return {
    body: entryObjectCopy,
    names: entryPackage,
  };
};

const urlForApiCallGet = (pageNum, loginInfo, kind, mode = 'list') => {
  const owner =
    mode === 'list' ? loginInfo.homeRepoOwner : loginInfo.templateRepoOwner;
  const repo =
    mode === 'list' ? loginInfo.homeRepoName : loginInfo.templateRepoName;
  let url =
    'https://api.github.com/repos/' +
    `${owner}/${repo}/${kind}` +
    `?per_page=50` +
    `&page=${pageNum}`;

  if (kind === 'milestones') {
    url += '&state=all';
  }
  return url;
};

const fetchGet = (pageNum, loginInfo, kind, mode) =>
  fetch(urlForApiCallGet(pageNum, loginInfo, kind, mode), {
    method: 'GET',
    headers: {
      Authorization: makeBasicAuth(loginInfo),
      Accept: 'application/vnd.github.v3+json',
    },
  });

const apiCallGetRecursively = (pageNum, loginInfo, kind, mode = 'list') =>
  fetchGet(pageNum, loginInfo, kind, mode)
    .then((response) => {
      if (!response.ok) {
        throw new Error('Error occurred while getting entries.');
      }
      console.log(response);
      return response.json();
    })
    .then((body) => {
      console.log(body);
      if (body.length === 0) {
        if (pageNum === 1) {
          alert(`No ${kind} exist in this repository.`);
        }
        console.log(`apiCallGetRecursively RESOLVED at page: ${pageNum} `);
        return;
      }
      if (kind === 'labels') {
        body.map((e) => createNewLabelEntry(e, mode));
      } else {
        body.map((e) => createNewMilestoneEntry(e, mode));
      }
      return apiCallGetRecursively(++pageNum, loginInfo, kind, mode);
    });

/**
 * Get labels/milestones from a repository
 * @param {*} kind Either 'labels' or 'milestones'
 * @param {*} mode Either 'list' or 'copy'. 'List' means to list labels/milestones from the repository you're managing. 'Copy' means to copy labels/milestones from a template repository.
 * @return {Promise}
 */
const apiCallGet = (kind, mode = 'list') => {
  validateKind(kind);
  const loginInfo = getLoginInfo();
  return apiCallGetRecursively(1, loginInfo, kind, mode).catch((err) => {
    console.error(err);
    alert(`Error occurred while listing ${kind}.`);
  });
};

const urlForApiCallCreate = (loginInfo, kind) =>
  `https://api.github.com/repos/${loginInfo.homeRepoOwner}/` +
  `${loginInfo.homeRepoName}/${kind}`;

const apiCallCreate = (entry, kind) => {
  try {
    validateKind(kind);
  } catch (err) {
    console.error(err);
    alert(err);
    return;
  }

  const loginInfo = getLoginInfo();
  const serializedEntry = serializeEntry(entry, kind);
  const entryPackage = packEntry(serializedEntry, kind);
  const url = urlForApiCallCreate(loginInfo, kind);
  const kindSingular = kind.slice(0, -1);

  fetch(url, {
    method: 'POST',
    headers: {
      Authorization: makeBasicAuth(loginInfo),
      Accept: 'application/vnd.github.v3+json',
    },
    body: JSON.stringify(entryPackage.body),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(response.status);
      }
      response.json().then((body) => {
        writeLog(`Created ${kindSingular}: ${entryPackage.names.newName}.`);
      });
    })
    .catch((err) => {
      writeLog(
        `Creation of ${kindSingular} ${entryPackage.names.newName} ` +
          `failed due to error: ${err}.`
      );
      console.error(err);
    });
};

const urlForApiCallUpdate = (loginInfo, kind, apiCallSign) =>
  `https://api.github.com/repos/${loginInfo.homeRepoOwner}/` +
  `${loginInfo.homeRepoName}/${kind}/${apiCallSign}`;

const apiCallUpdate = (entry, kind) => {
  try {
    validateKind(kind);
  } catch (err) {
    console.error(err);
    alert(err);
    return;
  }

  const loginInfo = getLoginInfo();
  const serializedEntry = serializeEntry(entry, kind);
  const entryPackage = packEntry(serializedEntry, kind);
  const url = urlForApiCallUpdate(
    loginInfo,
    kind,
    entryPackage.names.apiCallSign
  );
  const kindSingular = kind.slice(0, -1);

  fetch(url, {
    method: 'PATCH',
    headers: {
      Authorization: makeBasicAuth(loginInfo),
    },
    body: JSON.stringify(entryPackage.body),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(response.status);
      }
      response.json().then((body) => {
        writeLog(
          `Updated ${kindSingular}: ${entryPackage.names.originalName} -> ${entryPackage.names.newName}.`
        );
      });
    })
    .catch((err) => {
      writeLog(
        `Update of ${kindSingular} ${entryPackage.names.originalName} -> ${entryPackage.names.newName} failed due to ` +
          `error: ${err}.`
      );
      console.error(err);
    });
};

const urlForApiCallDelete = (loginInfo, kind, apiCallSign) =>
  `https://api.github.com/repos/${loginInfo.homeRepoOwner}/` +
  `${loginInfo.homeRepoName}/${kind}/${apiCallSign}`;

const apiCallDelete = (entry, kind) => {
  try {
    validateKind(kind);
  } catch (err) {
    console.error(err);
    alert(err);
    return;
  }

  const loginInfo = getLoginInfo();
  const serializedEntry = serializeEntry(entry, kind);
  const entryPackage = packEntry(serializedEntry, kind);
  const url = urlForApiCallDelete(
    loginInfo,
    kind,
    entryPackage.names.apiCallSign
  );
  const kindSingular = kind.slice(0, -1);

  fetch(url, {
    method: 'DELETE',
    headers: {
      Authorization: makeBasicAuth(loginInfo),
    },
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(response.status);
      }
      writeLog(`Deleted ${kindSingular}: ${entryPackage.names.originalName}.`);
    })
    .catch((err) => {
      writeLog(
        `Deletion of ${kindSingular} ${entryPackage.names.originalName} ` +
          `failed due to error: ${err}.`
      );
      console.error(err);
    });
};

export {
  makeBasicAuth,
  writeLog,
  formatDate,
  serializeEntry,
  packEntry,
  urlForApiCallGet,
  apiCallGetRecursively,
  apiCallGet,
  urlForApiCallCreate,
  apiCallCreate,
  urlForApiCallUpdate,
  apiCallUpdate,
  urlForApiCallDelete,
  apiCallDelete,
};
