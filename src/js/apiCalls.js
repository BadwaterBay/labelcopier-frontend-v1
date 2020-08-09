/**
 * Communicate with GitHub API
 */

'use strict';

import base64 from './base64';
import { getLoginInfo, validateKind } from './dataValidation';
import createNewLabelEntry from './createNewLabelEntry';
import { createNewMilestoneEntry } from './createNewMilestoneEntry';

/**
 * Encode authentication info for HTTP requests
 * @param {*} loginInfo
 * @return {string}
 */
const makeBasicAuth = (loginInfo) =>
  'Basic ' +
  base64.encode(
    `${loginInfo.gitHubUsername}:` + `${loginInfo.personalAccessToken}`
  );

/**
 * Write logs inside modal #committing-modal when committing changes
 * @param {*} string
 */
const writeLog = (string) => {
  const logNode = document.createElement('p');
  logNode.innerHTML = string;
  const modalNode = document.querySelector('#committing-modal .modal-body');
  modalNode.appendChild(logNode);
  return;
};

/**
 * Format data from an HTML node element
 * @param {*} node
 * @return {string | null}
 */
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
 * Serialize entries for HTTP requests
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

/**
 * Pack an entry with serialized data and various information for convenience
 * @param {*} serializedEntry
 * @param {*} kind
 * @return {Object}
 */
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

/**
 * Throw error message when HTTP request fails
 * @param {*} response
 */
const throwFailedStatusError = (response) => {
  if (response.status === 401) {
    throw new Error(
      `${response.status} ${response.statusText}.` +
        ' Please check the repository owner, the repository name,' +
        ' the username and the personal access token that you provided.'
    );
  }
  throw new Error(
    `${response.status} ${response.statusText}.` +
      ` Error occurred while fetching ${kind}.`
  );
};

/**
 * Returns a HTTP request URL for getting entries from a repository
 * @param {*} pageNum
 * @param {*} loginInfo
 * @param {*} kind
 * @param {*} mode
 * @return {string}
 */
const urlForGet = (pageNum, loginInfo, kind, mode = 'list') => {
  const owner =
    mode === 'list' ? loginInfo.homeRepoOwner : loginInfo.templateRepoOwner;
  const repo =
    mode === 'list' ? loginInfo.homeRepoName : loginInfo.templateRepoName;
  let url =
    'https://api.github.com/repos/' +
    `${owner}/${repo}/${kind}` +
    `?per_page=100` +
    `&page=${pageNum}`;

  if (kind === 'milestones') {
    url += '&state=all';
  }
  return url;
};

/**
 * Returns a Fetch API promise for getting entries
 * @param {*} getUrl
 * @param {*} pageNum
 * @param {*} loginInfo
 * @param {*} kind
 * @param {*} mode
 * @return {Promise}
 */
const fetchGet = (getUrl, pageNum, loginInfo, kind, mode) =>
  fetch(getUrl(pageNum, loginInfo, kind, mode), {
    method: 'GET',
    headers: {
      Authorization: makeBasicAuth(loginInfo),
      Accept: 'application/vnd.github.v3+json',
    },
  });

/**
 * Get entries recursively as there might be multiple pages
 * @param {*} pageNum
 * @param {*} loginInfo
 * @param {*} kind
 * @param {*} mode
 * @return {Promise}
 */
const apiCallGetRecursively = (pageNum, loginInfo, kind, mode = 'list') =>
  fetchGet(urlForGet, pageNum, loginInfo, kind, mode)
    .then((response) => {
      if (!response.ok) {
        throwFailedStatusError(response);
      }
      return response.json();
    })
    .then((body) => {
      if (body.length === 0) {
        if (pageNum === 1) {
          alert(`No ${kind} exist in this repository.`);
        }
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
 * Get entries from a repository
 * @param {*} kind Either 'labels' or 'milestones'
 * @param {*} mode Either 'list' or 'copy'. 'List' means to list entries
 * from the repository you're managing. 'Copy' means to copy entries from
 * a template repository.
 * @return {Promise}
 */
const apiCallGet = (kind, mode = 'list') => {
  try {
    validateKind(kind);
  } catch (err) {
    writeLog(err);
    return;
  }

  const loginInfo = getLoginInfo();
  return apiCallGetRecursively(1, loginInfo, kind, mode).catch((err) => {
    console.error(err);
    alert(err);
  });
};

/**
 * Returns a HTTP request URL for creating entries
 * @param {*} loginInfo
 * @param {*} kind
 * @return {string}
 */
const urlForCreate = (loginInfo, kind) =>
  `https://api.github.com/repos/${loginInfo.homeRepoOwner}/` +
  `${loginInfo.homeRepoName}/${kind}`;

/**
 * Return a Fetch API promise for creating entries
 * @param {*} getUrl
 * @param {*} loginInfo
 * @param {*} kind
 * @param {*} entryPackage
 * @return {Promise}
 */
const fetchCreate = (getUrl, loginInfo, kind, entryPackage) =>
  fetch(getUrl(loginInfo, kind), {
    method: 'POST',
    headers: {
      Authorization: makeBasicAuth(loginInfo),
      Accept: 'application/vnd.github.v3+json',
    },
    body: JSON.stringify(entryPackage.body),
  });

/**
 * Make API calls to create entries and parse responses
 * @param {*} entry
 * @param {*} kind
 * @return {Promise}
 */
const apiCallCreate = (entry, kind) => {
  try {
    validateKind(kind);
  } catch (err) {
    writeLog(err);
    return;
  }

  const loginInfo = getLoginInfo();
  const serializedEntry = serializeEntry(entry, kind);
  const entryPackage = packEntry(serializedEntry, kind);
  const kindSingular = kind.slice(0, -1);

  return fetchCreate(urlForCreate, loginInfo, kind, entryPackage)
    .then((response) => {
      if (!response.ok) {
        throwFailedStatusError(response);
      }
    })
    .then(() => {
      writeLog(`Created ${kindSingular}: ${entryPackage.names.newName}.`);
    })
    .catch((err) => {
      writeLog(
        `Creation of ${kindSingular} ${entryPackage.names.newName}` +
          ` failed due to error: ${err}.`
      );
      console.error(err);
    });
};

/**
 * Return a URL for updating entries
 * @param {*} loginInfo
 * @param {*} kind
 * @param {*} apiCallSign
 * @return {string}
 */
const urlForUpdate = (loginInfo, kind, apiCallSign) =>
  `https://api.github.com/repos/${loginInfo.homeRepoOwner}/` +
  `${loginInfo.homeRepoName}/${kind}/${apiCallSign}`;

/**
 * Returns a Fetch API promise for updating entries
 * @param {*} getUrl
 * @param {*} loginInfo
 * @param {*} kind
 * @param {*} entryPackage
 * @return {Promise}
 */
const fetchUpdate = (getUrl, loginInfo, kind, entryPackage) =>
  fetch(getUrl(loginInfo, kind, entryPackage.names.apiCallSign), {
    method: 'PATCH',
    headers: {
      Authorization: makeBasicAuth(loginInfo),
      Accept: 'application/vnd.github.v3+json',
    },
    body: JSON.stringify(entryPackage.body),
  });

/**
 * Make API calls to update entries
 * @param {*} entry
 * @param {*} kind
 * @return {Promise}
 */
const apiCallUpdate = (entry, kind) => {
  try {
    validateKind(kind);
  } catch (err) {
    writeLog(err);
    return;
  }

  const loginInfo = getLoginInfo();
  const serializedEntry = serializeEntry(entry, kind);
  const entryPackage = packEntry(serializedEntry, kind);
  const kindSingular = kind.slice(0, -1);

  return fetchUpdate(urlForUpdate, loginInfo, kind, entryPackage)
    .then((response) => {
      if (!response.ok) {
        throwFailedStatusError(response);
      }
    })
    .then(() => {
      writeLog(
        `Updated ${kindSingular}: ${entryPackage.names.originalName}` +
          ` &#8680; ${entryPackage.names.newName}.`
      );
    })
    .catch((err) => {
      writeLog(
        `Update of ${kindSingular} ${entryPackage.names.originalName}` +
          ` &#8680; ${entryPackage.names.newName} failed due to error: ${err}.`
      );
      console.error(err);
    });
};

/**
 * Return a URL for deleting entries
 * @param {*} loginInfo
 * @param {*} kind
 * @param {*} apiCallSign
 * @return {string}
 */
const urlForDelete = (loginInfo, kind, apiCallSign) =>
  `https://api.github.com/repos/${loginInfo.homeRepoOwner}/` +
  `${loginInfo.homeRepoName}/${kind}/${apiCallSign}`;

/**
 * Return a Fetch promise for deleting entries
 * @param {*} getUrl
 * @param {*} loginInfo
 * @param {*} kind
 * @param {*} entryPackage
 * @return {Promise}
 */
const fetchDelete = (getUrl, loginInfo, kind, entryPackage) =>
  fetch(getUrl(loginInfo, kind, entryPackage.names.apiCallSign), {
    method: 'DELETE',
    headers: {
      Authorization: makeBasicAuth(loginInfo),
      Accept: 'application/vnd.github.v3+json',
    },
  });

/**
 * Make API calls to delete entries
 * @param {*} entry
 * @param {*} kind
 * @return {Promise}
 */
const apiCallDelete = (entry, kind) => {
  try {
    validateKind(kind);
  } catch (err) {
    writeLog(err);
    return;
  }

  const loginInfo = getLoginInfo();
  const serializedEntry = serializeEntry(entry, kind);
  const entryPackage = packEntry(serializedEntry, kind);
  const kindSingular = kind.slice(0, -1);

  return fetchDelete(urlForDelete, loginInfo, kind, entryPackage)
    .then((response) => {
      if (!response.ok) {
        throwFailedStatusError(response);
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
  throwFailedStatusError,
  urlForGet,
  fetchGet,
  apiCallGetRecursively,
  apiCallGet,
  urlForCreate,
  fetchCreate,
  apiCallCreate,
  urlForUpdate,
  fetchUpdate,
  apiCallUpdate,
  urlForDelete,
  fetchDelete,
  apiCallDelete,
};
