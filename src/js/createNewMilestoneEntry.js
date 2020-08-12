/**
 * Create new milestone entries
 */

'use strict';

import {
  checkIfEnableCommitButton,
  checkInputChanges,
  countDuplicates,
  resolveDuplicates,
} from './dataValidation';

const parseDate = (raw) => {
  if (raw === null || raw === '') {
    return ['', ''];
  }

  const parsedDatetime = new Date(raw);
  const dt = {
    year: parsedDatetime.getFullYear(),
    month: parsedDatetime.getMonth() + 1,
    dayOfMonth: parsedDatetime.getDate(),
    hour: parsedDatetime.getHours(),
    minute: parsedDatetime.getMinutes(),
    second: parsedDatetime.getSeconds(),
  };

  Object.keys(dt).forEach((k) => {
    dt[k] = dt[k] < 10 ? '0' + dt[k] : '' + dt[k];
  });

  return [
    `${dt.year}-${dt.month}-${dt.dayOfMonth}`,
    `${dt.hour}:${dt.minute}:${dt.second}`,
  ];
};

const createNewMilestoneEntry = (milestone, mode = 'list') => {
  if (milestone === undefined || milestone === null) {
    milestone = {
      title: '',
      state: 'open',
      description: '',
      due_on: '',
      number: null,
    };
  }

  if (mode === 'copy') {
    milestone.number = null;
  }

  let todo = ' data-todo="none"';
  let uncommittedSignClass = '';

  if (mode === 'copy' || mode === 'new') {
    todo = ' data-todo="create" new="true" ';
    uncommittedSignClass = ' uncommitted ';
  }

  const origTitleVal = ` data-orig-val="${milestone.title}"`;
  const origStateVal = ` data-orig-val="${milestone.state}"`;
  const origDescriptionVal = ` data-orig-val="${milestone.description}"`;
  const [parsedDueDate, parsedDueTime] = parseDate(milestone.due_on);
  const origDueDate = ` data-orig-val="${parsedDueDate}"`;
  const origDueTime = ` data-orig-time="${parsedDueTime}"`;
  const number = milestone.number;

  const newElementEntry = $(
    `
  <div class="milestone-entry ${uncommittedSignClass}" ${todo} \
    data-number="${number}" data-state="${milestone.state}" \
    data-due-on="${milestone.due_on}">\
    <div class="card">\
      <div class="card-body" id="milestone-grid">\
        <input name="title" type="text" \
        class="form-control name-fitting" placeholder="Title" \
        value="${milestone.title}" ${origTitleVal}>\
        <div class="empty-name-input invalid-input hidden">\
          Milestone title is required.\
        </div>\
        <div class="duplicate-name-input invalid-input hidden">\
          Another milestone with the same title exists.\
        </div>\
        <input name="description" type="text" \
          class="form-control description-fitting" \
          placeholder="Description" value="${milestone.description}" \
          ${origDescriptionVal}>\
        <label class="date-fitting">Due Date: \
          <input name="due-date" type="date" \
          class="form-control pl-1" \
          value="${parsedDueDate}" ${origDueDate} ${origDueTime}>\
        </label>\
        <div class="invalid-date-input hidden">\
          Invalid date.\
        </div>\
        <label class="state-fitting">Status: \
          <select name="state" class="form-control pl-2" \
            ${origStateVal}>\
            <option value="open">\
              open\
            </option>\
            <option value="closed">\
              closed\
            </option>\
          </select>\
        </label>\
      </div>\
    </div>\
    <button type="button" class="btn btn-danger delete-button">\
      <svg class="fas fa-trash-alt"></svg>\
    </button>\
    <button type="button" class="btn btn-success hidden recover-button">\
      <svg class="fas fa-history"></svg>\
    </button>\
  </div>
  `
  );

  newElementEntry
    .find('.state-fitting')
    .children()
    .each(
      /** @this HTMLElement */
      function () {
        if (milestone.state === $(this).attr('value')) {
          $(this).attr('selected', true);
        }
      }
    );

  newElementEntry.find(':input[data-orig-val]').keyup(
    /** @this HTMLElement */
    function () {
      const $entry = $(this).closest('.milestone-entry');

      if (checkInputChanges($entry) && $entry.attr('new') !== 'true') {
        // unchanged
        $entry.attr('data-todo', 'none');
        $entry.removeClass('uncommitted');
      } else {
        // changed
        if ($entry.attr('new') === 'true') {
          $entry.attr('data-todo', 'create');
        } else {
          $entry.attr('data-todo', 'update');
        }
        $entry.addClass('uncommitted');
      }

      checkIfEnableCommitButton();
      return;
    }
  );

  newElementEntry
    .find('label')
    .children()
    .change(
      /** @this HTMLElement */
      function () {
        const $entry = $(this).closest('.milestone-entry');

        if (checkInputChanges($entry)) {
          // unchanged
          $entry.attr('data-todo', 'none');
          $entry.removeClass('uncommitted');
        } else {
          // changed
          if ($entry.attr('new') === 'true') {
            $entry.attr('data-todo', 'create');
          } else {
            $entry.attr('data-todo', 'update');
          }
          $entry.addClass('uncommitted');
        }

        checkIfEnableCommitButton();
        return;
      }
    );

  newElementEntry.find('input[name="title"]').keyup(
    /** @this HTMLElement */
    function () {
      $(this).siblings('.empty-name-input').addClass('hidden');

      const $duplicateWarning = $(this).siblings('.duplicate-name-input');
      if (!$duplicateWarning.hasClass('hidden')) {
        const blockedVal = $(this).attr('blocked-val');
        const duplicateCount = countDuplicates('milestones', blockedVal);
        if (duplicateCount === 2) {
          resolveDuplicates('milestones', blockedVal);
        } else {
          $duplicateWarning.addClass('hidden');
          $(this).attr('dup-resolved', true);
        }
      }
      // const $entry = $(this).closest('.milestone-entry');
      // const currentVal = $(this).val();
      // const originalVal = $(this).attr('data-orig-val');

      // if (MILESTONE_SET.has(currentVal) && currentVal !== originalVal) {
      //   $entry.addClass('duplicate-entry');
      //   $(this).addClass('red-alert-background');
      //   alert('This milestone title has already been taken!');
      //   // In the future, we might use a popup instead of an alert
      // } else {
      //   $entry.removeClass('duplicate-entry');
      //   $(this).removeClass('red-alert-background');
      // }

      checkIfEnableCommitButton();
      return;
    }
  );

  newElementEntry.children('.delete-button').click(
    /** @this HTMLElement */
    function () {
      if ($(this).parent().attr('new') === 'true') {
        $(this).parent().remove();
      } else {
        $(this).siblings('.card').addClass('deleted-card');
        $(this).parent().find('.invalid-input').addClass('hidden');
        $(this).siblings('.recover-button').removeAttr('disabled');
        $(this).addClass('hidden');
        $(this).parent().attr('data-todo', 'delete');
      }

      $(this).siblings('.recover-button').removeClass('hidden');

      checkIfEnableCommitButton();
      return;
    }
  );

  newElementEntry.children('.recover-button').click(
    /** @this HTMLElement */
    function () {
      $(this).siblings('.card').removeClass('deleted-card');
      $(this).siblings('.delete-button').removeClass('hidden');
      $(this).addClass('hidden');

      const $entry = $(this).closest('.milestone-entry');

      if (checkInputChanges($entry)) {
        $entry.attr('data-todo', 'none');
      } else {
        $entry.attr('data-todo', 'update');
      }

      checkIfEnableCommitButton();
    }
  );

  if (mode === 'list') {
    $('#form-milestones').append(newElementEntry);
  } else {
    // mode === 'copy' or mode === 'new'
    $('#form-milestones').prepend(newElementEntry);
  }
};

export { parseDate, createNewMilestoneEntry };
