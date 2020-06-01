const copyFromCard = () => {
  return `
    <div class="card bg-light card-body mb-3">
      <div class="card-header">
        <h3>
          Copy from an existing repository
        </h3>
      </div>
      <div class="form-text text-muted">
        You can copy labels and milestones from other repositories and
        modify them before committing to your repository.
      </div>
      <div>
        <form>
          <div class="row">
            <div class="col-12 col-md-6 col-lg-12">
              <div class="form-group">
                <label for="target-owner" class="bmd-label-floating">
                  Repository&nbsp;owner
                </label>
                <input
                  type="text"
                  class="form-control"
                  id="copy-from-owner"
                />
                <span class="bmd-help">
                  Such as: BadwaterBay
                </span>
              </div>
            </div>
            <!-- col -->
            <div class="col-12 col-md-6 col-lg-12">
              <div class="form-group">
                <label for="target-repo" class="bmd-label-floating">
                  Repository
                </label>
                <input
                  type="text"
                  class="form-control"
                  id="copy-from-repo"
                />
                <span class="bmd-help">
                  Such as: template-for-label-and-milestone-1
                </span>
              </div>
            </div>
            <!-- col -->
          </div>
          <!-- row -->
        </form>
        <div class="row">
          <div class="col-12 col-md-6 col-lg-12">
            <button
              id="copy-labels-from"
              type="button"
              class="btn btn-outline-info btn-block"
              data-loading-text="Adding..."
            >
              Copy&nbsp;labels
            </button>
          </div>
          <!-- col -->
          <div class="col-12 col-md-6 col-lg-12">
            <button
              id="copy-milestones-from"
              type="button"
              class="btn btn-outline-info btn-block"
              data-loading-text="Adding..."
            >
              Copy&nbsp;milestones
            </button>
          </div>
          <!-- col -->
        </div>
        <!-- row -->
        <!-- <button id="delete-and-copy-labels-from" type="button" class="btn btn-outline-info btn-block"
        data-loading-text="Cloning...">
        Delete all existing labels and copy
      </button>
      <button id="delete-and-copy-milestones-from" type="button" class="btn btn-outline-info btn-block"
        data-loading-text="Cloning...">
        Delete all existing milestones and copy
      </button> -->
      </div>
    </div>
  `;
};

export default copyFromCard;
