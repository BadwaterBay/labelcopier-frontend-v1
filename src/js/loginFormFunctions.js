/**
 * LOGIN INPUT FUNCTIONALITIES
 */

'use strict';

/**
 * Copy #home-repo-owner to #github-username when #i-am-repo-owner checkbox is
 * checked; if unchecked, reset #github-username to an empty string
 */
const listenForRepoOwnerCheckbox = () => {
  document.getElementById('i-am-repo-owner').addEventListener(
    'click',
    /** @this HTMLElement */
    function () {
      document.getElementById('github-username').value = (() =>
        this.checked ? document.getElementById('home-repo-owner').value : '')();
    }
  );
};

/**
 * Copy #home-repo-owner to #github-username if #i-am-repo-owner is checked
 */
const listenForRepoOwnerInput = () => {
  document.getElementById('home-repo-owner').addEventListener(
    'keyup',
    /** @this HTMLElement */
    function () {
      if (document.getElementById('i-am-repo-owner').checked) {
        document.getElementById('github-username').value = this.value;
      }
    }
  );
};

/**
 * Check #i-am-repo-owner checkbox if the values of #github-username and
 * #home-repo-owner are equal, and vice versa
 */
const autoCheckRepoOwnerCheckbox = () => {
  document.getElementById('github-username').addEventListener(
    'keyup',
    /** @this HTMLElement */
    function () {
      document.getElementById('i-am-repo-owner').checked =
        this.value === document.getElementById('home-repo-owner').value;
    }
  );
};

const listenForLoginWithGithub = () => {
  document.getElementById('login-with-github').addEventListener('click', () => {
    const hostName = window.location.hostname;
    window.location =
      hostName === 'badwaterbay.com'
        ? 'https://api.badwaterbay.com/labelcopier/oauth'
        : 'http://localhost:5036/labelcopier/oauth';
  });
};

export {
  listenForRepoOwnerCheckbox,
  listenForRepoOwnerInput,
  autoCheckRepoOwnerCheckbox,
  listenForLoginWithGithub,
};
