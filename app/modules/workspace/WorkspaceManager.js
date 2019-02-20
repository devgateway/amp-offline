import WorkspaceFilterBuilder from '../filters/WorkspaceFilter';
import * as WorkspaceHelper from '../helpers/WorkspaceHelper';
import Logger from '../../modules/util/LoggerManager';

const logger = new Logger('Workspace manager');

const WorkspaceManager = {
  /**
   * @returns {Promise}
   */
  getWorkspaceFilter(workspace, teamMemberId = 0) {
    logger.log('getWorkspaceFilter');
    const wsFilterBuilder = new WorkspaceFilterBuilder(workspace, teamMemberId);
    return wsFilterBuilder.getDBFilter();
  },

  findWorkspaceById(wsId) {
    logger.log('findWorkspaceById');
    return WorkspaceHelper.findById(wsId);
  },

  findAllWorkspacesForUser(userId) {
    logger.log('findAllWorkspacesForUser');
    return WorkspaceHelper.findAllByUserId(userId, { id: 1, name: 1, 'workspace-group': 1 });
  }
};

module.exports = WorkspaceManager;
