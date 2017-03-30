import WorkspaceFilterBuilder from './WorkspaceFilter';
import * as WorkspaceHelper from '../helpers/WorkspaceHelper';

const WorkspaceManager = {
  /**
   * @returns {Promise}
   */
  getWorkspaceFilter() {
    console.log('getWorkspaceFilter');
    const wsFilterBuilder = new WorkspaceFilterBuilder();
    return wsFilterBuilder.getDBFilter();
  },

  findWorkspaceById(wsId) {
    console.log('findWorkspaceById');
    return WorkspaceHelper.findById(wsId);
  },

  findAllWorkspacesForUser(userId) {
    console.log('findAllWorkspacesForUser');
    return WorkspaceHelper.findAllByUserId(userId, { id: 1, name: 1, 'workspace-group': 1 });
  }
};

module.exports = WorkspaceManager;
