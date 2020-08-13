const managementCard = (() =>
  `
    <div class="card bg-light card-body mb-3">
      <ul class="nav nav-tabs nav-justified" id="nav-tab" role="tablist">
        <li class="nav-item">
          <a
            class="nav-link active"
            id="labels-tab"
            data-toggle="tab"
            href="#labels-form"
            role="tab"
            aria-controls="labels-form"
            aria-selected="true"
          >
            <span id="labels-progress-indicator" class="progress-indicator spinner-border spinner-border-sm text-info hidden" role="status" aria-hidden="true"></span>
            <span>Labels<span>
          </a>
        </li>
        <li class="nav-item">
          <a
            class="nav-link"
            id="milestones-tab"
            data-toggle="tab"
            href="#milestones-form"
            role="tab"
            aria-controls="milestones-form"
            aria-selected="false"
          >
            <span id="milestones-progress-indicator" class="progress-indicator spinner-border spinner-border-sm text-info hidden" role="status" aria-hidden="true"></span>
            <span>Milestones</span>
          </a>
        </li>
        <li class="nav-item">
          <a
            class="nav-link"
            id="faq-tab"
            data-toggle="tab"
            href="#faq-form"
            role="tab"
            aria-controls="faq-form"
            aria-selected="false"
          >
            FAQ
          </a>
        </li>
      </ul>
      <div class="card-body">
        <div class="tab-content" id="nav-tab-content">
          <div
            class="tab-pane active"
            id="labels-form"
            role="tabpanel"
            aria-labelledby="labels-tab"
          >
            <div class="row">
              <div class="col-12 col-md-4">
                <button
                  id="add-new-label-entry"
                  type="button"
                  class="btn btn-raised btn-success btn-block mb-3"
                >
                  New label
                </button>
              </div>
              <div class="col-12 col-md-4">
                <button
                  id="undo-all-labels"
                  type="button"
                  class="btn btn-raised btn-primary btn-block"
                  disabled
                  data-loading-text="Resetting..."
                >
                  Undo all
                </button>
              </div>
              <div class="col-12 col-md-4">
                <button
                  id="delete-all-labels"
                  type="button"
                  class="btn btn-raised btn-danger btn-block"
                  data-loading-text="Deleting..."
                >
                  Delete all
                </button>
              </div>
            </div>
            <!-- row -->
            <div class="login-first-notice">
              <p>
                Please login with GitHub before managaning labels and milestones. Otherwise the changes will not be saved.
              </p>
            </div>
            <form id="form-labels" class="form-inline"></form>
          </div>
          <div
            class="tab-pane"
            id="milestones-form"
            role="tabpanel"
            aria-labelledby="milestones-tab"
          >
            <div class="row">
              <div class="col-12 col-md-4">
                <button
                  id="add-new-milestone-entry"
                  type="button"
                  class="btn btn-raised btn-success btn-block mb-3"
                >
                  New milestone
                </button>
              </div>
              <div class="col-12 col-md-4">
                <button
                  id="undo-all-milestones"
                  type="button"
                  class="btn btn-raised btn-primary btn-block"
                  disabled
                  data-loading-text="Resetting..."
                >
                  Undo all
                </button>
              </div>
              <div class="col-12 col-md-4">
                <button
                  id="delete-all-milestones"
                  type="button"
                  class="btn btn-raised btn-danger btn-block"
                  data-loading-text="Deleting..."
                >
                  Delete all
                </button>
              </div>
            </div>
            <!-- row -->
            <div class="login-first-notice">
              <p>
                Please login with GitHub before managaning labels and milestones. Otherwise the changes will not be saved.
              </p>
            </div>
            <form id="form-milestones" class="form-inline"></form>
          </div>
          <div
            class="tab-pane"
            id="faq-form"
            role="tabpanel"
            aria-labelledby="faq-tab"
          >
            <div class="card-header">
              <h3>
                How this web app works?
              </h3>
            </div>
            <div id="collapse-card-token-safety">
              <div class="card-body">
                <p>
                  This web app works by making cross-site requests to
                  GitHub's API. You can also download this website and use
                  it on your localhost.
                </p>
              </div>
            </div>
            <div class="card-header">
              <h3>
                Is my personal access token safe?
              </h3>
            </div>
            <div>
              <div class="card-body">
                <p>
                  This web app authenticates to GitHub API via
                  <strong>HTTP Basic Authentication</strong>, but all API
                  calls are done over <strong>SSL</strong>, so your
                  personal access token is safe.
                </p>
                <p>
                  Although you can use your password in lieu of a personal
                  access token, it is highly encouraged to use a personal
                  access token.
                </p>
                <p>
                  <a
                    href="https://help.github.com/en/github/authenticating-to-github/creating-a-personal-access-token-for-the-command-line"
                    target="_blank"
                  >
                    How to create a personal access token?
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `)();

export default managementCard;
