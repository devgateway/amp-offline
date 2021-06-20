/* eslint-disable max-len */
import { FeatureManagerConstants, FmManagerHelper } from 'amp-ui';
import PossibleValuesHelper from '../../../modules/helpers/PossibleValuesHelper';
import * as MC from '../../../utils/constants/MigrationsConstants';
import * as CSC from '../../../utils/constants/ClientSettingsConstants';
import * as ClientSettingsHelper from '../../../modules/helpers/ClientSettingsHelper';
import FMHelper from '../../../modules/helpers/FMHelper';
import { FEATURE_MANAGER_BY_WS_URL } from '../../../modules/connectivity/AmpApiConstants';

const body = FmManagerHelper.getRequestFmSyncUpBody(Object.values(FeatureManagerConstants));

// AMPOFFLINE-1515: DO NOT LOAD ConnectionHelper WITH IMPORT BECAUSE IT WILL BREAK MOCHA-TESTS.
let ConnectionHelper = {};
if (process.env.NODE_ENV !== 'test') {
// eslint-disable-next-line global-require
  ConnectionHelper = require('../../../modules/connectivity/ConnectionHelper');
}

export default ({
  changelog: {
    preConditions: [],
    changesets: [
      {
        changeid: 'AMPOFFLINE-1528-ws-prefix-based-category-values',
        author: 'ginchauspe',
        comment: 'Delete possible values to force sync including category values with prefix (ie: modalities->SSC_modalities)',
        preConditions: [],
        context: MC.CONTEXT_STARTUP,
        changes: [{
          func: () => Promise.all([PossibleValuesHelper.deleteAll(),
            ClientSettingsHelper.updateSettingValue(CSC.FORCE_SYNC_UP, true)])
        }]
      },
      {
        changeid: 'AMPOFFLINE-1531-upgrade-FM-structure',
        author: 'ginchauspe',
        comment: 'Erase current feature manager and replace with the new structure we made for DRC that has WS info.',
        preConditions: [],
        context: MC.CONTEXT_AFTER_LOGIN,
        changes: [{
          func: () => Promise.all([ClientSettingsHelper.updateSettingValue(CSC.FORCE_SYNC_UP, true),
            FMHelper.removeAll({}).then(() => ConnectionHelper.doPost({ url: FEATURE_MANAGER_BY_WS_URL, body, shouldRetry: true })
              .then((fmTree) => FMHelper.replaceAll([{ fmTree }])))])
        }]
      }
    ]
  },
});
