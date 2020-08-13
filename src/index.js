/**
 * Entry point for all JavaScript and HTML
 */

'use strict';

import './scss/app.scss';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faTrashAlt, faHistory } from '@fortawesome/free-solid-svg-icons';
import loginCard from './components/loginCard';
import copyFromCard from './components/copyFromCard';
import managementCard from './components/managementCard';
import loadingModal from './components/loadingModal';

library.add(faTrashAlt, faHistory);

const labelcopierContent = document.createElement('div');

labelcopierContent.innerHTML = (() =>
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

export default labelcopierContent;
