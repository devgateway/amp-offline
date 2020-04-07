/* eslint-disable max-len */
import { ActivityConstants, Constants, FieldPathConstants, AllApprovalStatuses, GlobalSettingsConstants } from 'amp-ui';
import * as RC from '../../../utils/constants/ResourceConstants';
import * as Utils from '../../../utils/Utils';
import * as CurrencyRatesHelper from '../../../modules/helpers/CurrencyRatesHelper';
import * as MC from '../../../utils/constants/MigrationsConstants';
import * as GlobalSettingsHelper from '../../../modules/helpers/GlobalSettingsHelper';
import * as CSC from '../../../utils/constants/ClientSettingsConstants';
import PossibleValuesHelper from '../../../modules/helpers/PossibleValuesHelper';
import * as ActivityHelper from '../../../modules/helpers/ActivityHelper';
import logger from '../ChangelogLogger';
import DateUtils from '../../../utils/DateUtils';
import { ACTIVITY_LOCATION_FIX_OLD_IDS, AMP_COUNTRY_FLAG } from '../../../modules/connectivity/AmpApiConstants';
import * as ConnectionHelper from '../../../modules/connectivity/ConnectionHelper';

export default ({
  changelog: {
    preConditions: [],
    changesets: [
      {
        changeid: 'AMPOFFLINE-1515-update-location-ids',
        author: 'ginchauspe',
        comment: 'Go online to retrieve new ids for amp locations.',
        preConditions: [],
        context: MC.CONTEXT_INIT,
        changes: [{
          func: () => {
            logger.error("entrando");
            console.error("entrando");
            debugger
            return ConnectionHelper.doGet({ url: ACTIVITY_LOCATION_FIX_OLD_IDS, shouldRetry: true }).then((data) => {
              debugger
              logger.error(data);
              console.error(data);
              return Promise.resolve();
            });
          }
        }],
        rollback: {
          func: () => logger.error('muy mal')
        }
      }
    ]
  },
});
