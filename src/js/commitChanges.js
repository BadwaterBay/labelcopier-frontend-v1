/**
 * Commit changes
 *
 * Things that happen when the 'Commit' button is clicked
 */

import { getAndValidateLoginInfo, validateEntries } from './dataValidation';
import { listEntriesFromApi } from './manipulateEntries';
import { apiCallCreate, apiCallUpdate, apiCallDelete } from './apiCalls';

/**
 * Reload entires
 * @return {Promise}
 */
const reloadEntries = () =>
  Promise.allSettled([
    listEntriesFromApi('labels'),
    listEntriesFromApi('milestones'),
  ]).catch((err) => {
    console.error(err);
  });

/**
 * Reset the content inside '#committing-modal' modal when it is closed
 */
const resetModalWhenClosed = () => {
  $('#committing-modal').on('hidden.bs.modal', () => {
    document.getElementById('committing-spinner').classList.remove('hidden');
    const modalBody = document.querySelector('#committing-modal .modal-body');
    modalBody.textContent = '';
  });
};

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

  // Fire API calls asynchronously in parallel
  const apiCalls = entriesForApiCall.map((e) => selectEntriesForApiCall(...e));
  return Promise.allSettled(apiCalls)
    .then(() => {
      reloadEntries();
    })
    .catch((err) => {
      console.error(err);
    });
};

const writeErrorsAlert = (errorCount, duplicateCount, kind) => {
  if (errorCount || duplicateCount) {
    if (duplicateCount) {
      if (errorCount) {
        return (
          `${duplicateCount} set(s) of duplicate entries ` +
          `and ${errorCount} other error(s) found in ${kind}!`
        );
      } else {
        return (
          `${duplicateCount} set(s) of duplicate entries found in` + `${kind} !`
        );
      }
    } else {
      return `${errorCount} error(s) found in ${kind} !`;
    }
  }
  return '';
};

/**
 * Listen for clicking the commit button to commit changes by making
 * API calls
 */
const listenForCommitButton = () => {
  document
    .getElementById('commit-to-home-repo-name')
    .addEventListener('click', () => {
      const loginInfo = getAndValidateLoginInfo();

      if (window.accessToken === null && !loginInfo.personalAccessToken) {
        // The global accessToken variable is problematic. It should be addressed in the future.
        alert(
          `You need to login with GitHub or manually enter a personal access token to commit changes.`
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

        alert(`${labelsAlert} ${milestonesAlert} `);
        return;
      }

      commitChanges()
        .then(() => {
          setTimeout(() => {
            document
              .getElementById('committing-spinner')
              .classList.add('hidden');
          }, 750);
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
  reloadEntries,
  resetModalWhenClosed,
  selectEntriesForApiCall,
  commitChanges,
  writeErrorsAlert,
  listenForCommitButton,
  clickOutsideToCloseModal,
};
