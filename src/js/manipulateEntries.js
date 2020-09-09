/**
 * manipulateEntries
 */

'use strict';

import { comparatorLexic, bubbleSort } from '@dongskyler/helpers.js';
import {
  getAndValidateLoginInfo,
  enableOrDisableCommitButton,
  validateKind,
} from './dataValidation';
import { makeApiCallToGetEntries } from './apiCalls';
import createNewLabelEntry from './createNewLabelEntry';
import { createNewMilestoneEntry } from './createNewMilestoneEntry';

const toggleTabProgressIndicator = (kind, action = null) => {
  const nodeClassList = document.getElementById(`${kind}-progress-indicator`)
    .classList;

  if (action === null) {
    action = nodeClassList.contains('hidden') ? show : hide;
  }

  if (action === 'show') {
    nodeClassList.remove('hidden');
    return true;
  }

  if (action === 'hide') {
    nodeClassList.add('hidden');
    return false;
  }

  throw new Error('Invalid action in toggleTabProgressIndication.');
};

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
 */
const listEntriesOfKind = (kind, mode = 'list') =>
  new Promise((resolve, reject) => {
    toggleTabProgressIndicator(kind, 'show');

    validateKind(kind);

    makeApiCallToGetEntries(getAndValidateLoginInfo(mode), kind, 1, mode)
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
    enableOrDisableCommitButton();
    toggleTabProgressIndicator(kind, 'hide');
  });

const listenForClickOfListEntriesOfKind = (kind) => {
  return document
    .getElementById(`list-all-${kind}`)
    .addEventListener('click', async () => {
      $(`#${kind}-tab`).tab('show');
      return await listEntriesOfKind(kind).catch((err) => {
        alert(err);
        console.error(err);
      });
    });
};

const listenForClickOfUndoEntriesOfKind = (kind) => {
  return document
    .getElementById(`undo-all-${kind}`)
    .addEventListener('click', async () => {
      return await listEntriesOfKind(kind).catch((err) => {
        alert(err);
        console.error(err);
      });
    });
};

const listenForClickOfCopyEntriesOfKind = (kind) => {
  document.getElementById(`copy-${kind}-from`).addEventListener('click', () => {
    $(`#${kind}-tab`).tab('show');
    listEntriesOfKind(kind, 'copy').catch((err) => {
      alert(err);
      console.error(err);
    });
  });
};

const listenForClickOfCreateEntriesOfKind = (kind) => {
  document
    .getElementById(`add-new-${kind.slice(0, -1)}-entry`)
    .addEventListener('click', () => {
      if (kind === 'labels') {
        createNewLabelEntry(null, 'new');
      } else {
        // kind === 'milestones'
        createNewMilestoneEntry(null, 'new');
      }
      enableOrDisableCommitButton();
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

const listenForClickOfDeleteEntriesOfKind = (kind) => {
  document
    .getElementById(`delete-all-${kind}`)
    .addEventListener('click', () => {
      deleteEntriesOfKind(kind);
      enableOrDisableCommitButton();
    });
};

export {
  toggleTabProgressIndicator,
  clearAllEntriesOfKind,
  listEntriesOfKind,
  listenForClickOfListEntriesOfKind,
  listenForClickOfUndoEntriesOfKind,
  listenForClickOfCopyEntriesOfKind,
  listenForClickOfCreateEntriesOfKind,
  deleteEntriesOfKind,
  listenForClickOfDeleteEntriesOfKind,
};
