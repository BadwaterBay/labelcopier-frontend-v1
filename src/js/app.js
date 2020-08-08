/**
  github-label-manager-2 is free software: you can redistribute it and/or modify
  it under the terms of the GNU General Public License as published by
  the Free Software Foundation, either version 3 of the License, or
  (at your option) any later version.

  github-label-manager-2 is distributed in the hope that it will be useful,
  but WITHOUT ANY WARRANTY; without even the implied warranty of
  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
  GNU General Public License for more details.

  You should have received a copy of the GNU General Public License
  along with github-label-manager-2.  If not, see <http://www.gnu.org/licenses/>.
*/

'use strict';

import {
  copyToUsername,
  copyOwnerToUsername,
  setCopyToUsernameCheckbox,
} from './copyToUsername';
import {
  getLoginInfo,
  checkInputChanges,
  countDuplicates,
  resolveDuplicates,
  checkIfEnableCommit,
  writeLog,
} from './preApiCallChecks';
import { assignNameForEntry, makeBasicAuth } from './makeApiCalls';
import {
  clearAllEntries,
  clickToDeleteAllLabels,
  clickToDeleteAllMilestones,
} from './manipulateEntries';
import { serializeEntries } from './commitChanges';
import clickToCloseModal from './modal';

const app = () => {
  return $(document).ready(function () {
    /** === START: INSTANTIATE BOOTSTRAP-MATERIAL-DESIGN === */

    $('body').bootstrapMaterialDesign();

    /** === END: INSTANTIATE BOOTSTRAP-MATERIAL-DESIGN === */

    /** === START: COPY-TO-USERNAME CHECKBOX FUNCTIONALITIES === */

    copyToUsername();
    copyOwnerToUsername();
    setCopyToUsernameCheckbox();

    /** === END: COPY-TO-USERNAME CHECKBOX FUNCTIONALITIES === */

    /** === START: API CALL FUNCTIONALITIES === */

    let isLoadingShown = false;

    const loadingSemaphore = (() => {
      let count = 0;

      return {
        acquire: () => {
          ++count;
          return null;
        },
        release: () => {
          if (count <= 0) {
            throw new Error('Semaphore inconsistency');
          }

          --count;
          return null;
        },
        isLocked: () => {
          return count > 0;
        },
      };
    })();

    $.ajaxSetup({
      cache: false,
      complete: () => {
        loadingSemaphore.release();
        if (isLoadingShown && loadingSemaphore.isLocked() === false) {
          writeLog('All operations are done.');

          $('#loadingModal .modal-content').append(`
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary"
              data-dismiss="modal" aria-label="Close">
              <span aria-hidden="true">
                Close
              </span>
            </button>
          </div>
        `);
        }
      },
      beforeSend: (xhr) => {
        const LOGIN_INFO = getLoginInfo();
        loadingSemaphore.acquire();
        if (LOGIN_INFO.targetUsername && LOGIN_INFO.personalAccessToken) {
          xhr.setRequestHeader('Authorization', makeBasicAuth(LOGIN_INFO));
        }
      },
    });

    const apiCallGetEntries = (owner, repo, kind, mode, callback) => {
      const apiCallGetUrl = (owner, repo, kind, pageNum) => {
        let queryURL = `https://api.github.com/repos/${owner}/${repo}/${kind}?page=${pageNum}`;
        if (kind === 'milestones') {
          queryURL += '&state=all';
        }
        return queryURL;
      };

      const apiCallGetEntriesRecursive = (
        owner,
        repo,
        kind,
        mode,
        callback,
        pageNum
      ) => {
        $.ajax({
          type: 'GET',
          url: apiCallGetUrl(owner, repo, kind, pageNum),
          success: (response) => {
            if (response) {
              if (response.length === 0) {
                if (pageNum === 1) {
                  alert(`No ${kind} exist in this repo!`);
                }
                return;
              }
              if (kind === 'labels') {
                response.forEach((e) => {
                  e.color = `#${e.color.toUpperCase()}`;
                  createNewLabelEntry(e, mode);
                });
              } else if (kind === 'milestones') {
                response.forEach((e) => {
                  createNewMilestoneEntry(e, mode);
                });
              } else {
                console.log('Bug in function apiCallGetEntriesRecursive!');
              }
            }
            if (typeof callback === 'function') {
              callback(response);
            }
            apiCallGetEntriesRecursive(
              owner,
              repo,
              kind,
              mode,
              callback,
              ++pageNum
            );
          },
          error: (response) => {
            if (response.status === 404) {
              alert(
                `Not found! If this is a private repo, make sure you 
                provide a personal access token.`
              );
            }
            if (typeof callback === 'function') {
              callback(response);
            }
          },
        });
        checkIfEnableCommit();
      };

      apiCallGetEntriesRecursive(owner, repo, kind, mode, callback, 1);
    };

    const apiCallCreateEntries = (entryObject, kind, callback) => {
      const LOGIN_INFO = getLoginInfo();
      const NAME_OF_ENTRY = assignNameForEntry(entryObject, kind);

      $.ajax({
        type: 'POST',
        url: `https://api.github.com/repos/${LOGIN_INFO.targetOwner}/${LOGIN_INFO.targetRepo}/${kind}`,
        data: JSON.stringify(entryObject),
        success: (response) => {
          if (typeof callback === 'function') {
            callback(response);
          }
          writeLog(`Created ${kind.slice(0, -1)}: ${NAME_OF_ENTRY}`);
        },
        error: (jqXHR, textStatus, errorThrown) => {
          writeLog(
            'Creation of ' +
              kind.slice(0, -1) +
              `failed for: ${NAME_OF_ENTRY} due to error: ${errorThrown}`
          );
        },
      });
    };

    const apiCallUpdateEntries = (entryObject, kind, callback) => {
      const API_CALL_SIGN = ((entryObject, kind) => {
        let apiCallSign = '';
        if (kind === 'labels') {
          apiCallSign = entryObject.originalName;
          delete entryObject.originalName;
        } else if (kind === 'milestones') {
          apiCallSign = entryObject.number;
        } else {
          apiCallSign = "There's a bug in function assignAPICallSign4Update!";
        }
        return apiCallSign;
      })(entryObject, kind);

      const LOGIN_INFO = getLoginInfo();
      const NAME_OF_ENTRY = assignNameForEntry(entryObject, kind);

      $.ajax({
        type: 'PATCH',
        url: `https://api.github.com/repos/${LOGIN_INFO.targetOwner}/${LOGIN_INFO.targetRepo}/${kind}/${API_CALL_SIGN}`,
        data: JSON.stringify(entryObject),
        success: (response) => {
          if (typeof callback === 'function') {
            callback(response);
          }
          writeLog(
            'Updated ' +
              kind.slice(0, -1) +
              `: ${API_CALL_SIGN} => ${NAME_OF_ENTRY}`
          );
        },
        error: (jqXHR, textStatus, errorThrown) => {
          writeLog(
            'Update of ' +
              kind.slice(0, -1) +
              ` failed for: ${API_CALL_SIGN} due to error: ${errorThrown}`
          );
        },
      });
    };

    const apiCallDeleteEntries = (entryObject, kind, callback) => {
      const API_CALL_SIGN = ((entryObject, kind) => {
        let apiCallSign = '';
        if (kind === 'labels') {
          apiCallSign = entryObject.originalName;
        } else if (kind === 'milestones') {
          apiCallSign = entryObject.number;
        } else {
          apiCallSign = "There's a bug in function assignAPICallSign4Delete!";
        }
        return apiCallSign;
      })(entryObject, kind);

      const LOGIN_INFO = getLoginInfo();
      const NAME_OF_ENTRY = assignNameForEntry(entryObject, kind);

      $.ajax({
        type: 'DELETE',
        url: `https://api.github.com/repos/${LOGIN_INFO.targetOwner}/${LOGIN_INFO.targetRepo}/${kind}/${API_CALL_SIGN}`,
        success: (response) => {
          if (typeof callback === 'function') {
            callback(response);
          }
          writeLog(`Deleted ${kind.slice(0, -1)}: ${NAME_OF_ENTRY}`);
        },
        error: (jqXHR, textStatus, errorThrown) => {
          writeLog(
            'Deletion of ' +
              kind.slice(0, -1) +
              ` failed for: ${NAME_OF_ENTRY} due to error: ${errorThrown}`
          );
        },
      });
    };

    /** === END: API CALL FUNCTIONALITIES === */

    /** === START: CREATE NEW LABEL ENTRIES === */

    const createNewLabelEntry = (label, mode) => {
      let todo = ' data-todo="none" ';
      let uncommittedSignClass = '';

      if (mode === 'copy' || mode === 'new') {
        todo = ' data-todo="create" new="true" ';
        uncommittedSignClass = ' uncommitted ';
      }

      if (label === undefined || label === null) {
        label = {
          name: '',
          color: '',
          description: '',
        };
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
          <i class="fas fa-trash-alt"></i>\
        </button>\
        <button type="button" class="btn btn-success hidden recover-button">\
          <i class="fas fa-history"></i>\
        </button>\
      <div>
    `);

      newElementEntry
        .find('.color-box')
        .css('background-color', `${label.color}`);

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

          checkIfEnableCommit();
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

          checkIfEnableCommit();
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

          checkIfEnableCommit();
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

          checkIfEnableCommit();
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
            checkIfEnableCommit();
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

      $('#form-labels').prepend(newElementEntry);
    };

    $('#add-new-label-entry').click(() => {
      createNewLabelEntry(null, 'new');
      checkIfEnableCommit();
    });

    /** === END: CREATE NEW LABEL ENTRIES === */

    /** === START: CREATE NEW MILESTONE ENTRIES === */

    const createNewMilestoneEntry = (milestone, mode) => {
      const parseDate = (raw) => {
        if (raw === null || raw === '') {
          return ['', ''];
        } else {
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
        }
      };

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
          <i class="fas fa-trash-alt"></i>\
        </button>\
        <button type="button" class="btn btn-success hidden recover-button">\
          <i class="fas fa-history"></i>\
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

          checkIfEnableCommit();
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

            checkIfEnableCommit();
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

          checkIfEnableCommit();
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

          checkIfEnableCommit();
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

          checkIfEnableCommit();
        }
      );

      $('#form-milestones').prepend(newElementEntry);
    };

    $('#add-new-milestone-entry').click(() => {
      createNewMilestoneEntry(null, 'new');
      checkIfEnableCommit();
    });

    /** === END: CREATE NEW MILESTONE ENTRIES === */

    /** === START: MANIPULATE ENTRIES (LIST, DELETE, CLEAR, AND COPY) === */

    const clickToListAllEntries = (kind) => {
      const LOGIN_INFO = getLoginInfo();

      if (LOGIN_INFO.targetOwner && LOGIN_INFO.targetRepo) {
        if (kind === 'labels') {
          clearAllEntries('labels');
        }
        if (kind === 'milestones') {
          clearAllEntries('milestones');
        }

        apiCallGetEntries(
          LOGIN_INFO.targetOwner,
          LOGIN_INFO.targetRepo,
          kind,
          'list'
        );
        $(`#${kind}-tab`).tab('show');
      } else {
        alert('Please enter the repo owner and the repo.');
      }
    };

    $('#list-all-labels').click(() => {
      clickToListAllEntries('labels');
    });

    $('#list-all-milestones').click(() => {
      clickToListAllEntries('milestones');
    });

    $('#revert-labels-to-original').click(() => {
      clearAllEntries('labels');
      const LOGIN_INFO = getLoginInfo();
      apiCallGetEntries(
        LOGIN_INFO.targetOwner,
        LOGIN_INFO.targetRepo,
        'labels',
        'list'
      );
    });

    $('#revert-milestones-to-original').click(() => {
      clearAllEntries('milestones');
      const LOGIN_INFO = getLoginInfo();
      apiCallGetEntries(
        LOGIN_INFO.targetOwner,
        LOGIN_INFO.targetRepo,
        'milestones',
        'list'
      );
    });

    clickToDeleteAllLabels();
    clickToDeleteAllMilestones();

    const clickToCopyEntriesFrom = (kind) => {
      const LOGIN_INFO = getLoginInfo();

      if (LOGIN_INFO.copyFromOwner && LOGIN_INFO.copyFromRepo) {
        apiCallGetEntries(
          LOGIN_INFO.copyFromOwner,
          LOGIN_INFO.copyFromRepo,
          kind,
          'copy'
        );
        // set adduncommitted to true because those are coming from another repo

        $(`#${kind}-tab`).tab('show');
      } else {
        alert(
          'Please enter the repo owner and the repo you want to copy from.'
        );
      }
      checkIfEnableCommit();
    };

    const clickToCopyEntriesFromLabels = () => {
      document
        .getElementById('copy-labels-from')
        .addEventListener('click', () => {
          clickToCopyEntriesFrom('labels');
        });
    };

    clickToCopyEntriesFromLabels();

    const clickToCopyEntriesFromMilestones = () => {
      document
        .getElementById('copy-milestones-from')
        .addEventListener('click', () => {
          clickToCopyEntriesFrom('milestones');
        });
    };

    clickToCopyEntriesFromMilestones();

    /** === END: MANIPULATE ENTRIES (LIST, DELETE, CLEAR, AND COPY) === */

    /** === START: COMMIT FUNCTION COMPONENTS === */

    const validateEntries = () => {
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
                !/^#([0-9A-F]{3}){1,2}$/i.test(
                  $(this).find('.color-fitting').val()
                )
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

      const labelsDuplicateCount = displayDuplicateErrors(
        'labels',
        labelsTally
      );
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

    const commit = () => {
      // freeze the world
      $('#loadingModal').modal({
        keyboard: false,
        backdrop: 'static',
      });
      isLoadingShown = true;

      // To be deleted
      $('.label-entry[data-todo="delete"]').each(
        /** @this HTMLElement */
        function () {
          const entryObject = serializeEntries($(this), 'labels');
          apiCallDeleteEntries(entryObject, 'labels');
        }
      );

      $('.milestone-entry[data-todo="delete"]').each(
        /** @this HTMLElement */
        function () {
          const entryObject = serializeEntries($(this), 'milestones');
          apiCallDeleteEntries(entryObject, 'milestones');
        }
      );

      // To be updated
      $('.label-entry[data-todo="update"]').each(
        /** @this HTMLElement */
        function () {
          const entryObject = serializeEntries($(this), 'labels');
          apiCallUpdateEntries(entryObject, 'labels');
        }
      );

      $('.milestone-entry[data-todo="update"]').each(
        /** @this HTMLElement */
        function () {
          const entryObject = serializeEntries($(this), 'milestones');
          apiCallUpdateEntries(entryObject, 'milestones');
        }
      );

      // To be created
      $('.label-entry[data-todo="create"]').each(
        /** @this HTMLElement */
        function () {
          const entryObject = serializeEntries($(this), 'labels');
          apiCallCreateEntries(entryObject, 'labels');
        }
      );

      $('.milestone-entry[data-todo="create"]').each(
        /** @this HTMLElement */
        function () {
          const entryObject = serializeEntries($(this), 'milestones');
          apiCallCreateEntries(entryObject, 'milestones');
        }
      );
    };

    $('#commit-to-target-repo').click(() => {
      const LOGIN_INFO = getLoginInfo();
      const writeErrorsAlert = (errorCount, duplicateCount, kind) => {
        let alertMsg = '';
        if (errorCount || duplicateCount) {
          if (duplicateCount) {
            if (errorCount) {
              alertMsg = `${duplicateCount} set(s) of duplicate entries and ${errorCount} other error(s) found in ${kind}!\n`;
            } else {
              alertMsg = `${duplicateCount} set(s) of duplicate entries found in ${kind}!\n`;
            }
          } else {
            alertMsg = `${errorCount} error(s) found in ${kind}!\n`;
          }
        }
        return alertMsg;
      };

      if (!LOGIN_INFO.personalAccessToken) {
        alert(
          `You need to enter your personal access token for repo \
          ${LOGIN_INFO.targetRepo} in order to commit changes.`
        );
        return;
      }

      const [
        labelsErrorCount,
        labelsDuplicateCount,
        milestonesErrorCount,
        milestonesDuplicateCount,
      ] = validateEntries();

      if (
        labelsErrorCount ||
        milestonesErrorCount ||
        labelsDuplicateCount ||
        milestonesDuplicateCount
      ) {
        const labelsAlert = writeErrorsAlert(
          labelsErrorCount,
          labelsDuplicateCount,
          'labels'
        );
        const milestonesAlert = writeErrorsAlert(
          milestonesErrorCount,
          milestonesDuplicateCount,
          'milestones'
        );

        alert(`${labelsAlert}${milestonesAlert}`);
        return;
      }

      commit();
    });

    clickToCloseModal();

    $('#loadingModal').on('hidden.bs.modal', () => {
      isLoadingShown = false;

      // reset modal
      $('#loadingModal .modal-body').text('');
      $('#loadingModal .modal-body').append('<p>Commiting...');
      $('#loadingModal .modal-footer').remove();

      // reload labels after changes
      clearAllEntries('labels');
      clearAllEntries('milestones');

      const LOGIN_INFO = getLoginInfo();

      apiCallGetEntries(
        LOGIN_INFO.targetOwner,
        LOGIN_INFO.targetRepo,
        'labels',
        'list'
      );

      apiCallGetEntries(
        LOGIN_INFO.targetOwner,
        LOGIN_INFO.targetRepo,
        'milestones',
        'list'
      );
    });

    /** === END: COMMIT FUNCTION COMPONENTS === */
  });
};

export default app;
