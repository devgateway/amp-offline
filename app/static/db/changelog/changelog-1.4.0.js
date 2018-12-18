import * as RC from '../../../utils/constants/ResourceConstants';
import { COLLECTION_ACTIVITIES, COLLECTION_CLIENT_SETTINGS, COLLECTION_RESOURCES } from '../../../utils/Constants';
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
            table: COLLECTION_RESOURCES,
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
            table: COLLECTION_RESOURCES,
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
            table: COLLECTION_CLIENT_SETTINGS,
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
            table: COLLECTION_CLIENT_SETTINGS,
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
            table: COLLECTION_ACTIVITIES,
            field: AC.APPROVAL_STATUS,
            value: as.id,
            filter: Utils.toMap(AC.APPROVAL_STATUS, as.value)
          }
        })), {
          update: {
            table: COLLECTION_CLIENT_SETTINGS,
            field: 'value',
            value: true,
            filter: { name: CSC.FORCE_SYNC_UP }
          }
        }]
      },
    ]
  },
});
