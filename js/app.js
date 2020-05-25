/*
  github-label-manager is free software: you can redistribute it and/or modify
  it under the terms of the GNU General Public License as published by
  the Free Software Foundation, either version 3 of the License, or
  (at your option) any later version.

  github-label-manager is distributed in the hope that it will be useful,
  but WITHOUT ANY WARRANTY; without even the implied warranty of
  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
  GNU General Public License for more details.

  You should have received a copy of the GNU General Public License
  along with github-label-manager.  If not, see <http://www.gnu.org/licenses/>.
*/

"use strict";

$(document).ready(function () {
  let targetUsername;
  let targetRepo;
  let targetOwner;
  let isLoadingShown = false;

  let loadingSemaphore = (function () {
    let count = 0;

    return {
      acquire: function () {
        // console.log("acq " + count);
        ++count;
        return null;
      },
      release: function () {
        // console.log("rel " + count);
        if (count <= 0) {
          throw "Semaphore inconsistency";
        }

        --count;
        return null;
      },
      isLocked: function () {
        return count > 0;
      }
    };
  }());

  $.ajaxSetup({
    cache: false,
    complete: function () {
      loadingSemaphore.release();
      if (isLoadingShown && loadingSemaphore.isLocked() === false) {
        writeLog("All operations are done.");

        //add close button
        $('#loadingModal .modal-content').append('<div class="modal-footer"><button type="button" class="btn btn-secondary" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">Close</span></button></div>');
      }
    },
    beforeSend: function (xhr) {
      let password = $('#personalAccessToken').val().trim();
      loadingSemaphore.acquire();
      // only add authorization if a password is provided. Adding empty authorization header
      // fails loading for public repos
      if (password) {
        xhr.setRequestHeader('Authorization', makeBasicAuth(targetUsername, password));
      }
    }
  });

  function apiCallGetEntriesRecursive(username, repo, kind, mode, callback, pageNum) {
    $.ajax({
      type: 'GET',
      url: 'https://api.github.com/repos/' + username + '/' + repo + '/' + kind + '?page=' + pageNum,
      success: function (response) {
        if (response) {
          response.forEach(e => {
            if (kind === 'labels') {
              e.color = e.color.toUpperCase();
              createNewLabelEntry(e, mode);              
            }
            else if (kind === 'milestones') {
              createNewMilestoneEntry(e, mode)
            }
            else {
              console.log('Bug in function apiCallGetEntriesRecursive!');
            }
            //sets target indicator text
            $('#which-repo-in-use').html('<strong>Repo owner:</strong> ' + targetOwner + "<br /><strong>Repo:</strong> " + targetRepo + '<br /><strong>Username:</strong> ' + username);
          });
        }//if

        if (typeof callback === 'function') {
          callback(response);
        }

        if (response.length === 0) {
          if (pageNum === 1) {
            alert('No ' + kind + ' exist within this repo!');
          }
          return;
        }
        else {
          apiCallGetEntriesRecursive(username, repo, kind, mode, callback, ++pageNum);
        }

      },
      error: function (response) {
        if (response.status === 404) {
          alert('Not found! If this is a private repo make sure you provide a password.');
        }

        if (typeof callback === 'function') {
          callback(response);
        }
      }
    });
  }

  function apiCallGetEntries(username, repo, kind, mode, callback) {
    apiCallGetEntriesRecursive(username, repo, kind, mode, callback, 1);
    checkIfAnyActionNeeded();
  }

  function apiCallCreateEntries(entryObject, kind, callback) {
    $.ajax({
      type: "POST",
      url: 'https://api.github.com/repos/' + targetOwner + '/' + targetRepo + '/' + kind,
      data: JSON.stringify(entryObject),
      success: function (response) {
        // console.log("success: ");
        // console.log(response);
        if (typeof callback === 'function') {
          callback(response);
        }
        let entryName;
        if (kind === 'labels') {
          entryName = entryObject.name;
        }
        else if (kind === 'milestones') {
          entryName = entryObject.title;
        }
        else {
          entryName = 'There\'s a bug in function apiCallCreateEntries!';
        }
        writeLog('Created ' + kind + ': ' + entryName);
      },
      error: function (jqXHR, textStatus, errorThrown) {
        let entryName;
        if (kind === 'labels') {
          entryName = entryObject.name;
        }
        else if (kind === 'milestones') {
          entryName = entryObject.title;
        }
        else {
          entryName = 'There\'s a bug in function apiCallCreateEntries!';
        }
        writeLog('Creation of ' + kind + ' failed for: ' + entryName + ' Error: ' + errorThrown);
      }
    });
  }

  function apiCallUpdateEntries(entryObject, kind, callback) {
    let originalEntry;

    if (kind === 'labels') {
      originalEntry = entryObject.originalName;
      delete entryObject.originalName;
    }
    else if (kind === 'milestones') {
      originalEntry =  entryObject.originalTitle;
      delete entryObject.originalTitle;
    }

    $.ajax({
      type: "PATCH",
      url: 'https://api.github.com/repos/' + targetOwner + '/' + targetRepo + '/' + kind + '/' + originalEntry,
      data: JSON.stringify(entryObject),
      success: function (response) {
        // console.log("success: ");
        // console.log(response);
        if (typeof callback === 'function') {
          callback(response);
        }
        if (kind === 'labels') {
          writeLog('Updated ' + kind + ': ' + originalEntry + ' => ' + entryObject.name);
        }
        else if (kind === 'milestones') {
          writeLog('Updated ' + kind + ': ' + originalEntry + ' => ' + entryObject.title);
        }
      },
      error: function (jqXHR, textStatus, errorThrown) {
        writeLog('Update of' + kind + 'failed for: ' + originalEntry + ' Error: ' + errorThrown);
      }
    });
  }

  function apiCallDeleteEntries(entryObject, kind, callback) {
    let originalEntry;
    if (kind === 'labels') {
      originalEntry = entryObject.originalName;
    }
    else if (kind === 'milestones') {
      originalEntry =  entryObject.originalTitle;
    }
    else {
      console.log('Bug in function apiCallDeleteEntries!');
    }

    $.ajax({
      type: "DELETE",
      url: 'https://api.github.com/repos/' + targetOwner + '/' + targetRepo + '/' + kind + '/' + originalEntry,
      success: function (response) {
        // console.log("success: ");
        // console.log(response);
        if (typeof callback === 'function') {
          callback(response);
        }
        writeLog('Deleted label' + kind + ': ' + originalEntry);
      },
      error: function (jqXHR, textStatus, errorThrown) {
        writeLog('Deletion of label failed for: ' + originalEntry + ' Error: ' + errorThrown);
      }
    });
  }

  function makeBasicAuth(username, password) {
    return "Basic " + Base64.encode(username + ":" + password);
  }

  // Labels

  function clearAllLabels() {
    $('#form-labels').text('');
    $('#commit-to-target-repo').text('Commit changes');
    $('#commit-to-target-repo').attr('disabled', 'disabled');
  }

  function createNewLabelEntry(label, mode) {

    let action = ' action="none" ';
    let uncommittedSignClass = '';

    if (mode === 'copy' || mode === 'new') {
      action = ' action="create" new="true" ';
      uncommittedSignClass = ' uncommitted ';
    }

    if (label === undefined || label === null) {
      label = {
        name: '',
        color: '',
        description: ''
      };
    }

    let origNameVal = ' orig-val="' + label.name + '"';
    let origColorVal = ' orig-val="' + label.color + '"';
    let origDescriptionVal = ' orig-val="' + label.description + '"';

    let newElementEntry = $('\
      <div class="label-entry ' + uncommittedSignClass + '" ' + action + '>\
      <div class="card">\
      <div class="card-body">\
      <div class="flexbox-container">\
      <input name="name" type="text" class="form-control title-fitting" placeholder="Name" value="' + label.name + '" ' + origNameVal + '>\
      <input name="color" type="text" class="form-control color-fitting color-box" placeholder="Color"  value="' + label.color + '" ' + origColorVal + '>\
      </div>\
      <input name="description" type="text" class="form-control description-fitting" placeholder="Description" value="' + label.description + '" ' + origDescriptionVal + '>\
      </div>\
      </div>\
      <button type="button" class="btn btn-danger delete-button"><i class="fas fa-trash-alt"></i></button>\
      <button type="button" class="btn btn-success hidden recover-button"><i class="fas fa-history"></i></button>\
      </div>\
    ');

    newElementEntry.find('.color-box').css('background-color', '#' + label.color);

    newElementEntry.children(':input[orig-val]').change(function () {

      if ($(this).val() === $(this).attr('orig-val')) {//unchanged
        $(this).parent().attr('action', 'none');
        $(this).parent().removeClass('uncommitted');
      }
      else {//changed
        if ($(this).parent().attr('new') === 'true') {
          $(this).parent().attr('action', 'create');
        }
        else {
          $(this).parent().attr('action', 'update');
        }
        $(this).parent().addClass('uncommitted');
      }

      checkIfAnyActionNeeded();
      return;
    });

    //Delete button
    newElementEntry.children('.delete-button').click(function () {
      if ($(this).parent().attr('new') === 'true') {
        $(this).parent().remove();
      }
      else {
        $(this).siblings('.card').addClass('deleted-card');
        $(this).siblings('.recover-button').removeAttr('disabled');
        $(this).addClass('hidden');
        $(this).parent().attr('action', 'delete');
      }


      $(this).siblings('.recover-button').removeClass('hidden');

      checkIfAnyActionNeeded();
      return;
    });

    newElementEntry.children('.recover-button').click(function () {
      $(this).siblings('.card').removeClass('deleted-card');
      $(this).siblings('.delete-button').removeClass('hidden');
      $(this).addClass('hidden');

      if ($(this).siblings('[name="name"]').attr('orig-val') === $(this).siblings('[name="name"]').val() &&
        $(this).siblings('[name="color"]').attr('orig-val') === $(this).siblings('[name="color"]').val()) {
        $(this).parent().attr('action', 'none');
      }
      else {
        $(this).parent().attr('action', 'update');
      }

      checkIfAnyActionNeeded();
    });

    //activate color picker on color-box field
    newElementEntry.find('.color-box').ColorPicker({
      //http://www.eyecon.ro/colorpicker
      color: label.color,
      onSubmit: function (hsb, hex, rgb, el) {
        $(el).val(hex.toUpperCase());
        $(el).ColorPickerHide();
        $(el).css('background-color', '#' + hex);

        //-----------------------------
        //well here goes the copy-paste because normal binding to 'change' doesn't work
        // on newElementEntry.children().filter(':input[orig-val]').change(function...
        // since it is triggered programmatically
        if ($(el).val() === $(el).attr('orig-val')) {
          $(el).parent().attr('action', 'none');
          $(el).parent().removeClass('uncommitted');
        }
        else {
          if ($(el).parent().attr('new') === 'true') {
            $(el).parent().attr('action', 'create');
          }
          else {
            $(el).parent().attr('action', 'update');
          }
          $(el).parent().addClass('uncommitted');
        }
        checkIfAnyActionNeeded();
        return;
        //-----------------------------
      },
      onBeforeShow: function () {
        $(this).ColorPickerSetColor(this.value);
      }
    })
      .bind('keyup', function () {
        $(this).ColorPickerSetColor(this.value);
        $(this).css('background-color', '#' + this.value);
      });

    $('#form-labels').prepend(newElementEntry);
  }

  $('#add-new-label-entry').click(function () {
    createNewLabelEntry(null, 'new');
  });

  // Milestones

  function clearAllMilestones() {
    $('#form-milestones').text('');
    $('#commit-to-target-repo').text('Commit changes');
    $('#commit-to-target-repo').attr('disabled', 'disabled');
  }

  function createNewMilestoneEntry(milestone, mode) {

    let action = ' action="none" ';
    let uncommittedSignClass = '';

    if (mode === 'copy' || mode === 'new') {
      action = ' action="create" new="true" ';
      uncommittedSignClass = ' uncommitted ';
    }

    if (milestone === undefined || milestone === null) {
      milestone = {
        title: '',
        description: ''
      };
    }

    let origTitleVal = ' orig-val="' + milestone.title + '"';
    let origDescriptionVal = ' orig-val="' + milestone.description + '"';

    let newElementEntry = $('\
      <div class="milestone-entry ' + uncommittedSignClass + '" ' + action + '>\
      <div class="card">\
      <div class="card-body">\
      <input name="title" type="text" class="form-control title-fitting" placeholder="Title" value="' + milestone.title + '" ' + origTitleVal + '>\
      <input name="description" type="text" class="form-control description-fitting" placeholder="Description" value="' + milestone.description + '" ' + origDescriptionVal + '>\
      </div>\
      </div>\
      <button type="button" class="btn btn-danger delete-button"><i class="fas fa-trash-alt"></i></button>\
      <button type="button" class="btn btn-success hidden recover-button"><i class="fas fa-history"></i></button>\
      </div>\
    ');

    // newElementEntry.children('.color-box').css('background-color', '#' + milestone.color);

    newElementEntry.children(':input[orig-val]').change(function () {

      if ($(this).val() === $(this).attr('orig-val')) {//unchanged
        $(this).parent().attr('action', 'none');
        $(this).parent().removeClass('uncommitted');
      }
      else {//changed
        if ($(this).parent().attr('new') === 'true') {
          $(this).parent().attr('action', 'create');
        }
        else {
          $(this).parent().attr('action', 'update');
        }
        $(this).parent().addClass('uncommitted');
      }

      checkIfAnyActionNeeded();
      return;
    });

    //Delete button
    newElementEntry.children('.delete-button').click(function () {
      if ($(this).parent().attr('new') === 'true') {
        $(this).parent().remove();
      }
      else {
        $(this).siblings('.card').addClass('deleted-card');
        $(this).siblings('.recover-button').removeAttr('disabled');
        $(this).addClass('hidden');
        $(this).parent().attr('action', 'delete');
      }

      $(this).siblings('.recover-button').removeClass('hidden');

      checkIfAnyActionNeeded();
      return;
    });

    newElementEntry.children('.recover-button').click(function () {
      $(this).siblings('.card').removeClass('deleted-card');
      $(this).siblings('.delete-button').removeClass('hidden');
      $(this).addClass('hidden');

      if ($(this).siblings('[name="title"]').attr('orig-val') === $(this).siblings('[name="title"]').val() &&
        $(this).siblings('[name="description"]').attr('orig-val') === $(this).siblings('[name="description"]').val()) {
        $(this).parent().attr('action', 'none');
      }
      else {
        $(this).parent().attr('action', 'update');
      }

      checkIfAnyActionNeeded();
    });

    $('#form-milestones').prepend(newElementEntry);
  }

  $('#add-new-milestone-entry').click(function () {
    createNewMilestoneEntry(null, 'new');
  });

  function clickToListAllEntries(kind) {
    let theButton = $(this);// dealing with closure
    targetOwner = $('#targetOwner').val();
    targetRepo = $('#targetRepo').val();

    if (targetOwner && targetRepo) {
      clearAllMilestones();

      apiCallGetEntries(targetOwner, targetRepo, kind, 'list', () => {
        theButton.button('reset');
      });
    }
    else {
      alert("Please enter the repo owner and the repo");
      theButton.button('reset');
    }
  }

  $('#list-all-labels').click(function () {
    clickToListAllEntries('labels');
  });


  $('#list-all-milestones').click(function () {
    clickToListAllEntries('milestones');
  });

  $('#revert-to-original').click(function () {
    let theButton = $(this);// dealing with closure
    clearAllLabels();
    clearAllMilestones();
    apiCallGetEntries(targetOwner, targetRepo, 'labels', 'list', () => {
      theButton.button('reset');
    });
    apiCallGetEntries(targetOwner, targetRepo, 'milestones', 'list', () => {
      theButton.button('reset');
    });
  });

  function clickToDeleteAllEntries(selector) {
    $(selector).children().each(function () {
      if ($(this).attr('new') === 'true') {
        $(this).remove();
      }
      else {
        $(this).children('.card').addClass('deleted-card');
        $(this).children(".recover-button").removeAttr('disabled');
        $(this).children('.delete-button').addClass('hidden');
        $(this).children('.recover-button').removeClass('hidden');
        $(this).attr('action', 'delete');
      }
    });
  }

  $('#delete-all-labels').click(function () {
    clickToDeleteAllEntries('#form-labels');
    checkIfAnyActionNeeded();
  })

  $('#delete-all-milestones').click(function () {
    clickToDeleteAllEntries('#form-milestones');
    checkIfAnyActionNeeded();
  })

  function clickToCopyEntriesFrom(selector) {
    let username = $('#copyFromOwner').val();
    let repo = $('#copyFromRepo').val();

    if (username && repo) {
      apiCallGetEntries(username, repo, selector, 'copy', function () {
        $(this).button('reset');
      });//set adduncommitted to true because those are coming from another repo
    }
    else {
      alert("Please enter the repo owner and the repo");
      $(this).button('reset');
    }
  }

  $('#copy-labels-from').click(function () {
    clickToCopyEntriesFrom('labels');
  });

  $('#copy-milestones-from').click(function () {
    clickToCopyEntriesFrom('milestones');
  });

  $('#delete-and-copy-labels-from').click(function () {
    let username = $('#copyFromOwner').val();
    let repo = $('#copyFromRepo').val();

    if (username && repo) {
      clickToDeleteAllEntries('#form-labels');
      apiCallGetEntries(username, repo, 'labels', 'copy', function () {
        $(this).button('reset');
      });//set adduncommitted to true because those are coming from another repo
    }
    else {
      alert("Please follow the format: \n\nusername:repo");
      $(this).button('reset');
    }

    checkIfAnyActionNeeded();
  });

  $('#delete-and-copy-milestones-from').click(function () {
    let username = $('#copyFromOwner').val();
    let repo = $('#copyFromRepo').val();

    if (username && repo) {
      clickToDeleteAllEntries('#form-milestones');
      apiCallGetEntries(username, repo, 'milestones', 'copy', function () {
        $(this).button('reset');
      });//set adduncommitted to true because those are coming from another repo
    }
    else {
      alert("Please follow the format: \n\nusername:repo");
      $(this).button('reset');
    }

    checkIfAnyActionNeeded();
  });

  $('#commit-to-target-repo').click(function () {
    let theButton = $(this);// dealing with closure
    let password = $('#personalAccessToken').val();

    if (password.trim() === '') {
      alert('You need to enter your personal access token for repo: ' + targetRepo + ' in order to commit changes.');
      theButton.button('reset');
      return;
    }

    commit();
  });

  // //Enable popovers
  // $('#targetRepo').popover({
  //   title: 'Example',
  //   content: '<code>github.com/Badwater-Apps/template-label-milestone-1</code> Then use <code>Badwater-Apps:template-label-milestone-1</code><br><em>Note that owner can also be an organization name.</em>',
  //   trigger: 'hover',
  //   html: true
  // });

  // $('#targetUsername').popover({
  //   title: "Why 'username' again?",
  //   content: "To let you modify a repo which belongs to another user or an organization. For example the repo maybe <code>my-organization:the-app</code> but username is <code>cylon</code>",
  //   trigger: "hover",
  //   html: true
  // });

  // $('#personalAccessToken').popover({
  //   title: "My token/password for what?",
  //   content: "Token/Password is only required for committing. It won't be required until you try to commit something. It is encouraged to use a token instead of your password.",
  //   trigger: "hover",
  //   html: true
  // });

  /**
  * Makes a label entry out of a div having the class .label-entry
  */
  function serializeEntries(jObjectLabelEntry, kind) {
    if (kind === 'labels') {
      return {
        name: jObjectLabelEntry.children('[name="name"]').val(),
        color: jObjectLabelEntry.children('[name="color"]').val(),
        description: jObjectLabelEntry.children('[name="description"]').val(),
        originalName: jObjectLabelEntry.children('[name="name"]').attr('orig-val')
      };
    }
    else if (kind === 'milestones') {
      return {
        title: jObjectLabelEntry.children('[name="title"]').val(),
        description: jObjectLabelEntry.children('[name="description"]').val(),
        originalName: jObjectLabelEntry.children('[name="name"]').attr('orig-val')
      };
    }
    else {
      console.log('Bug in function serializeEntries!');
    }
  }

  /**
  * returns true if any change has been made and activates or disactivates commit button accordingly
  */
  function checkIfAnyActionNeeded() {
    let isNeeded = $('.label-entry:not([action="none"])').length > 0 | $('.milestone-entry:not([action="none"])').length > 0;

    if (isNeeded) {
      $('#commit-to-target-repo').removeAttr('disabled');
      $('#commit-to-target-repo').removeClass('disabled');
    }
    else {
      $('#commit-to-target-repo').attr('disabled', 'disabled');
    }

    return isNeeded;
  }

  function commit() {

    //freeze the world
    $('#loadingModal').modal({
      keyboard: false,
      backdrop: 'static'
    });
    isLoadingShown = true;

    //To be deleted
    $('.label-entry[action="delete"]').each(function () {
      let entryObject = serializeEntries($(this), 'labels');
      apiCallDeleteEntries(entryObject, 'labels');
    });

    $('.milestone-entry[action="delete"]').each(function () {
      let entryObject = serializeEntries($(this), 'milestones');
      apiCallDeleteEntries(entryObject, 'milestones');
    });

    //To be updated
    $('.label-entry[action="update"]').each(function () {
      let entryObject = serializeEntries($(this), 'labels');
      apiCallUpdateEntries(entryObject, 'labels');
    });

    $('.milestone-entry[action="update"]').each(function () {
      let entryObject = serializeEntries($(this), 'milestones');
      apiCallUpdateEntries(entryObject, 'milestones');
    });

    //To be created
    $('.label-entry[action="create"]').each(function () {
      let entryObject = serializeEntries($(this), 'labels');
      apiCallCreateEntries(entryObject, 'labels');
    });

    $('.milestone-entry[action="create"]').each(function () {
      let entryObject = serializeEntries($(this), 'milestones');
      apiCallCreateEntries(entryObject, 'milestones');
    });
  }

  function writeLog(string) {
    $('#loadingModal .modal-body').append(string + '<br>');
  }

  $('#loadingModal').on('hidden.bs.modal', function () {
    isLoadingShown = false;

    //reset modal
    $('#loadingModal .modal-body').text('');
    $('#loadingModal .modal-body').append('<p>Commiting...');
    $('#loadingModal .modal-footer').remove();

    //reload labels after changes
    clearAllLabels();
    apiCallGetEntries(targetOwner, targetRepo, 'labels', 'list');
  });

  /* ========== The rest is BASE64 STUFF ========== */
  let Base64 = {
    // http://stackoverflow.com/a/246813
    // private property
    _keyStr: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",

    // public method for encoding
    encode: function (input) {
      let output = "";
      let chr1, chr2, chr3, enc1, enc2, enc3, enc4;
      let i = 0;

      input = Base64._utf8_encode(input);

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

        output = output + this._keyStr.charAt(enc1) + this._keyStr.charAt(enc2) + this._keyStr.charAt(enc3) + this._keyStr.charAt(enc4);

      }

      return output;
    },

    // public method for decoding
    decode: function (input) {
      let output = "";
      let chr1, chr2, chr3;
      let enc1, enc2, enc3, enc4;
      let i = 0;

      input = input.replace(/[^A-Za-z0-9+/=]/g, "");

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

      output = Base64._utf8_decode(output);

      return output;

    },

    // private method for UTF-8 encoding
    _utf8_encode: function (string) {
      string = string.replace(/\r\n/g, "\n");
      let utftext = "";

      for (let n = 0; n < string.length; n++) {

        let c = string.charCodeAt(n);

        if (c < 128) {
          utftext += String.fromCharCode(c);
        } else if ((c > 127) && (c < 2048)) {
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
    _utf8_decode: function (utftext) {
      let string = "";
      let i = 0;
      let c = c1 = c2 = 0;

      while (i < utftext.length) {

        c = utftext.charCodeAt(i);

        if (c < 128) {
          string += String.fromCharCode(c);
          i++;
        } else if ((c > 191) && (c < 224)) {
          c2 = utftext.charCodeAt(i + 1);
          string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
          i += 2;
        } else {
          c2 = utftext.charCodeAt(i + 1);
          c3 = utftext.charCodeAt(i + 2);
          string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
          i += 3;
        }

      }

      return string;
    }

  };//end of Base64

}); //end of doc ready
