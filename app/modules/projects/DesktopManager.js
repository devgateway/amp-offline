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
import PossibleValuesHelper from '../helpers/PossibleValuesHelper';

// TODO: remove these test data.
const rejectedProjects = [{
  ampId: 1,
  title: 'Project 1a',
  fundingAgency: 'Japan',
  actualCommitments: '10.000',
  actualDisbursements: '157.000',
  view: true,
  edit: false,
  new: true,
  synced: false,
  status: ACTIVITY_STATUS_DRAFT
}];

const DesktopManager = {

  generateDesktopData(teamId) {
    console.log('generateDesktopData');
    return new Promise((resolve, reject) => {
      return ActivityHelper.findAllNonRejected({ team: teamId }).then((activities) => {
        return ActivityHydrator.hydrateActivities({
          activities,
          fieldPaths: ['donor_organization~organization'],
          teamMember: { id: 787 } // just for testing.
        }).then((hydratedActivities) => {
          const activeProjectsWithLinks = hydratedActivities.map((item) => (
            Object.assign({}, item, {
              key: item.id,
              icon: this.getActivityIcon(item),
              status: this.getActivityStatus(item),
              donor: this.getActivityDonors(item),
              synced: this.getActivitySynced(item),
              actualDisbursements: this.getAmounts(item),
              actualCommitments: this.getAmounts(item)
            })
          ));
          console.log(activeProjectsWithLinks);
          return resolve({
            activeProjectsWithLinks,
            rejectedProjects,
            defaultTabs: this.generateDefaultTabsStructure(activeProjectsWithLinks, rejectedProjects),
            paginationOptions: this.getGeneralPaginationOptions() // TODO: split pagination options.
          });
        }).catch(reject);
      }).catch(reject);
    });
  },

  getAmounts(/* item */) {
    return (Math.random() * 1000000).toString().substring(0, 9); // TODO: to be implemented.
  },

  getActivityDonors(item) {
    return item.donor_organization.map((donor) => (donor.organization.value));
  },

  getActivitySynced(/* item */) {
    // TODO: to be implemented.
    return true;
  },

  getActivityIcon(item) {
    return (item.edit ? ACTIVITY_EDIT : (item.view ? ACTIVITY_VIEW : ''));
  },

  getActivityStatus(item) {
    return (item.is_draft ? ACTIVITY_STATUS_DRAFT : null);
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
