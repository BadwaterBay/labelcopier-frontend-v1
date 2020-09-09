/**
 * LOGIN INPUT FUNCTIONALITIES
 */

'use strict';

const listenForClickOfLoginWithGithub = () => {
  document.getElementById('login-with-github').addEventListener('click', () => {
    if (
      typeof window.accessToken === 'undefined' ||
      window.accessToken === null
    ) {
      window.location =
        window.location.hostname === 'badwaterbay.com'
          ? 'http://api.badwaterbay.com/apps/labelcopier/oauth/authorize'
          : 'http://localhost:5036/apps/labelcopier/oauth/authorize';
    }
  });
};

export { listenForClickOfLoginWithGithub };
