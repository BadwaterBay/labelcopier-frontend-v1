/**
 * COPY-TO-USERNAME CHECKBOX FUNCTIONALITIES
 */

'use strict';

/**
 * Copy #target-owner to #target-username when #copy-to-username checkbox is
 * checked; if unchecked, reset #target-username to an empty string
 */
const copyToUsername = () => {
  document.getElementById('copy-to-username').addEventListener(
    'click',
    /** @this HTMLElement */
    function () {
      document.getElementById('target-username').value = (() =>
        this.checked ? document.getElementById('target-owner').value : '')();
    }
  );
};

/**
 * Copy #target-owner to #target-username if #copy-to-username is checked
 */
const copyOwnerToUsername = () => {
  document.getElementById('target-owner').addEventListener(
    'keyup',
    /** @this HTMLElement */
    function () {
      if (document.getElementById('copy-to-username').checked) {
        document.getElementById('target-username').value = this.value;
      }
    }
  );
};

/**
 * Check #copy-to-username checkbox if the values of #target-username and
 * #target-owner are equal, and vice versa
 */
const setCopyToUsernameCheckbox = () => {
  document.getElementById('target-username').addEventListener(
    'keyup',
    /** @this HTMLElement */
    function () {
      document.getElementById('copy-to-username').prop('checked', () => {
        return this.value === document.getElementById('target-owner').value;
      });
    }
  );
};

export { copyToUsername, copyOwnerToUsername, setCopyToUsernameCheckbox };
