/**
 * Communicate with GitHub API
 */

'use strict';

import base64 from './base64';
import { getLoginInfo, checkIfEnableCommitButton } from './preApiCallCheck';
import { clearAllEntries } from './manipulateEntries';
import { validateEntries } from './dataValidation';
import createNewLabelEntry from './createNewLabelEntry';
import { createNewMilestoneEntry } from './createNewMilestoneEntry';

const writeLog = (string) => {
  $('#loadingModal .modal-body').append(`${string}<br />`);
};

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
  if (kind === 'labels') {
    return {
      name: jObjectEntry.find('[name="name"]').val(),
      color: jObjectEntry.find('[name="color"]').val().slice(1),
      description: jObjectEntry.find('[name="description"]').val(),
      originalName: jObjectEntry.find('[name="name"]').attr('data-orig-val'),
    };
  } else if (kind === 'milestones') {
    if (jObjectEntry.attr('data-number') !== 'null') {
      return {
        title: jObjectEntry.find('[name="title"]').val(),
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
  } else {
    console.log('Bug in function serializeEntries!');
  }
};

const assignNameForEntry = (entryObject, kind) => {
  let nameOfEntry = 'Default name';
  if (kind === 'labels') {
    nameOfEntry = entryObject.name;
  } else if (kind === 'milestones') {
    nameOfEntry = entryObject.title;
  } else {
    console.log(
      "The 'kind' is invalid (neither labels or milestones). Return 'Default name'."
    );
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

const loadingSemaphore = (() => {
  let count = 0;

  return {
    acquire: () => {
      ++count;
      return null;
    },
    release: () => {
      if (count <= 0) {
        throw new Error('Semaphore inconsistency');
      }

      --count;
      return null;
    },
    isLocked: () => {
      return count > 0;
    },
  };
})();

let isLoadingShown = false;

$.ajaxSetup({
  cache: false,
  complete: () => {
    loadingSemaphore.release();
    if (isLoadingShown && loadingSemaphore.isLocked() === false) {
      writeLog('All operations are done.');

      $('#loadingModal .modal-content').append(`
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary"
              data-dismiss="modal" aria-label="Close">
              <span aria-hidden="true">
                Close
              </span>
            </button>
          </div>
          `);
    }
  },
  beforeSend: (xhr) => {
    const LOGIN_INFO = getLoginInfo();
    loadingSemaphore.acquire();
    if (LOGIN_INFO.targetUsername && LOGIN_INFO.personalAccessToken) {
      xhr.setRequestHeader('Authorization', makeBasicAuth(LOGIN_INFO));
    }
  },
});

const apiCallGetUrl = (owner, repo, kind, pageNum) => {
  let queryURL = `https://api.github.com/repos/${owner}/${repo}/${kind}?page=${pageNum}`;
  if (kind === 'milestones') {
    queryURL += '&state=all';
  }
  return queryURL;
};

const apiCallGetEntriesRecursively = (
  owner,
  repo,
  kind,
  mode,
  pageNum = 1,
  callback = undefined
) => {
  $.ajax({
    type: 'GET',
    url: apiCallGetUrl(owner, repo, kind, pageNum),
    success: (response) => {
      if (response) {
        if (response.length === 0) {
          if (pageNum === 1) {
            alert(`No ${kind} exist in this repo!`);
          }
          return;
        }
        if (kind === 'labels') {
          response.forEach((e) => {
            e.color = `#${e.color.toUpperCase()}`;
            createNewLabelEntry(e, mode);
          });
        } else if (kind === 'milestones') {
          response.forEach((e) => {
            createNewMilestoneEntry(e, mode);
          });
        } else {
          console.log('Bug in function apiCallGetEntriesRecursively!');
        }
      }
      if (typeof callback === 'function') {
        callback(response);
      }
      apiCallGetEntriesRecursively(
        owner,
        repo,
        kind,
        mode,
        ++pageNum,
        callback
      );
    },
    error: (response) => {
      if (response.status === 404) {
        alert(
          `Not found! If this is a private repo, make sure you provide a personal access token.`
        );
      }
      if (typeof callback === 'function') {
        callback(response);
      }
    },
  });
  checkIfEnableCommitButton();
};

const apiCallGetEntries = (kind, mode = 'list', callback = undefined) => {
  const LOGIN_INFO = getLoginInfo();
  const startingPageNum = 1;

  apiCallGetEntriesRecursively(
    LOGIN_INFO.targetOwner,
    LOGIN_INFO.targetRepo,
    kind,
    mode,
    startingPageNum,
    callback
  );
};

const apiCallCreateEntries = (entryObject, kind, callback = undefined) => {
  const LOGIN_INFO = getLoginInfo();
  const NAME_OF_ENTRY = assignNameForEntry(entryObject, kind);

  $.ajax({
    type: 'POST',
    url: `https://api.github.com/repos/${LOGIN_INFO.targetOwner}/${LOGIN_INFO.targetRepo}/${kind}`,
    data: JSON.stringify(entryObject),
    success: (response) => {
      if (typeof callback === 'function') {
        callback(response);
      }
      writeLog(`Created ${kind.slice(0, -1)}: ${NAME_OF_ENTRY}`);
    },
    error: (jqXHR, textStatus, errorThrown) => {
      writeLog(
        'Creation of ' +
          kind.slice(0, -1) +
          `failed for: ${NAME_OF_ENTRY} due to error: ${errorThrown}`
      );
    },
  });
};

const apiCallUpdateEntries = (entryObject, kind, callback = undefined) => {
  const API_CALL_SIGN = ((entryObject, kind) => {
    let apiCallSign = '';
    if (kind === 'labels') {
      apiCallSign = entryObject.originalName;
      delete entryObject.originalName;
    } else if (kind === 'milestones') {
      apiCallSign = entryObject.number;
    } else {
      apiCallSign = "There's a bug in function assignAPICallSign4Update!";
    }
    return apiCallSign;
  })(entryObject, kind);

  const LOGIN_INFO = getLoginInfo();
  const NAME_OF_ENTRY = assignNameForEntry(entryObject, kind);

  $.ajax({
    type: 'PATCH',
    url: `https://api.github.com/repos/${LOGIN_INFO.targetOwner}/${LOGIN_INFO.targetRepo}/${kind}/${API_CALL_SIGN}`,
    data: JSON.stringify(entryObject),
    success: (response) => {
      if (typeof callback === 'function') {
        callback(response);
      }
      writeLog(
        'Updated ' +
          kind.slice(0, -1) +
          `: ${API_CALL_SIGN} => ${NAME_OF_ENTRY}`
      );
    },
    error: (jqXHR, textStatus, errorThrown) => {
      writeLog(
        'Update of ' +
          kind.slice(0, -1) +
          ` failed for: ${API_CALL_SIGN} due to error: ${errorThrown}`
      );
    },
  });
};

const apiCallDeleteEntries = (entryObject, kind, callback = undefined) => {
  const API_CALL_SIGN = ((entryObject, kind) => {
    let apiCallSign = '';
    if (kind === 'labels') {
      apiCallSign = entryObject.originalName;
    } else if (kind === 'milestones') {
      apiCallSign = entryObject.number;
    } else {
      apiCallSign = "There's a bug in function assignAPICallSign4Delete!";
    }
    return apiCallSign;
  })(entryObject, kind);

  const LOGIN_INFO = getLoginInfo();
  const NAME_OF_ENTRY = assignNameForEntry(entryObject, kind);

  $.ajax({
    type: 'DELETE',
    url: `https://api.github.com/repos/${LOGIN_INFO.targetOwner}/${LOGIN_INFO.targetRepo}/${kind}/${API_CALL_SIGN}`,
    success: (response) => {
      if (typeof callback === 'function') {
        callback(response);
      }
      writeLog(`Deleted ${kind.slice(0, -1)}: ${NAME_OF_ENTRY}`);
    },
    error: (jqXHR, textStatus, errorThrown) => {
      writeLog(
        'Deletion of ' +
          kind.slice(0, -1) +
          ` failed for: ${NAME_OF_ENTRY} due to error: ${errorThrown}`
      );
    },
  });
};

const commitChanges = () => {
  // freeze the world
  $('#loadingModal').modal({
    keyboard: false,
    backdrop: 'static',
  });
  isLoadingShown = true;

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
    const LOGIN_INFO = getLoginInfo();

    if (!LOGIN_INFO.personalAccessToken) {
      alert(
        `You need to enter your personal access token for repo \
      ${LOGIN_INFO.targetRepo} in order to commit changes.`
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
    isLoadingShown = false;

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
  writeLog,
  formatDate,
  serializeEntries,
  assignNameForEntry,
  makeBasicAuth,
  loadingSemaphore,
  apiCallGetUrl,
  apiCallGetEntriesRecursively,
  apiCallGetEntries,
  apiCallCreateEntries,
  apiCallUpdateEntries,
  apiCallDeleteEntries,
  commitChanges,
  writeErrorsAlert,
  listenForClickOfCommitButton,
  reloadEntriesWhenModalCloses,
};
