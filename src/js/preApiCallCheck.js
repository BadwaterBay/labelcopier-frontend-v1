/**
 * preApiCallCheck.js
 *
 * PREP WORK BEFORE MAKING API CALLS
 */

'use strict';

const getLoginInfo = () => {
  return {
    targetOwner: document.getElementById('target-owner').value.trim(),
    targetRepo: document.getElementById('target-repo').value.trim(),
    targetUsername: document.getElementById('target-username').value.trim(),
    personalAccessToken: document
      .getElementById('personal-access-token')
      .value.trim(),
    copyFromOwner: document.getElementById('copy-from-owner').value.trim(),
    copyFromRepo: document.getElementById('copy-from-repo').value.trim(),
  };
};

const enableCommitButton = () => {
  const commitToTargetRepo = document.getElementById('commit-to-target-repo');
  commitToTargetRepo.removeAttribute('disabled');
  commitToTargetRepo.classList.remove('btn-outline-success');
  commitToTargetRepo.classList.add('btn-success');
};

const disableCommitButton = () => {
  document
    .getElementById('commit-to-target-repo')
    .setAttribute('disabled', true);
  document
    .getElementById('commit-to-target-repo')
    .classList.remove('btn-success');
  document
    .getElementById('commit-to-target-repo')
    .classList.add('btn-outline-success');
};

const checkIfEnableCommitButton = () => {
  // returns true if any change has been made and activates or
  // disactivates commit button accordingly

  const labelsModified =
    document.querySelectorAll('.label-entry:not([data-todo="none"])').length >
    0;
  const milestonesModified =
    document.querySelectorAll('.milestone-entry:not([data-todo="none"])')
      .length > 0;
  const labelsDuplicated =
    document.querySelectorAll('.label-entry.duplicate-entry').length > 0;
  const milestonesDuplicated =
    document.querySelectorAll('.milestone-entry.duplicate-entry').length > 0;

  if (labelsModified) {
    document
      .getElementById('revert-labels-to-original')
      .removeAttribute('disabled');
  } else {
    document
      .getElementById('revert-labels-to-original')
      .setAttribute('disabled', true);
  }

  if (milestonesModified) {
    document
      .getElementById('revert-milestones-to-original')
      .removeAttribute('disabled');
  } else {
    document
      .getElementById('revert-milestones-to-original')
      .setAttribute('disabled', true);
  }

  if (labelsDuplicated || milestonesDuplicated) {
    // if (labelsDuplicated) {
    //   alert("Please resolve duplicated label names before committing.");
    // }
    // if (milestonesDuplicated) {
    //   alert("Please resolve duplicated milestone titles \
    //     before committing.");
    // }
    disableCommitButton();
  } else {
    if (labelsModified || milestonesModified) {
      enableCommitButton();
    } else {
      disableCommitButton();
    }
  }
};

export {
  getLoginInfo,
  enableCommitButton,
  disableCommitButton,
  checkIfEnableCommitButton,
};
