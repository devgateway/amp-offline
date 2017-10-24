/* eslint "no-nested-ternary": 0 */
import translate from '../../utils/translate';
import { ACTIVITY_STATUS_DRAFT, ACTIVITY_STATUS_UNVALIDATED, ACTIVITY_STATUS_VALIDATED } from '../../utils/Constants';
import * as ActivityHelper from '../../modules/helpers/ActivityHelper';
import ActivityHydrator from '../helpers/ActivityHydrator';
import { ACTIVITIES_TAB_TITLE, REJECTED_TAB_TITLE } from '../../utils/constants/TabsConstants';
import {
  ADJUSTMENT_TYPE,
  APPROVAL_STATUS,
  DONOR_ORGANIZATION,
  FUNDING_DETAILS,
  FUNDINGS,
  IS_DRAFT,
  REJECTED_ID,
  TRANSACTION_TYPE
} from '../../utils/constants/ActivityConstants';
import {
  ADJUSTMENT_TYPE_PATH,
  DONOR_ORGANIZATIONS_PATH,
  FUNDING_CURRENCY_PATH,
  TRANSACTION_TYPE_PATH
} from '../../utils/constants/FieldPathConstants';
import {
  ACTUAL,
  APPROVED_STATUS,
  COMMITMENTS,
  DISBURSEMENTS,
  EDITED_STATUS,
  STARTED_APPROVED_STATUS,
  STARTED_STATUS
} from '../../utils/constants/ValueConstants';
import WorkspaceFilter from '../filters/WorkspaceFilter';
import LoggerManager from '../../modules/util/LoggerManager';

const DesktopManager = {

  generateDesktopData(workspace, teamMemberId, currentWorkspaceSettings, currencyRatesManager) {
    LoggerManager.log('generateDesktopData');
    return new Promise((resolve, reject) =>
      WorkspaceFilter.getDBFilter(workspace).then(wsFilter =>
        this.generateOneTabData(wsFilter, teamMemberId, ActivityHelper.findAllNonRejected, currentWorkspaceSettings,
          currencyRatesManager)
          .then((tab1Data) =>
            this.generateOneTabData(wsFilter, teamMemberId, ActivityHelper.findAllRejected, currentWorkspaceSettings,
              currencyRatesManager)
              .then((tab2Data) =>
                resolve({
                  activeProjects: tab1Data,
                  rejectedProjects: tab2Data,
                  defaultTabs: this.generateDefaultTabsStructure(tab1Data, tab2Data)
                })
              ).catch(reject)
          ).catch(reject)
      ).catch(reject)
    );
  },

  generateOneTabData(wsFilter, teamMemberId, fn, currentWorkspaceSettings, currencyRatesManager) {
    LoggerManager.log('generateOneTabData');
    return new Promise((resolve, reject) => (
      fn.call(ActivityHelper, wsFilter)
        .then((activities) => (
          this.hydrateActivities(activities, teamMemberId)
            .then((hydratedActivities) => (
              this.convertActivitiesToGridStructure(hydratedActivities, currentWorkspaceSettings, currencyRatesManager)
                .then((activitiesForGrid) => (
                  resolve(activitiesForGrid)
                )).catch(reject)
            )).catch(reject))
        ).catch(reject)
    ));
  },

  hydrateActivities(activities, teamMemberId) {
    LoggerManager.log('hydrateActivities');
    return ActivityHydrator.hydrateActivities({
      activities,
      fieldPaths: [DONOR_ORGANIZATIONS_PATH, ADJUSTMENT_TYPE_PATH, TRANSACTION_TYPE_PATH, FUNDING_CURRENCY_PATH],
      teamMemberId
    });
  },

  convertActivitiesToGridStructure(hydratedActivities, currentWorkspaceSettings, currencyRatesManager) {
    LoggerManager.log('convertActivitiesToGridStructure');
    const forGrid = hydratedActivities.map((item) => (
      Object.assign({}, item, {
        key: item.id,
        status: this.getActivityStatus(item),
        donor: this.getActivityDonors(item),
        synced: this.getActivityIsSynced(item),
        actualDisbursements: this.getActivityAmounts(item, DISBURSEMENTS, currentWorkspaceSettings,
          currencyRatesManager),
        actualCommitments: this.getActivityAmounts(item, COMMITMENTS, currentWorkspaceSettings, currencyRatesManager),
        view: true,
        edit: this.getActivityCanEdit(item),
        new: this.getActivityIsNew(item)
      })
    ));
    return Promise.resolve(forGrid);
  },

  getActivityIsNew(item) {
    if (item[IS_DRAFT]) {
      if (item[APPROVAL_STATUS] === APPROVED_STATUS || item[APPROVAL_STATUS] === EDITED_STATUS) {
        return false;
      } else {
        return true;
      }
    } else {
      if (item[APPROVAL_STATUS] === STARTED_STATUS) {
        return true;
      }
      return false;
    }
  },

  getActivityCanEdit(item) {
    return !item[REJECTED_ID];
  },

  getActivityAmounts(item, trnType, currentWorkspaceSettings, currencyRatesManager) {
    let amount = 0;
    if (item[FUNDINGS]) {
      item[FUNDINGS].forEach((funding) => (
        funding[FUNDING_DETAILS].forEach((fd) => {
          if (fd[TRANSACTION_TYPE].value === trnType && fd[ADJUSTMENT_TYPE].value === ACTUAL) {
            amount += currencyRatesManager
              .convertTransactionAmountToCurrency(fd, currentWorkspaceSettings.currency.code);
          }
        })
      ));
    }
    return amount;
  },

  getActivityDonors(item) {
    if (item[DONOR_ORGANIZATION]) {
      return item[DONOR_ORGANIZATION].map((donor) => (donor.organization.value));
    }
    return [];
  },

  getActivityIsSynced(/* item */) {
    // TODO: to be implemented.
    return true;
  },

  getActivityStatus(item) {
    let status = '';
    if (item[IS_DRAFT]) {
      status = ACTIVITY_STATUS_DRAFT;
    } else if (item[APPROVAL_STATUS] === APPROVED_STATUS || item[APPROVAL_STATUS] === STARTED_APPROVED_STATUS) {
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
        name: ACTIVITIES_TAB_TITLE,
        isActive: true,
        projects: projectsWithLinks,
        sorting: null,
        page: 0
      },
      {
        id: 1,
        name: REJECTED_TAB_TITLE,
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
