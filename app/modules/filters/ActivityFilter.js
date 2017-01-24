import * as AC from '../../utils/constants/ActivityConstants';
import * as Utils from '../../utils/Utils';
import Notification from '../helpers/NotificationHelper';
import { NOTIFICATION_ORIGIN_WORKSPACE_FILTER } from '../../utils/constants/ErrorConstants';

/**
 * Activity Filter class
 * Counterpart for AmpARFilter.java
 * @author Nadejda Mandrescu
 */
export default class ActivityFilter {

  constructor(filters) {
    this._filters = filters;
    this._dbFilter = undefined;
    this._isComputed = filters && filters['is-computed'] === true;
  }

  getDBFilter() {
    console.log('getDBFilter');
    const self = this;
    return new Promise((resolve, reject) => {
      if (self._dbFilter === undefined && self._filters) {
        self._prepareFilter().then(() => {
          self._dbFilter = self._generateFilter();
          resolve(self._dbFilter);
          return self._dbFilter;
        }).catch(reject);
      } else {
        resolve(self._dbFilter);
      }
    });
  }

  _prepareFilter() {
    console.log('_prepareFilter');
    return Promise.all([this._getWorkspaces()]).then(
      (workspaces) => {
        this._wsIds = workspaces;
        return this._wsIds;
      });
  }

  _getWorkspaces() {
    console.log('_getWorkspaces');
    // TODO: once GS are available, update to check from GS 'Show workspace filter'
    return Promise.resolve(false).then((showWorkspaceFilterInTeamWorkspace) => {
      if (showWorkspaceFilterInTeamWorkspace === true || this._isComputed) {
        const workspaces = this._filters.workspaces ? this._filters.workspaces : [];
        return workspaces;
      }
      return [];
    });
  }

  /**
   * This is equivalent to AmpARFilter.generateFilterQuery
   * @private
   */
  _generateFilter() {
    console.log('_generateFilter');
    this._tmpFilter = Utils.toMap(AC.TEAM, { $in: this._wsIds });

    // note that some filters were not replicated since they are obsolete (AMP-25215)
    // or either irrelevant (pledges)

    /* TODO: rebuild  all date filters based on dynamic filter. To confirm with Vanessa, since NA in new filters.
     It can be tricky due to timstamp mistmatch between server and client when building the dynamic filter.
     But if needed, build this._updateDynamicFilters(); + reset filters at midnight
     */

    this._addGeneralFilters();
    this._addDateFilters();
    this._addSectorFilters();
    // TODO (noted): change locationSelected once possible values EP for locations includes also parent info
    this._addListMapValueFilter(AC.LOCATIONS, AC.LOCATION, '$in', 'locationSelected');
    this._addProgramFilters();
    this._addOrgsFilters();
    this._addApprovalStatusFilter('approvalStatusSelected');
    this._addFundingsFilter();

    // TODO add indexText search (also where 'text' filter comes from?)
    // TODO add 'risks' filter once it ME is implemented in Activities API

    return this._tmpFilter;
  }

  _addGeneralFilters() {
    console.log('_addGeneralFilters');
    this._addValueFilter(AC.ARCHIVED, getEqOrNe(this._filters.showArchived), 'showArchived', null, true);
    this._addValueFilter(AC.HUMANITARIAN_AID, '$in', 'humanitarianAid', null,
      listToBoolean(this._filters.humanitarianAid));
    this._addValueFilter(AC.GOVERNMENT_APPROVAL_PROCEDURES, getEqOrNe(this._filters.governmentApprovalProcedures),
      'governmentApprovalProcedures', null, true);
    this._addValueFilter(AC.JOINT_CRITERIA, getEqOrNe(this._filters.jointCriteria), 'jointCriteria', null, true);

    this._addValueFilter(AC.ACTIVITY_BUDGET, '$in', 'budget');
    this._addValueFilter(AC.ACTIVITY_STATUS, '$in', 'statuses');
    this._addValueFilter(AC.PROJECT_CATEGORY, '$in', 'projectCategory');
    this._addValueFilter(AC.PROJECT_IMPLEMENTING_UNIT, '$in', 'projectImplementingUnits');
    this._addValueFilter(AC.MODALITIES, '$in', 'aidModalities');
    this._addValueFilter(AC.LINE_MINISTRY_RANK, '$in', 'lineMinRank');
  }

  _addDateFilters() {
    console.log('_addDateFilters');
    this._addYearFilter(AC.ACTUAL_APPROVAL_DATE, 'actualAppYear');

    // both 'toXXX' and filter dates timestamps are zeros, so it should work. But caution if smt changes
    this._addValueFilter(AC.ACTUAL_START_DATE, '$gte', 'fromActivityStartDate');
    this._addValueFilter(AC.ACTUAL_START_DATE, '$lte', 'toActivityStartDate');

    this._addValueFilter(AC.ACTUAL_COMPLETION_DATE, '$gte', 'fromActivityActualCompletionDate');
    this._addValueFilter(AC.ACTUAL_COMPLETION_DATE, '$lte', 'toActivityActualCompletionDate');

    this._addValueFilter(AC.CONTRACTING_DATE, '$gte', 'fromActivityFinalContractingDate');
    this._addValueFilter(AC.CONTRACTING_DATE, '$lte', 'toActivityFinalContractingDate');

    this._addValueFilter(AC.PROPOSED_APPROVAL_DATE, '$gte', 'fromProposedApprovalDate');
    this._addValueFilter(AC.PROPOSED_APPROVAL_DATE, '$lte', 'toProposedApprovalDate');
  }

  _addSectorFilters() {
    console.log('_addSectorFilters');
    /* TODO: bug or feature:
     When sector "A" from level 1 is selected, then filter saves all descendants (e.g. A1, A2, etc.) automatically.
     Thus when a new sector, e.g. A101 is added to "A", then it will be filtered out from results.
     On the other hand, locations and programs descendants are built at filtering time, not saved.
     */
    this._addListMapValueFilter(AC.PRIMARY_SECTORS, AC.SECTOR_ID, '$in', 'sectors');
    this._addListMapValueFilter(AC.SECONDARY_SECTORS, AC.SECTOR_ID, '$in', 'secondarySectors');
    this._addListMapValueFilter(AC.TERTIARY_SECTORS, AC.SECTOR_ID, '$in', 'tertiarySectors');
    this._addListMapValueFilter(AC.TAG_SECTORS, AC.SECTOR_ID, '$in', 'tagSectors');
  }

  _addProgramFilters() {
    console.log('_addProgramFilters');
    // TODO (noted): expand with descendants program filters once the full programs tree info is available via EP
    this._addListMapValueFilter(AC.NATIONAL_PLAN_OBJECTIVE, AC.PROGRAM, '$in', 'nationalPlanningObjectives');
    this._addListMapValueFilter(AC.PRIMARY_PROGRAMS, AC.PROGRAM, '$in', 'primaryPrograms');
    this._addListMapValueFilter(AC.SECONDARY_PROGRAMS, AC.PROGRAM, '$in', 'secondaryPrograms');
  }

  _addOrgsFilters() {
    console.log('_addOrgsFilters');
    /* TODO: add donorTypes, donorGroups and contractingAgencyGroups filters
     once we have an EP providing their options to get the mappings based on activities orgs */

    this._addListMapValueFilter(AC.EXECUTING_AGENCY, AC.ORGANIZATION, '$in', 'executingAgency');
    this._addListMapValueFilter(AC.CONTRACTING_AGENCY, AC.ORGANIZATION, '$in', 'contractingAgency');
    this._addListMapValueFilter(AC.BENEFICIARY_AGENCY, AC.ORGANIZATION, '$in', 'beneficiaryAgency');
    this._addListMapValueFilter(AC.IMPLEMENTING_AGENCY, AC.ORGANIZATION, '$in', 'implementingAgency');
    this._addListMapValueFilter(AC.RESPONSIBLE_ORGANIZATION, AC.ORGANIZATION, '$in', 'responsibleorg');
    this._addListMapValueFilter(AC.DONOR_ORGANIZATION, AC.ORGANIZATION, '$in', 'donnorgAgency');
  }

  _addFundingsFilter() {
    console.log('_addFundingsFilter');
    const fundings = {};
    this._addValueFilter(AC.FINANCING_INSTRUMENT, '$in', 'financingInstruments', fundings);
    this._addValueFilter(AC.FUNDING_STATUS, '$in', 'fundingStatus', fundings);
    this._addValueFilter(AC.TYPE_OF_ASSISTANCE, '$in', 'typeOfAssistance', fundings);
    this._addValueFilter(AC.MODE_OF_PAYMENT, '$in', 'modeOfPayment', fundings);

    this._addValueFilter(AC.EFFECTIVE_FUNDING_DATE, '$gte', 'fromEffectiveFundingDate', fundings);
    this._addValueFilter(AC.EFFECTIVE_FUNDING_DATE, '$lte', 'toEffectiveFundingDate', fundings);

    this._addValueFilter(AC.FUNDING_CLOSING_DATE, '$gte', 'fromFundingClosingDate', fundings);
    this._addValueFilter(AC.FUNDING_CLOSING_DATE, '$lte', 'toFundingClosingDate', fundings);

    const fundingDetails = this._getFundingDetails();
    if (fundingDetails) {
      fundings.$elemMatch = fundingDetails;
    }

    if (fundings.size > 0) {
      this._tmpFilter[AC.FUNDINGS] = { $and: fundings };
    }
  }

  _getFundingDetails() {
    console.log('_getFundingDetails');
    let result;
    const details = {};
    // TODO: use GS with the latest code to detect dateFilterHidesProjects using 'Filter by date hides projects'
    const dateFilterHidesProjects = true;
    if (dateFilterHidesProjects) {
      this._addValueFilter(AC.TRANSACTION_DATE, '$gte', 'fromDate', details);
      // both 'toDate' and transaction date timestamps are zeros, so it should work. But caution if smt changes
      this._addValueFilter(AC.TRANSACTION_DATE, '$lte', 'toDate', details);
    }
    this._addValueFilter(AC.DISASTER_RESPONSE, '$in', 'disasterResponse', details,
      listToBoolean(this._filters.disasterResponse));

    this._addValueFilter(AC.EXPENDITURE_CLASS, '$in', 'expenditureClass', details);

    if (details.size > 0) {
      result = Utils.toMap(AC.FUNDING_DETAILS, { $elemMatch: details });
    }
    return result;
  }


  _addValueFilter(dbField, filterRule, filterName, resultMap, replaceFilterValue) {
    if (this._filters[filterName] !== undefined) {
      const filterValue = Utils.toMap(filterRule, replaceFilterValue || this._filters[filterName]);
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
    console.log('_addApprovalStatusFilter');
    if (this._filters[filterName]) {
      const approvalStatuses = this._filters[filterName];
      const approvalStatusFilter = [];
      approvalStatuses.forEach(id => approvalStatusFilter.push(getApprovalStatusFilter(id)));
      this._addAlternatives(approvalStatusFilter);
    }
  }

}

function getApprovalStatusFilter(id) {
  console.log('getApprovalStatusFilter');
  // based on AmpARFilter.buildApprovalStatusQuery(int, boolean)
  let options;
  let includeDraft = true;
  switch (id) {
    case 0:// Existing Un-validated - This will show all the activities that
      // have been approved at least once and have since been edited
      // and not validated.
      options = ['edited', 'not_approved', 'rejected'];
      includeDraft = false;
      break;

    case 1:// New Draft - This will show all the activities that have never
      // been approved and are saved as drafts.
      options = ['started', 'startedapproved'];
      break;

    case 2:// New Un-validated - This will show all activities that are new
      // and have never been approved by the workspace manager.
      options = ['started'];
      includeDraft = false;
      break;

    case 3:// existing draft. This is because when you filter by Existing
      // Unvalidated you get draft activites that were edited and
      // saved as draft
      options = ['edited', 'approved'];
      break;

    case 4:// Validated Activities
      options = ['approved', 'startedapproved'];
      includeDraft = false;
      break;
    default:
      break;
  }
  if (options === undefined) {
    throw new Notification({
      message: `Unrecognized approval status value: ${id}`,
      origin: NOTIFICATION_ORIGIN_WORKSPACE_FILTER
    });
  }
  const approvalStatusOptions = Utils.toMap('$in', options);
  const approvalStatusfilter = Utils.toMap(AC.APPROVAL_STATUS, approvalStatusOptions);
  const includeDraftFilter = Utils.toMap(AC.IS_DRAFT, Utils.toMap(getEqOrNe(includeDraft), true));
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
        origin: NOTIFICATION_ORIGIN_WORKSPACE_FILTER
      });
    });
  }
  return boolList;
}
