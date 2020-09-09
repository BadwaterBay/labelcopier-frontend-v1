/**
 * Commit changes
 *
 * Things that happen when the 'Commit' button is clicked
 */

import { validateEntries } from './dataValidation';
import { listEntriesOfKind } from './manipulateEntries';
import {
  makeApiCallToCreateEntries,
  makeApiCallToUpdateEntries,
  makeApiCallToDeleteEntries,
} from './apiCalls';

const reloadEntries = () =>
  Promise.allSettled([
    listEntriesOfKind('labels'),
    listEntriesOfKind('milestones'),
  ]).catch((err) => {
    console.error(err);
  });

const resetModalWhenClosed = () => {
  $('#committing-modal').on('hidden.bs.modal', () => {
    reloadEntries();
    document.getElementById('committing-spinner').classList.remove('hidden');
    const modalBody = document.querySelector('#committing-modal .modal-body');
    modalBody.textContent = '';
  });
};

const selectEntriesForApiCall = (
  kind,
  apiCallActionToDo,
  apiCallFunctionCallback
) => {
  const kindSingular = kind.slice(0, -1);
  const selector = `.${kindSingular}-entry[data-apiCallActionToDo="${apiCallActionToDo}"]`;

  document
    .querySelectorAll(selector)
    .forEach((e) => apiCallFunctionCallback(e, kind));
};

/**
 * 2D array for selecting entries for API call
 * [[kind, to-do, API call function to be made],]
 */
const apiCallsToMake = [
  ['labels', 'create', makeApiCallToCreateEntries],
  ['labels', 'update', makeApiCallToUpdateEntries],
  ['labels', 'delete', makeApiCallToDeleteEntries],
  ['milestones', 'create', makeApiCallToCreateEntries],
  ['milestones', 'update', makeApiCallToUpdateEntries],
  ['milestones', 'delete', makeApiCallToDeleteEntries],
];

const commitChangesByMakingApiCalls = () => {
  $('#committing-modal').modal({
    keyboard: false,
    backdrop: 'static',
  });

  // Fire API calls asynchronously in parallel
  const resolvedApiCallPromises = apiCallsToMake.map((e) =>
    selectEntriesForApiCall(...e)
  );

  return Promise.allSettled(resolvedApiCallPromises).catch((err) => {
    console.error(err);
  });
};

const writeErrorsAlert = (errorCount, duplicateCount, kind) => {
  if (duplicateCount && errorCount)
    return (
      `${duplicateCount} set(s) of duplicate entries ` +
      `and ${errorCount} other error(s) found in ${kind}!`
    );

  if (duplicateCount && !errorCount)
    return (
      `${duplicateCount} set(s) of duplicate entries found in` + `${kind} !`
    );

  if (!duplicateCount && errorCount)
    return `${errorCount} error(s) found in ${kind} !`;

  // when !duplicateCount && !errorCount
  return '';
};

const listenForClickOfCommitButton = () => {
  document
    .getElementById('commit-to-home-repo-name')
    .addEventListener('click', () => {
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

      commitChangesByMakingApiCalls()
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

const listenForClickOutsideModalToCloseModal = () => {
  $(document).click((event) => {
    if ($(event.target).is('#committing-modal'))
      $('#committing-modal').modal('hide');
  });
};

export {
  reloadEntries,
  resetModalWhenClosed,
  selectEntriesForApiCall,
  commitChangesByMakingApiCalls,
  writeErrorsAlert,
  listenForClickOfCommitButton,
  listenForClickOutsideModalToCloseModal,
};
