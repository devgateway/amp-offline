import * as WorkspaceHelper from '../helpers/WorkspaceHelper';
import Utils from '../../utils/Utils';
import * as ActivityConstants from '../../utils/constants/ActivityConstants';
import ActivityFilter from './ActivityFilter';
import LoggerManager from '../util/LoggerManager';

/**
 * Workspace Filter class
 * Counterpart for WorkspaceFilter.java
 * @author Nadejda Mandrescu
 */
export default class WorkspaceFilterBuilder {
  static getDBFilter(workspace) {
    return (new WorkspaceFilterBuilder(workspace)).getDBFilter();
  }

  constructor(workspace) {
    this._workspace = workspace;
    this._isComputed = this._workspace && this._workspace['is-computed'] === true;
    this._wsFilters = this._workspace ? this._workspace['workspace-filters'] : undefined;
  }

  /**
   * Workspace Filter as a promise
   * @returns {Promise}
   */
  getDBFilter() {
    LoggerManager.log('getDBFilter');
    return new Promise((resolve, reject) => {
      if (!this._workspace) {
        return resolve({});
      }
      return this._prepareFilters().then(() => resolve(this._generateDBFilter())).catch(reject);
    });
  }

  _prepareFilters() {
    const self = this;
    return new Promise((resolve, reject) =>
      self._getActivityFiltersPromise().then(activityDbFilter => {
        self._activityDbFilter = activityDbFilter;
        return resolve(self._activityDbFilter);
      }).catch(reject));
  }

  _getActivityFiltersPromise() {
    if (this._isComputed && this._wsFilters && this._workspace['use-filter'] === true) {
      return (new ActivityFilter(this._wsFilters)).getDBFilter();
    }
    return Promise.resolve();
  }

  /**
   * Generates final workspace filter.
   * This is based on AmpARFilter.processTeamFilter and WorkspaceFilter.getGeneratedQuery() from AMP.
   * It is without Management workspaces logic, that won't be used in AMP Offline, at least for now.
   * Notes:
   *  used_approval_status: is not coming from Legacy Filters and is true only for management workspaces
   *  isolated_filter: is not needed, since we don't sync private workspaces
   * @private
   */
  _generateDBFilter() {
    LoggerManager.log('_generateDBFilter');
    // initialise the team filter (no special Management workspaces rules are needed)
    const teamFilter = Utils.toMap(ActivityConstants.TEAM, this._workspace.id);
    // non-computed workspace filter
    let dbFilter = teamFilter;
    // Add computed filters if needed
    if (this._isComputed) {
      // computed with filters
      if (this._activityDbFilter) {
        dbFilter = { $or: [teamFilter, this._activityDbFilter] };
      } else {
        // computed with organisations
        const computedOrgsTeamFilter = this._getComputedOrgsFilter();
        if (computedOrgsTeamFilter) {
          dbFilter = { $or: [teamFilter, computedOrgsTeamFilter] };
        }
      }
    }
    return dbFilter;
  }

  _getComputedOrgsFilter() {
    LoggerManager.log('_getComputedOrgsFilter');
    let computedOrgsFilter;
    const orgIds = this._workspace.organizations;
    if (orgIds && orgIds.length > 0) {
      // build activity orgs filter
      const activityOrgs = [];
      ActivityConstants.ORG_ROLE_FIELDS.forEach(orgField => {
        const orgFilter = Utils.toMap(ActivityConstants.ORG_ROLE_ORG_ID, { $in: orgIds });
        const orgRoleFilter = Utils.toMap(orgField, { $elemMatch: orgFilter });
        activityOrgs.push(orgRoleFilter);
      });
      const fundingDonorOrgFilter = Utils.toMap(ActivityConstants.FUNDING_DONOR_ORG_ID, { $in: orgIds });
      const fundingOrgs = Utils.toMap(ActivityConstants.FUNDINGS, { $elemMatch: fundingDonorOrgFilter });
      activityOrgs.push(fundingOrgs);
      // add draft flag if needed
      if (this._workspace['hide-draft'] === true) {
        const isDraftFilter = Utils.toMap(ActivityConstants.IS_DRAFT, { $ne: true });
        computedOrgsFilter = { $or: { $and: [activityOrgs, isDraftFilter] } };
      } else {
        computedOrgsFilter = { $or: activityOrgs };
      }
    }
    return computedOrgsFilter;
  }

  /**
   * ******************************************************************************* NOT USED
   * Builds children workspaces for a Management Workspace
   * Note: not used, but keeping for potential needs since already implemented
   * @param wsIds
   * @param processedWsIds
   * @returns {Promise}
   * @private
   */
  _getChildrenWorkspaces(wsIds, processedWsIds) {
    const self = this;
    return new Promise((resolve, reject) =>
    wsIds.reduce((promise, wsId) =>
      promise.then(() => new Promise(() => {
        if (!processedWsIds.has(wsId)) {
          LoggerManager.log(wsId);
          processedWsIds.add(wsId);

          WorkspaceHelper.findAll({ 'parent-workspace-id': wsId }, { id: 1 }).then(childWsIds => {
            const idsList = childWsIds.map(ws => ws.id);
            return self._getChildrenWorkspaces(idsList, processedWsIds).then(result => resolve(result));
          }).catch(reject);
        }
        return processedWsIds;
      }),
      Promise.resolve(processedWsIds)).then(() => {
        LoggerManager.log('done');
        return processedWsIds;
      }, (e) => {
        LoggerManager.error(e);
        reject(e);
      })
    ));
  }
}
