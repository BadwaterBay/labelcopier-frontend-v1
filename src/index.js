/**
 * Entry point for all JavaScript and HTML
 */

'use strict';

import 'bootstrap-material-design/dist/css/bootstrap-material-design.min.css';
import './scss/app.scss';
import 'bootstrap-material-design';
import { library, dom } from '@fortawesome/fontawesome-svg-core';
import { faTrashAlt, faHistory } from '@fortawesome/free-solid-svg-icons';
import loginCard from './components/loginCard';
import copyFromCard from './components/copyFromCard';
import managementCard from './components/managementCard';
import loadingModal from './components/loadingModal';
import app from './app';

library.add(faTrashAlt, faHistory);
dom.watch();

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

document.getElementById('content-anchor').appendChild(mainContent);

app();
