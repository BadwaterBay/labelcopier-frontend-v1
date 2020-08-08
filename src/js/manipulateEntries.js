/**
 *
 */

'use strict';

const clickToDeleteAllEntries = (selector) => {
  $(selector)
    .children()
    .each(
      /** @this HTMLElement */
      function () {
        if ($(this).attr('new') === 'true') {
          $(this).remove();
        } else {
          $(this).children('.card').addClass('deleted-card');
          $(this).parent().find('.invalid-input').addClass('hidden');
          $(this).children('.recover-button').removeAttr('disabled');
          $(this).children('.delete-button').addClass('hidden');
          $(this).children('.recover-button').removeClass('hidden');
          $(this).attr('data-todo', 'delete');
        }
      }
    );
  checkIfEnableCommit();
};

const clickToDeleteAllLabels = () => {
  document.getElementById('delete-all-labels').addEventListener('click', () => {
    clickToDeleteAllEntries('#form-labels');
    checkIfEnableCommit();
  });
};

const clickToDeleteAllMilestones = () => {
  document
    .getElementById('delete-all-milestones')
    .addEventListener('click', () => {
      clickToDeleteAllEntries('#form-milestones');
      checkIfEnableCommit();
    });
};

export { clickToDeleteAllLabels, clickToDeleteAllMilestones };
