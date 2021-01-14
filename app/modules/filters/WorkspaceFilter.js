import { ActivityConstants, Constants, ValueConstants, FieldPathConstants, FieldsManager } from 'amp-ui';
import * as WorkspaceHelper from '../helpers/WorkspaceHelper';
import Utils from '../../utils/Utils';
import ActivityFilter from './ActivityFilter';
import { IS_COMPUTED, IS_PRIVATE } from '../../utils/constants/WorkspaceConstants';
import LoggerManager from '../util/LoggerManager';
import * as FieldsHelper from '../helpers/FieldsHelper';
import PossibleValuesHelper from '../helpers/PossibleValuesHelper';

const logger = new LoggerManager('Workspace filter');

/**
 * Workspace Filter class
 * Counterpart for WorkspaceFilter.java
 * @author Nadejda Mandrescu
 */
export default class WorkspaceFilterBuilder {
  static getDBFilter(workspace, teamMemberId, currentLanguage) {
    return (new WorkspaceFilterBuilder(workspace, teamMemberId, currentLanguage)).getDBFilter();
  }

  constructor(workspace, teamMemberId, currentLanguage) {
    this._workspace = workspace;
    this._teamMemberId = teamMemberId;
    this._isComputed = this._workspace && this._workspace[IS_COMPUTED] === true;
    this._isPrivate = this._workspace && this._workspace[IS_PRIVATE] === true;
    this._wsFilters = this._workspace ? this._workspace['workspace-filters'] : undefined;
    this._currentLanguage = currentLanguage;
  }

  /**
   * Workspace Filter as a promise
   * @returns {Promise}
   */
  getDBFilter() {
    logger.log('getDBFilter');
    if (!this._workspace) {
      return Promise.resolve({});
    }
    return this._prepareFilters().then(() => this._generateDBFilter());
  }

  _prepareFilters() {
    const privateWSFilter = Utils.toMap(IS_PRIVATE, true);
    return Promise.all([this._getActivityFiltersPromise(), WorkspaceHelper.findAll(privateWSFilter, { id: 1 })])
      .then(([activityDbFilter, privateWorkspaces]) => {
        this._activityDbFilter = activityDbFilter == null ||
        (Object.keys(activityDbFilter).length === 0 && activityDbFilter.constructor === Object)
          ? null : activityDbFilter;
        this._privateWorkspaces = Utils.flattenToListByKey(privateWorkspaces, 'id');
        return activityDbFilter;
      });
  }

  _getActivityFiltersPromise() {
    if (this._isComputed && this._wsFilters && this._workspace['use-filter'] === true) {
      const possibleValuesPaths = FieldPathConstants.ADJUSTMENT_TYPE_PATHS;
      const pvFilter = possibleValuesPaths ? { id: { $in: possibleValuesPaths } } : {};
      return Promise.all([
        FieldsHelper.findByWorkspaceMemberIdAndType(this._workspace.id, Constants.SYNCUP_TYPE_ACTIVITY_FIELDS),
        PossibleValuesHelper.findAll(pvFilter),
      ]).then(([fieldsDef, pvs]) => {
        const fieldsManager = new FieldsManager(fieldsDef[Constants.SYNCUP_TYPE_ACTIVITY_FIELDS],
          pvs, this._currentLanguage, LoggerManager);
        return (new ActivityFilter(this._wsFilters, fieldsManager)).getDBFilter();
      });
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
    logger.log('_generateDBFilter');
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
    if (!this._isPrivate) {
      const excludeFromPrivateWS = Utils.toMap(ActivityConstants.TEAM, { $nin: this._privateWorkspaces });
      dbFilter = { $and: [dbFilter, excludeFromPrivateWS] };
    }
    return dbFilter;
  }

  _getComputedOrgsFilter() {
    logger.log('_getComputedOrgsFilter');
    let computedOrgsFilter;
    const orgIds = this._workspace.organizations;
    if (orgIds && orgIds.length > 0) {
      // build activity orgs filter
      const activityOrgs = [];
      ActivityConstants.toFieldNames(ValueConstants.ORG_ROLE_NAMES).forEach(orgField => {
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
        computedOrgsFilter = { $and: [{ $or: activityOrgs }, isDraftFilter] };
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
            logger.log(wsId);
            processedWsIds.add(wsId);

            WorkspaceHelper.findAll({ 'parent-workspace-id': wsId }, { id: 1 }).then(childWsIds => {
              const idsList = childWsIds.map(ws => ws.id);
              return self._getChildrenWorkspaces(idsList, processedWsIds).then(result => resolve(result));
            }).catch(reject);
          }
          return processedWsIds;
        }),
          Promise.resolve(processedWsIds)).then(() => {
            logger.log('done');
            return processedWsIds;
          }, (e) => {
            logger.error(e);
            reject(e);
          })
      ));
  }
}
