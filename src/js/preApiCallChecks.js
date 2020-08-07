/**
 *
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

/**
 * @param {Object} el
 * @return {boolean}
 */
const checkInputChanges = (el) => {
  let noChanges = true;

  el.find(':input[data-orig-val]').each(
    /** @this HTMLElement */
    function () {
      if ($(this).val() !== $(this).attr('data-orig-val')) {
        noChanges = false;
      }
    }
  );
  return noChanges;
};

/**
 * @param {string} kind
 * @param {string} blockedVal
 * @return {number}
 */
const countDuplicates = (kind, blockedVal) => {
  let duplicateCount = 0;
  $(`#form-${kind}`)
    .children()
    .each(
      /** @this HTMLElement */
      function () {
        const $nameInput = $(this).find('.name-fitting');
        if (
          $nameInput.attr('blocked-val') === blockedVal &&
          $nameInput.attr('dup-resolved') !== 'true'
        ) {
          duplicateCount += 1;
        }
      }
    );
  return duplicateCount;
};

/**
 * @param {string} kind
 * @param {string} blockedVal
 */
const resolveDuplicates = (kind, blockedVal) => {
  $(`#form-${kind}`)
    .children()
    .each(
      /** @this HTMLElement */
      function () {
        const $nameInput = $(this).find('.name-fitting');
        if (
          $nameInput.attr('blocked-val') === blockedVal &&
          $nameInput.attr('dup-resolved') !== 'true'
        ) {
          $(this).find('.duplicate-name-input').addClass('hidden');
          $nameInput.attr('dup-resolved', true);
        }
      }
    );
};

const enableCommitButton = () => {
  document.getElementById('commit-to-target-repo').removeAttribute('disabled');
  document
    .getElementById('commit-to-target-repo')
    .classList.remove('btn-outline-success');
  document.getElementById('commit-to-target-repo').classList.add('btn-success');
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

const checkIfEnableCommit = () => {
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
  checkInputChanges,
  countDuplicates,
  resolveDuplicates,
  checkIfEnableCommit,
};
