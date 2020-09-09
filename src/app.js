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
import { listenForClickOfLoginWithGithub } from './js/loginFormFunctions';
import {
  listenForClickOfListEntriesOfKind,
  listenForClickOfUndoEntriesOfKind,
  listenForClickOfCopyEntriesOfKind,
  listenForClickOfCreateEntriesOfKind,
  listenForClickOfDeleteEntriesOfKind,
} from './js/manipulateEntries';
import {
  resetModalWhenClosed,
  listenForClickOfCommitButton,
  listenForClickOutsideModalToCloseModal,
} from './js/commitChanges';

const app = () => {
  try {
    // Instantiate Bootstrap-Material-Design
    $('body').bootstrapMaterialDesign();

    listenForClickOfLoginWithGithub();

    const listenerFuncs = [
      listenForClickOfListEntriesOfKind,
      listenForClickOfUndoEntriesOfKind,
      listenForClickOfCopyEntriesOfKind,
      listenForClickOfCreateEntriesOfKind,
      listenForClickOfDeleteEntriesOfKind,
    ];
    const kinds = ['labels', 'milestones'];

    // Run each function with each element in the `kinds` array
    runFuncsWithArgs(listenerFuncs, kinds);

    listenForClickOfCommitButton();

    listenForClickOutsideModalToCloseModal();

    resetModalWhenClosed();
  } catch (err) {
    console.error('Unexpected error occurred in Labelcopier.');
    console.error(err);
  }
};

export default app;
