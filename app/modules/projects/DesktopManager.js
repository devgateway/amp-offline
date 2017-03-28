/* eslint "no-nested-ternary": 0 */
import translate from '../../utils/translate';
import {
  ACTIVITY_EDIT,
  ACTIVITY_VIEW,
  ACTIVITY_STATUS_DRAFT,
  ACTIVITY_STATUS_UNVALIDATED,
  ACTIVITY_STATUS_VALIDATED
} from '../../utils/Constants';

// TODO: remove these test data.
const activeProjects = [{
  // using Timor IDs for activity preview testing
  id: 10098,
  ampId: 1,
  title: 'Project 1',
  fundingAgency: 'Japan',
  actualCommitments: '100.000',
  actualDisbursements: '157.000',
  view: false,
  edit: false,
  new: true,
  synced: true,
  status: ACTIVITY_STATUS_DRAFT
}, {
  id: 10098,
  ampId: 2,
  title: 'Project 2',
  fundingAgency: 'USAID',
  actualCommitments: '100.000',
  actualDisbursements: '5.000',
  view: true,
  edit: false,
  new: true,
  synced: true,
  status: ACTIVITY_STATUS_UNVALIDATED
}, {
  id: 10098,
  ampId: 3,
  title: 'Project 3',
  fundingAgency: 'USAID',
  actualCommitments: '100.000',
  actualDisbursements: '5.000',
  view: true,
  edit: false,
  new: true,
  synced: false,
  status: ACTIVITY_STATUS_VALIDATED
}, {
  id: 10098,
  ampId: 4,
  title: 'Project 4',
  fundingAgency: 'UNICEF',
  actualCommitments: '10.000',
  actualDisbursements: '5.000',
  view: false,
  edit: true,
  new: false,
  synced: true,
  status: ACTIVITY_STATUS_DRAFT
}, {
  id: 10098,
  ampId: 5,
  title: 'Project 5',
  fundingAgency: 'USAID',
  actualCommitments: '100.000',
  actualDisbursements: '5.000',
  view: false,
  edit: true,
  new: false,
  synced: false,
  status: ACTIVITY_STATUS_DRAFT
}, {
  id: 10098,
  ampId: 6,
  title: 'Project 6',
  fundingAgency: 'USAID',
  actualCommitments: '100.000',
  actualDisbursements: '5.000',
  view: true,
  edit: false,
  new: false,
  synced: true,
  status: ACTIVITY_STATUS_VALIDATED
}];
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
}, {
  ampId: 2,
  title: 'Project a2',
  fundingAgency: 'USAID',
  actualCommitments: '100',
  actualDisbursements: '5.000',
  view: false,
  edit: true,
  new: true,
  synced: true,
  status: ACTIVITY_STATUS_UNVALIDATED
}, {
  ampId: 5,
  title: 'Project 5a',
  fundingAgency: 'USAID',
  actualCommitments: '1.000',
  actualDisbursements: '5.000',
  view: false,
  edit: true,
  new: true,
  synced: true,
  status: ACTIVITY_STATUS_VALIDATED
}, {
  ampId: 6,
  title: 'Project 6a',
  fundingAgency: 'USAID',
  actualCommitments: '8.000',
  actualDisbursements: '5.000',
  view: true,
  edit: true,
  new: false,
  synced: true,
  status: ACTIVITY_STATUS_DRAFT
}];

const DesktopManager = {

  generateDesktopData() {
    console.log('generateDesktopData');
    return new Promise((resolve) => {
      // TODO: go to an EP and load the projects from this WS, then combine with the local projects. This is just
      // an example to show some data in the tabs.
      const activeProjectsWithLinks = activeProjects.map((item) => (
        Object.assign({}, item, {
          key: item.id,
          icon: (item.edit ? ACTIVITY_EDIT : (item.view ? ACTIVITY_VIEW : ''))
        })
      ));
      resolve({
        activeProjectsWithLinks,
        rejectedProjects,
        defaultTabs: this.generateDefaultTabsStructure(activeProjectsWithLinks, rejectedProjects),
        paginationOptions: this.getGeneralPaginationOptions()
      });
    });
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
      sizePerPage: 5,
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
