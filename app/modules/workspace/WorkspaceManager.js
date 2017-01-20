import WorkspaceFilterBuilder from './WorkspaceFilter';

const WorkspaceManager = {
  /**
   * @returns {Promise}
   */
  getWorkspaceFilter() {
    const wsFilterBuilder = new WorkspaceFilterBuilder();
    return wsFilterBuilder.getDBFilter();
  }
}

module.exports = WorkspaceManager;
