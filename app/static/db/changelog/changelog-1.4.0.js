import * as RC from '../../../utils/constants/ResourceConstants';
import { COLLECTION_RESOURCES } from '../../../utils/Constants';
import * as Utils from '../../../utils/Utils';
import * as CurrencyRatesHelper from '../../../modules/helpers/CurrencyRatesHelper';
import * as MC from '../../../utils/constants/MigrationsConstants';
import * as GSC from '../../../utils/constants/GlobalSettingsConstants';
import * as GlobalSettingsHelper from '../../../modules/helpers/GlobalSettingsHelper';

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

export default({
  changelog: {
    preConditions: [
    ],
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
        changeid: 'AMPOFFLINE-1281',
        author: 'nmandrescu',
        comment: 'Force full resync for exchange rates app versions smaller than 1.3.0 was used',
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
          onFail: MC.ON_FAIL_ERROR_CONTINUE,
          onError: MC.ON_FAIL_ERROR_CONTINUE
        }],
        changes: {
          func: () => CurrencyRatesHelper.replaceAllCurrencyRates([])
        },
        rollback: {
          func: () => CurrencyRatesHelper.replaceAllCurrencyRates(currentExchangeRates)
        }
      },
    ]
  },
});
