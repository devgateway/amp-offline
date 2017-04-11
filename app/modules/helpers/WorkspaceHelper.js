import * as DatabaseManager from '../database/DatabaseManager';
import * as TeamMemberHelper from './TeamMemberHelper';
import { COLLECTION_WORKPACES } from '../../utils/Constants';
import LoggerManager from '../../modules/util/LoggerManager';

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
    LoggerManager.log('findById');
    const filter = { id };
    return this.findWorkspace(filter);
  },

  /**
   * Find a workspace by name
   * @param name workspace name
   * @returns {Promise}
   */
  findByName(name) {
    LoggerManager.log('findByName');
    const filter = { name };
    return this.findWorkspace(filter);
  },

  /**
   * Find workspaces by user id
   * @param userId
   * @returns {Promise}
   */
  findAllByUserId(userId) {
    LoggerManager.log('findAllByUserId');
    return TeamMemberHelper.findWorkspaceIdsByUserId(userId).then((workspacesIds) => {
      const filter = { id: { $in: workspacesIds } };
      return this.findAll(filter);
    });
  },

  findAll(filter, projections) {
    LoggerManager.log('findAll');
    return DatabaseManager.findAll(filter, COLLECTION_WORKPACES, projections);
  },

  /**
   * Find a workspace by a set of filter settings
   * @param filter filters to apply
   * @param projections fields to extract
   * @returns {Promise}
   */
  findWorkspace(filter, projections) {
    LoggerManager.log('findWorkspace');
    return DatabaseManager.findOne(filter, COLLECTION_WORKPACES, projections);
  },

  /**
   * Save or update a workspace
   * @param workspace workspace
   * @returns {Promise}
   */
  saveOrUpdateWorkspace(workspace) {
    LoggerManager.log('saveOrUpdateWorkspace');
    return DatabaseManager.saveOrUpdate(workspace.id, workspace, COLLECTION_WORKPACES);
  },

  /**
   * Delete a workspace by id
   * @param id workspace id
   * @returns {Promise}
   */
  deleteById(id) {
    LoggerManager.log('deleteById');
    return DatabaseManager.removeById(id, COLLECTION_WORKPACES);
  },

  /**
   * Replaces the entire list of workspaces
   * @param workspaces the workspaces collection to replace
   * @returns {Promise}
   */
  replaceWorkspaces(workspaces) {
    LoggerManager.log('replaceWorkspaces');
    return DatabaseManager.replaceCollection(workspaces, COLLECTION_WORKPACES);
  },

  /**
   * Saves or updates only the given list of workspaces
   * @param workspaces
   * @returns {Promise}
   * @see replaceWorkspaces
   */
  saveOrUpdateWorkspaces(workspaces) {
    LoggerManager.log('saveOrUpdateWorkspaces');
    return DatabaseManager.saveOrUpdateCollection(workspaces, COLLECTION_WORKPACES);
  }

};

module.exports = WorkspaceHelper;
