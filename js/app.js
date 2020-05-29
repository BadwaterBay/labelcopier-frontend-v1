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

"use strict";

$(document).ready(function () {
  let isLoadingShown = false;

  let loadingSemaphore = (function () {
    let count = 0;

    return {
      acquire: function () {
        ++count;
        return null;
      },
      release: function () {
        if (count <= 0) {
          throw "Semaphore inconsistency";
        }

        --count;
        return null;
      },
      isLocked: function () {
        return count > 0;
      },
    };
  })();

  const getLoginInfo = () => {
    return {
      targetOwner: $("#targetOwner").val().trim(),
      targetRepo: $("#targetRepo").val().trim(),
      targetUsername: $("#targetUsername").val().trim(),
      personalAccessToken: $("#personal-access-token").val().trim(),
      copyFromOwner: $("#copy-from-owner").val().trim(),
      copyFromRepo: $("#copy-from-repo").val().trim(),
    };
  };

  function makeBasicAuth(login) {
    return (
      "Basic " +
      Base64.encode(login.targetUsername + ":" + login.personalAccessToken)
    );
  }

  $.ajaxSetup({
    cache: false,
    complete: function () {
      loadingSemaphore.release();
      if (isLoadingShown && loadingSemaphore.isLocked() === false) {
        writeLog("All operations are done.");

        $("#loadingModal .modal-content").append(
          '<div class="modal-footer"><button type="button" class="btn btn-secondary" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">Close</span></button></div>'
        );
      }
    },
    beforeSend: function (xhr) {
      let login = getLoginInfo();
      loadingSemaphore.acquire();
      // only add authorization if a personalAccessToken is provided. Adding empty authorization header
      // fails loading for public repos
      if (login.targetUsername && login.personalAccessToken) {
        xhr.setRequestHeader("Authorization", makeBasicAuth(login));
      }
    },
  });

  function setWhichRepoInUseText() {
    let login = getLoginInfo();
    $("#which-repo-in-use").html(`
      <p>
        <strong>Repo owner:</strong> ${login.targetOwner}
      </p>
      <p> 
        <strong>Repo:</strong> ${login.targetRepo}
      </p>
      <p>
        <strong>Username:</strong> ${login.targetUsername}
      </p>`);
  }

  let setOfLabelNames = new Set();
  let setOfMilestoneTitles = new Set();

  function apiCallGetEntries(owner, repo, kind, mode, callback) {
    function apiCallGetEntriesRecursive(
      owner,
      repo,
      kind,
      mode,
      callback,
      pageNum
    ) {
      $.ajax({
        type: "GET",
        url: `https://api.github.com/repos/${owner}/${repo}/${kind}?page=${pageNum}`,
        success: function (response) {
          if (response) {
            if (response.length === 0) {
              if (pageNum === 1) {
                alert("No " + kind + " exist within this repo!");
              }
              return;
            }
            if (kind === "labels") {
              response.forEach((e) => {
                e.color = e.color.toUpperCase();
                createNewLabelEntry(e, mode);
                setOfLabelNames.add(e.name);
              });
            } else if (kind === "milestones") {
              response.forEach((e) => {
                createNewMilestoneEntry(e, mode);
                setOfMilestoneTitles.add(e.title);
              });
            } else {
              console.log("Bug in function apiCallGetEntriesRecursive!");
            }
          }
          if (typeof callback === "function") {
            callback(response);
          } else {
            apiCallGetEntriesRecursive(
              owner,
              repo,
              kind,
              mode,
              callback,
              ++pageNum
            );
          }
        },
        error: function (response) {
          if (response.status === 404) {
            alert(
              "Not found! If this is a private repo, make sure you provide a personal access token."
            );
          }
          if (typeof callback === "function") {
            callback(response);
          }
        },
      });
      checkIfAnyEntryModified();
    }

    setWhichRepoInUseText();

    if (kind === "labels") {
      setOfLabelNames.clear();
    } else if (kind === "milestones") {
      setOfMilestoneTitles.clear();
    } else {
      console.log("Bug in function apiCallGetEntries!");
    }

    apiCallGetEntriesRecursive(owner, repo, kind, mode, callback, 1);
  }

  function assignNameForEntry(entryObject, kind) {
    let nameForEntry;
    if (kind === "labels") {
      nameForEntry = entryObject.name;
    } else if (kind === "milestones") {
      nameForEntry = entryObject.title;
    } else {
      nameForEntry = "There's a bug in function assignAPICallSign!";
    }
    return nameForEntry;
  }

  function apiCallCreateEntries(entryObject, kind, callback) {
    let login = getLoginInfo();
    let nameForEntry = assignNameForEntry(entryObject, kind);

    $.ajax({
      type: "POST",
      url: `https://api.github.com/repos/${login.targetOwner}/${login.targetRepo}/${kind}`,
      data: JSON.stringify(entryObject),
      success: function (response) {
        if (typeof callback === "function") {
          callback(response);
        }
        writeLog("Created " + kind.slice(0, -1) + ": " + nameForEntry);
      },
      error: function (jqXHR, textStatus, errorThrown) {
        writeLog(
          "Creation of " +
            kind.slice(0, -1) +
            " failed for: " +
            nameForEntry +
            " due to error: " +
            errorThrown
        );
      },
    });
  }

  function assignAPICallSign4Update(entryObject, kind) {
    let apiCallSign;
    if (kind === "labels") {
      apiCallSign = entryObject.originalName;
      delete entryObject.originalName;
    } else if (kind === "milestones") {
      apiCallSign = entryObject.number;
    } else {
      apiCallSign = "There's a bug in function assignAPICallSign4Update!";
    }
    return apiCallSign;
  }

  function apiCallUpdateEntries(entryObject, kind, callback) {
    let login = getLoginInfo();
    let apiCallSign = assignAPICallSign4Update(entryObject, kind);
    let nameForEntry = assignNameForEntry(entryObject, kind);

    $.ajax({
      type: "PATCH",
      url: `https://api.github.com/repos/${login.targetOwner}/${login.targetRepo}/${kind}/${apiCallSign}`,
      data: JSON.stringify(entryObject),
      success: function (response) {
        if (typeof callback === "function") {
          callback(response);
        }
        writeLog(
          "Updated " +
            kind.slice(0, -1) +
            ": " +
            apiCallSign +
            " => " +
            nameForEntry
        );
      },
      error: function (jqXHR, textStatus, errorThrown) {
        writeLog(
          "Update of " +
            kind.slice(0, -1) +
            " failed for: " +
            apiCallSign +
            " due to error: " +
            errorThrown
        );
      },
    });
  }

  function assignAPICallSign4Delete(entryObject, kind) {
    let apiCallSign;
    if (kind === "labels") {
      apiCallSign = entryObject.name;
    } else if (kind === "milestones") {
      apiCallSign = entryObject.number;
    } else {
      apiCallSign = "There's a bug in function assignAPICallSign4Delete!";
    }
    return apiCallSign;
  }

  function apiCallDeleteEntries(entryObject, kind, callback) {
    let login = getLoginInfo();
    let apiCallSign = assignAPICallSign4Delete(entryObject, kind);
    let nameForEntry = assignNameForEntry(entryObject, kind);

    $.ajax({
      type: "DELETE",
      url: `https://api.github.com/repos/${login.targetOwner}/${login.targetRepo}/${kind}/${apiCallSign}`,
      success: function (response) {
        if (typeof callback === "function") {
          callback(response);
        }
        writeLog("Deleted " + kind.slice(0, -1) + ": " + nameForEntry);
      },
      error: function (jqXHR, textStatus, errorThrown) {
        writeLog(
          "Deletion of " +
            kind.slice(0, -1) +
            " failed for: " +
            nameForEntry +
            " due to error: " +
            errorThrown
        );
      },
    });
  }

  function clearAllLabels() {
    $("#form-labels").text("");
    $("#commit-to-target-repo").text("Commit changes");
    $("#commit-to-target-repo").attr("disabled", true);
    $("#commit-to-target-repo").removeClass("btn-success");
    $("#commit-to-target-repo").addClass("btn-outline-success");
  }

  function createNewLabelEntry(label, mode) {
    let action = ' action="none" ';
    let uncommittedSignClass = "";

    if (mode === "copy" || mode === "new") {
      action = ' action="create" new="true" ';
      uncommittedSignClass = " uncommitted ";
    }

    if (label === undefined || label === null) {
      label = {
        name: "",
        color: "",
        description: "",
      };
    }

    let origNameVal = ' data-orig-val="' + label.name + '"';
    let origColorVal = ' data-orig-val="' + label.color + '"';
    let origDescriptionVal = ' data-orig-val="' + label.description + '"';

    let newElementEntry = $(
      '\
      <div class="label-entry ' +
        uncommittedSignClass +
        '" ' +
        action +
        '>\
        <div class="card">\
          <div class="card-body">\
            <div class="flexbox-container">\
              <input name="name" type="text" class="form-control label-fitting" placeholder="Name" value="' +
        label.name +
        '" ' +
        origNameVal +
        '>\
              <input name="color" type="text" class="form-control color-fitting color-box" placeholder="Color"  value="' +
        label.color +
        '" ' +
        origColorVal +
        '>\
              <input name="description" type="text" class="form-control description-fitting" placeholder="Description" value="' +
        label.description +
        '" ' +
        origDescriptionVal +
        '>\
            </div>\
          </div>\
        </div>\
        <button type="button" class="btn btn-danger delete-button">\
          <i class="fas fa-trash-alt"></i>\
        </button>\
        <button type="button" class="btn btn-success hidden recover-button">\
          <i class="fas fa-history"></i>\
        </button>\
      <div>\
    '
    );

    newElementEntry
      .find(".color-box")
      .css("background-color", "#" + label.color);

    newElementEntry.find(":input[data-orig-val]").blur(function () {
      let $entry = $(this).closest(".label-entry");

      if ($(this).val() === $(this).attr("data-orig-val")) {
        // If this is unchanged
        $entry.attr("action", "none");
        $entry.removeClass("uncommitted");
      } else {
        // If this is changed
        if ($entry.attr("new") === "true") {
          $entry.attr("action", "create");
        } else {
          $entry.attr("action", "update");
        }
        $entry.addClass("uncommitted");
      }

      checkIfAnyEntryModified();
      return;
    });

    newElementEntry.find('input[name="name"]').blur(function () {
      let $entry = $(this).closest(".label-entry");
      let currentVal = $(this).val();
      let originalVal = $(this).attr("data-orig-val");

      if (setOfLabelNames.has(currentVal) && (currentVal !== originalVal)) {
        $entry.addClass("duplicate-entry");
        $(this).addClass("red-alert-background");
        alert("This label name has already been taken!");
        // In the future, we might use a popup instead of an alert
      }

      checkIfAnyEntryModified();
      return;
    });

    //Delete button
    newElementEntry.children(".delete-button").click(function () {
      if ($(this).parent().attr("new") === "true") {
        $(this).parent().remove();
      } else {
        $(this).siblings(".card").addClass("deleted-card");
        $(this).siblings(".recover-button").removeAttr("disabled");
        $(this).addClass("hidden");
        $(this).parent().attr("action", "delete");
      }

      $(this).siblings(".recover-button").removeClass("hidden");

      checkIfAnyEntryModified();
      return;
    });

    newElementEntry.children(".recover-button").click(function () {
      $(this).siblings(".card").removeClass("deleted-card");
      $(this).siblings(".delete-button").removeClass("hidden");
      $(this).addClass("hidden");

      let $entry = $(this).closest(".label-entry");

      if (
        $entry.find('[name="name"]').attr("data-orig-val") ===
          $entry.find('[name="name"]').val() &&
        $entry.find('[name="color"]').attr("data-orig-val") ===
          $entry.find('[name="color"]').val() &&
        $entry.find('[name="description"]').attr("data-orig-val") ===
          $entry.find('[name="description"]').val()
      ) {
        $entry.attr("action", "none");
      } else {
        $entry.attr("action", "update");
      }

      checkIfAnyEntryModified();
    });

    newElementEntry
      .find(".color-box")
      .ColorPicker({
        //activate color picker on color-box field
        //http://www.eyecon.ro/colorpicker
        color: label.color,
        onSubmit: function (hsb, hex, rgb, el) {
          $(el).val(hex.toUpperCase());
          $(el).ColorPickerHide();
          $(el).css("background-color", "#" + hex);

          //-----------------------------
          //well here goes the copy-paste because normal binding to 'change' doesn't work
          // on newElementEntry.children().filter(':input[data-orig-val]').change(function...
          // since it is triggered programmatically
          // if ($(el).val() === $(el).attr('data-orig-val')) {
          //   $(el).parent().attr('action', 'none');
          //   $(el).parent().removeClass('uncommitted');
          // }
          // else {
          //   if ($(el).parent().attr('new') === 'true') {
          //     $(el).parent().attr('action', 'create');
          //   }
          //   else {
          //     $(el).parent().attr('action', 'update');
          //   }
          //   // $(el).closest('label-entry').addClass('uncommitted');
          // }
          // checkIfAnyEntryModified();
          return;
          //-----------------------------
        },
        onBeforeShow: function () {
          $(this).ColorPickerSetColor(this.value);
        },
      })
      .bind("keyup", function () {
        $(this).ColorPickerSetColor(this.value);
        $(this).css("background-color", "#" + this.value);
      });

    $("#form-labels").prepend(newElementEntry);
  }

  $("#add-new-label-entry").click(function () {
    createNewLabelEntry(null, "new");
  });

  function clearAllMilestones() {
    $("#form-milestones").text("");
    $("#commit-to-target-repo").text("Commit changes");
    $("#commit-to-target-repo").attr("disabled", true);
    $("#commit-to-target-repo").removeClass("btn-success");
    $("#commit-to-target-repo").addClass("btn-outline-success");
  }

  function createNewMilestoneEntry(milestone, mode) {
    if (milestone === undefined || milestone === null) {
      milestone = {
        title: "",
        state: "open",
        description: "",
        due_on: "",
        number: null,
      };
    }

    let action = ' action="none" ';
    let uncommittedSignClass = "";

    if (mode === "copy" || mode === "new") {
      action = ' action="create" new="true" ';
      uncommittedSignClass = " uncommitted ";
    }

    if (mode === "copy") {
      milestone.number = null;
    }

    let origTitleVal = ' data-orig-val="' + milestone.title + '"';
    let state = milestone.state;
    let origDescriptionVal = ' data-orig-val="' + milestone.description + '"';
    let due_on = milestone.due_on;
    let number = milestone.number;

    let newElementEntry = $(
      '\
      <div class="milestone-entry ' +
        uncommittedSignClass +
        '" ' +
        action +
        ' data-number="' +
        number +
        '" data-state="' +
        state +
        '" data-due_on="' +
        due_on +
        '">\
        <div class="card">\
          <div class="card-body">\
            <div class="flexbox-container">\
              <input name="title" type="text" class="form-control title-fitting" placeholder="Title" value="' +
        milestone.title +
        '" ' +
        origTitleVal +
        '>\
              <input name="description" type="text" class="form-control description-fitting" placeholder="Description" value="' +
        milestone.description +
        '" ' +
        origDescriptionVal +
        '>\
            </div>\
          </div>\
        </div>\
        <button type="button" class="btn btn-danger delete-button">\
          <i class="fas fa-trash-alt"></i>\
        </button>\
        <button type="button" class="btn btn-success hidden recover-button">\
          <i class="fas fa-history"></i>\
        </button>\
      </div>\
    '
    );

    newElementEntry.find(":input[data-orig-val]").blur(function () {
      let $entry = $(this).closest(".milestone-entry");

      if ($(this).val() === $(this).attr("data-orig-val")) {
        //unchanged
        $entry.attr("action", "none");
        $entry.removeClass("uncommitted");
      } else {
        //changed
        if ($entry.attr("new") === "true") {
          $entry.attr("action", "create");
        } else {
          $entry.attr("action", "update");
          console.log($entry.attr("action"));
        }
        $entry.addClass("uncommitted");
      }

      checkIfAnyEntryModified();
      return;
    });

    newElementEntry.find('input[name="title"]').blur(function () {
      let $entry = $(this).closest(".milestone-entry");
      let currentVal = $(this).val();
      let originalVal = $(this).attr("data-orig-val");

      if (
        setOfMilestoneTitles.has(currentVal) &&
        currentVal !== originalVal
      ) {
        $entry.addClass("duplicate-entry");
        $(this).addClass("red-alert-background");
        alert("This milestone title has already been taken!");
        // In the future, we might use a popup instead of an alert
      }

      checkIfAnyEntryModified();
      return;
    });

    newElementEntry.children(".delete-button").click(function () {
      if ($(this).parent().attr("new") === "true") {
        $(this).parent().remove();
      } else {
        $(this).siblings(".card").addClass("deleted-card");
        $(this).siblings(".recover-button").removeAttr("disabled");
        $(this).addClass("hidden");
        $(this).parent().attr("action", "delete");
      }

      $(this).siblings(".recover-button").removeClass("hidden");

      checkIfAnyEntryModified();
      return;
    });

    newElementEntry.children(".recover-button").click(function () {
      $(this).siblings(".card").removeClass("deleted-card");
      $(this).siblings(".delete-button").removeClass("hidden");
      $(this).addClass("hidden");

      let $entry = $(this).closest(".milestone-entry");

      if (
        $entry.find('[name="title"]').attr("data-orig-val") ===
          $entry.find('[name="title"]').val() &&
        $entry.find('[name="description"]').attr("data-orig-val") ===
          $entry.find('[name="description"]').val()
      ) {
        $entry.attr("action", "none");
      } else {
        $entry.attr("action", "update");
      }

      checkIfAnyEntryModified();
    });

    $("#form-milestones").prepend(newElementEntry);
  }

  $("#add-new-milestone-entry").click(function () {
    createNewMilestoneEntry(null, "new");
  });

  function clickToListAllEntries(kind) {
    let login = getLoginInfo();

    if (login.targetOwner && login.targetRepo) {
      if (kind === "labels") {
        clearAllLabels();
      }
      if (kind === "milestones") {
        clearAllMilestones();
      }

      apiCallGetEntries(
        login.targetOwner,
        login.targetRepo,
        kind,
        "list",
        () => {
          $(this).button("reset");
        }
      );
      $("#" + kind + "-tab").tab("show");
    } else {
      alert("Please enter the repo owner and the repo");
      $(this).button("reset");
    }
  }

  $("#list-all-labels").click(function () {
    clickToListAllEntries("labels");
  });

  $("#list-all-milestones").click(function () {
    clickToListAllEntries("milestones");
  });

  $("#revert-labels-to-original").click(function () {
    clearAllLabels();
    let login = getLoginInfo();
    apiCallGetEntries(
      login.targetOwner,
      login.targetRepo,
      "labels",
      "list",
      () => {
        $(this).button("reset");
      }
    );
  });

  $("#revert-milestones-to-original").click(function () {
    clearAllMilestones();
    let login = getLoginInfo();
    apiCallGetEntries(
      login.targetOwner,
      login.targetRepo,
      "milestones",
      "list",
      () => {
        $(this).button("reset");
      }
    );
  });

  function clickToDeleteAllEntries(selector) {
    $(selector)
      .children()
      .each(function () {
        if ($(this).attr("new") === "true") {
          $(this).remove();
        } else {
          $(this).children(".card").addClass("deleted-card");
          $(this).children(".recover-button").removeAttr("disabled");
          $(this).children(".delete-button").addClass("hidden");
          $(this).children(".recover-button").removeClass("hidden");
          $(this).attr("action", "delete");
        }
      });
    checkIfAnyEntryModified();
  }

  $("#delete-all-labels").click(function () {
    clickToDeleteAllEntries("#form-labels");
  });

  $("#delete-all-milestones").click(function () {
    clickToDeleteAllEntries("#form-milestones");
  });

  function clickToCopyEntriesFrom(kind) {
    let login = getLoginInfo();

    if (login.copyFromOwner && login.copyFromRepo) {
      apiCallGetEntries(
        login.copyFromOwner,
        login.copyFromRepo,
        kind,
        "copy",
        function () {
          $(this).button("reset");
        }
      );
      //set adduncommitted to true because those are coming from another repo

      $("#" + kind + "-tab").tab("show");
    } else {
      alert("Please enter the repo owner and the repo you want to copy from.");
      $(this).button("reset");
    }
    checkIfAnyEntryModified();
  }

  $("#copy-labels-from").click(function () {
    clickToCopyEntriesFrom("labels");
  });

  $("#copy-milestones-from").click(function () {
    clickToCopyEntriesFrom("milestones");
  });

  $("#delete-and-copy-labels-from").click(function () {
    $("#delete-all-labels").click();
    $("#copy-labels-from").click();
  });

  $("#delete-and-copy-milestones-from").click(function () {
    $("#delete-all-milestones").click();
    $("#copy-milestones-from").click();
  });

  $("#commit-to-target-repo").click(function () {
    let login = getLoginInfo();

    if (login.personalAccessToken === "") {
      alert(
        `You need to enter your personal access token for repo ${login.targetRepo} in order to commit changes.`
      );
      $(this).button("reset");
      return;
    }

    commit();
  });

  function serializeEntries(jObjectEntry, kind) {
    if (kind === "labels") {
      return {
        name: jObjectEntry.find('[name="name"]').val(),
        color: jObjectEntry.find('[name="color"]').val(),
        description: jObjectEntry.find('[name="description"]').val(),
        originalName: jObjectEntry.find('[name="name"]').attr("data-orig-val"),
      };
    } else if (kind === "milestones") {
      if (jObjectEntry.attr("data-number") !== "null") {
        return {
          title: jObjectEntry.find('[name="title"]').val(),
          // state: jObjectEntry.attr('data-state'),
          description: jObjectEntry.find('[name="description"]').val(),
          // due_on: jObjectEntry.attr('data-due_on'),
          number: parseInt(jObjectEntry.attr("data-number")),
        };
      } else {
        return {
          title: jObjectEntry.find('[name="title"]').val(),
          // state: jObjectEntry.attr('data-state'),
          description: jObjectEntry.find('[name="description"]').val(),
          // due_on: jObjectEntry.attr('data-due_on')
        };
      }
    } else {
      console.log("Bug in function serializeEntries!");
    }
  }

  function checkIfAnyEntryModified() {
    // returns true if any change has been made and activates or disactivates commit button accordingly

    function enableCommitButton() {
      $("#commit-to-target-repo").removeAttr("disabled");
      $("#commit-to-target-repo").removeClass("btn-outline-success");
      $("#commit-to-target-repo").addClass("btn-success");
    }

    function disableCommitButton() {
      $("#commit-to-target-repo").attr("disabled", true);
      $("#commit-to-target-repo").removeClass("btn-success");
      $("#commit-to-target-repo").addClass("btn-outline-success");
    }

    let labelsModified = $('.label-entry:not([action="none"])').length > 0;
    let milestonesModified =
      $('.milestone-entry:not([action="none"])').length > 0;
    let labelsDuplicated = $(".label-entry.duplicate-entry").length > 0;
    let milestonesDuplicated = $(".milestone-entry.duplicate-entry").length > 0;

    if (labelsModified) {
      $("#revert-labels-to-original").removeAttr("disabled");
    } else {
      $("#revert-labels-to-original").attr("disabled", true);
    }

    if (milestonesModified) {
      $("#revert-milestones-to-original").removeAttr("disabled");
    } else {
      $("#revert-milestones-to-original").attr("disabled", true);
    }

    if (labelsDuplicated || milestonesDuplicated) {
      // if (labelsDuplicated) {
      //   alert("Please resolve duplicated label names before committing.");
      // }
      // if (milestonesDuplicated) {
      //   alert("Please resolve duplicated milestone titles before committing.");
      // }
      disableCommitButton();
    } else {
      if (labelsModified || milestonesModified) {
        enableCommitButton();
      } else {
        disableCommitButton();
      }
    }
  }

  function commit() {
    //freeze the world
    $("#loadingModal").modal({
      keyboard: false,
      backdrop: "static",
    });
    isLoadingShown = true;

    //To be deleted
    $('.label-entry[action="delete"]').each(function () {
      let entryObject = serializeEntries($(this), "labels");
      apiCallDeleteEntries(entryObject, "labels");
    });

    $('.milestone-entry[action="delete"]').each(function () {
      let entryObject = serializeEntries($(this), "milestones");
      apiCallDeleteEntries(entryObject, "milestones");
    });

    //To be updated
    $('.label-entry[action="update"]').each(function () {
      let entryObject = serializeEntries($(this), "labels");
      apiCallUpdateEntries(entryObject, "labels");
    });

    $('.milestone-entry[action="update"]').each(function () {
      let entryObject = serializeEntries($(this), "milestones");
      apiCallUpdateEntries(entryObject, "milestones");
    });

    //To be created
    $('.label-entry[action="create"]').each(function () {
      let entryObject = serializeEntries($(this), "labels");
      apiCallCreateEntries(entryObject, "labels");
    });

    $('.milestone-entry[action="create"]').each(function () {
      let entryObject = serializeEntries($(this), "milestones");
      apiCallCreateEntries(entryObject, "milestones");
    });
  }

  function writeLog(string) {
    $("#loadingModal .modal-body").append(string + "<br>");
  }

  $("#loadingModal").on("hidden.bs.modal", function () {
    isLoadingShown = false;

    //reset modal
    $("#loadingModal .modal-body").text("");
    $("#loadingModal .modal-body").append("<p>Commiting...");
    $("#loadingModal .modal-footer").remove();

    //reload labels after changes
    clearAllLabels();
    clearAllMilestones();
    let login = getLoginInfo();
    apiCallGetEntries(login.targetOwner, login.targetRepo, "labels", "list");
    apiCallGetEntries(
      login.targetOwner,
      login.targetRepo,
      "milestones",
      "list"
    );
  });

  /* ========== The rest is BASE64 STUFF ========== */
  let Base64 = {
    // http://stackoverflow.com/a/246813
    // private property
    _keyStr:
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",

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
    _utf8_decode: function (utftext) {
      let string = "";
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
  }; //end of Base64
}); //end of doc ready
