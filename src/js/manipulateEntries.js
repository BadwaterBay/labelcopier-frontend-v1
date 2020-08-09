/**
 * manipulateEntries
 */

'use strict';

import {
  getLoginInfo,
  validateLoginAgainstNull,
  checkIfEnableCommitButton,
  validateKind,
} from './dataValidation';
import { apiCallGet } from './apiCalls';
import createNewLabelEntry from './createNewLabelEntry';
import { createNewMilestoneEntry } from './createNewMilestoneEntry';
import { comparatorLexic, sortArray } from './helpers';

/**
 * Toggle the progress indicator in the tabs of labels and milestones
 * in Management Card
 *
 * @param {string} kind 'labels' or 'milestones'
 * @param {string | null} action 'show' or 'hide'
 * @return {bool}
 *
 * If 'action' is not specified, toggle the 'hidden' class of the indicator.
 * If 'action' is specified, do the action.
 */
const toggleTabProgressIndicator = (kind, action = null) => {
  const nodeClassList = document.getElementById(`${kind}-progress-indicator`)
    .classList;

  if (action === null) {
    action = nodeClassList.contains('hidden') ? show : hide;
  }

  if (action === 'show') {
    nodeClassList.remove('hidden');
  } else if (action === 'hide') {
    nodeClassList.add('hidden');
  } else {
    throw new Error('Invalid action in toggleTabProgressIndication.');
  }
  return true;
};

/**
 * Clear all entries of the specified kind
 * @param {string} kind
 */
const clearAllEntries = (kind) => {
  document.getElementById(`form-${kind}`).textContent = '';

  const commitToTargetRepo = document.getElementById(
    'commit-to-home-repo-name'
  );
  commitToTargetRepo.textContent = 'Commit changes';
  commitToTargetRepo.setAttribute('disabled', true);
  commitToTargetRepo.classList.remove('btn-success');
  commitToTargetRepo.classList.add('btn-outline-success');
};

const listEntriesFromApi = (kind, mode = 'list') =>
  new Promise((resolve, reject) => {
    // Eye candy
    toggleTabProgressIndicator(kind, 'show');

    const loginInfo = getLoginInfo();

    try {
      // Validate 'kind' argument:
      validateKind(kind);
      // Validate if necessary login information is present:
      validateLoginAgainstNull(loginInfo, mode);
    } catch (err) {
      toggleTabProgressIndicator(kind, 'hide');
      alert(err);
      reject(err);
      return;
    }

    apiCallGet(loginInfo, kind, 1, mode)
      .then((fetchedEntries) => {
        if (mode === 'list') {
          clearAllEntries(kind);
        }

        let sortedFetchedEntries = [];

        /**
         * This is because we append existing entries to the pannel, but
         * prepend 'copy' entries that are copied from other repositories,
         * and hence, we use descending order for 'copy'.
         *
         * We might re-write the logic of how we add entries to the panel
         * in the future. The current method requires frequent direct DOM
         * manipultions, which are expensive.
         */
        const descendingOrder = mode === 'copy';

        if (kind === 'labels') {
          console.log(`descendingOrder is ${descendingOrder}`);
          sortedFetchedEntries = sortArray(
            fetchedEntries,
            comparatorLexic('name', true, descendingOrder)
          );
          sortedFetchedEntries.map((e) => createNewLabelEntry(e, mode));
        } else {
          // kind === 'milestones'
          sortedFetchedEntries = sortArray(
            fetchedEntries,
            comparatorLexic('title', true, descendingOrder)
          );
          sortedFetchedEntries.map((e) => createNewMilestoneEntry(e, mode));
        }

        toggleTabProgressIndicator(kind, 'hide');
        checkIfEnableCommitButton();
        resolve(sortedFetchedEntries);
        return;
      })
      .catch((err) => {
        toggleTabProgressIndicator(kind, 'hide');
        console.error(err);
        reject(err);
        return;
      });
  });

const listenForListAllLabels = () => {
  const kind = 'labels';
  document.getElementById(`list-all-${kind}`).addEventListener('click', () => {
    $(`#${kind}-tab`).tab('show');
    listEntriesFromApi(kind).catch((err) => console.error(err));
  });
};

const listenForListAllMilestones = () => {
  const kind = 'milestones';
  document.getElementById(`list-all-${kind}`).addEventListener('click', () => {
    $(`#${kind}-tab`).tab('show');
    listEntriesFromApi(kind).catch((err) => console.error(err));
  });
};

const listenForCopyLabelsFromRepo = () => {
  const kind = 'labels';
  document.getElementById(`copy-${kind}-from`).addEventListener('click', () => {
    $(`#${kind}-tab`).tab('show');
    listEntriesFromApi(kind, 'copy').catch((err) => console.error(err));
  });
};

const listenForCopyMilestonesFromRepo = () => {
  const kind = 'milestones';
  document.getElementById(`copy-${kind}-from`).addEventListener('click', () => {
    $(`#${kind}-tab`).tab('show');
    listEntriesFromApi(kind, 'copy').catch((err) => console.error(err));
  });
};

const deleteAllEntries = (kind) => {
  $(`#form-${kind}`)
    .children()
    .each(
      /** @this HTMLElement */
      function () {
        if ($(this).attr('new') === 'true') {
          $(this).remove();
        } else {
          $(this).children('.card').addClass('deleted-card');
          $(this).parent().find('.invalid-input').addClass('hidden');
          $(this).children('.recover-button').removeAttr('disabled');
          $(this).children('.delete-button').addClass('hidden');
          $(this).children('.recover-button').removeClass('hidden');
          $(this).attr('data-todo', 'delete');
        }
      }
    );
  checkIfEnableCommitButton();
};

const listenForDeleteAllLabels = () => {
  document.getElementById('delete-all-labels').addEventListener('click', () => {
    deleteAllEntries('labels');
  });
};

const listenForDeleteAllMilestones = () => {
  document
    .getElementById('delete-all-milestones')
    .addEventListener('click', () => {
      deleteAllEntries('milestones');
    });
};

const listenForUndoLabels = () => {
  document.getElementById('undo-all-labels').addEventListener('click', () => {
    listEntriesFromApi('labels');
  });
};

const listenForUndoMilestones = () => {
  document
    .getElementById('undo-all-milestones')
    .addEventListener('click', () => {
      listEntriesFromApi('milestones');
    });
};

/**
 * CREATE NEW LABEL ENTRIES
 */
const listenForCreateNewLabel = () => {
  document
    .getElementById('add-new-label-entry')
    .addEventListener('click', () => {
      createNewLabelEntry(null, 'new');
      checkIfEnableCommitButton();
    });
};

/**
 * CREATE NEW MILESTONE ENTRIES
 */
const listenForCreateNewMilestone = () => {
  document
    .getElementById('add-new-milestone-entry')
    .addEventListener('click', () => {
      createNewMilestoneEntry(null, 'new');
      checkIfEnableCommitButton();
    });
};

export {
  toggleTabProgressIndicator,
  clearAllEntries,
  listEntriesFromApi,
  listenForListAllLabels,
  listenForListAllMilestones,
  deleteAllEntries,
  listenForDeleteAllLabels,
  listenForDeleteAllMilestones,
  listenForUndoLabels,
  listenForUndoMilestones,
  listenForCopyLabelsFromRepo,
  listenForCopyMilestonesFromRepo,
  listenForCreateNewLabel,
  listenForCreateNewMilestone,
};
