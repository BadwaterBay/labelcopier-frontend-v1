/**
 * Main script for all JavaScript functionalities of Labelcopier
 */

/**
  labelcopier is free software: you can redistribute it and/or modify
  it under the terms of the GNU General Public License as published by
  the Free Software Foundation, either version 3 of the License, or
  (at your option) any later version.

  labelcopier is distributed in the hope that it will be useful,
  but WITHOUT ANY WARRANTY; without even the implied warranty of
  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
  GNU General Public License for more details.

  You should have received a copy of the GNU General Public License
  along with labelcopier.  If not, see <http://www.gnu.org/licenses/>.
*/

'use strict';

import { runFuncsWithArgs } from '@dongskyler/helpers.js';
import {
  listenForRepoOwnerCheckbox,
  listenForRepoOwnerInput,
  autoCheckRepoOwnerCheckbox,
} from './js/loginFormFunctions';
import {
  listenForListEntriesOfKind,
  listenForUndoEntriesOfKind,
  listenForCopyEntriesOfKind,
  listenForCreateEntriesOfKind,
  listenForDeleteEntriesOfKind,
} from './js/manipulateEntries';
import {
  resetModalWhenClosed,
  listenForCommitButton,
  clickOutsideToCloseModal,
} from './js/commitChanges';

export default () => {
  try {
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
     * including list, undo, copy, create and delete.
     *
     */
    const listenerFuncs = [
      listenForListEntriesOfKind,
      listenForUndoEntriesOfKind,
      listenForCopyEntriesOfKind,
      listenForCreateEntriesOfKind,
      listenForDeleteEntriesOfKind,
    ];
    const kinds = ['labels', 'milestones'];
    /**
     * Run each function with each element in the `kinds` array
     */
    runFuncsWithArgs(listenerFuncs, kinds);

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

    console.log('labelcopierApp activated.');
  } catch (err) {
    console.error('Unexpected error occurred in Labelcopier.');
    console.error(err);
  }
};
