/**
 * Entry point for all JavaScript
 */

'use strict';

import './scss/app.scss';
import loginCard from './components/loginCard.js';
import copyFromCard from './components/copyFromCard.js';
import managementCard from './components/managementCard.js';
import loadingModal from './components/loadingModal.js';
import app from './js/app.js';

const mainContent = document.createElement('div');

mainContent.innerHTML = (() =>
  `
    <div id="main-content" class="container">
      <div class="row">
        <div class="col-12 col-lg-4">
          ${loginCard}
          ${copyFromCard}
        </div>
        <div class="col-12 col-lg-8">
          ${managementCard}
        </div>
      </div>
    </div><!-- #content -->
    ${loadingModal}
  `)();

document.body.appendChild(mainContent);

app();
