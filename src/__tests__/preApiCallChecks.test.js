/**
 * Test preApiCallChecks
 */

'use strict';

import {
  enableCommitButton,
  disableCommitButton,
} from '../js/preApiCallChecks';

describe('Test preApiCallChecks', () => {
  describe('Test enableCommitButton', () => {
    document.body.innerHTML = `
      <button id="commit-to-target-repo" type="button" class="btn btn-raised btn-outline-success btn-block" disabled="" data-loading-text="Commiting...">
        Commit changes'
      </button>
      `;

    enableCommitButton();

    const commitToTargetRepo = document.getElementById('commit-to-target-repo');

    test("Test if attribute 'disabled' is removed", () => {
      expect(commitToTargetRepo.hasAttribute('disabled')).toBe(false);
    });

    test("Test if class 'btn-outline-success' is removed", () => {
      expect(commitToTargetRepo.classList.contains('btn-outline-success')).toBe(
        false
      );
    });

    test("Test if class 'btn-success' is added", () => {
      expect(commitToTargetRepo.classList.contains('btn-success')).toBe(true);
    });
  });

  describe('Test disableCommitButton', () => {
    document.body.innerHTML = `
      <div>
        <button id="commit-to-target-repo" type="button" class="btn btn-raised btn-success btn-block" data-loading-text="Commiting...">
          Commit changes'
        </button>
      </div>
      `;

    disableCommitButton();

    const commitToTargetRepo = document.getElementById('commit-to-target-repo');

    test("Test if attribute 'disabled' is added", () => {
      expect(commitToTargetRepo.hasAttribute('disabled')).toBe(true);
    });

    test("Test if class 'btn-success' is removed", () => {
      expect(commitToTargetRepo.classList.contains('btn-success')).toBe(false);
    });

    test("Test if class 'btn-outline-success' is added", () => {
      expect(commitToTargetRepo.classList.contains('btn-outline-success')).toBe(
        true
      );
    });
  });
});
