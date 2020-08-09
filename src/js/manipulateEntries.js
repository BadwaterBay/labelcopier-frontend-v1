/**
 * manipulateEntries
 */

'use strict';

import { getLoginInfo, checkIfEnableCommitButton } from './dataValidation';
import { apiCallGet } from './apiCalls';
import createNewLabelEntry from './createNewLabelEntry';
import { createNewMilestoneEntry } from './createNewMilestoneEntry';
import { comparatorLexic, sortArray } from './helpers';

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

const listAllEntries = (kind) =>
  new Promise((resolve, reject) => {
    // Eye candy
    document
      .getElementById(`${kind}-progress-indicator`)
      .classList.remove('hidden');

    // Check if login information is present
    const loginInfo = getLoginInfo();

    if (!(loginInfo.homeRepoOwner && loginInfo.homeRepoName)) {
      const msg = 'Please enter the owner and the name of the repository.';
      alert(msg);
      reject(msg);
    }

    apiCallGet(kind)
      .then((fetchedEntries) => {
        clearAllEntries(kind);
        let sortedFetchedEntries = [];

        if (kind === 'labels') {
          sortedFetchedEntries = sortArray(
            fetchedEntries,
            comparatorLexic('name', true)
          );
          sortedFetchedEntries.map((e) => createNewLabelEntry(e));
          document
            .getElementById('labels-progress-indicator')
            .classList.add('hidden');
        } else {
          // kind === 'milestones'
          sortedFetchedEntries = sortArray(
            fetchedEntries,
            comparatorLexic('title', true)
          );
          sortedFetchedEntries.map((e) => createNewMilestoneEntry(e));
          document
            .getElementById('milestones-progress-indicator')
            .classList.add('hidden');
        }

        checkIfEnableCommitButton();
        resolve(sortedFetchedEntries);
      })
      .catch((err) => {
        console.error(err);
        reject(err);
      });
  });

const listenForListAllLabels = () => {
  document.getElementById('list-all-labels').addEventListener('click', () => {
    $(`#labels-tab`).tab('show');
    listAllEntries('labels');
  });
};

const listenForListAllMilestones = () => {
  document
    .getElementById('list-all-milestones')
    .addEventListener('click', () => {
      $(`#milestones-tab`).tab('show');
      listAllEntries('milestones');
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
  document.getElementById('revert-labels-to-original').click(() => {
    clearAllEntries('labels');
    apiCallGet('labels');
  });
};

const listenForUndoMilestones = () => {
  document.getElementById('revert-milestones-to-original').click(() => {
    clearAllEntries('milestones');
    apiCallGet('milestones');
  });
};

const copyEntriesFromRepo = (kind) => {
  const loginInfo = getLoginInfo();

  if (loginInfo.templateRepoOwner && loginInfo.templateRepoName) {
    apiCallGet(kind, 'copy')
      .then(() => {
        $(`#${kind}-tab`).tab('show');
        checkIfEnableCommitButton();
      })
      .catch((err) => {
        console.error(err);
      });
    // set uncommitted to true because those are coming from another repo
  } else {
    alert(
      "Please enter the owner and the name of the repository you'd " +
        'like to copy from.'
    );
  }
};

const listenForCopyLabelsFromRepo = () => {
  document
    .getElementById('copy-labels-from')
    .addEventListener('click', async () => {
      await copyEntriesFromRepo('labels');
    });
};

const listenForCopyMilestonesFromRepo = () => {
  document
    .getElementById('copy-milestones-from')
    .addEventListener('click', async () => {
      await copyEntriesFromRepo('milestones');
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
  listAllEntries,
  listenForListAllLabels,
  listenForListAllMilestones,
  clearAllEntries,
  listenForDeleteAllLabels,
  listenForDeleteAllMilestones,
  listenForUndoLabels,
  listenForUndoMilestones,
  copyEntriesFromRepo,
  listenForCopyLabelsFromRepo,
  listenForCopyMilestonesFromRepo,
  listenForCreateNewLabel,
  listenForCreateNewMilestone,
};
