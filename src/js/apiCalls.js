/**
 * Communicate with GitHub API
 */

'use strict';

import base64Tool from './base64Tool';
import {
  bugReportMsg,
  getAndValidateLoginInfo,
  validateKind,
} from './dataValidation';

const apiPaginationLimit = 100;

const encodeForBasicAuthentication = (loginInfo) =>
  'Basic ' +
  base64Tool.encode(
    `${loginInfo.gitHubUsername}:${loginInfo.personalAccessToken}`
  );

const writeLogInCommitModal = (string) => {
  const logNode = document.createElement('p');
  logNode.innerHTML = string;
  const modalNode = document.querySelector('#committing-modal .modal-body');
  modalNode.appendChild(logNode);
};

const formatDate = (node) => {
  const date = node.value;
  const time = node.getAttribute('data-orig-time');

  if (!date) return null;

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

const serializeEntryForApiCalls = (node, kind) => {
  validateKind(kind);

  if (kind === 'labels') {
    return {
      name: node.querySelector('[name="name"]').value,
      originalName: node
        .querySelector('[name="name"]')
        .getAttribute('data-orig-val'),
      color: node.querySelector('[name="color"]').value.slice(1),
      description: node.querySelector('[name="description"]').value,
    };
  }

  if (kind === 'milestones') {
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
    }

    if (node.querySelector('[name="due-date"]').value !== '') {
      return {
        title: node.querySelector('[name="title"]').value,
        state: node.querySelector('[name="state"]').value,
        description: node.querySelector('[name="description"]').value,
        due_on: formatDate(node.querySelector('[name="due-date"]')),
      };
    }

    return {
      title: node.querySelector('[name="title"]').value,
      state: node.querySelector('[name="state"]').valie,
      description: node.querySelector('[name="description"]').value,
    };
  }

  return null;
};

const packageEntryForApiCalls = (serializedEntry, kind) => {
  validateKind(kind);

  const entryObjectCopy = serializedEntry; // Avoid side effects
  const entryPackage = {};

  if (kind === 'labels') {
    entryPackage.originalName = entryObjectCopy.originalName;
    entryPackage.newName = entryObjectCopy.name;
    entryPackage.apiCallSign = entryObjectCopy.originalName;
    delete entryObjectCopy.originalName;
  }

  if (kind === 'milestones') {
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

const composeErrorMessageWhenApiCallFails = (response) => {
  if (response.ok) return `${response.status} status OK.`;

  if (response.status === 401)
    return (
      `${response.status} ${response.statusText}.` +
      ' Please check the input values of your login information.'
    );

  if (response.status === 403)
    return (
      `${response.status} ${response.statusText}.` +
      ' The GitHub server refused to your request.' +
      ' Maybe you have exceeded your rate limit.' +
      ' Please wait for a little while.'
    );

  if (response.status === 404)
    return (
      `${response.status} ${response.statusText}.` +
      ' Repository not found. Please check the input values of your' +
      ' login information.'
    );

  if (response.status === 422)
    return (
      `${response.status} ${response.statusText}.` +
      ` ${bugReportMsg}` +
      `${response.status} ${response.statusText}.`
    );

  return `${response.status} ${response.statusText}.` + ` Error occurred.`;
};

const composeUrlForMakingApiCallToGetUserInfo = () =>
  'https://api.github.com/user';

const makeApiCallToGetUserInfo = () =>
  new Promise((resolve, reject) => {
    fetch(composeUrlForMakingApiCallToGetUserInfo(), {
      method: 'GET',
      headers: {
        Accept: 'application/vnd.github.v3+json',
        Authorization: `token ${window.accessToken}`,
      },
    })
      .then((response) => {
        if (!response.ok) {
          writeLogInCommitModal(composeErrorMessageWhenApiCallFails(response));
          response.json().then((body) => {
            console.error(body.message);
            reject(new Error(body.message));
            return;
          });
        }
        return response.json();
      })
      .then((body) => {
        resolve(body);
        return;
      });
  }).catch((err) => {
    writeLogInCommitModal(err);
    throw new Error(err);
  });

const composeUrlForCheckingIfGithubAppIsInstalled = () =>
  'https://api.github.com/user/installations' +
  `?per_page=${apiPaginationLimit}` +
  '&page=1';

const makeApiCallToCheckIfGithubAppIsInstalled = () => {
  return new Promise((resolve) => {
    fetch(composeUrlForCheckingIfGithubAppIsInstalled(), {
      method: 'GET',
      headers: {
        Accept: 'application/vnd.github.v3+json',
        Authorization: `token ${window.accessToken}`,
      },
    })
      .then((response) => response.json())
      .then((body) => {
        const thisAppAccessible = body.installations.some(
          (e) => e.app_id === 76912
        );
        resolve(thisAppAccessible);
        return;
      });
  });
};

const composeUrlForMakingApiCallGetEntries = (
  loginInfo,
  kind,
  pageNum,
  mode = 'list'
) => {
  const owner =
    mode === 'list' ? loginInfo.homeRepoOwner : loginInfo.templateRepoOwner;

  const repo =
    mode === 'list' ? loginInfo.homeRepoName : loginInfo.templateRepoName;

  let url =
    'https://api.github.com/repos/' +
    `${owner}/${repo}/${kind}` +
    `?per_page=${apiPaginationLimit}` +
    `&page=${pageNum}`;

  if (kind === 'milestones') {
    url += '&state=all';
  }

  return url;
};

const makeGetHttpRequest = (urlFunc, loginInfo, kind, pageNum, mode) =>
  fetch(urlFunc(loginInfo, kind, pageNum, mode), {
    method: 'GET',
    headers: {
      Authorization: encodeForBasicAuthentication(loginInfo),
      Accept: 'application/vnd.github.v3+json',
    },
  });

const makeApiCallToGetEntries = (loginInfo, kind, pageNum = 1, mode = 'list') =>
  makeGetHttpRequest(
    composeUrlForMakingApiCallGetEntries,
    loginInfo,
    kind,
    pageNum,
    mode
  )
    .then((response) => {
      if (!response.ok) {
        throw new Error(composeErrorMessageWhenApiCallFails(response));
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
      return body.concat(
        await makeApiCallToGetEntries(loginInfo, kind, ++pageNum, mode)
      );
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
const makeHttpRequestOfMethod = (
  method,
  urlFunc,
  loginInfo,
  kind,
  entryPackage
) => {
  return fetch(urlFunc(loginInfo, kind, entryPackage), {
    method: method,
    headers: {
      Authorization: encodeForBasicAuthentication(loginInfo),
      Accept: 'application/vnd.github.v3+json',
    },
    body: JSON.stringify(entryPackage.body),
  });
};

const composeUrlForCreatingEntries = (loginInfo, kind) =>
  `https://api.github.com/repos/${loginInfo.homeRepoOwner}/` +
  `${loginInfo.homeRepoName}/${kind}`;

const makeApiCallToCreateEntries = (entryNode, kind, mode = 'create') =>
  new Promise((resolve, reject) => {
    validateKind(kind);
    const loginInfo = getAndValidateLoginInfo(mode);
    const entryPackage = packageEntryForApiCalls(
      serializeEntryForApiCalls(entryNode, kind),
      kind
    );
    const kindSingular = kind.slice(0, -1);

    makeHttpRequestOfMethod(
      'POST',
      composeUrlForCreatingEntries,
      loginInfo,
      kind,
      entryPackage
    )
      .then((response) => {
        if (!response.ok) {
          writeLogInCommitModal(composeErrorMessageWhenApiCallFails(response));
          response.json().then((body) => {
            console.error(body.message);
            throw new Error(body.message);
          });
        }
        return response.json();
      })
      .then((body) => {
        let returnedName = '';

        if (kind === 'labels') returnedName = body.name;

        if (kind === 'milestones') returnedName = body.title;

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

        writeLogInCommitModal(`Created ${kindSingular}: ${returnedName}.`);
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
    writeLogInCommitModal(err);
    throw new Error(err);
  });

const composeUrlForUpdatingEntries = (loginInfo, kind, entryPackage) =>
  `https://api.github.com/repos/${loginInfo.homeRepoOwner}/` +
  `${loginInfo.homeRepoName}/${kind}/${entryPackage.names.apiCallSign}`;

const makeApiCallToUpdateEntries = (entryNode, kind) =>
  new Promise((resolve, reject) => {
    validateKind(kind);
    const loginInfo = getAndValidateLoginInfo();
    const entryPackage = packageEntryForApiCalls(
      serializeEntryForApiCalls(entryNode, kind),
      kind
    );
    const kindSingular = kind.slice(0, -1);

    makeHttpRequestOfMethod(
      'PATCH',
      composeUrlForUpdatingEntries,
      loginInfo,
      kind,
      entryPackage
    )
      .then((response) => {
        if (!response.ok) {
          writeLogInCommitModal(composeErrorMessageWhenApiCallFails(response));
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
        }

        if (kind === 'milestones') returnedName = body.title;

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
        writeLogInCommitModal(
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
    writeLogInCommitModal(err);
    throw new Error(err);
  });

const composeUrlForDeletingEntries = (loginInfo, kind, entryPackage) =>
  `https://api.github.com/repos/${loginInfo.homeRepoOwner}/` +
  `${loginInfo.homeRepoName}/${kind}/${entryPackage.names.apiCallSign}`;

const makeApiCallToDeleteEntries = (entryNode, kind) =>
  new Promise((resolve, reject) => {
    validateKind(kind);
    const loginInfo = getAndValidateLoginInfo();
    const entryPackage = packageEntryForApiCalls(
      serializeEntryForApiCalls(entryNode, kind),
      kind
    );
    const kindSingular = kind.slice(0, -1);

    makeHttpRequestOfMethod(
      'DELETE',
      composeUrlForDeletingEntries,
      loginInfo,
      kind,
      entryPackage
    )
      .then((response) => {
        if (!response.ok) {
          writeLogInCommitModal(composeErrorMessageWhenApiCallFails(response));
          response.json().then((body) => {
            console.error(body.message);
            throw new Error(body.message);
          });
        }

        writeLogInCommitModal(
          `Deleted ${kindSingular} ${entryPackage.names.originalName}.`
        );
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
    writeLogInCommitModal(err);
    throw new Error(err);
  });

export {
  encodeForBasicAuthentication,
  writeLogInCommitModal,
  formatDate,
  serializeEntryForApiCalls,
  packageEntryForApiCalls,
  composeErrorMessageWhenApiCallFails,
  composeUrlForMakingApiCallToGetUserInfo,
  makeApiCallToGetUserInfo,
  composeUrlForCheckingIfGithubAppIsInstalled,
  makeApiCallToCheckIfGithubAppIsInstalled,
  composeUrlForMakingApiCallGetEntries,
  makeGetHttpRequest,
  makeApiCallToGetEntries,
  makeHttpRequestOfMethod,
  composeUrlForCreatingEntries,
  makeApiCallToCreateEntries,
  composeUrlForUpdatingEntries,
  makeApiCallToUpdateEntries,
  composeUrlForDeletingEntries,
  makeApiCallToDeleteEntries,
};
