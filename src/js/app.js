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

const app = () => {
  return $(document).ready(function () {
    /** === START: INSTANTIATE BOOTSTRAP-MATERIAL-DESIGN === */

    $('body').bootstrapMaterialDesign();

    /** === END: INSTANTIATE BOOTSTRAP-MATERIAL-DESIGN === */

    /** === START: COPY-TO-USERNAME CHECKBOX FUNCTIONALITIES === */

    (() => {
      $('#copy-to-username').click(
        /** @this HTMLElement */
        function () {
          $('#target-username').val(() =>
            $(this).prop('checked') ? $('#target-owner').val() : ''
          );
        }
      );

      $('#target-owner').keyup(() => {
        $('#copy-to-username').prop('checked') &&
          $('#target-username').val($('#target-owner').val());
      });

      $('#target-username').keyup(
        /** @this HTMLElement */
        function () {
          $('#copy-to-username').prop('checked', () => {
            return $(this).val() === $('#target-owner').val();
          });
        }
      );
    })();

    /** The following section of code is to be used if we remove
     * the "I'm the owner of the repository" checkbox
     */

    // (() => {
    //   let copyToUsernameBool = true;

    //   $('#target-username').keyup(
    //     /** @this HTMLElement */
    //     function () {
    //       copyToUsernameBool = $(this).val() === $('#target-owner').val();
    //     },
    //   );

    //   $('#target-owner').keyup(() => {
    //     copyToUsernameBool && $('#target-username').val($('#target-owner').val());
    //   });
    // })();

    /** === END: COPY-TO-USERNAME CHECKBOX FUNCTIONALITIES === */

    /** === START: PREP WORK BEFORE MAKING API CALLS === */

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

    const writeLog = (string) => {
      $('#loadingModal .modal-body').append(`${string}<br />`);
    };

    // const setWhichRepoInUseText = () => {
    //   const LOGIN_INFO = getLoginInfo();
    //   $('#which-repo-in-use').html(`
    //     <p>
    //       <strong>Repo owner:</strong> ${LOGIN_INFO.targetOwner}
    //     </p>
    //     <p>
    //       <strong>Repo:</strong> ${LOGIN_INFO.targetRepo}
    //     </p>
    //     <p>
    //       <strong>Username:</strong> ${LOGIN_INFO.targetUsername}
    //     </p>`);
    // };

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

    const checkIfEnableCommit = () => {
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

      const labelsModified =
        $('.label-entry:not([data-todo="none"])').length > 0;
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

    /** === END: PREP WORK BEFORE MAKING API CALLS === */

    /** === START: BASE64 FOR API CALLS === */

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

          /** @this BASE64 */
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

        /** @this BASE64 */
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
              ((c1 & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63)
            );
            i += 3;
          }
        }

        return string;
      },
    };

    /** === END: BASE64 FOR API CALLS=== */

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

    const makeBasicAuth = (LOGIN_INFO) => {
      return (
        'Basic ' +
        BASE64.encode(
          `${LOGIN_INFO.targetUsername}:${LOGIN_INFO.personalAccessToken}`
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

    // const LABEL_SET = new Set();
    // const MILESTONE_SET = new Set();

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
                  // LABEL_SET.add(e.name);
                });
              } else if (kind === 'milestones') {
                response.forEach((e) => {
                  createNewMilestoneEntry(e, mode);
                  // MILESTONE_SET.add(e.title);
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

      // setWhichRepoInUseText();

      // if (kind === 'labels') {
      //   LABEL_SET.clear();
      // } else if (kind === 'milestones') {
      //   MILESTONE_SET.clear();
      // } else {
      //   console.log('Bug in function apiCallGetEntries!');
      // }

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
        .ColorPicker({
          // activate color picker on color-box field
          // http://www.eyecon.ro/colorpicker
          color: label.color,
          onSubmit: (hsb, hex, rgb, el) => {
            $(el).val(`#${hex.toUpperCase()}`);
            $(el).ColorPickerHide();
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
            $(this).ColorPickerSetColor(this.value.replace('#', ''));
          },
        })
        .bind(
          'keyup',
          /** @this HTMLElement */
          function () {
            $(this).siblings('.empty-color-input').addClass('hidden');
            const setColorCode = `#${this.value.replace(/#|\s/g, '')}`;
            $(this).ColorPickerSetColor(setColorCode.replace('#', ''));
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

    /** === START: LIST, DELETE, CLEAR, AND COPY ENTRIES === */

    const clearAllEntries = (kind) => {
      $(`#form-${kind}`).text('');
      $('#commit-to-target-repo').text('Commit changes');
      $('#commit-to-target-repo').attr('disabled', true);
      $('#commit-to-target-repo').removeClass('btn-success');
      $('#commit-to-target-repo').addClass('btn-outline-success');
    };

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

    const clickToDeleteAllEntries = (selector) => {
      $(selector)
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
      checkIfEnableCommit();
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

    $('#copy-labels-from').click(() => {
      clickToCopyEntriesFrom('labels');
    });

    $('#copy-milestones-from').click(() => {
      clickToCopyEntriesFrom('milestones');
    });

    // $('#delete-and-copy-labels-from').click(() => {
    //   $('#delete-all-labels').click();
    //   $('#copy-labels-from').click();
    // });

    // $('#delete-and-copy-milestones-from').click(() => {
    //   $('#delete-all-milestones').click();
    //   $('#copy-milestones-from').click();
    // });

    /** === END: LIST, DELETE, CLEAR, AND COPY ENTRIES === */

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
          dt.second
        );
        return dateObject.toISOString().replace('.000Z', 'Z');
      };

      if (kind === 'labels') {
        return {
          name: jObjectEntry.find('[name="name"]').val(),
          color: jObjectEntry.find('[name="color"]').val().slice(1),
          description: jObjectEntry.find('[name="description"]').val(),
          originalName: jObjectEntry
            .find('[name="name"]')
            .attr('data-orig-val'),
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

    // Clicking outside the modal closes it
    $(document).click((event) => {
      if ($(event.target).is('#loadingModal')) {
        $('#loadingModal').modal('hide');
      }
    });

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
