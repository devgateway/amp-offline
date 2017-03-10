import translate from '../../utils/translate';
import { ACTIVITY_EDIT, ACTIVITY_VIEW } from '../../utils/Constants';

// TODO: remove these test data.
const activeProjects = [{
  ampId: 1,
  title: 'Project 1',
  fundingAgency: 'Japan',
  actualCommitments: '100.000',
  actualDisbursements: '157.000',
  view: false,
  edit: false
}, {
  ampId: 2,
  title: 'Project 2',
  fundingAgency: 'USAID',
  actualCommitments: '100.000',
  actualDisbursements: '5.000',
  view: true,
  edit: false
}, {
  ampId: 3,
  title: 'Project 3',
  fundingAgency: 'USAID',
  actualCommitments: '100.000',
  actualDisbursements: '5.000',
  view: true,
  edit: false
}, {
  ampId: 4,
  title: 'Project 4',
  fundingAgency: 'UNICEF',
  actualCommitments: '10.000',
  actualDisbursements: '5.000',
  view: false,
  edit: true
}, {
  ampId: 5,
  title: 'Project 5',
  fundingAgency: 'USAID',
  actualCommitments: '100.000',
  actualDisbursements: '5.000',
  view: false,
  edit: true
}, {
  ampId: 6,
  title: 'Project 6',
  fundingAgency: 'USAID',
  actualCommitments: '100.000',
  actualDisbursements: '5.000',
  view: true,
  edit: false
}];
const rejectedProjects = [{
  ampId: 1,
  title: 'Project 1a',
  fundingAgency: 'Japan',
  actualCommitments: '10.000',
  actualDisbursements: '157.000',
  view: true,
  edit: false
}, {
  ampId: 2,
  title: 'Project a2',
  fundingAgency: 'USAID',
  actualCommitments: '100',
  actualDisbursements: '5.000',
  view: false,
  edit: true
}, {
  ampId: 5,
  title: 'Project 5a',
  fundingAgency: 'USAID',
  actualCommitments: '1.000',
  actualDisbursements: '5.000',
  view: false,
  edit: true
}, {
  ampId: 6,
  title: 'Project 6a',
  fundingAgency: 'USAID',
  actualCommitments: '8.000',
  actualDisbursements: '5.000',
  view: true,
  edit: true
}];

const DesktopManager = {

  generateDesktopData(teamId) {
    console.log('generateDesktopData');
    return new Promise((resolve, reject) => {
      // TODO: go to an EP and load the projects from this WS, then combine with the local projects. This is just
      // an example to show some data in the tabs.
      const activeProjectsWithLinks = activeProjects.map((item) => {
        return Object.assign({}, item, {
          key: item.id,
          icon: (item.edit ? ACTIVITY_EDIT : (item.view ? ACTIVITY_VIEW : ''))
        });
      });
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

  generateDefaultTabsStructure(rojectsWithLinks, rejectedProjects) {
    // TODO: this function can be more complex and take data from GS, local preferences, etc.
    const defaultTabs = [
      {
        id: 0,
        name: translate('Activities'),
        isActive: true,
        projects: rojectsWithLinks,
        sorting: null,
        page: 0
      },
      {
        id: 1,
        name: translate('Rejected Activities'),
        isActive: false,
        projects: rejectedProjects,
        sorting: null,
        page: 0
      }
    ];
    return defaultTabs;
  },

  getGeneralPaginationOptions() {
    // TODO: this function can be more complex and take data from GS, local preferences, etc.
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
      paginationShowsTotal: false,
      hideSizePerPage: true,
      noDataText: translate('customTextForEmptyData')
    };
    return options;
  }
};

module.exports = DesktopManager;
