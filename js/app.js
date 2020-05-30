/*
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

$(document).ready(function () {
  $('body').bootstrapMaterialDesign();

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

  $('#copy-to-username').click(function () {
    $('#target-username').val(() =>
      $(this).prop('checked') ? $('#target-owner').val() : '',
    );
  });

  $('#target-owner').keyup(() => {
    if ($('#copy-to-username').prop('checked')) {
      $('#target-username').val($('#target-owner').val());
    }
  });

  $('#target-username').keyup(function () {
    $('#copy-to-username').prop('checked', () => {
      return $(this).val() === $('#target-owner').val();
    });
  });

  const getLoginInfo = () => {
    return {
      targetOwner: $('#target-owner').val().trim(),
      targetRepo: $('#target-repo').val().trim(),
      targetUsername: $('#target-username').val().trim(),
      personalAccessToken: $('#personal-access-token').val().trim(),
      copyFromOwner: $('#copy-from-owner').val().trim(),
      copyFromRepo: $('#copy-from-repo').val().trim(),
    };
  };

  const makeBasicAuth = (LOGIN_INFO) => {
    return (
      'Basic ' +
      BASE64.encode(
        `${LOGIN_INFO.targetUsername}:${LOGIN_INFO.personalAccessToken}`,
      )
    );
  };

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

  const setWhichRepoInUseText = () => {
    const LOGIN_INFO = getLoginInfo();
    $('#which-repo-in-use').html(`
      <p>
        <strong>Repo owner:</strong> ${LOGIN_INFO.targetOwner}
      </p>
      <p> 
        <strong>Repo:</strong> ${LOGIN_INFO.targetRepo}
      </p>
      <p>
        <strong>Username:</strong> ${LOGIN_INFO.targetUsername}
      </p>`);
  };

  const LABEL_SET = new Set();
  const MILESTONE_SET = new Set();

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
      pageNum,
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
                e.color = e.color.toUpperCase();
                createNewLabelEntry(e, mode);
                LABEL_SET.add(e.name);
              });
            } else if (kind === 'milestones') {
              response.forEach((e) => {
                createNewMilestoneEntry(e, mode);
                MILESTONE_SET.add(e.title);
              });
            } else {
              console.log('Bug in function apiCallGetEntriesRecursive!');
            }
          }
          if (typeof callback === 'function') {
            callback(response);
          } else {
            apiCallGetEntriesRecursive(
              owner,
              repo,
              kind,
              mode,
              callback,
              ++pageNum,
            );
          }
        },
        error: (response) => {
          if (response.status === 404) {
            alert(
              `Not found! If this is a private repo, make sure you 
                provide a personal access token.`,
            );
          }
          if (typeof callback === 'function') {
            callback(response);
          }
        },
      });
      checkIfAnyEntryModified();
    };

    setWhichRepoInUseText();

    if (kind === 'labels') {
      LABEL_SET.clear();
    } else if (kind === 'milestones') {
      MILESTONE_SET.clear();
    } else {
      console.log('Bug in function apiCallGetEntries!');
    }

    apiCallGetEntriesRecursive(owner, repo, kind, mode, callback, 1);
  };

  const assignNameForEntry = (entryObject, kind) => {
    let nameOfEntry = '';
    if (kind === 'labels') {
      nameOfEntry = entryObject.name;
    } else if (kind === 'milestones') {
      nameOfEntry = entryObject.title;
    } else {
      nameOfEntry = "There's a bug in function assignAPICallSign!";
    }
    return nameOfEntry;
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
            `failed for: ${NAME_OF_ENTRY} due to error: ${errorThrown}`,
        );
      },
    });
  };

  const assignAPICallSign4Update = (entryObject, kind) => {
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
  };

  const apiCallUpdateEntries = (entryObject, kind, callback) => {
    const LOGIN_INFO = getLoginInfo();
    const API_CALL_SIGN = assignAPICallSign4Update(entryObject, kind);
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
            `: ${API_CALL_SIGN} => ${NAME_OF_ENTRY}`,
        );
      },
      error: (jqXHR, textStatus, errorThrown) => {
        writeLog(
          'Update of ' +
            kind.slice(0, -1) +
            ` failed for: ${API_CALL_SIGN} due to error: ${errorThrown}`,
        );
      },
    });
  };

  const assignAPICallSign4Delete = (entryObject, kind) => {
    let apiCallSign = '';
    if (kind === 'labels') {
      apiCallSign = entryObject.name;
    } else if (kind === 'milestones') {
      apiCallSign = entryObject.number;
    } else {
      apiCallSign = "There's a bug in function assignAPICallSign4Delete!";
    }
    return apiCallSign;
  };

  const apiCallDeleteEntries = (entryObject, kind, callback) => {
    const LOGIN_INFO = getLoginInfo();
    const API_CALL_SIGN = assignAPICallSign4Delete(entryObject, kind);
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
            ` failed for: ${NAME_OF_ENTRY} due to error: ${errorThrown}`,
        );
      },
    });
  };

  const clearAllEntries = (kind) => {
    $(`#form-${kind}`).text('');
    $('#commit-to-target-repo').text('Commit changes');
    $('#commit-to-target-repo').attr('disabled', true);
    $('#commit-to-target-repo').removeClass('btn-success');
    $('#commit-to-target-repo').addClass('btn-outline-success');
  };

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
          <div class="card-body">\
            <div class="flexbox-container">\
              <input name="name" type="text" \
              class="form-control label-fitting" \
              placeholder="Name" value="${label.name}" ${origNameVal}>\
              <input name="color" type="text" \
              class="form-control color-fitting color-box" \
              placeholder="Color" value="${label.color}" ${origColorVal}>\
              <input name="description" type="text" \
              class="form-control description-fitting" \
              placeholder="Description" value="${label.description}" \
              ${origDescriptionVal}>\
            </div>\
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
      .css('background-color', `#${label.color}`);

    newElementEntry.find(':input[data-orig-val]').blur(function () {
      const $entry = $(this).closest('.label-entry');

      if ($(this).val() === $(this).attr('data-orig-val')) {
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

      checkIfAnyEntryModified();
      return;
    });

    newElementEntry.find('input[name="name"]').blur(function () {
      const $entry = $(this).closest('.label-entry');
      const currentVal = $(this).val();
      const originalVal = $(this).attr('data-orig-val');

      if (LABEL_SET.has(currentVal) && currentVal !== originalVal) {
        $entry.addClass('duplicate-entry');
        $(this).addClass('red-alert-background');
        alert('This label name has already been taken!');
        // In the future, we might use a popup instead of an alert
      } else {
        $entry.removeClass('duplicate-entry');
        $(this).removeClass('red-alert-background');
      }

      checkIfAnyEntryModified();
      return;
    });

    // Delete button
    newElementEntry.children('.delete-button').click(function () {
      if ($(this).parent().attr('new') === 'true') {
        $(this).parent().remove();
      } else {
        $(this).siblings('.card').addClass('deleted-card');
        $(this).siblings('.recover-button').removeAttr('disabled');
        $(this).addClass('hidden');
        $(this).parent().attr('data-todo', 'delete');
      }

      $(this).siblings('.recover-button').removeClass('hidden');

      checkIfAnyEntryModified();
      return;
    });

    newElementEntry.children('.recover-button').click(function () {
      $(this).siblings('.card').removeClass('deleted-card');
      $(this).siblings('.delete-button').removeClass('hidden');
      $(this).addClass('hidden');

      const $entry = $(this).closest('.label-entry');

      if (
        $entry.find('[name="name"]').attr('data-orig-val') ===
          $entry.find('[name="name"]').val() &&
        $entry.find('[name="color"]').attr('data-orig-val') ===
          $entry.find('[name="color"]').val() &&
        $entry.find('[name="description"]').attr('data-orig-val') ===
          $entry.find('[name="description"]').val()
      ) {
        $entry.attr('data-todo', 'none');
      } else {
        $entry.attr('data-todo', 'update');
      }

      checkIfAnyEntryModified();
    });

    newElementEntry
      .find('.color-box')
      .ColorPicker({
        // activate color picker on color-box field
        // http://www.eyecon.ro/colorpicker
        color: label.color,
        onSubmit: (hsb, hex, rgb, el) => {
          $(el).val(hex.toUpperCase());
          $(el).ColorPickerHide();
          $(el).css('background-color', `#${hex}`);

          // -----------------------------
          // if ($(el).val() === $(el).attr('data-orig-val')) {
          //   $(el).parent().attr('data-todo', 'none');
          //   $(el).parent().removeClass('uncommitted');
          // }
          // else {
          //   if ($(el).parent().attr('new') === 'true') {
          //     $(el).parent().attr('data-todo', 'create');
          //   }
          //   else {
          //     $(el).parent().attr('data-todo', 'update');
          //   }
          //   // $(el).closest('label-entry').addClass('uncommitted');
          // }
          // checkIfAnyEntryModified();
          return;
          // -----------------------------
        },
        onBeforeShow: function () {
          $(this).ColorPickerSetColor(this.value);
        },
      })
      .bind('keyup', function () {
        $(this).ColorPickerSetColor(this.value);
        $(this).css('background-color', `#${this.value}`);
      });

    $('#form-labels').prepend(newElementEntry);
  };

  $('#add-new-label-entry').click(() => {
    createNewLabelEntry(null, 'new');
  });

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
          <div class="card-body">\
            <div class="flexbox-container">\
              <input name="title" type="text" \
              class="form-control title-fitting" placeholder="Title" \
              value="${milestone.title}" ${origTitleVal}>\
              <input name="description" type="text" \
                class="form-control description-fitting" \
                placeholder="Description" value="${milestone.description}" \
                ${origDescriptionVal}>\
              <label>Due Date: \
                <input name="due-date" type="date" \
                class="form-control due-date-fitting pl-1" \
                value="${parsedDueDate}" ${origDueDate} ${origDueTime}>\
              </label>\
              <label>Status: \
                <select name="state" class="form-control state-fitting pl-2" \
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
        </div>\
        <button type="button" class="btn btn-danger delete-button">\
          <i class="fas fa-trash-alt"></i>\
        </button>\
        <button type="button" class="btn btn-success hidden recover-button">\
          <i class="fas fa-history"></i>\
        </button>\
      </div>
      `,
    );

    newElementEntry
      .find('.state-fitting')
      .children()
      .each(function () {
        if (milestone.state === $(this).attr('value')) {
          $(this).attr('selected', true);
        }
      });

    newElementEntry.find(':input[data-orig-val]').blur(function () {
      const $entry = $(this).closest('.milestone-entry');

      if ($(this).val() === $(this).attr('data-orig-val')) {
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

      checkIfAnyEntryModified();
      return;
    });

    newElementEntry.find('input[name="title"]').blur(function () {
      const $entry = $(this).closest('.milestone-entry');
      const currentVal = $(this).val();
      const originalVal = $(this).attr('data-orig-val');

      if (MILESTONE_SET.has(currentVal) && currentVal !== originalVal) {
        $entry.addClass('duplicate-entry');
        $(this).addClass('red-alert-background');
        alert('This milestone title has already been taken!');
        // In the future, we might use a popup instead of an alert
      } else {
        $entry.removeClass('duplicate-entry');
        $(this).removeClass('red-alert-background');
      }

      checkIfAnyEntryModified();
      return;
    });

    newElementEntry.children('.delete-button').click(function () {
      if ($(this).parent().attr('new') === 'true') {
        $(this).parent().remove();
      } else {
        $(this).siblings('.card').addClass('deleted-card');
        $(this).siblings('.recover-button').removeAttr('disabled');
        $(this).addClass('hidden');
        $(this).parent().attr('data-todo', 'delete');
      }

      $(this).siblings('.recover-button').removeClass('hidden');

      checkIfAnyEntryModified();
      return;
    });

    newElementEntry.children('.recover-button').click(function () {
      $(this).siblings('.card').removeClass('deleted-card');
      $(this).siblings('.delete-button').removeClass('hidden');
      $(this).addClass('hidden');

      const $entry = $(this).closest('.milestone-entry');

      if (
        $entry.find('[name="title"]').attr('data-orig-val') ===
          $entry.find('[name="title"]').val() &&
        $entry.find('[name="description"]').attr('data-orig-val') ===
          $entry.find('[name="description"]').val() &&
        $entry.find('[name="due-date"]').attr('data-orig-val') ===
          $entry.find('[name="due-date"]').val() &&
        $entry.find('[name="state"]').attr('data-orig-val') ===
          $entry.find('[name="state"]').val()
      ) {
        $entry.attr('data-todo', 'none');
      } else {
        $entry.attr('data-todo', 'update');
      }

      checkIfAnyEntryModified();
    });

    $('#form-milestones').prepend(newElementEntry);
  };

  $('#add-new-milestone-entry').click(() => {
    createNewMilestoneEntry(null, 'new');
  });

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
        'list',
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
      'list',
    );
  });

  $('#revert-milestones-to-original').click(() => {
    clearAllEntries('milestones');
    const LOGIN_INFO = getLoginInfo();
    apiCallGetEntries(
      LOGIN_INFO.targetOwner,
      LOGIN_INFO.targetRepo,
      'milestones',
      'list',
    );
  });

  const clickToDeleteAllEntries = (selector) => {
    $(selector)
      .children()
      .each(function () {
        if ($(this).attr('new') === 'true') {
          $(this).remove();
        } else {
          $(this).children('.card').addClass('deleted-card');
          $(this).children('.recover-button').removeAttr('disabled');
          $(this).children('.delete-button').addClass('hidden');
          $(this).children('.recover-button').removeClass('hidden');
          $(this).attr('data-todo', 'delete');
        }
      });
    checkIfAnyEntryModified();
  };

  $('#delete-all-labels').click(() => {
    clickToDeleteAllEntries('#form-labels');
  });

  $('#delete-all-milestones').click(() => {
    clickToDeleteAllEntries('#form-milestones');
  });

  const clickToCopyEntriesFrom = (kind) => {
    const LOGIN_INFO = getLoginInfo();

    if (LOGIN_INFO.copyFromOwner && LOGIN_INFO.copyFromRepo) {
      apiCallGetEntries(
        LOGIN_INFO.copyFromOwner,
        LOGIN_INFO.copyFromRepo,
        kind,
        'copy',
      );
      // set adduncommitted to true because those are coming from another repo

      $(`#${kind}-tab`).tab('show');
    } else {
      alert('Please enter the repo owner and the repo you want to copy from.');
    }
    checkIfAnyEntryModified();
  };

  $('#copy-labels-from').click(() => {
    clickToCopyEntriesFrom('labels');
  });

  $('#copy-milestones-from').click(() => {
    clickToCopyEntriesFrom('milestones');
  });

  $('#delete-and-copy-labels-from').click(() => {
    $('#delete-all-labels').click();
    $('#copy-labels-from').click();
  });

  $('#delete-and-copy-milestones-from').click(() => {
    $('#delete-all-milestones').click();
    $('#copy-milestones-from').click();
  });

  $('#commit-to-target-repo').click(() => {
    const LOGIN_INFO = getLoginInfo();

    if (!LOGIN_INFO.personalAccessToken) {
      alert(
        `You need to enter your personal access token for repo \
          ${LOGIN_INFO.targetRepo} in order to commit changes.`,
      );
      return;
    }

    commit();
  });

  const serializeEntries = (jObjectEntry, kind) => {
    const formatDate = (dateInput) => {
      const date = dateInput.val();
      const time = dateInput.attr('data-orig-time');

      if (!date) {
        return null;
      }

      const dt = {};
      [dt.year, dt.month, dt.dayOfMonth] = date.split('-').map((e) => +e);
      [dt.hour, dt.minute, dt.second] = time ? time.split(':') : [0, 0, 0];

      const dateObject = new Date(
        dt.year,
        dt.month - 1,
        dt.dayOfMonth,
        dt.hour,
        dt.minute,
        dt.second,
      );
      return dateObject.toISOString().replace('.000Z', 'Z');
    };

    if (kind === 'labels') {
      return {
        name: jObjectEntry.find('[name="name"]').val(),
        color: jObjectEntry.find('[name="color"]').val(),
        description: jObjectEntry.find('[name="description"]').val(),
        originalName: jObjectEntry.find('[name="name"]').attr('data-orig-val'),
      };
    } else if (kind === 'milestones') {
      if (jObjectEntry.attr('data-number') !== 'null') {
        return {
          title: jObjectEntry.find('[name="title"]').val(),
          state: jObjectEntry.find('[name="state"]').val(),
          description: jObjectEntry.find('[name="description"]').val(),
          due_on: formatDate(jObjectEntry.find('[name="due-date"]')),
          number: +jObjectEntry.attr('data-number'),
        };
      } else {
        if (jObjectEntry.find('[name="due-date"]').val() !== '') {
          return {
            title: jObjectEntry.find('[name="title"]').val(),
            state: jObjectEntry.find('[name="state"]').val(),
            description: jObjectEntry.find('[name="description"]').val(),
            due_on: formatDate(jObjectEntry.find('[name="due-date"]')),
          };
        } else {
          return {
            title: jObjectEntry.find('[name="title"]').val(),
            state: jObjectEntry.find('[name="state"]').val(),
            description: jObjectEntry.find('[name="description"]').val(),
          };
        }
      }
    } else {
      console.log('Bug in function serializeEntries!');
    }
  };

  const checkIfAnyEntryModified = () => {
    // returns true if any change has been made and activates or
    // disactivates commit button accordingly

    const enableCommitButton = () => {
      $('#commit-to-target-repo').removeAttr('disabled');
      $('#commit-to-target-repo').removeClass('btn-outline-success');
      $('#commit-to-target-repo').addClass('btn-success');
    };

    const disableCommitButton = () => {
      $('#commit-to-target-repo').attr('disabled', true);
      $('#commit-to-target-repo').removeClass('btn-success');
      $('#commit-to-target-repo').addClass('btn-outline-success');
    };

    const labelsModified = $('.label-entry:not([data-todo="none"])').length > 0;
    const milestonesModified =
      $('.milestone-entry:not([data-todo="none"])').length > 0;
    const labelsDuplicated = $('.label-entry.duplicate-entry').length > 0;
    const milestonesDuplicated =
      $('.milestone-entry.duplicate-entry').length > 0;

    if (labelsModified) {
      $('#revert-labels-to-original').removeAttr('disabled');
    } else {
      $('#revert-labels-to-original').attr('disabled', true);
    }

    if (milestonesModified) {
      $('#revert-milestones-to-original').removeAttr('disabled');
    } else {
      $('#revert-milestones-to-original').attr('disabled', true);
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

  const commit = () => {
    // freeze the world
    $('#loadingModal').modal({
      keyboard: false,
      backdrop: 'static',
    });
    isLoadingShown = true;

    // To be deleted
    $('.label-entry[data-todo="delete"]').each(function () {
      const entryObject = serializeEntries($(this), 'labels');
      apiCallDeleteEntries(entryObject, 'labels');
    });

    $('.milestone-entry[data-todo="delete"]').each(function () {
      const entryObject = serializeEntries($(this), 'milestones');
      apiCallDeleteEntries(entryObject, 'milestones');
    });

    // To be updated
    $('.label-entry[data-todo="update"]').each(function () {
      const entryObject = serializeEntries($(this), 'labels');
      apiCallUpdateEntries(entryObject, 'labels');
    });

    $('.milestone-entry[data-todo="update"]').each(function () {
      const entryObject = serializeEntries($(this), 'milestones');
      apiCallUpdateEntries(entryObject, 'milestones');
    });

    // To be created
    $('.label-entry[data-todo="create"]').each(function () {
      const entryObject = serializeEntries($(this), 'labels');
      apiCallCreateEntries(entryObject, 'labels');
    });

    $('.milestone-entry[data-todo="create"]').each(function () {
      const entryObject = serializeEntries($(this), 'milestones');
      apiCallCreateEntries(entryObject, 'milestones');
    });
  };

  const writeLog = (string) => {
    $('#loadingModal .modal-body').append(`${string}<br />`);
  };

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
      'list',
    );

    apiCallGetEntries(
      LOGIN_INFO.targetOwner,
      LOGIN_INFO.targetRepo,
      'milestones',
      'list',
    );
  });

  /* ========== The rest is BASE64 STUFF ========== */
  const BASE64 = {
    // http://stackoverflow.com/a/246813
    // private property
    _keyStr:
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=',

    // public method for encoding
    encode: function (input) {
      let output = '';
      let chr1;
      let chr2;
      let chr3;
      let enc1;
      let enc2;
      let enc3;
      let enc4;
      let i = 0;

      input = BASE64._utf8_encode(input);

      while (i < input.length) {
        chr1 = input.charCodeAt(i++);
        chr2 = input.charCodeAt(i++);
        chr3 = input.charCodeAt(i++);

        enc1 = chr1 >> 2;
        enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
        enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
        enc4 = chr3 & 63;

        if (isNaN(chr2)) {
          enc3 = enc4 = 64;
        } else if (isNaN(chr3)) {
          enc4 = 64;
        }

        output =
          output +
          this._keyStr.charAt(enc1) +
          this._keyStr.charAt(enc2) +
          this._keyStr.charAt(enc3) +
          this._keyStr.charAt(enc4);
      }

      return output;
    },

    // public method for decoding
    decode: function (input) {
      let output = '';
      let chr1;
      let chr2;
      let chr3;
      let enc1;
      let enc2;
      let enc3;
      let enc4;
      let i = 0;

      input = input.replace(/[^A-Za-z0-9+/=]/g, '');

      while (i < input.length) {
        enc1 = this._keyStr.indexOf(input.charAt(i++));
        enc2 = this._keyStr.indexOf(input.charAt(i++));
        enc3 = this._keyStr.indexOf(input.charAt(i++));
        enc4 = this._keyStr.indexOf(input.charAt(i++));

        chr1 = (enc1 << 2) | (enc2 >> 4);
        chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
        chr3 = ((enc3 & 3) << 6) | enc4;

        output = output + String.fromCharCode(chr1);

        if (enc3 != 64) {
          output = output + String.fromCharCode(chr2);
        }
        if (enc4 != 64) {
          output = output + String.fromCharCode(chr3);
        }
      }

      output = BASE64._utf8_decode(output);

      return output;
    },

    // private method for UTF-8 encoding
    _utf8_encode: (string) => {
      string = string.replace(/\r\n/g, '\n');
      let utftext = '';

      for (let n = 0; n < string.length; n++) {
        const c = string.charCodeAt(n);

        if (c < 128) {
          utftext += String.fromCharCode(c);
        } else if (c > 127 && c < 2048) {
          utftext += String.fromCharCode((c >> 6) | 192);
          utftext += String.fromCharCode((c & 63) | 128);
        } else {
          utftext += String.fromCharCode((c >> 12) | 224);
          utftext += String.fromCharCode(((c >> 6) & 63) | 128);
          utftext += String.fromCharCode((c & 63) | 128);
        }
      }

      return utftext;
    },

    // private method for UTF-8 decoding
    _utf8_decode: (utftext) => {
      let string = '';
      let i = 0;
      let [c1, c2, c3] = [0, 0, 0];

      while (i < utftext.length) {
        c1 = utftext.charCodeAt(i);

        if (c1 < 128) {
          string += String.fromCharCode(c1);
          i++;
        } else if (c1 > 191 && c1 < 224) {
          c2 = utftext.charCodeAt(i + 1);
          string += String.fromCharCode(((c1 & 31) << 6) | (c2 & 63));
          i += 2;
        } else {
          c2 = utftext.charCodeAt(i + 1);
          c3 = utftext.charCodeAt(i + 2);
          string += String.fromCharCode(
            ((c1 & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63),
          );
          i += 3;
        }
      }

      return string;
    },
  }; // end of BASE64
}); // end of doc ready
