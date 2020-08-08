/**
 * Modal functionalities
 */

'use strict';

// jQuery is temporarily made accessible globally

// Clicking outside the modal closes it
const clickToCloseModal = () => {
  $(document).click((event) => {
    if ($(event.target).is('#loadingModal')) {
      $('#loadingModal').modal('hide');
    }
  });
};

export default clickToCloseModal;
