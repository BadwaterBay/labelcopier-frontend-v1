const dashboardCard = () => {
  return `
    <div class="card bg-light card-body mb-3">
      <div class="card-header">
        <h3>
          Which repository is in use?
        </h3>
      </div>
      <div id="which-repo-in-use" class="form-text text-muted">
        Not using any yet
      </div>
    </div>
  `;
};

export default dashboardCard;
