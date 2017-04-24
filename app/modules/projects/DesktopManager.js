/* eslint "no-nested-ternary": 0 */
import translate from '../../utils/translate';
import {
  ACTIVITY_STATUS_DRAFT,
  ACTIVITY_STATUS_UNVALIDATED,
  ACTIVITY_STATUS_VALIDATED
} from '../../utils/Constants';
import ActivityHelper from '../../modules/helpers/ActivityHelper';
import ActivityHydrator from '../helpers/ActivityHydrator';
import { IS_DRAFT, APPROVAL_STATUS } from '../../utils/constants/ActivityConstants';
import LoggerManager from '../../modules/util/LoggerManager';

const DesktopManager = {

  generateDesktopData(teamId, teamMemberId) {
    LoggerManager.log('generateDesktopData');
    return new Promise((resolve, reject) => (
      this.generateOneTabData(teamId, teamMemberId, this.getActivitiesNonRejected)
        .then((tab1Data) => (
          this.generateOneTabData(teamId, teamMemberId, this.getActivitiesRejected)
            .then((tab2Data) => (
              resolve({
                activeProjects: tab1Data,
                rejectedProjects: tab2Data,
                defaultTabs: this.generateDefaultTabsStructure(tab1Data, tab2Data)
              })
            )).catch(reject)
        )).catch(reject)
    ));
  },

  generateOneTabData(teamId, teamMemberId, fn) {
    LoggerManager.log('generateOneTabData');
    return new Promise((resolve, reject) => (
      fn(teamId)
        .then((activities) => (
          this.hidrateActivities(activities, teamMemberId)
            .then((hydratedActivities) => (
              this.convertActivitiesToGridStructure(hydratedActivities)
                .then((activitiesForGrid) => (
                  resolve(activitiesForGrid)
                )).catch(reject)
            )).catch(reject))
        ).catch(reject)
    ));
  },

  getActivitiesNonRejected(teamId) {
    LoggerManager.log('getActivitiesNonRejected');
    return ActivityHelper.findAllNonRejected({ team: teamId });
  },

  getActivitiesRejected(teamId) {
    LoggerManager.log('getActivitiesRejected');
    return ActivityHelper.findAllRejected({ team: teamId });
  },

  hidrateActivities(activities, teamMemberId) {
    LoggerManager.log('hidrateActivities');
    return ActivityHydrator.hydrateActivities({
      activities,
      fieldPaths: ['donor_organization~organization'],
      teamMemberId
    });
  },

  convertActivitiesToGridStructure(hydratedActivities) {
    LoggerManager.log('convertActivitiesToGridStructure');
    const forGrid = hydratedActivities.map((item) => (
      Object.assign({}, item, {
        key: item.id,
        status: this.getActivityStatus(item),
        donor: this.getActivityDonors(item),
        synced: this.getActivityIsSynced(item),
        actualDisbursements: this.getActivityAmounts(item),
        actualCommitments: this.getActivityAmounts(item),
        view: true,
        edit: this.getActivityCanEdit(item),
        new: this.getActivityIsNew(item)
      })
    ));
    return Promise.resolve(forGrid);
  },

  getActivityIsNew(item) {
    if (item[IS_DRAFT]) {
      if (item[APPROVAL_STATUS] === 'approved' || item[APPROVAL_STATUS] === 'edited') {
        return true;
      } else {
        return false;
      }
    } else {
      if (item[APPROVAL_STATUS] === 'started') {
        return true;
      }
      return false;
    }
  },

  getActivityCanEdit(/* item */) {
    return true; // TODO: to be implemented.
  },

  getActivityAmounts(/* item */) {
    return (Math.random() * 100000000).toString().substring(0, 12); // TODO: to be implemented.
  },

  getActivityDonors(item) {
    return item.donor_organization.map((donor) => (donor.organization.value));
  },

  getActivityIsSynced(/* item */) {
    // TODO: to be implemented.
    return true;
  },

  getActivityStatus(item) {
    let status = '';
    if (item[IS_DRAFT]) {
      status = ACTIVITY_STATUS_DRAFT;
    } else if (item[APPROVAL_STATUS] === 'approved' || item[APPROVAL_STATUS] === 'startedapproved') {
      status = ACTIVITY_STATUS_VALIDATED;
    } else {
      status = ACTIVITY_STATUS_UNVALIDATED;
    }
    return status;
  },

  formatNumbers(number) {
    // TODO: this function will apply the gs and format numbers.
    return number;
  },

  generateDefaultTabsStructure(projectsWithLinks, rejected) {
    // TODO: this function can be more complex and take data from GS, local preferences, etc.
    const defaultTabs = [
      {
        id: 0,
        name: 'Activities',
        isActive: true,
        projects: projectsWithLinks,
        sorting: null,
        page: 0
      },
      {
        id: 1,
        name: 'Rejected Sync',
        isActive: false,
        projects: rejected,
        sorting: null,
        page: 0
      }
    ];
    return defaultTabs;
  },

  getGeneralPaginationOptions(length) {
    // TODO: this function can be more complex and take data from GS, local preferences, etc.
    /* TODO: also this needs to react to changes in the data, meaning we need to move it to the component or call it
     from there. */
    // FFR: https://allenfang.github.io/react-bootstrap-table/example.html#pagination
    let options = {};
    if (length > 0) {
      options = {
        page: 1,
        sizePerPageList: [{
          text: '10', value: 10
        }, {
          text: '50', value: 50,
        }, {
          text: translate('All'), value: length,
        }],
        pageStartIndex: 1,
        paginationSize: 3,
        prePage: translate('Prev'),
        nextPage: translate('Next'),
        firstPage: translate('First'),
        lastPage: translate('Last'),
        paginationShowsTotal: true,
        hideSizePerPage: false,
        noDataText: translate('customTextForEmptyData'),
        paginationPosition: 'bottom',
        usePagination: true
      };
    } else {
      options.usePagination = false;
    }
    return options;
  }
};

module.exports = DesktopManager;
