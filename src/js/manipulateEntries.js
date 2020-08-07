/**
 * manipulateEntries
 */

'use strict';

import createNewLabelEntry from './createNewLabelEntry';
import { createNewMilestoneEntry } from './createNewMilestoneEntry';
import { getLoginInfo, checkIfEnableCommitButton } from './preApiCallCheck';
import { apiCallGetEntries } from './apiCall';

const clearAllEntries = (kind) => {
  document.getElementById(`form-${kind}`).textContent = '';

  const commitToTargetRepo = document.getElementById('commit-to-target-repo');
  commitToTargetRepo.textContent = 'Commit changes';
  commitToTargetRepo.setAttribute('disabled', true);
  commitToTargetRepo.classList.remove('btn-success');
  commitToTargetRepo.classList.add('btn-outline-success');
};

const listAllEntries = (kind) => {
  const LOGIN_INFO = getLoginInfo();

  if (LOGIN_INFO.targetOwner && LOGIN_INFO.targetRepo) {
    if (kind === 'labels') {
      clearAllEntries('labels');
    }
    if (kind === 'milestones') {
      clearAllEntries('milestones');
    }

    apiCallGetEntries(kind, 'list');
    $(`#${kind}-tab`).tab('show');
  } else {
    alert('Please enter the owner and the name of the repository.');
  }
};

const listenForListAllLabels = () => {
  document.getElementById('list-all-labels').addEventListener('click', () => {
    listAllEntries('labels');
  });
};

const listenForListAllMilestones = () => {
  document
    .getElementById('list-all-milestones')
    .addEventListener('click', () => {
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
    checkIfEnableCommitButton();
  });
};

const listenForDeleteAllMilestones = () => {
  document
    .getElementById('delete-all-milestones')
    .addEventListener('click', () => {
      deleteAllEntries('milestones');
      checkIfEnableCommitButton();
    });
};

const listenForRevertLabelsToOriginal = () => {
  document.getElementById('revert-labels-to-original').click(() => {
    clearAllEntries('labels');
    apiCallGetEntries('labels', 'list');
  });
};

const listenForRevertMilestonesToOriginal = () => {
  document.getElementById('revert-milestones-to-original').click(() => {
    clearAllEntries('milestones');
    apiCallGetEntries('milestones', 'list');
  });
};

const copyEntriesFromRepo = (kind) => {
  const LOGIN_INFO = getLoginInfo();

  if (LOGIN_INFO.copyFromOwner && LOGIN_INFO.copyFromRepo) {
    apiCallGetEntries(kind, 'copy');
    // set uncommitted to true because those are coming from another repo

    $(`#${kind}-tab`).tab('show');
  } else {
    alert(
      "Please enter the owner and the name of the repository you'd like to copy from."
    );
  }
  checkIfEnableCommitButton();
};

const listenForCopyLabelsFromRepo = () => {
  document.getElementById('copy-labels-from').addEventListener('click', () => {
    copyEntriesFromRepo('labels');
  });
};

const listenForCopyMilestonesFromRepo = () => {
  document
    .getElementById('copy-milestones-from')
    .addEventListener('click', () => {
      copyEntriesFromRepo('milestones');
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
    .getElementById('add-new-label-entry')
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
  listenForRevertLabelsToOriginal,
  listenForRevertMilestonesToOriginal,
  copyEntriesFromRepo,
  listenForCopyLabelsFromRepo,
  listenForCopyMilestonesFromRepo,
  listenForCreateNewLabel,
  listenForCreateNewMilestone,
};
