import React, { Component } from 'react';

class Cards extends Component {
  render() {
    return (
      <div id="content" className="container">
        <div className="row">
          <div className="col-12 col-lg-5">
            <div className="card bg-light card-body mb-3">
              <div className="card-header">
                <h3>
                  Manage your Github labels and milestones
                </h3>
              </div>
              <form>
                <div className="form-group">
                  <label htmlFor="targetOwner" className="bmd-label-floating">
                    Repo owner
                  </label>
                  <input type="text" className="form-control" id="targetOwner" name="targetOwner" />
                  <span className="bmd-help">
                    Such as: Badwater-Apps
                  </span>
                </div>
                <div className="form-group">
                  <label htmlFor="targetRepo" className="bmd-label-floating">
                    Repo
                  </label>
                  <input type="text" className="form-control" id="targetRepo" />
                  <span className="bmd-help">
                    Such as: template-for-label-and-milestone-1
                  </span>
                </div>
                <div className="checkbox">
                  <label>
                    <input type="checkbox" name="checkOwnerOfRepo" onClick="copyToUsername(this.form)" />
                      I'm the owner of the repo
                  </label>
                </div>
                <div className="form-group">
                  <label className="bmd-label-floating" htmlFor="targetUsername">
                    Username for authentication
                  </label>
                  <input type="text" className="form-control" id="targetUsername" name="targetUsername" />
                  <span className="bmd-help">
                    You can manage repos you own or have access to
                  </span>
                </div>
                <div className="form-group">
                  <label htmlFor="personalAccessToken" className="bmd-label-floating">
                    Personal access token
                  </label>
                  <input type="password" className="form-control" id="personalAccessToken" />
                  <span className="bmd-help">
                    We don't store your personal access token
                  </span>
                </div>
              </form>
              <button id="list-all-labels" type="button" className="btn btn-block btn-outline-secondary" data-loading-text="Loading...">
                List labels in this repo
              </button>
              <button id="list-all-milestones" type="button" className="btn btn-block btn-outline-secondary" data-loading-text="Loading...">
                List milestones in this repo
              </button>
              <button id="commit-to-target-repo" type="button" className="btn btn-raised btn-outline-success btn-block" disabled data-loading-text="Commiting...">
                Commit changes
              </button>
            </div>
            <div className="card bg-light card-body mb-3">
              <div className="card-header">
                <h3>
                  Copy from an existing repo's labels (Optional)
                </h3>
              </div>
              <div className="form-text text-muted">
                You can copy labels from any repo and modify them before committing to your repo.
              </div>
              <div>
                <form>
                  <div className="form-group">
                    <label htmlFor="targetOwner" className="bmd-label-floating">
                      Repo owner
                    </label>
                    <input type="text" className="form-control" id="copyFromOwner" />
                    <span className="bmd-help">
                      Such as: Badwater-Apps
                    </span>
                  </div>
                  <div className="form-group">
                    <label htmlFor="targetRepo" className="bmd-label-floating">
                      Repo
                    </label>
                    <input type="text" className="form-control" id="copyFromRepo" />
                    <span className="bmd-help">
                      Such as: template-for-label-and-milestone-1
                    </span>
                  </div>
                </form>
                <button id="copy-labels-from" type="button" className="btn btn-outline-info btn-block" data-loading-text="Adding...">
                  Copy labels
                </button>
                <button id="copy-milestones-from" type="button" className="btn btn-outline-info btn-block" data-loading-text="Adding...">
                  Copy milestones
                </button>
                <button id="delete-and-copy-labels-from" type="button" className="btn btn-outline-info btn-block" data-loading-text="Cloning...">
                  Delete all existing labels and copy
                </button>
                <button id="delete-and-copy-milestones-from" type="button" className="btn btn-outline-info btn-block" data-loading-text="Cloning...">
                  Delete all existing milestones and copy
                </button>
              </div>
            </div>
          </div>
          <div className="col-12 col-lg-7">
            <div className="card bg-light card-body mb-3">
              <div className="card-header">
                <h3>
                  Which repo is in use?
                </h3>
              </div>
              <span id="which-repo-in-use">
                Not using any yet!
              </span>
            </div>
            <div className="card bg-light card-body mb-3">
              <ul className="nav nav-tabs nav-justified" id="nav-tab" role="tablist">
                <li className="nav-item">
                  <a className="nav-link active" id="labels-tab" data-toggle="tab" href="#labels-form" role="tab" aria-controls="labels-form" aria-selected="true">
                    Labels
                  </a>
                </li>
                <li className="nav-item">
                  <a className="nav-link" id="milestones-tab" data-toggle="tab" href="#milestones-form" role="tab" aria-controls="milestones-form" aria-selected="false">
                    Milestones
                  </a>
                </li>
                <li className="nav-item">
                  <a className="nav-link" id="faq-tab" data-toggle="tab" href="#faq-form" role="tab" aria-controls="faq-form" aria-selected="false">
                    FAQ
                  </a>
                </li>
              </ul>
              <div className="card-body">
                <div className="tab-content" id="nav-tab-content">
                  <div className="tab-pane active" id="labels-form" role="tabpanel" aria-labelledby="labels-tab">
                    <button id="delete-all-labels" type="button" className="btn btn-outline-danger btn-block" data-loading-text="Deleting...">
                      Delete all labels
                    </button>
                    <button id="revert-labels-to-original" type="button" className="btn btn-outline-warning btn-block" data-loading-text="Resetting...">
                      Revert labels to original
                    </button>
                    <button id="add-new-label-entry" type="button" className="btn btn-outline-success btn-block mb-3">
                      Add a new label
                    </button>
                    <form id="form-labels" className="form-inline" />
                  </div>
                  <div className="tab-pane" id="milestones-form" role="tabpanel" aria-labelledby="milestones-tab">
                    <button id="delete-all-milestones" type="button" className="btn btn-outline-danger btn-block" data-loading-text="Deleting...">
                      Delete all milestones
                    </button>
                    <button id="revert-milestones-to-original" type="button" className="btn btn-outline-warning btn-block" data-loading-text="Resetting...">
                      Revert milestones to original
                    </button>
                    <button id="add-new-milestone-entry" type="button" className="btn btn-outline-success btn-block mb-3">
                      Add a new milestone
                    </button>
                    <form id="form-milestones" className="form-inline" />
                  </div>
                  <div className="tab-pane" id="faq-form" role="tabpanel" aria-labelledby="faq-tab">
                    <div className="card-header">
                      <h3>
                        How this web app works?
                      </h3>
                    </div>
                    <div id="collapse-card-token-safety">
                      <div className="card-body">
                        <p>
                          This web app works by making cross-site requests to Github's API. You can also download this website and use it on your localhost.
                        </p>
                      </div>
                    </div>
                    <div className="card-header">
                      <h3>
                        Is my personal access token safe?
                      </h3>
                    </div>
                    <div>
                      <div className="card-body">
                        <p>
                          This web app authenticates to Github API via <strong>HTTP Basic Authentication</strong>, but all API calls are done over <strong>SSL</strong>, so your personal access token is safe.
                        </p>
                        <p>
                          Although you can use your password in lieu of a personal access token, it is highly encouraged to use a personal access token.
                        </p>
                        <p>
                          <a href="https://help.github.com/en/github/authenticating-to-github/creating-a-personal-access-token-for-the-command-line" target="_blank">
                            How to create a personal access token?
                          </a>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default Cards;
