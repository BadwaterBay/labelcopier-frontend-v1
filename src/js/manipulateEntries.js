/**
 *
 */

'use strict';

const clearAllEntries = (kind) => {
  document.getElementById(`form-${kind}`).textContent = '';
  const commitToTargetRepo = document.getElementById('commit-to-target-repo');
  commitToTargetRepo.textContent = 'Commit changes';
  commitToTargetRepo.setAttribute('disabled', true);
  commitToTargetRepo.classList.remove('btn-success');
  commitToTargetRepo.classList.add('btn-outline-success');
};

const clickToDeleteAllEntries = (kind) => {
  $(`#form-${kind}`)
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
    clickToDeleteAllEntries('labels');
    checkIfEnableCommit();
  });
};

const clickToDeleteAllMilestones = () => {
  document
    .getElementById('delete-all-milestones')
    .addEventListener('click', () => {
      clickToDeleteAllEntries('milestones');
      checkIfEnableCommit();
    });
};

export { clearAllEntries, clickToDeleteAllLabels, clickToDeleteAllMilestones };
