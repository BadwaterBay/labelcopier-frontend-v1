/**
 * Main script for all JavaScript functionalities
 *
 * It will run when document is ready
 */

/**
  github-label-manager-plus is free software: you can redistribute it and/or modify
  it under the terms of the GNU General Public License as published by
  the Free Software Foundation, either version 3 of the License, or
  (at your option) any later version.

  github-label-manager-plus is distributed in the hope that it will be useful,
  but WITHOUT ANY WARRANTY; without even the implied warranty of
  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
  GNU General Public License for more details.

  You should have received a copy of the GNU General Public License
  along with github-label-manager-plus.  If not, see <http://www.gnu.org/licenses/>.
*/

'use strict';

import {
  listenForRepoOwnerCheckbox,
  listenForRepoOwnerInput,
  autoCheckRepoOwnerCheckbox,
} from './js/loginFormFunctions';
import {
  listenForListAllLabels,
  listenForListAllMilestones,
  listenForDeleteAllLabels,
  listenForDeleteAllMilestones,
  listenForUndoLabels,
  listenForUndoMilestones,
  listenForCopyLabelsFromRepo,
  listenForCopyMilestonesFromRepo,
  listenForCreateNewLabel,
  listenForCreateNewMilestone,
} from './js/manipulateEntries';
import {
  resetModalWhenClosed,
  listenForCommitButton,
  clickOutsideToCloseModal,
} from './js/commitChanges';

export default () =>
  document.addEventListener('DOMContentLoaded', () => {
    /**
     * Instantiate Bootstrap-Material-Design
     */
    $('body').bootstrapMaterialDesign();

    /**
     * Login form functionalities
     */
    listenForRepoOwnerCheckbox();
    listenForRepoOwnerInput();
    autoCheckRepoOwnerCheckbox();

    /**
     * Listen for DOM events to manipulate labels and milestones
     * including list, delete, revert (undo), copy and create
     */
    listenForListAllLabels();
    listenForListAllMilestones();
    listenForDeleteAllLabels();
    listenForDeleteAllMilestones();
    listenForUndoLabels();
    listenForUndoMilestones();
    listenForCopyLabelsFromRepo();
    listenForCopyMilestonesFromRepo();
    listenForCreateNewLabel();
    listenForCreateNewMilestone();

    /**
     * Listen for click events of the commit button
     * When clicked, commit changes by communicating with GitHub API
     */
    listenForCommitButton();

    /**
     * Click anywhere outside the modal to close the modal
     */
    clickOutsideToCloseModal();

    /**
     * Reset the content inside '#committing-modal' modal when it is closed
     * and reload entries
     */
    resetModalWhenClosed();
  });
