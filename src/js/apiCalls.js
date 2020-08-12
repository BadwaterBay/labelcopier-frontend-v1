/**
 * Communicate with GitHub API
 */

'use strict';

import base64 from './base64';
import {
  bugReportMsg,
  getAndValidateLoginInfo,
  validateKind,
} from './dataValidation';

/**
 * Encode authentication info for HTTP requests
 * @param {Object} loginInfo
 * @return {string}
 */
const makeBasicAuth = (loginInfo) =>
  'Basic ' +
  base64.encode(
    `${loginInfo.gitHubUsername}:` + `${loginInfo.personalAccessToken}`
  );

/**
 * Write logs inside modal #committing-modal when committing changes
 * @param {string} string
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
 * @param {HTMLElement} node
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
 * @param {Object} serializedEntry
 * @param {string} kind
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
 * @param {Object} response
 * @return {string}
 */
const composeStatusMessage = (response) => {
  if (response.ok) {
    return `${response.status} status OK.`;
  }
  if (response.status === 401) {
    return (
      `${response.status} ${response.statusText}.` +
      ' Please check the input values of your login information.'
    );
  }
  if (response.status === 403) {
    return (
      `${response.status} ${response.statusText}.` +
      ' The GitHub server refused to your request.' +
      ' Maybe you have exceeded your rate limit.' +
      ' Please wait for a little while.'
    );
  }
  if (response.status === 404) {
    return (
      `${response.status} ${response.statusText}.` +
      ' Repository not found. Please check the input values of your' +
      ' login information.'
    );
  }
  if (response.status === 422) {
    return (
      `${response.status} ${response.statusText}.` +
      ` ${bugReportMsg}` +
      `${response.status} ${response.statusText}.`
    );
  }
  return `${response.status} ${response.statusText}.` + ` Error occurred.`;
};

/**
 * Returns a HTTP request URL for getting entries from a repository
 * @param {Object} loginInfo
 * @param {string} kind
 * @param {number} pageNum
 * @param {string} mode
 * @return {string}
 */
const urlForGet = (loginInfo, kind, pageNum, mode = 'list') => {
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
 * @param {function} urlFunc
 * @param {Object} loginInfo
 * @param {string} kind
 * @param {number} pageNum
 * @param {string} mode
 * @return {Promise}
 */
const fetchGet = (urlFunc, loginInfo, kind, pageNum, mode) =>
  fetch(urlFunc(loginInfo, kind, pageNum, mode), {
    method: 'GET',
    headers: {
      Authorization: makeBasicAuth(loginInfo),
      Accept: 'application/vnd.github.v3+json',
    },
  });

/**
 * Get entries recursively because there might be multiple pages
 * @param {Object} loginInfo
 * @param {string} kind
 * @param {number} pageNum
 * @param {string} mode
 * @return {Promise}
 */
const apiCallGet = (loginInfo, kind, pageNum = 1, mode = 'list') =>
  fetchGet(urlForGet, loginInfo, kind, pageNum, mode)
    .then((response) => {
      if (!response.ok) {
        throw new Error(composeStatusMessage(response));
      }
      return response.json();
    })
    .then(async (body) => {
      // Recursively fetch entries in mutliple pages
      if (body.length === 0) {
        if (pageNum === 1) {
          // This needs to return an empty array instead instead of an Error
          throw new Error(`No ${kind} exist in this repository.`);
        }
        return body;
      }
      return body.concat(await apiCallGet(loginInfo, kind, ++pageNum, mode));
    })
    .then((fetchedArray) => {
      return new Promise((resolve, reject) => {
        if (Array.isArray(fetchedArray)) {
          resolve(fetchedArray);
          return;
        }
        reject(new Error(fetchedArray));
      });
    })
    .catch((err) => {
      throw new Error(err);
    });

/**
 * Return a Fetch API promise
 * @param {string} method HTTP method
 * @param {function} urlFunc
 * @param {Object} loginInfo
 * @param {string} kind
 * @param {Object} entryPackage
 * @return {Promise}
 */
const fetchWithBody = (method, urlFunc, loginInfo, kind, entryPackage) => {
  return fetch(urlFunc(loginInfo, kind, entryPackage), {
    method: method,
    headers: {
      Authorization: makeBasicAuth(loginInfo),
      Accept: 'application/vnd.github.v3+json',
    },
    body: JSON.stringify(entryPackage.body),
  });
};

/**
 * Returns a HTTP request URL for creating entries
 * @param {Object} loginInfo
 * @param {string} kind
 * @return {string}
 */
const urlForCreate = (loginInfo, kind) =>
  `https://api.github.com/repos/${loginInfo.homeRepoOwner}/` +
  `${loginInfo.homeRepoName}/${kind}`;

/**
 * Make API calls to create entries and parse responses
 * @param {HTMLElement} entryNode
 * @param {string} kind
 * @param {string} mode
 * @return {Promise}
 */
const apiCallCreate = (entryNode, kind, mode = 'create') =>
  new Promise((resolve, reject) => {
    validateKind(kind);
    const loginInfo = getAndValidateLoginInfo(mode);
    const entryPackage = packEntry(serializeEntry(entryNode, kind), kind);
    const kindSingular = kind.slice(0, -1);

    fetchWithBody('POST', urlForCreate, loginInfo, kind, entryPackage)
      .then((response) => {
        if (!response.ok) {
          writeLog(composeStatusMessage(response));
          response.json().then((body) => {
            console.error(body.message);
            throw new Error(body.message);
          });
        }
        return response.json();
      })
      .then((body) => {
        let returnedName = '';
        if (kind === 'labels') {
          returnedName = body.name;
        } else {
          // kind === 'milestones'
          returnedName = body.title;
        }
        if (returnedName !== entryPackage.names.newName) {
          const msg =
            `Error occurred while creating ${kindSingular}` +
            ` ${entryPackage.names.originalName}.` +
            ` ${bugReportMsg}` +
            `The submitted ${kindSingular} for creation failed to validate` +
            ' against the returned confirmation.';
          reject(new Error(msg));
          return;
        }
        writeLog(`Created ${kindSingular}: ${returnedName}}.`);
        resolve(returnedName);
        return;
      })
      .catch((err) => {
        const msg =
          `Creation of ${kindSingular} ${entryPackage.names.originalName}` +
          ` failed due to: ${err}.`;
        throw new Error(msg);
      });
  }).catch((err) => {
    writeLog(err);
    throw new Error(err);
  });

/**
 * Return a URL for updating entries
 * @param {Object} loginInfo
 * @param {string} kind
 * @param {Object} entryPackage
 * @return {string}
 */
const urlForUpdate = (loginInfo, kind, entryPackage) =>
  `https://api.github.com/repos/${loginInfo.homeRepoOwner}/` +
  `${loginInfo.homeRepoName}/${kind}/${entryPackage.names.apiCallSign}`;

/**
 * Make API calls to update entries
 * @param {HTMLElement} entryNode
 * @param {string} kind
 * @return {Promise}
 */
const apiCallUpdate = (entryNode, kind) =>
  new Promise((resolve, reject) => {
    validateKind(kind);
    const loginInfo = getAndValidateLoginInfo();
    const entryPackage = packEntry(serializeEntry(entryNode, kind), kind);
    const kindSingular = kind.slice(0, -1);

    fetchWithBody('PATCH', urlForUpdate, loginInfo, kind, entryPackage)
      .then((response) => {
        if (!response.ok) {
          writeLog(composeStatusMessage(response));
          response.json().then((body) => {
            console.error(body.message);
            throw new Error(body.message);
          });
        }
        return response.json();
      })
      .then((body) => {
        let returnedName = '';
        if (kind === 'labels') {
          returnedName = body.name;
        } else {
          // kind === 'milestones'
          returnedName = body.title;
        }

        if (returnedName !== entryPackage.names.newName) {
          const msg =
            `Error occurred while updating ${kindSingular}` +
            ` ${entryPackage.names.originalName}.` +
            ` ${bugReportMsg}` +
            `The submitted ${kindSingular} for update failed to validate` +
            'against the returned confirmation.';
          reject(new Error(msg));
          return;
        }
        writeLog(
          `Updated ${kindSingular}: ${entryPackage.names.originalName}` +
            ` &#8680; ${returnedName}.`
        );
        resolve(returnedName);
        return;
      })
      .catch((err) => {
        const msg =
          `Update of ${kindSingular} ${entryPackage.names.originalName}` +
          ` &#8680; ${entryPackage.names.newName} failed due to error: ${err}.`;
        throw new Error(msg);
      });
  }).catch((err) => {
    writeLog(err);
    throw new Error(err);
  });

/**
 * Return a URL for deleting entries
 * @param {Object} loginInfo
 * @param {string} kind
 * @param {Object} entryPackage
 * @return {string}
 */
const urlForDelete = (loginInfo, kind, entryPackage) =>
  `https://api.github.com/repos/${loginInfo.homeRepoOwner}/` +
  `${loginInfo.homeRepoName}/${kind}/${entryPackage.names.apiCallSign}`;

/**
 * Make API calls to delete entries
 * @param {HTMLElement} entryNode
 * @param {string} kind
 * @return {Promise}
 */
const apiCallDelete = (entryNode, kind) =>
  new Promise((resolve, reject) => {
    validateKind(kind);
    const loginInfo = getAndValidateLoginInfo();
    const entryPackage = packEntry(serializeEntry(entryNode, kind), kind);
    const kindSingular = kind.slice(0, -1);

    fetchWithBody('DELETE', urlForDelete, loginInfo, kind, entryPackage)
      .then((response) => {
        if (!response.ok) {
          writeLog(composeStatusMessage(response));
          response.json().then((body) => {
            console.error(body.message);
            throw new Error(body.message);
          });
        }
        writeLog(`Deleted ${kindSingular} ${entryPackage.names.originalName}.`);
        resolve(response.status);
        return;
      })
      .catch((err) => {
        const msg =
          `Deletion of ${kindSingular} ${entryPackage.names.originalName}` +
          ` failed due to: ${err}.`;
        reject(new Error(msg));
        return;
      });
  }).catch((err) => {
    writeLog(err);
    throw new Error(err);
  });

export {
  makeBasicAuth,
  writeLog,
  formatDate,
  serializeEntry,
  packEntry,
  composeStatusMessage,
  urlForGet,
  fetchGet,
  apiCallGet,
  fetchWithBody,
  urlForCreate,
  apiCallCreate,
  urlForUpdate,
  apiCallUpdate,
  urlForDelete,
  apiCallDelete,
};
