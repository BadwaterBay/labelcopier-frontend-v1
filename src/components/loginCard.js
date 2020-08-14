const loginCard = `
<div class="card bg-light card-body mb-3">
  <div class="card-header">
    <h3>
      Manage your repository
    </h3>
  </div>
  <div class="row">
    <div class="col-12 col-md-4 col-lg-12">
      <button id="login-with-github" type="button" class="btn btn-block btn-raised btn-outline-secondary login-button">
        <svg class="fab fa-github"></svg> Login with GitHub
      </button>
    </div>
  </div>
  <img id="avatar" src=""/>
  <form>
    <div class="row">
      <div class="col-12 col-md-6 col-lg-12">
        <div class="form-group">
          <label for="home-repo-owner" class="bmd-label-floating">
            Repository&nbsp;owner
          </label>
          <input type="text" class="form-control" id="home-repo-owner" name="home-repo-owner" />
          <span class="bmd-help">
            Such as: BadwaterBay
          </span>
        </div>
      </div>
      <div class="col-12 col-md-6 col-lg-12">
        <div class="form-group">
          <label for="home-repo-name" class="bmd-label-floating">
            Repository
          </label>
          <input type="text" class="form-control" id="home-repo-name" />
          <span class="bmd-help">
            Such as: template-for-label-and-milestone-1
          </span>
        </div>
      </div>
    </div>
    <!-- row -->
  </form>
  <div class="row">
    <div class="col-12 col-md-4 col-lg-12">
      <button id="list-all-labels" type="button" class="btn btn-block btn-raised btn-outline-secondary"
        data-loading-text="Loading...">
        List&nbsp;labels
      </button>
    </div>
    <div class="col-12 col-md-4 col-lg-12">
      <button id="list-all-milestones" type="button" class="btn btn-block btn-raised btn-outline-secondary"
        data-loading-text="Loading...">
        List&nbsp;milestones
      </button>
    </div>
    <div class="col-12 col-md-4 col-lg-12">
      <button id="commit-to-home-repo-name" type="button" class="btn btn-block btn-raised btn-outline-success" disabled
        data-loading-text="Commiting...">
        Commit&nbsp;changes
      </button>
    </div>
  </div>
  <!-- row -->
</div>`;

export default loginCard;
