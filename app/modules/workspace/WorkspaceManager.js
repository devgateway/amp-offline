import WorkspaceFilterBuilder from './WorkspaceFilter';
import * as WorkspaceHelper from '../helpers/WorkspaceHelper';
import LoggerManager from '../../modules/util/LoggerManager';

const WorkspaceManager = {
  /**
   * @returns {Promise}
   */
  getWorkspaceFilter() {
    LoggerManager.log('getWorkspaceFilter');
    const wsFilterBuilder = new WorkspaceFilterBuilder();
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
