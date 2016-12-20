import DatabaseManager from '../database/DatabaseManager';
import {COLLECTION_TEAMMEMBERS} from '../../utils/Constants';

/**
 * A simplified helper for "Team Member" storage for loading, searching / filtering and saving team members configs.
 */
const TeamMemberHelper = {

  /**
   * Find workspaces ids by user id
   * @param userId
   * @returns {Promise}
   */
  findWorkspaceIdsByUserId(userId) {
    console.log('findWorkspaceIdsByUserId');
    let filter = {"user-id": userId};
    return new Promise(function (resolve, reject) {
      let projections = {"workspace-id" : 1}
      DatabaseManager.findAll(filter, projections, COLLECTION_TEAMMEMBERS)
        .then((teamMembers) => {
          var wsIds = [];
          teamMembers.forEach((teamMember) => wsIds.add(teamMember.workspaceId));
          return wsIds;
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
    let filter = {"workspace-id": workspaceId};
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
    let filter = {"workspace-id": workspaceId, "user-id": userId};
    return this.findTeamMember(filter)
  },

  findAll(filter) {
    return new Promise(function (resolve, reject) {
      DatabaseManager.findAll(filter, COLLECTION_TEAMMEMBERS).then(resolve).catch(reject);
    });
  },

  /**
   * Find a teammber by a set of filter settings
   * @param filter filters to apply
   * @returns {Promise}
   */
  findTeamMember(filter) {
    console.log('findTeamMember');
    return new Promise(function (resolve, reject) {
      DatabaseManager.findOne(filter, COLLECTION_TEAMMEMBERS).then(resolve).catch(reject);
    });
  },

  /**
   * Save or update a team member config
   * @param teamMember team member
   * @returns {Promise}
   */
  saveOrUpdateTeamMember(teamMember) {
    console.log('saveOrUpdateWorkspace');
    return new Promise(function (resolve, reject) {
      DatabaseManager.saveOrUpdate(teamMember.id, teamMember, COLLECTION_TEAMMEMBERS, {}).then(resolve).catch(reject);
    });
  },

  /**
   * Delete a team member by id
   * @param id the team member id
   * @returns {Promise}
   */
  deleteById(id) {
    console.log('deleteById');
    return new Promise(function (resolve, reject) {
      DatabaseManager.removeById(id, COLLECTION_TEAMMEMBERS, {}).then(resolve).catch(reject);
    });
  }

};

module.exports = TeamMemberHelper;