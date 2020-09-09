/**
 * Test manipulateEntries
 */

'use strict';

import { clearAllEntriesOfKind } from '../js/manipulateEntries';

describe('Test manipulateEntires', () => {
  describe('Test clearAllEntriesOfKind', () => {
    document.body.innerHTML = `
      <form id="form-labels">
        <div>Dummy to be removed.</div>
      </form>
      <button id="commit-to-home-repo-name" type="button" class="btn btn-raised btn-block btn-success" data-loading-text="Commiting...">
        To be changed
      </button>
    `;

    clearAllEntriesOfKind('labels');

    const formEl = document.getElementById('form-labels');
    const commitToHomeRepo = document.getElementById(
      'commit-to-home-repo-name'
    );

    test('Test if the content of the corresponding form is cleared', () => {
      expect(formEl.textContent).toStrictEqual('');
    });
    test("Test if #commit-to-home-repo-name's text is changed correctly", () => {
      expect(commitToHomeRepo.textContent).toStrictEqual('Commit changes');
    });
    test("Test if #commit-to-home-repo-name's disabled attribute is added", () => {
      expect(commitToHomeRepo.getAttribute('disabled')).toStrictEqual('true');
    });
    test("Test if #commit-to-home-repo-name's btn-success class is removed", () => {
      expect(commitToHomeRepo.classList.contains('btn-success')).toStrictEqual(
        false
      );
    });
    test("Test if #commit-to-home-repo-name's btn-outline-success class is added", () => {
      expect(
        commitToHomeRepo.classList.contains('btn-outline-success')
      ).toStrictEqual(true);
    });
  });
});
