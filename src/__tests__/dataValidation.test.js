/**
 * Test dataValidation.js
 */

'use strict';

import { enableCommitButton, disableCommitButton } from '../js/dataValidation';

describe('Test dataValidation', () => {
  describe('Test enableCommitButton', () => {
    document.body.innerHTML = `
      <button id="commit-to-home-repo-name" type="button" class="btn btn-raised btn-outline-success btn-block" disabled="" data-loading-text="Commiting...">
        Commit changes'
      </button>
      `;

    enableCommitButton();

    const commitToHomeRepo = document.getElementById(
      'commit-to-home-repo-name'
    );

    test("Test if attribute 'disabled' is removed", () => {
      expect(commitToHomeRepo.hasAttribute('disabled')).toBe(false);
    });

    test("Test if class 'btn-outline-success' is removed", () => {
      expect(commitToHomeRepo.classList.contains('btn-outline-success')).toBe(
        false
      );
    });

    test("Test if class 'btn-success' is added", () => {
      expect(commitToHomeRepo.classList.contains('btn-success')).toBe(true);
    });
  });

  describe('Test disableCommitButton', () => {
    document.body.innerHTML = `
      <div>
        <button id="commit-to-home-repo-name" type="button" class="btn btn-raised btn-success btn-block" data-loading-text="Commiting...">
          Commit changes'
        </button>
      </div>
      `;

    disableCommitButton();

    const commitToHomeRepo = document.getElementById(
      'commit-to-home-repo-name'
    );

    test("Test if attribute 'disabled' is added", () => {
      expect(commitToHomeRepo.hasAttribute('disabled')).toBe(true);
    });

    test("Test if class 'btn-success' is removed", () => {
      expect(commitToHomeRepo.classList.contains('btn-success')).toBe(false);
    });

    test("Test if class 'btn-outline-success' is added", () => {
      expect(commitToHomeRepo.classList.contains('btn-outline-success')).toBe(
        true
      );
    });
  });
});
