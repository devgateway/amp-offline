import { ActivityConstants, ErrorConstants, FieldPathConstants } from 'amp-ui';
import { SHOW_WORKSPACE_FILTER_KEY, FILTER_BY_DATE_HIDE_PROJECTS } from '../../utils/constants/GlobalSettingsConstants';
import * as Utils from '../../utils/Utils';
import Notification from '../helpers/NotificationHelper';
import * as GlobalSettingsHelper from '../helpers/GlobalSettingsHelper';
import PossibleValuesHelper from '../helpers/PossibleValuesHelper';
import Logger from '../../modules/util/LoggerManager';
import ApprovalStatus from '../../utils/constants/ApprovalStatus';
import FieldsManager from '../field/FieldsManager';

const logger = new Logger('Activity filter');

/**
 * Activity Filter class
 * Counterpart for AmpARFilter.java
 * @author Nadejda Mandrescu
 */
export default class ActivityFilter {

  constructor(filters, fieldsManager: FieldsManager) {
    this._filters = filters;
    this._fieldsManager = fieldsManager;
    this._dbFilter = undefined;
    this._dateFilterHidesProjects = undefined;
    this._locationOptions = undefined;
    this._isComputed = filters && filters['is-computed'] === true;
  }

  getDBFilter() {
    logger.log('getDBFilter');
    const self = this;
    return new Promise((resolve, reject) => {
      if (self._dbFilter === undefined && self._filters) {
        self._prepareFilter().then(() => {
          self._dbFilter = self._generateFilter();
          return resolve(self._dbFilter);
        }).catch(reject);
      } else {
        resolve(self._dbFilter);
      }
    });
  }

  _prepareFilter() {
    logger.log('_prepareFilter');
    return Promise.all([
      this._getWorkspaces(),
      GlobalSettingsHelper.findByKey(FILTER_BY_DATE_HIDE_PROJECTS),
      PossibleValuesHelper.findById(FieldPathConstants.LOCATION_PATH)
    ])
      .then(([workspaces, dateFilterHidesProjects, locationOptions]) => {
        this._wsIds = workspaces;
        this._dateFilterHidesProjects = (dateFilterHidesProjects && dateFilterHidesProjects.value === 'true');
        if (locationOptions && locationOptions[FieldPathConstants.FIELD_OPTIONS]) {
          this._locationOptions = locationOptions[FieldPathConstants.FIELD_OPTIONS];
        } else {
          this._locationOptions = [];
        }
        return this._wsIds;
      });
  }

  _getWorkspaces() {
    logger.log('_getWorkspaces');
    return GlobalSettingsHelper.findByKey(SHOW_WORKSPACE_FILTER_KEY).then((showWSFilterInTeamWS) => {
      if ((showWSFilterInTeamWS && showWSFilterInTeamWS.value === 'true') || this._isComputed) {
        return this._filters.workspaces;
      }
      return null;
    });
  }

  /**
   * This is equivalent to AmpARFilter.generateFilterQuery
   * @private
   */
  _generateFilter() {
    logger.log('_generateFilter');
    this._tmpFilter = (this._wsIds && this._wsIds.length > 0) ?
      Utils.toMap(ActivityConstants.TEAM, { $in: this._wsIds }) : {};

    // note that some filters were not replicated since they are obsolete (AMP-25215)
    // or either irrelevant (pledges)

    /* Note: we won't rebuild  all date filters based on dynamic filter per clarification with Vanessa G.
     Once New Filter Widget will replace legacy filer widget in Admin, this feature will be gone.
     It can be tricky due to timstamp mistmatch between server and client when building the dynamic filter.
     But if needed, build this._updateDynamicFilters(); + reset filters at midnight
     */

    this._addGeneralFilters();
    this._addDateFilters();
    this._addSectorFilters();
    /*
    // TODO turns out locations are saved in expanded mode, iteration 2+, AMPOFFLINE-180
    this._filters.locationSelected =
      PossibleValuesManager.expandParentWithChildren(this._locationOptions, this._filters.locationSelected);
      */
    this._addListMapValueFilter(ActivityConstants.LOCATIONS, ActivityConstants.LOCATION, '$in', 'locationSelected');
    this._addProgramFilters();
    this._addOrgsFilters();
    this._addApprovalStatusFilter('approvalStatusSelected');
    this._addFundingsFilter();

    // TODO add indexText search (also where 'text' filter comes from?), iteration2+, AMPOFFLINE-377
    // TODO add 'risks' filter once it ME is implemented in Activities API, iteration 2+, AMPOFFLINE-376

    return this._tmpFilter;
  }

  _addGeneralFilters() {
    logger.log('_addGeneralFilters');
    this._addValueFilter(ActivityConstants.ARCHIVED, getEqOrNe(this._filters.showArchived), 'showArchived', null, true);
    this._addValueFilter(ActivityConstants.HUMANITARIAN_AID, '$in', 'humanitarianAid', null,
      listToBoolean(this._filters.humanitarianAid));
    this._addValueFilter(ActivityConstants.GOVERNMENT_APPROVAL_PROCEDURES,
      getEqOrNe(this._filters.governmentApprovalProcedures),
      'governmentApprovalProcedures', null, true);
    this._addValueFilter(ActivityConstants.JOINT_CRITERIA, getEqOrNe(this._filters.jointCriteria),
      'jointCriteria', null, true);

    this._addValueFilter(ActivityConstants.ACTIVITY_BUDGET, '$in', 'budget');
    this._addValueFilter(ActivityConstants.ACTIVITY_STATUS, '$in', 'statuses');
    this._addValueFilter(ActivityConstants.PROJECT_CATEGORY, '$in', 'projectCategory');
    this._addValueFilter(ActivityConstants.PROJECT_IMPLEMENTING_UNIT, '$in', 'projectImplementingUnits');
    this._addValueFilter(ActivityConstants.MODALITIES, '$in', 'aidModalities');
    this._addValueFilter(ActivityConstants.LINE_MINISTRY_RANK, '$in', 'lineMinRank');
  }

  _addDateFilters() {
    logger.log('_addDateFilters');
    this._addYearFilter(ActivityConstants.ACTUAL_APPROVAL_DATE, 'actualAppYear');

    // both 'toXXX' and filter dates timestamps are zeros, so it should work. But caution if smt changes
    this._addValueFilter(ActivityConstants.ACTUAL_START_DATE, '$gte', 'fromActivityStartDate');
    this._addValueFilter(ActivityConstants.ACTUAL_START_DATE, '$lte', 'toActivityStartDate');

    this._addValueFilter(ActivityConstants.ACTUAL_COMPLETION_DATE, '$gte', 'fromActivityActualCompletionDate');
    this._addValueFilter(ActivityConstants.ACTUAL_COMPLETION_DATE, '$lte', 'toActivityActualCompletionDate');

    this._addValueFilter(ActivityConstants.CONTRACTING_DATE, '$gte', 'fromActivityFinalContractingDate');
    this._addValueFilter(ActivityConstants.CONTRACTING_DATE, '$lte', 'toActivityFinalContractingDate');

    this._addValueFilter(ActivityConstants.PROPOSED_APPROVAL_DATE, '$gte', 'fromProposedApprovalDate');
    this._addValueFilter(ActivityConstants.PROPOSED_APPROVAL_DATE, '$lte', 'toProposedApprovalDate');
  }

  _addSectorFilters() {
    logger.log('_addSectorFilters');
    /* TODO: this is a bug, but for consistency keeping the same filters. Iteration 2+, AMPOFFLINE-180
     When sector "A" from level 1 is selected, then filter saves all descendants (e.g. A1, A2, etc.) automatically.
     Thus when a new sector, e.g. A101 is added to "A", then it will be filtered out from results.
     On the other hand, locations and programs descendants are built at filtering time, not saved.
     */
    this._addListMapValueFilter(ActivityConstants.PRIMARY_SECTORS, ActivityConstants.SECTOR, '$in', 'sectors');
    this._addListMapValueFilter(ActivityConstants.SECONDARY_SECTORS, ActivityConstants.SECTOR, '$in',
      'secondarySectors');
    this._addListMapValueFilter(ActivityConstants.TERTIARY_SECTORS, ActivityConstants.SECTOR, '$in', 'tertiarySectors');
    this._addListMapValueFilter(ActivityConstants.TAG_SECTORS, ActivityConstants.SECTOR, '$in', 'tagSectors');
  }

  _addProgramFilters() {
    logger.log('_addProgramFilters');
    // TODO: expand with descendants program filters once the full programs tree is available, AMPOFFLINE-378
    this._addListMapValueFilter(ActivityConstants.NATIONAL_PLAN_OBJECTIVE, ActivityConstants.PROGRAM, '$in',
      'nationalPlanningObjectives');
    this._addListMapValueFilter(ActivityConstants.PRIMARY_PROGRAMS, ActivityConstants.PROGRAM, '$in',
      'primaryPrograms');
    this._addListMapValueFilter(ActivityConstants.SECONDARY_PROGRAMS, ActivityConstants.PROGRAM, '$in',
      'secondaryPrograms');
  }

  _addOrgsFilters() {
    logger.log('_addOrgsFilters');
    /* TODO: add donorTypes, donorGroups and contractingAgencyGroups filters, iteration 2+, AMPOFFLINE-380
     once we have an EP providing their options to get the mappings based on activities orgs */

    this._addListMapValueFilter(ActivityConstants.EXECUTING_AGENCY, ActivityConstants.ORGANIZATION, '$in',
      'executingAgency');
    this._addListMapValueFilter(ActivityConstants.CONTRACTING_AGENCY, ActivityConstants.ORGANIZATION, '$in',
      'contractingAgency');
    this._addListMapValueFilter(ActivityConstants.BENEFICIARY_AGENCY, ActivityConstants.ORGANIZATION, '$in',
      'beneficiaryAgency');
    this._addListMapValueFilter(ActivityConstants.IMPLEMENTING_AGENCY, ActivityConstants.ORGANIZATION, '$in',
      'implementingAgency');
    this._addListMapValueFilter(ActivityConstants.RESPONSIBLE_ORGANIZATION, ActivityConstants.ORGANIZATION, '$in',
      'responsibleorg');
    this._addListMapValueFilter(ActivityConstants.DONOR_ORGANIZATION, ActivityConstants.ORGANIZATION, '$in',
      'donnorgAgency');
  }

  _addFundingsFilter() {
    logger.log('_addFundingsFilter');
    const fundings = {};
    this._addValueFilter(ActivityConstants.FINANCING_INSTRUMENT, '$in', 'financingInstruments', fundings);
    this._addValueFilter(ActivityConstants.FUNDING_STATUS, '$in', 'fundingStatus', fundings);
    this._addValueFilter(ActivityConstants.TYPE_OF_ASSISTANCE, '$in', 'typeOfAssistance', fundings);
    this._addValueFilter(ActivityConstants.MODE_OF_PAYMENT, '$in', 'modeOfPayment', fundings);

    this._addValueFilter(ActivityConstants.EFFECTIVE_FUNDING_DATE, '$gte', 'fromEffectiveFundingDate', fundings);
    this._addValueFilter(ActivityConstants.EFFECTIVE_FUNDING_DATE, '$lte', 'toEffectiveFundingDate', fundings);

    this._addValueFilter(ActivityConstants.FUNDING_CLOSING_DATE, '$gte', 'fromFundingClosingDate', fundings);
    this._addValueFilter(ActivityConstants.FUNDING_CLOSING_DATE, '$lte', 'toFundingClosingDate', fundings);

    const fundingDetails = this._getFundingDetails();
    if (fundingDetails) {
      fundings.$elemMatch = fundingDetails;
    }

    if (Object.keys(fundings).length > 0) {
      this._tmpFilter[ActivityConstants.FUNDINGS] = fundings;
    }
  }

  _getFundingDetails() {
    logger.log('_getFundingDetails');
    let result;
    const details = {};
    if (this._dateFilterHidesProjects) {
      this._addValueFilter(ActivityConstants.TRANSACTION_DATE, '$gte', 'fromDate', details);
      // both 'toDate' and transaction date timestamps are zeros, so it should work. But caution if smt changes
      this._addValueFilter(ActivityConstants.TRANSACTION_DATE, '$lte', 'toDate', details);
    }
    this._addValueFilter(ActivityConstants.DISASTER_RESPONSE, '$in', 'disasterResponse', details,
      listToBoolean(this._filters.disasterResponse));

    this._addValueFilter(ActivityConstants.EXPENDITURE_CLASS, '$in', 'expenditureClass', details);

    if (Object.keys(details).length > 0) {
      const trnAdjRules = FieldPathConstants.TRANSACTION_TYPES.map(trnType => {
        // TODO TBC how hidden adj type data is handled on AMP and should be handled in AMP Offline
        let ato = this._fieldsManager
          .getPossibleValuesOptions(`${ActivityConstants.FUNDINGS}~${trnType}~${ActivityConstants.ADJUSTMENT_TYPE}`);
        ato = ato.map(o => o.id);
        return Utils.toMap(trnType, {
          $elemMatch: {
            ...details,
            [ActivityConstants.ADJUSTMENT_TYPE]: { $in: ato }
          }
        });
      });
      result = { $or: trnAdjRules };
    }
    return result;
  }


  _addValueFilter(dbField, filterRule, filterName, resultMap, replaceFilterValue) {
    if (this._filters[filterName] !== undefined) {
      let filterValue = replaceFilterValue || this._filters[filterName];
      if (filterRule !== '$eq') {
        filterValue = Utils.toMap(filterRule, filterValue);
      }
      const result = resultMap || this._tmpFilter;
      result[dbField] = filterValue;
    }
  }

  _addListMapValueFilter(listName, mapKey, filterRule, filterName, useMainFilter = true) {
    let result;
    if (this._filters[filterName]) {
      // { $in : [12] }
      const mapValueFilter = Utils.toMap(filterRule, this._filters[filterName]);
      // { sector_id : { $in : [12]; } }
      const mapKeyFilter = Utils.toMap(mapKey, mapValueFilter);
      // { $elemMatch: { sector_id : { $in : [12]; } } }
      const listFilter = { $elemMatch: mapKeyFilter };
      // { primary_sectors : { $elemMatch: { sector_id : { $in : [12]; } } } }
      if (useMainFilter) {
        this._tmpFilter[listName] = listFilter;
      } else {
        result = Utils.toMap(listName, listFilter);
      }
    }
    return result;
  }

  _addMultiLevelListFilter(fields, filterRule, filterName) {
    if (this._filters[filterName] && fields && fields.length() > 0 && (fields.length() % 2 === 0)) {
      const end = fields.length() - 1;
      // { funding_details : { $elemMatch: { expenditure_class : { $in : [12]; } } } }
      let finalFilter = this._addListMapValueFilter(fields[end - 1], fields[end], filterRule, filterName, false);
      for (let index = end - 2; index >= 0; index--) {
        // field 1 elemMatch
        // { fundings  : { $elemMatch : { funding_details : { $elemMatch: { expenditure_class : { $in : [12]; } } } } }}
        finalFilter = Utils.toMap(fields[index], finalFilter);
      }
      if (finalFilter) {
        this._tmpFilter[fields[0]] = finalFilter;
      }
    }
  }

  _appendFilter(multiFilters, dbField, filterValue) {
    if (!multiFilters[dbField]) {
      this._tmpFilter[dbField] = [filterValue];
    } else {
      this._tmpFilter[dbField].push(filterValue);
    }
  }

  _addYearFilter(dbField, filterName) {
    if (this._filters[filterName]) {
      // this is to avoid partins dates and extracting year parts
      const year = this._filters[filterName];
      this._tmpFilter[dbField] = Utils.toMap('$gt', year - 1);
      this._tmpFilter[dbField] = Utils.toMap('$lt', year + 1);
    }
  }

  _addAlternatives(list) {
    let alternatives = this._tmpFilter.$or;
    if (!alternatives) {
      alternatives = [];
    }
    alternatives.push(list);
    this._tmpFilter.$or = alternatives;
  }

  _addApprovalStatusFilter(filterName) {
    logger.log('_addApprovalStatusFilter');
    if (this._filters[filterName]) {
      const approvalStatuses = this._filters[filterName];
      const approvalStatusFilter = [];
      approvalStatuses.forEach(id => approvalStatusFilter.push(getApprovalStatusFilter(id)));
      this._addAlternatives(approvalStatusFilter);
    }
  }

}

function getApprovalStatusFilter(id) {
  logger.log('getApprovalStatusFilter');
  // based on AmpARFilter.buildApprovalStatusQuery(int, boolean)
  let options;
  let isDraft = true;
  switch (id) {
    case 0:// Existing Un-validated - This will show all the activities that
      // have been approved at least once and have since been edited
      // and not validated.
      options = [ApprovalStatus.EDITED.id, ApprovalStatus.NOT_APPROVED.id, ApprovalStatus.REJECTED.id];
      isDraft = false;
      break;

    case 1:// New Draft - This will show all the activities that have never
      // been approved and are saved as drafts.
      options = [ApprovalStatus.STARTED.id, ApprovalStatus.STARTED_APPROVED.id];
      break;

    case 2:// New Un-validated - This will show all activities that are new
      // and have never been approved by the workspace manager.
      options = [ApprovalStatus.STARTED.id];
      isDraft = false;
      break;

    case 3:// existing draft. This is because when you filter by Existing
      // Unvalidated you get draft activites that were edited and
      // saved as draft
      options = [ApprovalStatus.EDITED.id, ApprovalStatus.APPROVED.id];
      break;

    case 4:// Validated Activities
      options = [ApprovalStatus.APPROVED.id, ApprovalStatus.STARTED_APPROVED.id];
      isDraft = false;
      break;
    default:
      break;
  }
  if (options === undefined) {
    throw new Notification({
      message: `Unrecognized approval status value: ${id}`,
      origin: ErrorConstants.NOTIFICATION_ORIGIN_WORKSPACE_FILTER
    });
  }
  const approvalStatusOptions = Utils.toMap('$in', options);
  const approvalStatusfilter = Utils.toMap(ActivityConstants.APPROVAL_STATUS, approvalStatusOptions);
  const includeDraftFilter = Utils.toMap(ActivityConstants.IS_DRAFT, Utils.toMap(getEqOrNe(isDraft), true));
  const filter = Utils.toMap('$and', [approvalStatusfilter, includeDraftFilter]);

  return filter;
}

function getEqOrNe(boolean) {
  return boolean ? '$eq' : '$ne';
}

function listToBoolean(intList) {
  let boolList;
  if (intList && intList.length > 0) {
    boolList = intList.map((int) => {
      if (int === 1) {
        return true;
      } else if (int === 2) {
        return false;
      }
      throw new Notification({
        message: `Unable to convert int value to boolean (expecting 1 or 2): ${int}`,
        origin: ErrorConstants.NOTIFICATION_ORIGIN_WORKSPACE_FILTER
      });
    });
  }
  return boolList;
}
