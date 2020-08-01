import './css/colorpicker.css';
// import 'bootstrap-material-design/dist/css/bootstrap-material-design.min.css';
import './scss/app.scss';

// import 'jquery';
// import 'popper.js';
import './js/colorpicker';
// import 'bootstrap-material-design/dist/js/bootstrap-material-design.min.js';
import loginCard from './components/loginCard.js';
import copyFromCard from './components/copyFromCard.js';
import managementCard from './components/managementCard.js';
import loadingModal from './components/loadingModal.js';
import app from './js/app.js';

const mainContent = () => {
  return `
    <div id="content" class="container">
      <div class="row">
        <div class="col-12 col-lg-4">
          ${loginCard()}
          ${copyFromCard()}
        </div>
        <div class="col-12 col-lg-8">
          ${managementCard()}
        </div>
      </div>
    </div><!-- /container -->
    ${loadingModal()}
  `;
};

document.body.innerHTML += mainContent();

app();
