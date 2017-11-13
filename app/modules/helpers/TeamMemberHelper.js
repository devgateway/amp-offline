import * as DatabaseManager from '../database/DatabaseManager';
import { COLLECTION_TEAMMEMBERS } from '../../utils/Constants';
import { flattenToListByKey } from '../../utils/Utils';
import Logger from '../../modules/util/LoggerManager';

const logger = new Logger('Team member helper');

/**
 * A simplified helper for 'Team Member' storage for loading, searching / filtering and saving team members configs.
 */
const TeamMemberHelper = {

  /**
   * Find workspaces ids by user id
   * @param userId
   * @param excludeDelete if to exclude deleted team members or not (false by default)
   * @returns {Promise}
   */
  findWorkspaceIdsByUserId(userId, excludeDelete = false) {
    logger.debug('findWorkspaceIdsByUserId');
    let filter = { 'user-id': userId };
    const projections = { 'workspace-id': 1 };
    if (excludeDelete) {
      filter = { ...filter, ...this._getExcludeDeletedFilter() };
    }
    return DatabaseManager.findAll(filter, COLLECTION_TEAMMEMBERS, projections)
      .then((teamMembers) => flattenToListByKey(teamMembers, 'workspace-id'));
  },

  /**
   * Find all team members by workspace id
   * @param workspaceId
   * @param excludeDelete if to exclude deleted team members or not (false by default)
   * @returns {Promise}
   */
  findAllByWorkspaceId(workspaceId, excludeDelete = false) {
    logger.debug('findAllByWorkspaceId');
    let filter = { 'workspace-id': workspaceId };
    if (excludeDelete) {
      filter = { ...filter, ...this._getExcludeDeletedFilter() };
    }
    return this.findAll(filter);
  },

  /**
   * Find a team member config by User and Workspace
   * @param userId
   * @param workspaceId
   * @param excludeDelete if to exclude deleted team members or not (false by default)
   * @returns {*|Promise}
   */
  findByUserAndWorkspaceId(userId, workspaceId, excludeDelete = false) {
    logger.debug('findByUserAndWorkspaceId');
    const filter = { $and: [{ 'workspace-id': workspaceId }, { 'user-id': userId }] };
    if (excludeDelete) {
      filter.$and.push(this._getExcludeDeletedFilter());
    }
    return this.findTeamMember(filter);
  },

  findAll(filter) {
    logger.debug('findAll');
    return DatabaseManager.findAll(filter, COLLECTION_TEAMMEMBERS);
  },

  /**
   * Find a teammber by a set of filter settings
   * @param filter filters to apply
   * @returns {Promise}
   */
  findTeamMember(filter) {
    logger.debug('findTeamMember');
    return DatabaseManager.findOne(filter, COLLECTION_TEAMMEMBERS);
  },

  _getExcludeDeletedFilter() {
    return { deleted: { $ne: true } };
  },

  /**
   * Save or update a team member config
   * @param teamMember team member
   * @returns {Promise}
   */
  saveOrUpdateTeamMember(teamMember) {
    logger.log('saveOrUpdateWorkspace');
    return DatabaseManager.saveOrUpdate(teamMember.id, teamMember, COLLECTION_TEAMMEMBERS, {});
  },

  saveOrUpdateTeamMembers(data) {
    logger.log('saveOrUpdateTeamMembers');
    return DatabaseManager.saveOrUpdateCollection(data, COLLECTION_TEAMMEMBERS);
  },

  /**
   * Delete a team member by id
   * @param id the team member id
   * @returns {Promise}
   */
  deleteById(id) {
    logger.log('deleteById');
    return DatabaseManager.removeById(id, COLLECTION_TEAMMEMBERS, {});
  },

  deleteByIds(ids) {
    logger.log('deleteByIds');
    const filter = { id: { $in: ids } };
    return DatabaseManager.removeAll(filter, COLLECTION_TEAMMEMBERS, {});
  }

};

module.exports = TeamMemberHelper;
