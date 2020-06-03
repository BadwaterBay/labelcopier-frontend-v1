const loadingModal = () => {
  return `
    <div id="loadingModal" class="modal fade" tabindex="-1" role="dialog">
      <div class="modal-dialog modal-dialog-centered" role="document">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              Please&nbsp;wait...
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
          <div class="modal-body">
            <p>
              Commiting...
            </p>
          </div>
        </div>
      </div>
    </div>
    <!-- #loadingModal -->
  `;
};

export default loadingModal;
