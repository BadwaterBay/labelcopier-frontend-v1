/**
 * Create new label entries
 */

'use strict';

import '../css/colorpicker.css';
import './colorpicker';
import {
  checkIfEnableCommitButton,
  checkInputChanges,
  countDuplicates,
  resolveDuplicates,
} from './dataValidation';

const createNewLabelEntry = (label, mode = 'list') => {
  if (label === undefined || label === null) {
    label = {
      name: '',
      color: '',
      description: '',
    };
  }

  label.color = `#${label.color.toUpperCase()}`;

  // if (mode === 'list') by default
  let todo = ' data-todo="none" ';
  let uncommittedSignClass = '';

  if (mode === 'copy' || mode === 'new') {
    todo = ' data-todo="create" new="true" ';
    uncommittedSignClass = ' uncommitted ';
  }

  const origNameVal = ` data-orig-val="${label.name}"`;
  const origColorVal = ` data-orig-val="${label.color}"`;
  const origDescriptionVal = ` data-orig-val="${label.description}"`;

  const newElementEntry = $(`
  <div class="label-entry ${uncommittedSignClass}" ${todo}>\
    <div class="card">\
      <div class="card-body" id="label-grid">\
        <input name="name" type="text" \
        class="form-control name-fitting" \
        placeholder="Name" value="${label.name}" ${origNameVal}>\
        <div class="empty-name-input invalid-input hidden">\
          Label name is required.\
        </div>\
        <div class="duplicate-name-input invalid-input hidden">\
          Another label with the same name exists.\
        </div>\
        <input name="color" type="text" \
        class="form-control color-fitting color-box" \
        placeholder="Color" value="${label.color}" ${origColorVal}>\
        <div class="invalid-color-input invalid-input hidden">\
          Invalid hex code.\
        </div>\
        <div class="empty-color-input invalid-input hidden">\
          Label color is required.\
        </div>\
        <input name="description" type="text" \
        class="form-control description-fitting" \
        placeholder="Description" value="${label.description}" \
        ${origDescriptionVal}>\
      </div>\
    </div>\
    <button type="button" class="btn btn-danger delete-button">\
      <svg class="fas fa-trash-alt"></svg>\
    </button>\
    <button type="button" class="btn btn-success hidden recover-button">\
      <svg class="fas fa-history"></svg>\
    </button>\
  <div>
  `);

  newElementEntry.find('.color-box').css('background-color', `${label.color}`);

  newElementEntry.find(':input[data-orig-val]').keyup(
    /** @this HTMLElement */
    function () {
      const $entry = $(this).closest('.label-entry');

      /** @this HTMLElement */
      if (checkInputChanges($entry) && $entry.attr('new') !== 'true') {
        // If this is unchanged
        $entry.attr('data-todo', 'none');
        $entry.removeClass('uncommitted');
      } else {
        // If this is changed
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

  newElementEntry.find('input[name="name"]').keyup(
    /** @this HTMLElement */
    function () {
      $(this).siblings('.empty-name-input').addClass('hidden');

      const $duplicateWarning = $(this).siblings('.duplicate-name-input');
      if (!$duplicateWarning.hasClass('hidden')) {
        const blockedVal = $(this).attr('blocked-val');
        const duplicateCount = countDuplicates('labels', blockedVal);
        if (duplicateCount === 2) {
          resolveDuplicates('labels', blockedVal);
        } else {
          $duplicateWarning.addClass('hidden');
          $(this).attr('dup-resolved', true);
        }
      }

      // const $entry = $(this).closest('.label-entry');
      // const currentVal = $(this).val();
      // const originalVal = $(this).attr('data-orig-val');

      // /** @this HTMLElement */
      // if (LABEL_SET.has(currentVal) && currentVal !== originalVal) {
      //   $entry.addClass('duplicate-entry');
      //   $(this).addClass('red-alert-background');
      //   alert('This label name has already been taken!');
      //   // In the future, we might use a popup instead of an alert
      // } else {
      //   $entry.removeClass('duplicate-entry');
      //   $(this).removeClass('red-alert-background');
      // }

      checkIfEnableCommitButton();
      return;
    }
  );

  // Delete button
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

      const $entry = $(this).closest('.label-entry');

      if (checkInputChanges($entry)) {
        $entry.attr('data-todo', 'none');
      } else {
        $entry.attr('data-todo', 'update');
      }

      checkIfEnableCommitButton();
    }
  );

  /** @this HTMLElement */
  newElementEntry
    .find('.color-box')
    // eslint-disable-next-line new-cap
    .ColorPicker({
      // activate color picker on color-box field
      // http://www.eyecon.ro/colorpicker
      color: label.color,
      onSubmit: (hsb, hex, rgb, el) => {
        $(el).val(`#${hex.toUpperCase()}`);
        $(el).ColorPickerHide(); // eslint-disable-line new-cap
        $(el).css('background-color', `#${hex}`);
        $(el).siblings('.invalid-color-input').addClass('hidden');
        $(el).siblings('.empty-color-input').addClass('hidden');
        const $entry = $(el).closest('.label-entry');

        if (checkInputChanges($entry)) {
          $entry.attr('data-todo', 'none');
          $entry.removeClass('uncommitted');
        } else {
          if ($entry.attr('new') === 'true') {
            $entry.attr('data-todo', 'create');
          } else {
            $entry.attr('data-todo', 'update');
          }
          $entry.addClass('uncommitted');
        }
        checkIfEnableCommitButton();
        return;
      },
      onBeforeShow: function () {
        $(this).ColorPickerSetColor(this.value.replace('#', '')); // eslint-disable-line new-cap
      },
    })
    .bind(
      'keyup',
      /** @this HTMLElement */
      function () {
        $(this).siblings('.empty-color-input').addClass('hidden');
        const setColorCode = `#${this.value.replace(/#|\s/g, '')}`;
        $(this).ColorPickerSetColor(setColorCode.replace('#', '')); // eslint-disable-line new-cap
        $(this).css('background-color', setColorCode);

        if (setColorCode === '#') {
          $(this).css('background-color', '#FFFFFF');
        } else if (/^#([0-9A-F]{3}){1,2}$/i.test(setColorCode)) {
          $(this).siblings('.invalid-color-input').addClass('hidden');
        }
      }
    )
    .blur(
      /** @this HTMLElement */
      function () {
        let displayColorCode = `#${this.value.replace(/#|\s/g, '')}`;
        if (this.value === '') {
          $(this).val(this.value);
          $(this).siblings('.invalid-color-input').addClass('hidden');
        } else if (/^#([0-9A-F]{3}){1,2}$/i.test(displayColorCode)) {
          if (displayColorCode.length === 4) {
            displayColorCode = displayColorCode.replace(
              /(\w)(\w)(\w)/,
              '$1$1$2$2$3$3'
            );
          }
          $(this).val(displayColorCode.toUpperCase());
          $(this).siblings('.invalid-color-input').addClass('hidden');
        } else {
          $(this).val(displayColorCode);
          $(this).siblings('.invalid-color-input').removeClass('hidden');
        }
      }
    );

  if (mode === 'list') {
    $('#form-labels').append(newElementEntry);
  } else {
    // mode === 'copy' or mode === 'new'
    $('#form-labels').prepend(newElementEntry);
  }
};

export default createNewLabelEntry;
