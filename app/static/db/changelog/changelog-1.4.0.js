import { Constants } from 'amp-ui';
import * as RC from '../../../utils/constants/ResourceConstants';
import * as Utils from '../../../utils/Utils';
import * as CurrencyRatesHelper from '../../../modules/helpers/CurrencyRatesHelper';
import * as MC from '../../../utils/constants/MigrationsConstants';
import * as GSC from '../../../utils/constants/GlobalSettingsConstants';
import * as GlobalSettingsHelper from '../../../modules/helpers/GlobalSettingsHelper';
import * as CSC from '../../../utils/constants/ClientSettingsConstants';
import PossibleValuesHelper from '../../../modules/helpers/PossibleValuesHelper';
import * as FPC from '../../../utils/constants/FieldPathConstants';
import * as ActivityHelper from '../../../modules/helpers/ActivityHelper';
import * as AC from '../../../utils/constants/ActivityConstants';
import logger from '../ChangelogLogger';
import { ALL_APPROVAL_STATUSES } from '../../../utils/constants/ApprovalStatus';
import DateUtils from '../../../utils/DateUtils';

// AMPOFFLINE-1312-configure-web-link-resource_type
const noResType = Utils.toMap(RC.RESOURCE_TYPE, { $exists: false });
const linkFilter = Utils.toDefinedNotNullRule(RC.WEB_LINK);
linkFilter.$and.push(noResType);

// AMPOFFLINE-1312-configure-doc-resource_type
let docFilter = Utils.toUndefinedOrNullRule(RC.WEB_LINK);
docFilter.$or.push(Utils.toDefinedNotNullRule(RC.CONTENT_ID));
docFilter = { $and: [noResType, docFilter] };

// AMPOFFLINE-1281
let currentExchangeRates = [];
let currencyPVs = [];

// AMPOFFLINE-1318
const CURRENCY_CODE = 'currency_code';
let activitiesWithPPCasCode = [];
let codeToId = null;

// AMPOFFLINE-1366
let activitiesWithFY = [];

// AMPOFFLINE-1371
let activitiesWithFundingDetails = [];

// AMPOFFLINE-1392
let allActivities = [];

// AMPOFFLINE-1368
let activitiesWithPPC = [];

export default ({
  changelog: {
    preConditions: [],
    changesets: [
      {
        changeid: 'AMPOFFLINE-1312-configure-web-link-resource_type',
        author: 'nmandrescu',
        comment: 'Default value for the new "resource_type" field for web links',
        changes: [{
          update: {
            table: Constants.COLLECTION_RESOURCES,
            field: RC.RESOURCE_TYPE,
            value: RC.TYPE_WEB_RESOURCE,
            filter: linkFilter
          }
        }]
      },
      {
        changeid: 'AMPOFFLINE-1312-configure-doc-resource_type',
        author: 'nmandrescu',
        comment: 'Default value for the new "resource_type" field for documents',
        changes: [{
          update: {
            table: Constants.COLLECTION_RESOURCES,
            field: RC.RESOURCE_TYPE,
            value: RC.TYPE_DOC_RESOURCE,
            filter: docFilter
          }
        }]
      },
      {
        changeid: 'AMPOFFLINE-1318-ppc-currency',
        author: 'nmandrescu',
        comment: 'Switch PPC currency reference from code to id',
        preConditions: [{
          func: () => ActivityHelper.findAll(
            Utils.toMap(AC.PPC_AMOUNT, { $elemMatch: Utils.toDefinedOrNullRule(CURRENCY_CODE) }))
            .then(activities => {
              activitiesWithPPCasCode = activities;
              return activitiesWithPPCasCode.length > 0;
            }),
          onFail: MC.ON_FAIL_ERROR_MARK_RAN,
          onError: MC.ON_FAIL_ERROR_CONTINUE
        }, {
          func: () => PossibleValuesHelper.findAllByExactIds(
            // locate at least one list of synced currencies
            [FPC.FUNDING_CURRENCY_PATH, FPC.MTEF_CURRENCY_PATH, FPC.COMPONENT_CURRENCY_PATH]
          ).then(pvs => {
            pvs = pvs && pvs.length && pvs.find(p => p && p[FPC.FIELD_OPTIONS]);
            if (pvs) {
              codeToId = {};
              Object.values(pvs[FPC.FIELD_OPTIONS]).forEach(c => {
                codeToId[c.value] = c.id;
              });
            }
            return !!codeToId;
          }),
          onFail: MC.ON_FAIL_ERROR_CONTINUE,
          onError: MC.ON_FAIL_ERROR_CONTINUE
        }],
        changes: [{
          func: () => {
            const couldNotRemapToDelete = [];
            const couldNotRemapToLeaveForReject = [];
            const couldNotRemapCodes = new Set();
            activitiesWithPPCasCode = activitiesWithPPCasCode.filter(a => {
              const ppc = a[AC.PPC_AMOUNT][0];
              if (ppc[CURRENCY_CODE]) {
                const id = codeToId[ppc[CURRENCY_CODE]];
                if (id) {
                  ppc[AC.CURRENCY] = id;
                } else {
                  if (a[AC.CLIENT_CHANGE_ID]) {
                    couldNotRemapToLeaveForReject.push(`${a[AC.AMP_ID] || ''}(${a[AC.PROJECT_TITLE]})`);
                  } else {
                    couldNotRemapToDelete.push(a);
                  }
                  couldNotRemapCodes.add(ppc[CURRENCY_CODE]);
                  return false;
                }
              }
              delete ppc[CURRENCY_CODE];
              return true;
            });
            let deletePromise = Promise.resolve();
            if (couldNotRemapCodes.size) {
              const codes = Array.from(couldNotRemapCodes.keys()).join(', ');
              const msgs = [`AMPOFFLINE-1318: could not remap currency codes to ids: ${codes}.`];
              if (couldNotRemapToDelete.length) {
                const toDeleteS = couldNotRemapToDelete.map(a => `${a[AC.AMP_ID]}(${a[AC.PROJECT_TITLE]})`).join(', ');
                msgs.push(`These activities will be deleted to be resynced: ${toDeleteS}.`);
              }
              if (couldNotRemapToLeaveForReject.length) {
                msgs.push(`These activities will be left to be rejected: ${couldNotRemapToLeaveForReject.join(', ')}.`);
              }
              logger.warn(msgs.join('\n\r'));
              if (couldNotRemapToDelete.length) {
                deletePromise = ActivityHelper.removeAllNonRejectedByIds(couldNotRemapToDelete.map(a => a.id));
              }
            }
            return Promise.all([deletePromise, ActivityHelper.saveOrUpdateCollection(activitiesWithPPCasCode)]);
          }
        }],
        rollback: {
          func: () => ActivityHelper.saveOrUpdateCollection(activitiesWithPPCasCode, false)
        }
      },
      {
        changeid: 'AMPOFFLINE-1318-force-sync',
        author: 'nmandrescu',
        comment: 'Force resync once currency code was migrated',
        preConditions: [{
          changeid: 'AMPOFFLINE-1318-ppc-currency',
          author: 'nmandrescu',
          file: 'changelog-1.4.0.js',
          onFail: MC.ON_FAIL_ERROR_CONTINUE,
          onError: MC.ON_FAIL_ERROR_CONTINUE
        }, {
          func: () => {
            const isForceSync = !!activitiesWithPPCasCode.length;
            activitiesWithPPCasCode = null;
            codeToId = null;
            return isForceSync;
          },
          onFail: MC.ON_FAIL_ERROR_MARK_RAN,
          onError: MC.ON_FAIL_ERROR_CONTINUE
        }],
        changes: [{
          update: {
            table: Constants.COLLECTION_CLIENT_SETTINGS,
            field: 'value',
            value: true,
            filter: { name: CSC.FORCE_SYNC_UP }
          }
        }]
      },
      {
        changeid: 'AMPOFFLINE-1281-currency-rates',
        author: 'nmandrescu',
        comment: 'Force full resync for exchange rates and currency possible values when app version smaller than ' +
          '1.3.0 was used',
        preConditions: [{
          func: () => CurrencyRatesHelper.findAll().then(dbCurrencyRates => {
            currentExchangeRates = dbCurrencyRates;
            return dbCurrencyRates.length > 0;
          }),
          onFail: MC.ON_FAIL_ERROR_MARK_RAN,
          onError: MC.ON_FAIL_ERROR_CONTINUE
        }, {
          func: () => GlobalSettingsHelper.findByKey(GSC.DEFAULT_COUNTRY).then(dc =>
            !dc || !dc.value || ['ht', 'td'].includes(dc.value.toLowerCase())),
          onFail: MC.ON_FAIL_ERROR_MARK_RAN,
          onError: MC.ON_FAIL_ERROR_CONTINUE
        }, {
          changeid: 'AMPOFFLINE-1318-ppc-currency',
          author: 'nmandrescu',
          file: 'changelog-1.4.0.js',
          onFail: MC.ON_FAIL_ERROR_CONTINUE,
          onError: MC.ON_FAIL_ERROR_CONTINUE
        }],
        changes: [{
          func: () => PossibleValuesHelper.findAllByExactIds(FPC.PATHS_FOR_ACTIVITY_CURRENCY).then(cpvs => {
            currencyPVs = cpvs;
            return Promise.all([
              CurrencyRatesHelper.replaceAllCurrencyRates([]),
              PossibleValuesHelper.deleteByIds(FPC.PATHS_FOR_ACTIVITY_CURRENCY)
            ]);
          })
        }],
        rollback: {
          func: () => Promise.all([
            CurrencyRatesHelper.replaceAllCurrencyRates(currentExchangeRates),
            PossibleValuesHelper.saveOrUpdateCollection(currencyPVs)
          ])
        }
      },
      {
        changeid: 'AMPOFFLINE-1281-force-sync',
        author: 'nmandrescu',
        comment: 'Force full sync up if no exchange rates',
        preConditions: [{
          changeid: 'AMPOFFLINE-1281-currency-rates',
          author: 'nmandrescu',
          file: 'changelog-1.4.0.js',
          onFail: MC.ON_FAIL_ERROR_CONTINUE,
          onError: MC.ON_FAIL_ERROR_CONTINUE
        }, {
          func: () => CurrencyRatesHelper.hasExchangeRates().then(has => {
            currentExchangeRates = null;
            currencyPVs = null;
            return !has;
          }),
          onFail: MC.ON_FAIL_ERROR_CONTINUE,
          onError: MC.ON_FAIL_ERROR_CONTINUE
        }],
        changes: [{
          update: {
            table: Constants.COLLECTION_CLIENT_SETTINGS,
            field: 'value',
            value: true,
            filter: { name: CSC.FORCE_SYNC_UP }
          }
        }]
      },
      {
        changeid: 'AMPOFFLINE-1342-approval-status-id',
        author: 'nmandrescu',
        comment: 'Switch approval status id from string to long and use corresponding values',
        preConditions: [{
          func: () => ActivityHelper.count().then(nr => nr > 0),
          onFail: MC.ON_FAIL_ERROR_MARK_RAN,
          onError: MC.ON_FAIL_ERROR_CONTINUE
        }],
        changes: [...ALL_APPROVAL_STATUSES.map(as => ({
          update: {
            table: Constants.COLLECTION_ACTIVITIES,
            field: AC.APPROVAL_STATUS,
            value: as.id,
            filter: Utils.toMap(AC.APPROVAL_STATUS, as.value)
          }
        })), {
          update: {
            table: Constants.COLLECTION_CLIENT_SETTINGS,
            field: 'value',
            value: true,
            filter: { name: CSC.FORCE_SYNC_UP }
          }
        }]
      },
      {
        changeid: 'AMPOFFLINE-1366-fy',
        author: 'nmandrescu',
        comment: 'Switch FY from a list of year-value pairs to simple list of years',
        preConditions: [{
          func: () => ActivityHelper.findAll(
            Utils.toMap(AC.FY, { $elemMatch: Utils.toDefinedOrNullRule(AC.YEAR) }))
            .then(activities => {
              activitiesWithFY = activities;
              return activitiesWithFY.length > 0;
            }),
          onFail: MC.ON_FAIL_ERROR_MARK_RAN,
          onError: MC.ON_FAIL_ERROR_CONTINUE
        }],
        changes: [{
          func: () => {
            activitiesWithFY.forEach(a => {
              a[AC.FY] = a[AC.FY].map(entry => entry[AC.YEAR]);
            });
            return Promise.all([
              PossibleValuesHelper.deleteById(`${AC.FY}~${AC.YEAR}`),
              ActivityHelper.saveOrUpdateCollection(activitiesWithFY)
            ]).then(result => {
              activitiesWithFY = null;
              return result;
            });
          }
        }, {
          update: {
            table: Constants.COLLECTION_CLIENT_SETTINGS,
            field: 'value',
            value: true,
            filter: { name: CSC.FORCE_SYNC_UP }
          }
        }],
        rollback: {
          func: () => ActivityHelper.saveOrUpdateCollection(activitiesWithFY, false)
        }
      },
      {
        changeid: 'AMPOFFLINE-1374-resource_type-as-long',
        author: 'nmandrescu',
        comment: 'Migrate "resource_type" from string to long',
        changes: [{
          update: {
            table: Constants.COLLECTION_RESOURCES,
            field: RC.RESOURCE_TYPE,
            value: RC.TYPE_WEB_RESOURCE,
            filter: Utils.toMap(RC.RESOURCE_TYPE, 'link')
          }
        }, {
          update: {
            table: Constants.COLLECTION_RESOURCES,
            field: RC.RESOURCE_TYPE,
            value: RC.TYPE_DOC_RESOURCE,
            filter: Utils.toMap(RC.RESOURCE_TYPE, 'file')
          }
        }, {
          update: {
            table: Constants.COLLECTION_CLIENT_SETTINGS,
            field: 'value',
            value: true,
            filter: { name: CSC.FORCE_SYNC_UP }
          }
        }]
      },
      {
        changeid: 'AMPOFFLINE-1371-new-fundings-transactions-structure',
        author: 'nmandrescu',
        comment: 'Migrate generic "funding_details" to corresponding transaction type groups',
        // this data migration is critical for AMP Offline to function correctly
        failOnError: true,
        preConditions: [{
          func: () => ActivityHelper.findAll(
            Utils.toMap(AC.FUNDINGS, {
              $elemMatch: Utils.toMap(AC.FUNDING_DETAILS, {
                $elemMatch: Utils.toDefinedOrNullRule(AC.TRANSACTION_TYPE)
              })
            })).then(activities => {
              activitiesWithFundingDetails = activities;
              return activitiesWithFundingDetails.length > 0;
            }),
          onFail: MC.ON_FAIL_ERROR_MARK_RAN,
          onError: MC.ON_FAIL_ERROR_CONTINUE
        }, {
          changeid: 'AMPOFFLINE-1318-ppc-currency',
          author: 'nmandrescu',
          file: 'changelog-1.4.0.js',
          onFail: MC.ON_FAIL_ERROR_CONTINUE,
          onError: MC.ON_FAIL_ERROR_CONTINUE
        }, {
          changeid: 'AMPOFFLINE-1281-currency-rates',
          author: 'nmandrescu',
          file: 'changelog-1.4.0.js',
          onFail: MC.ON_FAIL_ERROR_CONTINUE,
          onError: MC.ON_FAIL_ERROR_CONTINUE
        }],
        changes: [{
          func: () => {
            const legacyTrnTypeCodeToTrnGroupName = new Map([
              [0, AC.COMMITMENTS],
              [1, AC.DISBURSEMENTS],
              [2, AC.EXPENDITURES]
            ]);
            const trnTypeEntriesCount = new Map([[0, 0], [1, 0], [2, 0]]);
            activitiesWithFundingDetails.forEach(a => {
              a[AC.FUNDINGS].forEach(funding => {
                funding[AC.FUNDING_DETAILS].forEach(fd => {
                  const trnTypeCode = fd[AC.TRANSACTION_TYPE];
                  const trnTypeName = legacyTrnTypeCodeToTrnGroupName.get(trnTypeCode);
                  if (!trnTypeName) {
                    logger.warn(`Unsupported trnTypeId=${trnTypeCode}. Skipping funding item: 
                    ${AC.AMP_FUNDING_ID}=${fd[AC.AMP_FUNDING_ID]} for ${AC.AMP_ID}=${a[AC.AMP_ID]}`);
                  } else {
                    trnTypeEntriesCount.set(trnTypeCode, trnTypeEntriesCount.get(trnTypeCode) + 1);
                    let fundingItems = funding[trnTypeName];
                    if (!fundingItems) {
                      fundingItems = [];
                      funding[trnTypeName] = fundingItems;
                    }
                    delete fd[AC.TRANSACTION_TYPE];
                    fundingItems.push(fd);
                  }
                });
                delete funding[AC.FUNDING_DETAILS];
              });
            });
            const obsoletePVsIds = [AC.TRANSACTION_TYPE, AC.ADJUSTMENT_TYPE, AC.PLEDGE, AC.CURRENCY,
              AC.EXPENDITURE_CLASS].map(fdField => `${AC.FUNDINGS}~${AC.FUNDING_DETAILS}~${fdField}`);
            legacyTrnTypeCodeToTrnGroupName.forEach((value, key) => {
              logger.info(`Migrating ${trnTypeEntriesCount.get(key)} ${value} to the new fundings data format`);
            });
            return Promise.all([
              PossibleValuesHelper.deleteByIds(obsoletePVsIds),
              ActivityHelper.saveOrUpdateCollection(activitiesWithFundingDetails, false)
            ]).then(result => {
              activitiesWithFundingDetails = null;
              return result;
            });
          }
        }, {
          update: {
            table: Constants.COLLECTION_CLIENT_SETTINGS,
            field: 'value',
            value: true,
            filter: { name: CSC.FORCE_SYNC_UP }
          }
        }],
        rollback: {
          func: () => ActivityHelper.saveOrUpdateCollection(activitiesWithFundingDetails, false)
        }
      },
      {
        changeid: 'AMPOFFLINE-1392-separate-date-timestamp',
        author: 'nmandrescu',
        comment: 'Migrate some date fields to short API date format',
        preConditions: [{
          func: () => ActivityHelper.findAll({}).then(activities => {
            allActivities = activities;
            return allActivities.length > 0;
          }),
          onFail: MC.ON_FAIL_ERROR_MARK_RAN,
          onError: MC.ON_FAIL_ERROR_CONTINUE
        }, {
          changeid: 'AMPOFFLINE-1371-new-fundings-transactions-structure',
          author: 'nmandrescu',
          file: 'changelog-1.4.0.js',
          onFail: MC.ON_FAIL_ERROR_CONTINUE,
          onError: MC.ON_FAIL_ERROR_CONTINUE
        }],
        changes: [{
          func: () => {
            allActivities.forEach(a => {
              const dateFieldsObj = {};
              [AC.ORIGINAL_COMPLETION_DATE, AC.CONTRACTING_DATE, AC.DISBURSEMENT_DATE, AC.PROPOSED_START_DATE,
                AC.ACTUAL_START_DATE, AC.PROPOSED_APPROVAL_DATE, AC.ACTUAL_APPROVAL_DATE, AC.ACTUAL_COMPLETION_DATE,
                AC.PROPOSED_COMPLETION_DATE].forEach(datePath => Utils.pushByKey(dateFieldsObj, datePath, a));
              const ppc = a[AC.PPC_AMOUNT] && a[AC.PPC_AMOUNT].length ? a[AC.PPC_AMOUNT][0] : null;
              Utils.pushByKey(dateFieldsObj, AC.FUNDING_DATE, ppc);
              (a[AC.FUNDINGS] || []).forEach(funding => {
                [AC.ACTUAL_START_DATE, AC.ACTUAL_COMPLETION_DATE, AC.ORIGINAL_COMPLETION_DATE, AC.REPORTING_DATE,
                  AC.FUNDING_CLASSIFICATION_DATE, AC.EFFECTIVE_FUNDING_DATE, AC.FUNDING_CLOSING_DATE,
                  AC.RATIFICATION_DATE, AC.MATURITY]
                  .forEach(datePath => Utils.pushByKey(dateFieldsObj, datePath, funding));
                FPC.TRANSACTION_TYPES.forEach(trnType => {
                  (funding[trnType] || []).forEach(fd => Utils.pushByKey(dateFieldsObj, AC.TRANSACTION_DATE, fd));
                });
                Utils.pushByKey(dateFieldsObj, AC.TRANSACTION_DATE, funding[AC.MTEF_PROJECTIONS]);
              });
              (a[AC.COMPONENTS] || []).forEach(component => {
                FPC.TRANSACTION_TYPES.forEach(trnType => {
                  (component[trnType] || []).forEach(fd => Utils.pushByKey(dateFieldsObj, AC.TRANSACTION_DATE, fd));
                });
              });
              (a[AC.ISSUES] || []).forEach(issue => {
                Utils.pushByKey(dateFieldsObj, AC.ISSUE_DATE, issue);
                (issue[AC.MEASURES] || []).forEach(measure => Utils.pushByKey(dateFieldsObj, AC.MEASURE_DATE, measure));
              });
              Object.keys(dateFieldsObj)
                .forEach(datePath => dateFieldsObj[datePath].forEach(obj => {
                  const timestamp = obj && obj[datePath];
                  if (timestamp) {
                    // No matter in which timezone the date is picked, the date part reflects the date user selected
                    obj[datePath] = DateUtils.substractShortDateForAPI(timestamp);
                    if (!obj[datePath]) {
                      logger.error(`Could not convert ${datePath}=${datePath} to date for amp_id=${a[AC.AMP_ID]}`);
                    }
                  }
                }));
            });
            return ActivityHelper.saveOrUpdateCollection(allActivities, false).then(result => {
              allActivities = null;
              return result;
            });
          }
        }, {
          update: {
            table: Constants.COLLECTION_CLIENT_SETTINGS,
            field: 'value',
            value: true,
            filter: { name: CSC.FORCE_SYNC_UP }
          }
        }],
        rollback: {
          func: () => ActivityHelper.saveOrUpdateCollection(allActivities, false)
        }
      },
      {
        changeid: 'AMPOFFLINE-1368-ppc-as-object',
        author: 'nmandrescu',
        comment: 'Migrate PPC from list to object type',
        preConditions: [{
          func: () => ActivityHelper.findAll(Utils.toDefinedOrNullArrayRule(AC.PPC_AMOUNT))
            .then(activities => {
              activitiesWithPPC = activities;
              return activitiesWithPPC.length > 0;
            }),
          onFail: MC.ON_FAIL_ERROR_MARK_RAN,
          onError: MC.ON_FAIL_ERROR_CONTINUE
        }, {
          changeid: 'AMPOFFLINE-1318-ppc-currency',
          author: 'nmandrescu',
          file: 'changelog-1.4.0.js',
          onFail: MC.ON_FAIL_ERROR_CONTINUE,
          onError: MC.ON_FAIL_ERROR_CONTINUE
        }, {
          changeid: 'AMPOFFLINE-1392-separate-date-timestamp',
          author: 'nmandrescu',
          file: 'changelog-1.4.0.js',
          onFail: MC.ON_FAIL_ERROR_CONTINUE,
          onError: MC.ON_FAIL_ERROR_CONTINUE
        }],
        changes: [{
          func: () => {
            activitiesWithPPC.forEach(a => {
              const ppc = a[AC.PPC_AMOUNT];
              if (ppc && ppc.length) {
                a[AC.PPC_AMOUNT] = ppc[0];
              } else {
                delete a[AC.PPC_AMOUNT];
              }
            });
            return ActivityHelper.saveOrUpdateCollection(activitiesWithPPC).then(r => {
              activitiesWithPPC = null;
              return r;
            });
          }
        }],
        rollback: {
          func: () => ActivityHelper.saveOrUpdateCollection(activitiesWithPPC, false)
        }
      },
    ]
  },
});
