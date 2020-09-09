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

const getTrimmedValueFromGivenId = (id) =>
  document.getElementById(id).value.trim();

const validateLoginAgainstNull = (loginInfo, mode = 'list') => {
  if (mode === 'list') {
    if (!(loginInfo.homeRepoOwner && loginInfo.homeRepoName)) {
      const errorMessage =
        'Please enter the owner and the name of the repository.';

      throw new Error(errorMessage);
    }

    return true;
  }

  if (mode === 'create') {
    if (
      !loginInfo.homeRepoOwner &&
      !loginInfo.homeRepoName &&
      !loginInfo.personalAccessToken
    ) {
      const errorMessage =
        'Please enter the owner, the name of the repository and login with GitHub.';

      throw new Error(errorMessage);
    }

    return true;
  }

  if (mode === 'copy') {
    if (!loginInfo.templateRepoOwner && !loginInfo.templateRepoName) {
      const errorMessage =
        "Please enter the owner and the name of the repository you'd like to copy from.";

      throw new Error(errorMessage);
    }

    return true;
  }

  throw new Error(
    "Invalid 'mode' argument was given to validateLoginAgainstNull."
  );
};

const validateAccessTokenAgainstNull = (loginInfo) => {
  const errorMessage = 'Please login with GitHub.';

  if (!loginInfo.personalAccessToken) {
    throw new Error(errorMessage);
  }

  return true;
};

const getAndValidateLoginInfo = (mode = 'list') => {
  // The global accessToken variable is problematic. It should be addressed in the future.

  const loginInfo = {
    homeRepoOwner: getTrimmedValueFromGivenId('home-repo-owner'),
    homeRepoName: getTrimmedValueFromGivenId('home-repo-name'),
    personalAccessToken: window.accessToken,
    templateRepoOwner: getTrimmedValueFromGivenId('template-repo-owner'),
    templateRepoName: getTrimmedValueFromGivenId('template-repo-name'),
  };

  return (
    validateLoginAgainstNull(loginInfo, mode) &&
    validateAccessTokenAgainstNull(loginInfo)
  );
};

const getCommitButtonElement = () =>
  document.getElementById('commit-to-home-repo-name');

const enableCommitButton = () => {
  const el = getCommitButtonElement();
  el.removeAttribute('disabled');
  el.classList.remove('btn-outline-success');
  el.classList.add('btn-success');
  return true;
};

const disableCommitButton = () => {
  const el = getCommitButtonElement();
  el.setAttribute('disabled', true);
  el.classList.remove('btn-success');
  el.classList.add('btn-outline-success');
  return false;
};

const enableHtmlElement = (e) => {
  e.removeAttribute('disabled');
  return true;
};

const disableHtmlElement = (e) => {
  e.setAttribute('disabled', true);
  return false;
};

const checkIfEntriesOfKindHaveBeenModified = (kind) => {
  const kindSingular = kind.slice(0, -1);
  const querySelectorOfModifiedEntries = `.${kindSingular}-entry:not([data-todo="none"])`;
  const numberOfModifiedEntries = document.querySelectorAll(
    querySelectorOfModifiedEntries
  ).length;
  return numberOfModifiedEntries > 0;
};

const checkIfLabelsHaveBeenModified = () =>
  checkIfEntriesOfKindHaveBeenModified('labels');

const checkIfMilestonesHaveBeenModified = () =>
  checkIfEntriesOfKindHaveBeenModified('milestones');

const enableOrDisableUndoAllLabelsButton = () => {
  const labelsHaveBeenModified = checkIfLabelsHaveBeenModified();
  const undoAllLabelsButtonElement = document.getElementById('undo-all-labels');

  if (labelsHaveBeenModified) {
    enableHtmlElement(undoAllLabelsButtonElement);
  } else {
    disableHtmlElement(undoAllLabelsButtonElement);
  }

  return labelsHaveBeenModified;
};

const enableOrDisableUndoAllMilestonesButton = () => {
  const milestonesHaveBeenModified = checkIfMilestonesHaveBeenModified();
  const undoAllMilestonesButtonElement = document.getElementById(
    'undo-all-milestones'
  );

  if (milestonesHaveBeenModified) {
    enableHtmlElement(undoAllMilestonesButtonElement);
  } else {
    disableHtmlElement(undoAllMilestonesButtonElement);
  }

  return milestonesHaveBeenModified;
};

const enableOrDisableCommitButton = () => {
  const duplicateLabelsExist =
    document.querySelectorAll('.label-entry.duplicate-entry').length > 0;

  const duplicateMilestonesExist =
    document.querySelectorAll('.milestone-entry.duplicate-entry').length > 0;

  if (duplicateLabelsExist || duplicateMilestonesExist) {
    return disableCommitButton();
  }

  const labelsHaveBeenModified = enableOrDisableUndoAllLabelsButton();
  const milestonesHaveBeenModified = enableOrDisableUndoAllMilestonesButton();

  if (!labelsHaveBeenModified && !milestonesHaveBeenModified) {
    return disableCommitButton();
  }

  return enableCommitButton();
};

const checkIfEntryHasBeenModifiedFromOriginal = (el) => {
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

const countNumberOfDuplicateEntries = (kind, blockedVal) => {
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

const checkIfDuplicateEntriesAreResolved = (kind, blockedVal) => {
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

const displayWarningMessageOfDuplicateEntries = (kind, tally) => {
  if (Object.values(tally).some((e) => e > 1)) {
    const duplicates = Object.keys(tally).filter((k) => tally[k] > 1);

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

  return null;
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

  const labelsDuplicateCount = displayWarningMessageOfDuplicateEntries(
    'labels',
    labelsTally
  );

  const milestonesDuplicateCount = displayWarningMessageOfDuplicateEntries(
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
  getTrimmedValueFromGivenId,
  validateLoginAgainstNull,
  validateAccessTokenAgainstNull,
  getAndValidateLoginInfo,
  getCommitButtonElement,
  enableCommitButton,
  disableCommitButton,
  enableHtmlElement,
  disableHtmlElement,
  checkIfEntriesOfKindHaveBeenModified,
  checkIfLabelsHaveBeenModified,
  checkIfMilestonesHaveBeenModified,
  enableOrDisableUndoAllLabelsButton,
  enableOrDisableUndoAllMilestonesButton,
  enableOrDisableCommitButton,
  checkIfEntryHasBeenModifiedFromOriginal,
  countNumberOfDuplicateEntries,
  checkIfDuplicateEntriesAreResolved,
  displayWarningMessageOfDuplicateEntries,
  validateEntries,
  validateKind,
};
