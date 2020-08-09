const loadingModal = (() =>
  `
    <div id="committing-modal" class="modal fade" tabindex="-1" role="dialog">
      <div class="modal-dialog modal-dialog-centered" role="document">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              <span>Committing changes...</span>
              <span id="committing-spinner" class="spinner-border text-info" role="status" aria-hidden="true"></span>
            </h5>
            <button
              type="button"
              class="close"
              data-dismiss="modal"
              aria-label="Close"
            >
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div class="modal-body"></div>
        </div>
      </div>
    </div>
    <!-- #committing-modal -->
  `)();

export default loadingModal;
