/* eslint-disable max-len */
import PossibleValuesHelper from '../../../modules/helpers/PossibleValuesHelper';
import * as MC from '../../../utils/constants/MigrationsConstants';
import * as CSC from '../../../utils/constants/ClientSettingsConstants';
import * as ClientSettingsHelper from '../../../modules/helpers/ClientSettingsHelper';

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
      }
    ]
  },
});
