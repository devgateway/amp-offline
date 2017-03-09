import DatabaseManager from '../database/DatabaseManager';
import { COLLECTION_TEAMMEMBERS } from '../../utils/Constants';

/**
 * A simplified helper for 'Team Member' storage for loading, searching / filtering and saving team members configs.
 */
const TeamMemberHelper = {

  /**
   * Find workspaces ids by user id
   * @param userId
   * @returns {Promise}
   */
  findWorkspaceIdsByUserId(userId) {
    console.log('findWorkspaceIdsByUserId');
    const filter = { 'user-id': userId };
    return new Promise((resolve, reject) => {
      const projections = { 'workspace-id': 1 }
      DatabaseManager.findAllWithProjections(filter, projections, COLLECTION_TEAMMEMBERS)
        .then((teamMembers) => {
          const wsIds = [];
          teamMembers.forEach((teamMember) => wsIds.push(teamMember['workspace-id']));
          resolve(wsIds);
        }).catch(reject);
    });
  },

  /**
   * Find all team members by workspace id
   * @param workspaceId
   * @returns {*}
   */
  findAllByWorkspaceId(workspaceId) {
    console.log('findAllByWorkspaceId');
    const filter = { 'workspace-id': workspaceId };
    return this.findAll(filter);
  },

  /**
   * Find a team member config by User and Workspace
   * @param userId
   * @param workspaceId
   * @returns {*|Promise}
   */
  findByUserAndWorkspaceId(userId, workspaceId) {
    console.log('findByUserAndWorkspaceId');
    const filter = { 'workspace-id': workspaceId, 'user-id': userId };
    return this.findTeamMember(filter);
  },

  findAll(filter) {
    console.log('findAll');
    return DatabaseManager.findAll(filter, COLLECTION_TEAMMEMBERS);
  },

  /**
   * Find a teammber by a set of filter settings
   * @param filter filters to apply
   * @returns {Promise}
   */
  findTeamMember(filter) {
    console.log('findTeamMember');
    return DatabaseManager.findOne(filter, COLLECTION_TEAMMEMBERS);
  },

  /**
   * Save or update a team member config
   * @param teamMember team member
   * @returns {Promise}
   */
  saveOrUpdateTeamMember(teamMember) {
    console.log('saveOrUpdateWorkspace');
    return DatabaseManager.saveOrUpdate(teamMember.id, teamMember, COLLECTION_TEAMMEMBERS, {});
  },

  saveOrUpdateTeamMembers(data) {
    console.log('saveOrUpdateTeamMembers');
    return DatabaseManager.saveOrUpdateCollection(data, COLLECTION_TEAMMEMBERS);
  },

  /**
   * Delete a team member by id
   * @param id the team member id
   * @returns {Promise}
   */
  deleteById(id) {
    console.log('deleteById');
    return DatabaseManager.removeById(id, COLLECTION_TEAMMEMBERS);
  }

};

module.exports = TeamMemberHelper;
