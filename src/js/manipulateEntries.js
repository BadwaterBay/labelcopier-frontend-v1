/**
 * manipulateEntries
 */

'use strict';

import { comparatorLexic, bubbleSort } from '@dongskyler/helpers.js';
import {
  getAndValidateLoginInfo,
  checkIfEnableCommitButton,
  validateKind,
} from './dataValidation';
import { apiCallGet } from './apiCalls';
import createNewLabelEntry from './createNewLabelEntry';
import { createNewMilestoneEntry } from './createNewMilestoneEntry';

/**
 * Toggle the progress indicator in the tabs of labels and milestones
 * in Management Card
 *
 * @param {string} kind 'labels' or 'milestones'
 * @param {string | null} action 'show' or 'hide'
 * @return {bool} True if the progress indicator is shown, false if it's hidden
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
    return true;
  } else if (action === 'hide') {
    nodeClassList.add('hidden');
    return false;
  } else {
    throw new Error('Invalid action in toggleTabProgressIndication.');
  }
};

/**
 * Clear all entries of the specified kind
 * @param {string} kind
 */
const clearAllEntriesOfKind = (kind) => {
  document.getElementById(`form-${kind}`).textContent = '';
  const commitToHomeRepo = document.getElementById('commit-to-home-repo-name');
  commitToHomeRepo.textContent = 'Commit changes';
  commitToHomeRepo.setAttribute('disabled', true);
  commitToHomeRepo.classList.remove('btn-success');
  commitToHomeRepo.classList.add('btn-outline-success');
};

/**
 * List entries from API by calling GET HTTP requests
 * @param {string} kind
 * @param {string} mode
 * @return {Promise} A sorted array of fetched entries
 */
const listEntriesFromApi = (kind, mode = 'list') =>
  new Promise((resolve, reject) => {
    // Eye candy:
    toggleTabProgressIndicator(kind, 'show');

    // Validate 'kind' argument:
    validateKind(kind);

    apiCallGet(getAndValidateLoginInfo(mode), kind, 1, mode)
      .then((fetchedEntries) => {
        if (mode === 'list') {
          clearAllEntriesOfKind(kind);
        }

        /**
         * The use of 'descendingOrder' is because we append existing entries
         * to the pannel, but prepend 'copy' entries that are copied from
         * other repositories, and hence, we use descending order for 'copy'.
         *
         * We might re-write the logic of how we add entries to the panel
         * in the future. The current method requires frequent direct DOM
         * manipultions, which are expensive.
         */
        const descendingOrder = mode === 'copy';

        let sortedFetchedEntries = [];

        if (kind === 'labels') {
          sortedFetchedEntries = bubbleSort(
            fetchedEntries,
            comparatorLexic({
              key: 'name',
              ignoreCase: true,
              descending: descendingOrder,
            })
          );
          sortedFetchedEntries.map((e) => createNewLabelEntry(e, mode));
        } else {
          // kind === 'milestones'
          sortedFetchedEntries = bubbleSort(
            fetchedEntries,
            comparatorLexic({
              key: 'title',
              ignoreCase: true,
              descending: descendingOrder,
            })
          );
          sortedFetchedEntries.map((e) => createNewMilestoneEntry(e, mode));
        }

        resolve(sortedFetchedEntries);
      })
      .catch((err) => {
        reject(new Error(err));
      });
  }).finally(() => {
    checkIfEnableCommitButton();
    toggleTabProgressIndicator(kind, 'hide');
  });

/**
 * Listen for click events of 'List' buttons
 * @param {string} kind Kind of entries (labels/milestones)
 * @return {Array}
 */
const listenForListEntriesOfKind = (kind) => {
  return document
    .getElementById(`list-all-${kind}`)
    .addEventListener('click', async () => {
      $(`#${kind}-tab`).tab('show');
      return await listEntriesFromApi(kind).catch((err) => {
        alert(err);
        console.error(err);
      });
    });
};

/**
 * Listen for click events of 'Undo' buttons
 * @param {string} kind Kind of entries (labels/milestones)
 * @return {Array}
 */
const listenForUndoEntriesOfKind = (kind) => {
  return document
    .getElementById(`undo-all-${kind}`)
    .addEventListener('click', async () => {
      return await listEntriesFromApi(kind).catch((err) => {
        alert(err);
        console.error(err);
      });
    });
};

const listenForCopyEntriesOfKind = (kind) => {
  document.getElementById(`copy-${kind}-from`).addEventListener('click', () => {
    $(`#${kind}-tab`).tab('show');
    listEntriesFromApi(kind, 'copy').catch((err) => {
      alert(err);
      console.error(err);
    });
  });
};

const listenForCreateEntriesOfKind = (kind) => {
  document
    .getElementById(`add-new-${kind.slice(0, -1)}-entry`)
    .addEventListener('click', () => {
      if (kind === 'labels') {
        createNewLabelEntry(null, 'new');
      } else {
        // kind === 'milestones'
        createNewMilestoneEntry(null, 'new');
      }
      checkIfEnableCommitButton();
    });
};

const deleteEntriesOfKind = (kind) => {
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
};

const listenForDeleteEntriesOfKind = (kind) => {
  document
    .getElementById(`delete-all-${kind}`)
    .addEventListener('click', () => {
      deleteEntriesOfKind(kind);
      checkIfEnableCommitButton();
    });
};

export {
  toggleTabProgressIndicator,
  clearAllEntriesOfKind,
  listEntriesFromApi,
  listenForListEntriesOfKind,
  listenForUndoEntriesOfKind,
  listenForCopyEntriesOfKind,
  listenForCreateEntriesOfKind,
  deleteEntriesOfKind,
  listenForDeleteEntriesOfKind,
};
