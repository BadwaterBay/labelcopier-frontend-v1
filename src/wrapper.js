/**
 * Wrapper for HTML when developing Labelcopier outside BadwaterBay.com
 */

'use strict';

import 'bootstrap-material-design/dist/css/bootstrap-material-design.min.css';
import 'bootstrap-material-design';
import { dom } from '@fortawesome/fontawesome-svg-core';
import labelcopierContent from './index';
import labelcopierApp from './app';

dom.watch();

document.getElementById('content-anchor').appendChild(labelcopierContent);

document.addEventListener('DOMContentLoaded', () => {
  labelcopierApp();
});
