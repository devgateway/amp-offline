import translate from '../../utils/translate';

// TODO: remove these test data.
const activeProjects = [{
  ampId: 1,
  title: 'Project 1',
  fundingAgency: 'Japan',
  actualCommitments: '100.000',
  actualDisbursements: '157.000'
}, {
  ampId: 2,
  title: 'Project 2',
  fundingAgency: 'USAID',
  actualCommitments: '100.000',
  actualDisbursements: '5.000'
}, {
  ampId: 3,
  title: 'Project 3',
  fundingAgency: 'USAID',
  actualCommitments: '100.000',
  actualDisbursements: '5.000'
}, {
  ampId: 4,
  title: 'Project 4',
  fundingAgency: 'UNICEF',
  actualCommitments: '10.000',
  actualDisbursements: '5.000'
}, {
  ampId: 5,
  title: 'Project 5',
  fundingAgency: 'USAID',
  actualCommitments: '100.000',
  actualDisbursements: '5.000'
}, {
  ampId: 6,
  title: 'Project 6',
  fundingAgency: 'USAID',
  actualCommitments: '100.000',
  actualDisbursements: '5.000'
}];
const rejectedProjects = [{
  ampId: 1,
  title: 'Project 1a',
  fundingAgency: 'Japan',
  actualCommitments: '10.000',
  actualDisbursements: '157.000'
}, {
  ampId: 2,
  title: 'Project a2',
  fundingAgency: 'USAID',
  actualCommitments: '100',
  actualDisbursements: '5.000'
}, {
  ampId: 5,
  title: 'Project 5a',
  fundingAgency: 'USAID',
  actualCommitments: '1.000',
  actualDisbursements: '5.000'
}, {
  ampId: 6,
  title: 'Project 6a',
  fundingAgency: 'USAID',
  actualCommitments: '8.000',
  actualDisbursements: '5.000'
}];

const DesktopManager = {

  generateDesktopData(teamId) {
    console.log('generateDesktopData');
    return new Promise((resolve, reject) => {
      // TODO: go to an EP and load the projects from this WS, then combine with the local projects.
      resolve({
        activeProjects,
        rejectedProjects,
        defaultTabs: this.generateDefaultTabsStructure(),
        paginationOptions: this.getGeneralPaginationOptions()
      });
    });
  },

  formatNumbers(number) {
    // TODO: this function will apply the gs and format numbers.
    return number;
  },

  generateDefaultTabsStructure() {
    // TODO: this function can be more complex and take data from GS, local preferences, etc.
    const defaultTabs = [
      {
        id: 0,
        name: translate('Activities'),
        isActive: true,
        projects: activeProjects,
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
      hideSizePerPage: true
    };
    return options;
  }
};

module.exports = DesktopManager;
