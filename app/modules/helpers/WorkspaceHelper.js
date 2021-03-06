import { Constants } from 'amp-ui';
import * as DatabaseManager from '../database/DatabaseManager';
import * as TeamMemberHelper from './TeamMemberHelper';
import Logger from '../../modules/util/LoggerManager';

const logger = new Logger('Workspace helper');

/**
 * A simplified helper for "workspaces" storage for loading, searching / filtering and saving workspaces.
 * @author Nadejda Mandrescu
 */
const WorkspaceHelper = {

  /**
   * Find a workspace by Id
   * @param id workspace id
   * @returns {Promise}
   */
  findById(id) {
    logger.log('findById');
    const filter = { id };
    return this.findWorkspace(filter);
  },

  /**
   * Find a workspace by name
   * @param name workspace name
   * @returns {Promise}
   */
  findByName(name) {
    logger.log('findByName');
    const filter = { name };
    return this.findWorkspace(filter);
  },

  /**
   * Find workspaces by user id
   * @param userId
   * @returns {Promise}
   */
  findAllByUserId(userId) {
    logger.log('findAllByUserId');
    return TeamMemberHelper.findWorkspaceIdsByUserId(userId, true).then((workspacesIds) => {
      const filter = { id: { $in: workspacesIds } };
      return this.findAll(filter);
    });
  },

  findAll(filter, projections) {
    logger.log('findAll');
    return DatabaseManager.findAll(filter, Constants.COLLECTION_WORKPACES, projections);
  },

  /**
   * Find a workspace by a set of filter settings
   * @param filter filters to apply
   * @param projections fields to extract
   * @returns {Promise}
   */
  findWorkspace(filter, projections) {
    logger.log('findWorkspace');
    return DatabaseManager.findOne(filter, Constants.COLLECTION_WORKPACES, projections);
  },

  /**
   * Save or update a workspace
   * @param workspace workspace
   * @returns {Promise}
   */
  saveOrUpdateWorkspace(workspace) {
    logger.log('saveOrUpdateWorkspace');
    return DatabaseManager.saveOrUpdate(workspace.id, workspace, Constants.COLLECTION_WORKPACES);
  },

  /**
   * Delete a workspace by id
   * @param id workspace id
   * @returns {Promise}
   */
  deleteById(id) {
    logger.log('deleteById');
    return DatabaseManager.removeById(id, Constants.COLLECTION_WORKPACES);
  },

  /**
   * Replaces the entire list of workspaces
   * @param workspaces the workspaces collection to replace
   * @returns {Promise}
   */
  replaceWorkspaces(workspaces) {
    logger.log('replaceWorkspaces');
    return DatabaseManager.replaceCollection(workspaces, Constants.COLLECTION_WORKPACES);
  },

  /**
   * Saves or updates only the given list of workspaces
   * @param workspaces
   * @returns {Promise}
   * @see replaceWorkspaces
   */
  saveOrUpdateWorkspaces(workspaces) {
    logger.log('saveOrUpdateWorkspaces');
    return DatabaseManager.saveOrUpdateCollection(workspaces, Constants.COLLECTION_WORKPACES);
  }

};

module.exports = WorkspaceHelper;
