/* eslint "no-nested-ternary": 0 */
import translate from '../../utils/translate';
import {
  ACTIVITY_EDIT,
  ACTIVITY_VIEW,
  ACTIVITY_STATUS_DRAFT,
  ACTIVITY_STATUS_UNVALIDATED,
  ACTIVITY_STATUS_VALIDATED
} from '../../utils/Constants';
import ActivityHelper from '../../modules/helpers/ActivityHelper';
import ActivityHydrator from '../helpers/ActivityHydrator';

const DesktopManager = {

  generateDesktopData(teamId, teamMemberId) {
    console.log('generateDesktopData');
    return new Promise((resolve, reject) => (
      this.generateOneTabData(teamId, teamMemberId, this.getActivitiesNonRejected)
        .then((tab1Data) => (
          this.generateOneTabData(teamId, teamMemberId, this.getActivitiesRejected)
            .then((tab2Data) => (
              resolve({
                activeProjectsWithLinks: tab1Data,
                rejectedProjectsWithLinks: tab2Data,
                defaultTabs: this.generateDefaultTabsStructure(tab1Data, tab2Data),
                paginationOptions: this.getGeneralPaginationOptions() // TODO: split pagination options.
              })
            )).catch(reject)
        )).catch(reject)
    ));
  },

  generateOneTabData(teamId, teamMemberId, fn) {
    console.log('generateOneTabData');
    return new Promise((resolve, reject) => (
      fn(teamId)
        .then((activities) => (this.hidrateActivities(activities, teamMemberId)
          .then((hydratedActivities) => (
            this.convertActivitiesToGridStructure(hydratedActivities)
              .then((activitiesForGrid) => {
                console.log(activitiesForGrid);
                return resolve(activitiesForGrid);
              }).catch(reject)
          )).catch(reject))
        ).catch(reject)
    ));
  },

  getActivitiesNonRejected(teamId) {
    console.log('getActivitiesNonRejected');
    return ActivityHelper.findAllNonRejected({ team: teamId });
  },

  getActivitiesRejected(teamId) {
    console.log('getActivitiesRejected');
    return ActivityHelper.findAllRejected({ team: teamId });
  },

  hidrateActivities(activities, teamMemberId) {
    console.log('hidrateActivities');
    return ActivityHydrator.hydrateActivities({
      activities,
      fieldPaths: ['donor_organization~organization'],
      teamMember: { id: teamMemberId }
    });
  },

  convertActivitiesToGridStructure(hydratedActivities) {
    console.log('convertActivitiesToGridStructure');
    const forGrid = hydratedActivities.map((item) => (
      Object.assign({}, item, {
        key: item.id,
        icon: this.getActivityIcon(item),
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
    if (item.is_draft) {
      if (item.approval_status === 'approved' || item.approval_status === 'edited') {
        return true;
      } else {
        return false;
      }
    } else {
      if (item.approval_status === 'started') {
        return true;
      }
      return false;
    }
  },

  getActivityCanEdit(/* item */) {
    return true; // TODO: to be implemented.
  },

  getActivityAmounts(/* item */) {
    return (Math.random() * 1000000).toString().substring(0, 9); // TODO: to be implemented.
  },

  getActivityDonors(item) {
    return item.donor_organization.map((donor) => (donor.organization.value));
  },

  getActivityIsSynced(/* item */) {
    // TODO: to be implemented.
    return true;
  },

  getActivityIcon(item) {
    // TODO: to be implemented.
    return (item.edit ? ACTIVITY_EDIT : (item.view ? ACTIVITY_VIEW : ''));
  },

  getActivityStatus(item) {
    let status = '';
    if (item.is_draft) {
      status = ACTIVITY_STATUS_DRAFT;
    } else if (item.approval_status === 'approved' || item.approval_status === 'startedapproved') {
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
        name: translate('Activities'),
        isActive: true,
        projects: projectsWithLinks,
        sorting: null,
        page: 0
      },
      {
        id: 1,
        name: translate('Rejected Activities'),
        isActive: false,
        projects: rejected,
        sorting: null,
        page: 0
      }
    ];
    return defaultTabs;
  },

  getGeneralPaginationOptions() {
    // TODO: this function can be more complex and take data from GS, local preferences, etc.
    /* TODO: also this needs to react to changes in the data, meaning we need to move it to the component or call it
     from there. */
    // FFR: https://allenfang.github.io/react-bootstrap-table/example.html#pagination
    const options = {
      page: 1,
      sizePerPageList: [{
        text: '5', value: 5
      }, {
        text: '10', value: 10
      }, {
        text: translate('All'), value: 100
      }],
      sizePerPage: 10,
      pageStartIndex: 1,
      paginationSize: 3,
      prePage: translate('Prev'),
      nextPage: translate('Next'),
      firstPage: translate('First'),
      lastPage: translate('Last'),
      paginationShowsTotal: true,
      hideSizePerPage: false,
      noDataText: translate('customTextForEmptyData')
    };
    return options;
  }
};

module.exports = DesktopManager;
