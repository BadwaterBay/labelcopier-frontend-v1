/**
 * Commit changes
 *
 * Things that happen when the 'Commit' button is clicked
 */

import {
  getLoginInfo,
  validateEntries,
  checkIfEnableCommitButton,
} from './dataValidation';
import { clearAllEntries } from './manipulateEntries';
import {
  apiCallGet,
  apiCallCreate,
  apiCallUpdate,
  apiCallDelete,
} from './apiCalls';

/**
 * Callback for making API calls
 * @callback apiCallFunc
 * @param {HTMLElement} e HTML element node
 * @param {string} kind Kind of entry, e.g. 'labels' or 'milestones'
 */
/**
 * Select entries and make API calls
 * @param {string} kind Kind of entry, e.g. 'labels' or 'milestones'
 * @param {string} todo Action to do, e.g. create, update or delete
 * @param {apiCallFunc} apiCallFunc API call function as callback
 */
const selectEntriesForApiCall = (kind, todo, apiCallFunc) => {
  const kindSingular = kind.slice(0, -1);
  const selector = `.${kindSingular}-entry[data-todo="${todo}"]`;
  document.querySelectorAll(selector).forEach((e) => apiCallFunc(e, kind));
};

/**
 * 2D array for selecting entries for API call
 * [[kind, to-do, API call function to be made],]
 */
const entriesForApiCall = [
  ['labels', 'create', apiCallCreate],
  ['labels', 'update', apiCallUpdate],
  ['labels', 'delete', apiCallDelete],
  ['milestones', 'create', apiCallCreate],
  ['milestones', 'update', apiCallUpdate],
  ['milestones', 'delete', apiCallDelete],
];

const commitChanges = () => {
  // freeze the world
  $('#committing-modal').modal({
    keyboard: false,
    backdrop: 'static',
  });

  /**
   * Loop through the array and make API calls
   */
  const apiCalls = entriesForApiCall.map((e) => selectEntriesForApiCall(...e));
  Promise.allSettled(apiCalls)
    .then(() => {
      console.log('All API calls completed!');
    })
    .catch((err) => {
      console.error(err);
    });
};

const writeErrorsAlert = (errorCount, duplicateCount, kind) => {
  let alertMsg = '';
  if (errorCount || duplicateCount) {
    if (duplicateCount) {
      if (errorCount) {
        alertMsg =
          `${duplicateCount} set(s) of duplicate entries ` +
          `and ${errorCount} other error(s) found in ${kind}!\n`;
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
const listenForCommitButton = () => {
  document
    .getElementById('commit-to-home-repo-name')
    .addEventListener('click', () => {
      const loginInfo = getLoginInfo();

      if (!loginInfo.personalAccessToken) {
        alert(
          `You need to enter your personal access token for repo ` +
            `${loginInfo.homeRepoName} in order to commit changes.`
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
const reloadAfterCommit = () => {
  $('#committing-modal').on('hidden.bs.modal', () => {
    // reset modal
    const pNode = document.createElement('p');
    pNode.innerHTML = 'Committing...';

    const modalBody = document.querySelector('#committing-modal .modal-body');
    modalBody.textContent = '';
    modalBody.appendChild(pNode);

    // reload labels after changes
    clearAllEntries('labels');
    clearAllEntries('milestones');

    Promise.allSettled([apiCallGet('labels'), apiCallGet('milestones')])
      .then(() => {
        checkIfEnableCommitButton();
      })
      .catch((err) => {
        console.error(err);
      });
  });
};

/**
 * Clicking outside the modal closes it
 */
const clickOutsideToCloseModal = () => {
  $(document).click((event) => {
    if ($(event.target).is('#committing-modal')) {
      $('#committing-modal').modal('hide');
    }
  });
};

export {
  selectEntriesForApiCall,
  commitChanges,
  writeErrorsAlert,
  listenForCommitButton,
  reloadAfterCommit,
  clickOutsideToCloseModal,
};
