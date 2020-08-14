/**
 * Data validations before making API calls
 */

'use strict';

const bugReportLink =
  'https://github.com/BadwaterBay/labelcopier/blob/' +
  'master/CONTRIBUTING.md#reporting-bugs';

const bugReportMsg = (() =>
  'There is possibly a bug in the web app. We apologize for that.' +
  ' It would be greatly helpful if you submit a bug report at' +
  ` <a href="${bugReportLink}" target="_blank" ref="noopener noreferrer">` +
  'our GitHub page</a> with the following message:</br>')();

/**
 * Returns the trimmed value from an ID selector
 * @param {string} id ID selector
 * @return {string}
 */
const trimmedValFromId = (id) => document.getElementById(id).value.trim();

/**
 * Returns and validate login info or throw an Error if it's not valid
 * @param {string} mode 'list', 'copy' or 'create'
 * @return {Object | Error}
 */
const getAndValidateLoginInfo = (mode = 'list') => {
  // The global accessToken variable is problematic. It should be addressed in the future.

  const loginInfo = {
    homeRepoOwner: trimmedValFromId('home-repo-owner'),
    homeRepoName: trimmedValFromId('home-repo-name'),
    // gitHubUsername: trimmedValFromId('github-username'),
    personalAccessToken: window.accessToken,
    templateRepoOwner: trimmedValFromId('template-repo-owner'),
    templateRepoName: trimmedValFromId('template-repo-name'),
  };

  return validateLoginAgainstNull(loginInfo, mode);
};

/**
 * Validate necessary login information against null
 * @param {Object} loginInfo
 * @param {string} mode 'list', 'copy' or 'create'
 * @return {Object | Error}
 */
const validateLoginAgainstNull = (loginInfo, mode = 'list') => {
  if (mode === 'list') {
    if (!(loginInfo.homeRepoOwner && loginInfo.homeRepoName)) {
      throw new Error('Please enter the owner and the name of the repository.');
    }
  } else if (mode === 'create') {
    if (
      !(
        loginInfo.homeRepoOwner &&
        loginInfo.homeRepoName &&
        loginInfo.personalAccessToken
      )
    ) {
      throw new Error(
        'Please enter the owner, the name of the repository and login with GitHub.'
      );
    }
  } else if (mode === 'copy') {
    if (!(loginInfo.templateRepoOwner && loginInfo.templateRepoName)) {
      throw new Error(
        'Please enter the owner and the name of' +
          " the repository you'd like to copy from."
      );
    }
  } else {
    throw new Error(
      "Invalid 'mode' argument was given to validateLoginAgainstNull."
    );
  }
  return loginInfo;
};

/**
 * Enable commit button
 */
const enableCommitButton = () => {
  const el = document.getElementById('commit-to-home-repo-name');
  el.removeAttribute('disabled');
  el.classList.remove('btn-outline-success');
  el.classList.add('btn-success');
};

/**
 * Disable commit button
 */
const disableCommitButton = () => {
  const el = document.getElementById('commit-to-home-repo-name');
  el.setAttribute('disabled', true);
  el.classList.remove('btn-success');
  el.classList.add('btn-outline-success');
};

/**
 * Check conditions to enable or disable the commit button
 */
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
    document.getElementById('undo-all-labels').removeAttribute('disabled');
  } else {
    document.getElementById('undo-all-labels').setAttribute('disabled', true);
  }

  if (milestonesModified) {
    document.getElementById('undo-all-milestones').removeAttribute('disabled');
  } else {
    document
      .getElementById('undo-all-milestones')
      .setAttribute('disabled', true);
  }

  if (labelsDuplicated || milestonesDuplicated) {
    disableCommitButton();
  } else {
    if (labelsModified || milestonesModified) {
      enableCommitButton();
    } else {
      disableCommitButton();
    }
  }
};

/**
 * Return a boolean, indicating if changes of entires are present
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

const displayDuplicateErrors = (kind, tally) => {
  if (
    Object.values(tally).some((e) => {
      return e > 1;
    })
  ) {
    const duplicates = Object.keys(tally).filter((k) => {
      return tally[k] > 1;
    });

    $(`#form-${kind}`)
      .children()
      .each(
        /** @this HTMLElement */
        function () {
          if (duplicates.includes($(this).find('.name-fitting').val())) {
            $(this).find('.duplicate-name-input').removeClass('hidden');
          }
        }
      );
    return duplicates.length;
  }
};

const validateEntries = () => {
  let labelsErrorCount = 0;
  let milestonesErrorCount = 0;
  const labelsTally = {};
  const milestonesTally = {};

  $('#form-labels')
    .children()
    .each(
      /** @this HTMLElement */
      function () {
        $(this).find('.name-fitting').removeAttr('dup-resolved');
        if ($(this).attr('data-todo') === 'delete') {
          return;
        } else {
          const labelName = $(this).find('.name-fitting').val();
          if (labelName === '') {
            $(this).find('.empty-name-input').removeClass('hidden');
            labelsErrorCount += 1;
          } else {
            if (labelsTally[labelName] === undefined) {
              labelsTally[labelName] = 1;
            } else {
              labelsTally[labelName] += 1;
            }
          }
          $(this).find('.name-fitting').attr('blocked-val', labelName);

          if (
            !/^#([0-9A-F]{3}){1,2}$/i.test($(this).find('.color-fitting').val())
          ) {
            labelsErrorCount += 1;
            if ($(this).find('.color-fitting').val() === '') {
              $(this).find('.empty-color-input').removeClass('hidden');
            } else {
              $(this).find('.invalid-color-input').removeClass('hidden');
            }
          }
        }
      }
    );

  $('#form-milestones')
    .children()
    .each(
      /** @this HTMLElement */
      function () {
        $(this).find('.name-fitting').removeAttr('dup-resolved');
        if ($(this).attr('data-todo') === 'delete') {
          return;
        } else {
          const milestoneName = $(this).find('.name-fitting').val();
          if (milestoneName === '') {
            $(this).find('.empty-name-input').removeClass('hidden');
            milestonesErrorCount += 1;
          } else {
            if (milestonesTally[milestoneName] === undefined) {
              milestonesTally[milestoneName] = 1;
            } else {
              milestonesTally[milestoneName] += 1;
            }
          }
          $(this).find('.name-fitting').attr('blocked-val', milestoneName);
        }
      }
    );

  const labelsDuplicateCount = displayDuplicateErrors('labels', labelsTally);
  const milestonesDuplicateCount = displayDuplicateErrors(
    'milestones',
    milestonesTally
  );

  return [
    labelsErrorCount,
    labelsDuplicateCount,
    milestonesErrorCount,
    milestonesDuplicateCount,
  ];
};

/**
 * Validate 'kind'
 * Valid: 'labels', 'milestones'
 * @param {string} kind
 * @return {boolean}
 */
const validateKind = (kind) => {
  const validKinds = new Set(['labels', 'milestones']);
  if (validKinds.has(kind)) {
    return true;
  }
  throw new Error(
    bugReportMsg +
      'Error at validateKind. Invalid kind argument was given.' +
      " It is neither 'labels' or 'milestones'."
  );
};

export {
  bugReportLink,
  bugReportMsg,
  trimmedValFromId,
  getAndValidateLoginInfo,
  validateLoginAgainstNull,
  enableCommitButton,
  disableCommitButton,
  checkIfEnableCommitButton,
  checkInputChanges,
  countDuplicates,
  resolveDuplicates,
  displayDuplicateErrors,
  validateEntries,
  validateKind,
};
