/**
 * Data validations before making API calls
 */

'use strict';

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
            labelsErrorCount++;
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
            labelsErrorCount++;
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
            milestonesErrorCount++;
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

export {
  checkInputChanges,
  countDuplicates,
  resolveDuplicates,
  displayDuplicateErrors,
  validateEntries,
};
