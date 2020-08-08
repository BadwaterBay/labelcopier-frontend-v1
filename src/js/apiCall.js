/**
 * Communicate with GitHub API
 */

'use strict';

import base64 from './base64';
import { getLoginInfo, checkIfEnableCommitButton } from './preApiCallCheck';
import { clearAllEntries } from './manipulateEntries';
import { validateEntries, validateKind } from './dataValidation';
import createNewLabelEntry from './createNewLabelEntry';
import { createNewMilestoneEntry } from './createNewMilestoneEntry';

const formatDate = (dateInput) => {
  const date = dateInput.val();
  const time = dateInput.attr('data-orig-time');

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
 * @param {*} jObjectEntry
 * @param {string} kind
 * @return {Object | null} Serialized object
 */
const serializeEntries = (jObjectEntry, kind) => {
  try {
    validateKind(kind);
  } catch (err) {
    console.error(err);
    alert(err);
    return;
  }

  if (kind === 'labels') {
    return {
      name: jObjectEntry.find('[name="name"]').val(),
      originalName: jObjectEntry.find('[name="name"]').attr('data-orig-val'),
      color: jObjectEntry.find('[name="color"]').val().slice(1),
      description: jObjectEntry.find('[name="description"]').val(),
    };
  } else {
    if (jObjectEntry.attr('data-number') !== 'null') {
      return {
        title: jObjectEntry.find('[name="title"]').val(),
        originalTitle: jObjectEntry
          .find('[name="title"]')
          .attr('data-orig-val'),
        state: jObjectEntry.find('[name="state"]').val(),
        description: jObjectEntry.find('[name="description"]').val(),
        due_on: formatDate(jObjectEntry.find('[name="due-date"]')),
        number: +jObjectEntry.attr('data-number'),
      };
    } else {
      if (jObjectEntry.find('[name="due-date"]').val() !== '') {
        return {
          title: jObjectEntry.find('[name="title"]').val(),
          state: jObjectEntry.find('[name="state"]').val(),
          description: jObjectEntry.find('[name="description"]').val(),
          due_on: formatDate(jObjectEntry.find('[name="due-date"]')),
        };
      } else {
        return {
          title: jObjectEntry.find('[name="title"]').val(),
          state: jObjectEntry.find('[name="state"]').val(),
          description: jObjectEntry.find('[name="description"]').val(),
        };
      }
    }
  }
};

const makeBasicAuth = (loginInfo) =>
  'Basic ' +
  base64.encode(`${loginInfo.targetUsername}:${loginInfo.personalAccessToken}`);

const packEntry = (entryObject, kind) => {
  const entryObjectCopy = entryObject;
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

const writeLog = (string) => {
  $('#loadingModal .modal-body').append(`${string}<br/>`);
};

const urlForGetEntries = (loginInfo, kind, pageNum = 1) => {
  const owner = loginInfo.targetOwner;
  const repo = loginInfo.targetRepo;
  let queryURL =
    `https://api.github.com/repos/${owner}/${repo}/${kind}` +
    `?page=${pageNum}`;
  if (kind === 'milestones') {
    queryURL += '&state=all';
  }
  return queryURL;
};

const apiCallGetEntriesRecursively = async (
  loginInfo,
  kind,
  mode,
  pageNum = 1,
  callback = undefined
) => {
  const url = urlForGetEntries(loginInfo, kind, pageNum);
  fetch(url, {
    method: 'GET',
    headers: {
      Authorization: makeBasicAuth(loginInfo),
    },
  })
    .then((response) => {
      if (!response.ok) {
        if (typeof callback === 'function') {
          callback(response);
        }
        throw new Error('Error occurred while getting entries.');
      }
      response.json().then((body) => {
        if (body.length === 0) {
          if (pageNum === 1) {
            alert(`No ${kind} exist in this repository.`);
          }
          return;
        }
        if (kind === 'labels') {
          body.forEach((e) => {
            createNewLabelEntry(e, mode);
          });
        } else {
          body.forEach((e) => {
            createNewMilestoneEntry(e, mode);
          });
        }
        if (typeof callback === 'function') {
          callback(body);
        }
        apiCallGetEntriesRecursively(
          loginInfo,
          kind,
          mode,
          ++pageNum,
          callback
        );
      });
    })
    .catch((err) => {
      console.error(err);
      alert(err);
    });
};

const apiCallGetEntries = (kind, mode = 'list', callback = undefined) => {
  try {
    validateKind(kind);
  } catch (err) {
    console.error(err);
    alert(err);
    return;
  }

  const loginInfo = getLoginInfo();
  const startingPageNum = 1;
  apiCallGetEntriesRecursively(loginInfo, kind, mode, startingPageNum, callback)
    .then(() => {
      checkIfEnableCommitButton();
    })
    .catch((err) => {
      console.error(err);
      alert(err);
    });
};

const urlForCreateEntries = (loginInfo, kind) =>
  `https://api.github.com/repos/${loginInfo.targetOwner}/` +
  `${loginInfo.targetRepo}/${kind}`;

const apiCallCreateEntries = (entryObject, kind, callback = undefined) => {
  try {
    validateKind(kind);
  } catch (err) {
    console.error(err);
    alert(err);
    return;
  }

  const loginInfo = getLoginInfo();
  const entryPackage = packEntry(entryObject, kind);
  const url = urlForCreateEntries(loginInfo, kind);
  const kindNameSingular = kind.slice(0, -1);

  fetch(url, {
    method: 'POST',
    headers: {
      Authorization: makeBasicAuth(loginInfo),
    },
    body: JSON.stringify(entryPackage.body),
  })
    .then((response) => {
      if (!response.ok) {
        if (typeof callback === 'function') {
          callback(response);
        }
        throw new Error(response.status);
      }
      response.json().then((body) => {
        if (typeof callback === 'function') {
          callback(body);
        }
        writeLog(
          `Created ${kindNameSingular}: ${entryPackage.names.originalName}.`
        );
      });
    })
    .catch((err) => {
      writeLog(
        `Creation of ${kindNameSingular} ${entryPackage.names.originalName} failed due to ` +
          `error: ${err}.`
      );
      console.error(err);
    });
};

const urlForUpdateEntries = (loginInfo, kind, apiCallSign) =>
  `https://api.github.com/repos/${loginInfo.targetOwner}/` +
  `${loginInfo.targetRepo}/${kind}/${apiCallSign}`;

const apiCallUpdateEntries = (entryObject, kind, callback = undefined) => {
  try {
    validateKind(kind);
  } catch (err) {
    console.error(err);
    alert(err);
    return;
  }

  const loginInfo = getLoginInfo();
  const entryPackage = packEntry(entryObject, kind);
  const url = urlForUpdateEntries(
    loginInfo,
    kind,
    entryPackage.names.apiCallSign
  );
  const kindNameSingular = kind.slice(0, -1);

  fetch(url, {
    method: 'PATCH',
    headers: {
      Authorization: makeBasicAuth(loginInfo),
    },
    body: JSON.stringify(entryPackage.body),
  })
    .then((response) => {
      if (!response.ok) {
        if (typeof callback === 'function') {
          callback(response);
        }
        throw new Error(response.status);
      }
      response.json().then((body) => {
        if (typeof callback === 'function') {
          callback(body);
        }
        writeLog(
          `Updated ${kindNameSingular}: ${entryPackage.names.originalName} -> ${entryPackage.names.newName}.`
        );
      });
    })
    .catch((err) => {
      writeLog(
        `Update of ${kindNameSingular} ${entryPackage.names.originalName} -> ${entryPackage.names.newName} failed due to ` +
          `error: ${err}.`
      );
      console.error(err);
    });
};

const urlForDeleteEntries = (loginInfo, kind, apiCallSign) =>
  `https://api.github.com/repos/${loginInfo.targetOwner}/` +
  `${loginInfo.targetRepo}/${kind}/${apiCallSign}`;

const apiCallDeleteEntries = (entryObject, kind, callback = undefined) => {
  try {
    validateKind(kind);
  } catch (err) {
    console.error(err);
    alert(err);
    return;
  }

  const loginInfo = getLoginInfo();
  const entryPackage = packEntry(entryObject, kind);
  const url = urlForDeleteEntries(
    loginInfo,
    kind,
    entryPackage.names.apiCallSign
  );
  const kindNameSingular = kind.slice(0, -1);

  fetch(url, {
    method: 'DELETE',
    headers: {
      Authorization: makeBasicAuth(loginInfo),
    },
  })
    .then((response) => {
      if (!response.ok) {
        if (typeof callback === 'function') {
          callback(response);
        }
        throw new Error(response.status);
      }
      if (typeof callback === 'function') {
        callback(response);
      }
      writeLog(
        `Updated ${kindNameSingular}: ${entryPackage.names.originalName}.`
      );
    })
    .catch((err) => {
      writeLog(
        `Update of ${kindNameSingular} ${entryPackage.names.originalName} ` +
          `failed due to error: ${err}.`
      );
      console.error(err);
    });
};

const commitChanges = () => {
  // freeze the world
  $('#loadingModal').modal({
    keyboard: false,
    backdrop: 'static',
  });

  // To be deleted
  $('.label-entry[data-todo="delete"]').each(
    /** @this HTMLElement */
    function () {
      const entryObject = serializeEntries($(this), 'labels');
      apiCallDeleteEntries(entryObject, 'labels');
    }
  );

  $('.milestone-entry[data-todo="delete"]').each(
    /** @this HTMLElement */
    function () {
      const entryObject = serializeEntries($(this), 'milestones');
      apiCallDeleteEntries(entryObject, 'milestones');
    }
  );

  // To be updated
  $('.label-entry[data-todo="update"]').each(
    /** @this HTMLElement */
    function () {
      const entryObject = serializeEntries($(this), 'labels');
      apiCallUpdateEntries(entryObject, 'labels');
    }
  );

  $('.milestone-entry[data-todo="update"]').each(
    /** @this HTMLElement */
    function () {
      const entryObject = serializeEntries($(this), 'milestones');
      apiCallUpdateEntries(entryObject, 'milestones');
    }
  );

  // To be created
  $('.label-entry[data-todo="create"]').each(
    /** @this HTMLElement */
    function () {
      const entryObject = serializeEntries($(this), 'labels');
      apiCallCreateEntries(entryObject, 'labels');
    }
  );

  $('.milestone-entry[data-todo="create"]').each(
    /** @this HTMLElement */
    function () {
      const entryObject = serializeEntries($(this), 'milestones');
      apiCallCreateEntries(entryObject, 'milestones');
    }
  );
};

const writeErrorsAlert = (errorCount, duplicateCount, kind) => {
  let alertMsg = '';
  if (errorCount || duplicateCount) {
    if (duplicateCount) {
      if (errorCount) {
        alertMsg = `${duplicateCount} set(s) of duplicate entries and ${errorCount} other error(s) found in ${kind}!\n`;
      } else {
        alertMsg = `${duplicateCount} set(s) of duplicate entries found in ${kind}!\n`;
      }
    } else {
      alertMsg = `${errorCount} error(s) found in ${kind}!\n`;
    }
  }
  return alertMsg;
};

/**
 * Listen for clicking the commit button to commit changes by making
 * API calls
 */
const listenForClickOfCommitButton = () => {
  $('#commit-to-target-repo').click(() => {
    const loginInfo = getLoginInfo();

    if (!loginInfo.personalAccessToken) {
      alert(
        `You need to enter your personal access token for repo \
      ${loginInfo.targetRepo} in order to commit changes.`
      );
      return;
    }

    const [
      labelsErrorCount,
      labelsDuplicateCount,
      milestonesErrorCount,
      milestonesDuplicateCount,
    ] = validateEntries();

    if (
      labelsErrorCount ||
      milestonesErrorCount ||
      labelsDuplicateCount ||
      milestonesDuplicateCount
    ) {
      const labelsAlert = writeErrorsAlert(
        labelsErrorCount,
        labelsDuplicateCount,
        'labels'
      );
      const milestonesAlert = writeErrorsAlert(
        milestonesErrorCount,
        milestonesDuplicateCount,
        'milestones'
      );

      alert(`${labelsAlert}${milestonesAlert}`);
      return;
    }

    commitChanges();
  });
};

/**
 * Reload entries when the modal is closed after comitting changes
 */
const reloadEntriesWhenModalCloses = () => {
  $('#loadingModal').on('hidden.bs.modal', () => {
    // reset modal
    $('#loadingModal .modal-body').text('');
    $('#loadingModal .modal-body').append('<p>Commiting...');
    $('#loadingModal .modal-footer').remove();

    // reload labels after changes
    clearAllEntries('labels');
    clearAllEntries('milestones');

    apiCallGetEntries(
      'labels',
      'list' // !! This parameter no longer exists in createNewLabelEntry
    );

    apiCallGetEntries(
      'milestones',
      'list' // !! This parameter no longer exists in createNewMilestoneEntry
    );
  });
};

export {
  formatDate,
  serializeEntries,
  makeBasicAuth,
  packEntry,
  writeLog,
  urlForGetEntries,
  apiCallGetEntriesRecursively,
  apiCallGetEntries,
  urlForCreateEntries,
  apiCallCreateEntries,
  urlForUpdateEntries,
  apiCallUpdateEntries,
  urlForDeleteEntries,
  apiCallDeleteEntries,
  commitChanges,
  writeErrorsAlert,
  listenForClickOfCommitButton,
  reloadEntriesWhenModalCloses,
};
