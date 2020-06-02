const loginCard = () => {
  return `
    <div class="card bg-light card-body mb-3">
      <div class="card-header">
        <h3>
          Manage your repository
        </h3>
      </div>
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
                id="target-owner"
                name="target-owner"
              />
              <span class="bmd-help">
                Such as: BadwaterBay
              </span>
            </div>
            <!-- form-group -->
          </div>
          <div class="col-12 col-md-6 col-lg-12">
            <div class="form-group">
              <label for="target-repo" class="bmd-label-floating">
                Repository
              </label>
              <input type="text" class="form-control" id="target-repo" />
              <span class="bmd-help">
                Such as: template-for-label-and-milestone-1
              </span>
            </div>
            <!-- form-group -->
          </div>
          <!-- col -->

          <!-- <div class="row"> -->
          <div class="col-12">
            <div class="checkbox">
              <label>
                <input
                  type="checkbox"
                  id="copy-to-username"
                  name="checkOwnerOfRepository"
                  value=""
                  checked
                />
                I'm the owner of the repository
              </label>
            </div>
          </div>
          <!-- col -->
          <!-- </div> -->
        </div>
        <!-- row -->
        <div class="row">
          <div class="col-12 col-md-6 col-lg-12">
            <div class="form-group">
              <label class="bmd-label-floating" for="target-username">
                Username&nbsp;for&nbsp;authentication
              </label>
              <input
                type="text"
                class="form-control"
                id="target-username"
                name="target-username"
              />
              <span class="bmd-help">
                You can manage repositories you own or have access to
              </span>
            </div>
          </div>
          <!-- col -->
          <div class="col-12 col-md-6 col-lg-12">
            <div class="form-group">
              <label
                for="personal-access-token"
                class="bmd-label-floating"
              >
                Personal&nbsp;access&nbsp;token
              </label>
              <input
                type="password"
                class="form-control"
                id="personal-access-token"
              />
              <span class="bmd-help">
                We don't store your GitHub personal access token
              </span>
            </div>
          </div>
          <!-- col -->
        </div>
        <!-- row -->
      </form>
      <div class="row">
        <div class="col-12 col-md-4 col-lg-12">
          <button
            id="list-all-labels"
            type="button"
            class="btn btn-block btn-outline-secondary"
            data-loading-text="Loading..."
          >
            List labels
          </button>
        </div>
        <!-- col -->
        <div class="col-12 col-md-4 col-lg-12">
          <button
            id="list-all-milestones"
            type="button"
            class="btn btn-block btn-outline-secondary"
            data-loading-text="Loading..."
          >
            List milestones
          </button>
        </div>
        <!-- col -->
        <!-- </div> -->
        <!-- row -->
        <!-- <div class="row"> -->
        <div class="col-12 col-md-4 col-lg-12">
          <button
            id="commit-to-target-repo"
            type="button"
            class="btn btn-raised btn-outline-success btn-block"
            disabled
            data-loading-text="Commiting..."
          >
            Commit&nbsp;changes
          </button>
        </div>
        <!-- col -->
      </div>
      <!-- row -->
    </div>
  `;
};

export default loginCard;
