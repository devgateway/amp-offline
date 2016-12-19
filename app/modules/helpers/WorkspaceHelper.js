import DatabaseManager from '../database/DatabaseManager';
import TeamMemberHelper from './TeamMemberHelper';
import {COLLECTION_WORKPACES} from '../../utils/Constants';

/**
 * A simplified helper for "workspaces" storage for loading, searching / filtering and saving workspaces.
 */
const WorkspaceHelper = {

  /**
   * Find a workspace by Id
   * @param id workspace id
   * @returns {Promise}
   */
  findById(id) {
    console.log('findById');
    let filter = {id: id};
    return this.findWorkspace(filter);
  },

  /**
   * Find a workspace by name
   * @param name workspace name
   * @returns {Promise}
   */
  findByName(name) {
    console.log('findByName');
    let filter = {name: name};
    return this.findWorkspace(filter);
  },

  /**
   * Find workspaces by user id
   * @param userId
   * @returns {Promise}
   */
  findAllByUserId(userId) {
    console.log('findAllByUserId');
    return new Promise(function (resolve, reject) {
      TeamMemberHelper.findWorkspaceIdsByUserId(userId).then((workspacesIds) => {
        let filter = {id: {$in: workspacesIds}};
        return this.findAll(filter);
        }
      ).catch(reject);
    });
  },

  findAll(filter) {
    console.log('findAll');
    return new Promise(function (resolve, reject) {
      DatabaseManager.findAll(filter, COLLECTION_WORKPACES).then(resolve).catch(reject);
    });
  },

  /**
   * Find a workspace by a set of filter settings
   * @param filter filters to apply
   * @returns {Promise}
   */
  findWorkspace(filter) {
    console.log('findWorkspace');
    return new Promise(function (resolve, reject) {
      DatabaseManager.findOne(filter, COLLECTION_WORKPACES).then(resolve).catch(reject);
    });
  },

  /**
   * Save or update a workspace
   * @param workspace workspace
   * @returns {Promise}
   */
  saveOrUpdateWorkspace(workspace) {
    console.log('saveOrUpdateWorkspace');
    return new Promise(function (resolve, reject) {
      DatabaseManager.saveOrUpdate(workspace.id, workspace, COLLECTION_WORKPACES, {}).then(resolve).catch(reject);
    });
  },

  /**
   * Delete a workspace by id
   * @param id workspace id
   * @returns {Promise}
   */
  deleteById(id) {
    console.log('deleteById');
    return new Promise(function (resolve, reject) {
      DatabaseManager.removeById(id, COLLECTION_WORKPACES, {}).then(resolve).catch(reject);
    });
  },

  /**
   * Replaces the entire list of workspaces
   * @param workspaces the workspaces collection to replace
   * @returns {Promise}
   */
  replaceWorkspaces(workspaces) {
    console.log('replaceWorkspaces');
    return new Promise(function (resolve, reject) {
      DatabaseManager.replaceCollection(workspaces, COLLECTION_WORKPACES, {}).then(resolve).catch(reject);
    });
  },

  /**
   * TODO: not expecting this one to be useful
   * Saves or updates only the given list of workspaces
   * @param workspaces
   * @returns {Promise}
   * @see replaceWorkspaces
   */
  saveOrUpdateWorkspaces(workspaces) {
    console.log('saveOrUpdateWorkspaces');
    return new Promise(function (resolve, reject) {
      DatabaseManager.saveOrUpdateCollection(workspaces, COLLECTION_WORKPACES, {}).then(resolve).catch(reject);
    });
  }

};

module.exports = WorkspaceHelper;
