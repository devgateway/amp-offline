import WorkspaceFilterBuilder from './WorkspaceFilter';
import * as WorkspaceHelper from '../helpers/WorkspaceHelper';

const WorkspaceManager = {
  /**
   * @returns {Promise}
   */
  getWorkspaceFilter() {
    const wsFilterBuilder = new WorkspaceFilterBuilder();
    return wsFilterBuilder.getDBFilter();
  },

  findWorkspaceById(wsId) {
    return WorkspaceHelper.findById(wsId);
  },

  findAllWorkspacesForUser() { // userId) {
    // we are receiving user id but we dont have implemented yet
    // the method to filter out ws for users so for now return all users
    return WorkspaceHelper.findAll({}, { id: 1, name: 1, 'workspace-group': 1 });
  }
};

module.exports = WorkspaceManager;
