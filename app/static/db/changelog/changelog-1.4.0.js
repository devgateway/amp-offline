import * as RC from '../../../utils/constants/ResourceConstants';
import { COLLECTION_CLIENT_SETTINGS, COLLECTION_RESOURCES } from '../../../utils/Constants';
import * as Utils from '../../../utils/Utils';
import * as CurrencyRatesHelper from '../../../modules/helpers/CurrencyRatesHelper';
import * as MC from '../../../utils/constants/MigrationsConstants';
import * as GSC from '../../../utils/constants/GlobalSettingsConstants';
import * as GlobalSettingsHelper from '../../../modules/helpers/GlobalSettingsHelper';
import * as CSC from '../../../utils/constants/ClientSettingsConstants';
import PossibleValuesHelper from '../../../modules/helpers/PossibleValuesHelper';
import * as FPC from '../../../utils/constants/FieldPathConstants';

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

export default ({
  changelog: {
    preConditions: [],
    changesets: [
      {
        changeid: 'AMPOFFLINE-1312-configure-web-link-resource_type',
        author: 'nmandrescu',
        comment: 'Default value for the new "resource_type" field for web links',
        changes: {
          update: {
            table: COLLECTION_RESOURCES,
            field: RC.RESOURCE_TYPE,
            value: RC.TYPE_WEB_RESOURCE,
            filter: linkFilter
          }
        }
      },
      {
        changeid: 'AMPOFFLINE-1312-configure-doc-resource_type',
        author: 'nmandrescu',
        comment: 'Default value for the new "resource_type" field for documents',
        changes: {
          update: {
            table: COLLECTION_RESOURCES,
            field: RC.RESOURCE_TYPE,
            value: RC.TYPE_DOC_RESOURCE,
            filter: docFilter
          }
        }
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
        }],
        changes: {
          func: () => PossibleValuesHelper.findAllByExactIds(FPC.PATHS_FOR_ACTIVITY_CURRENCY).then(cpvs => {
            currencyPVs = cpvs;
            return Promise.all([
              CurrencyRatesHelper.replaceAllCurrencyRates([]),
              PossibleValuesHelper.deleteByIds(FPC.PATHS_FOR_ACTIVITY_CURRENCY)
            ]);
          })
        },
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
          func: () => CurrencyRatesHelper.hasExchangeRates().then(has => !has),
          onFail: MC.ON_FAIL_ERROR_CONTINUE,
          onError: MC.ON_FAIL_ERROR_CONTINUE
        }],
        changes: {
          update: {
            table: COLLECTION_CLIENT_SETTINGS,
            field: 'value',
            value: true,
            filter: { name: CSC.FORCE_SYNC_UP }
          }
        }
      },
    ]
  },
});
