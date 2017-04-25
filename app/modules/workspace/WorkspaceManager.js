import WorkspaceFilterBuilder from '../filters/WorkspaceFilter';
import * as WorkspaceHelper from '../helpers/WorkspaceHelper';
import LoggerManager from '../../modules/util/LoggerManager';

const WorkspaceManager = {
  /**
   * @returns {Promise}
   */
  getWorkspaceFilter(workspace) {
    LoggerManager.log('getWorkspaceFilter');
    const wsFilterBuilder = new WorkspaceFilterBuilder(workspace);
    return wsFilterBuilder.getDBFilter();
  },

  findWorkspaceById(wsId) {
    LoggerManager.log('findWorkspaceById');
    return WorkspaceHelper.findById(wsId);
  },

  findAllWorkspacesForUser(userId) {
    LoggerManager.log('findAllWorkspacesForUser');
    return WorkspaceHelper.findAllByUserId(userId, { id: 1, name: 1, 'workspace-group': 1 });
  }
};

module.exports = WorkspaceManager;
