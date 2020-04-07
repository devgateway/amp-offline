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
import * as DatabaseManager from '../../../modules/database/DatabaseManager';

export default ({
  changelog: {
    preConditions: [],
    changesets: [
      {
        changeid: 'AMPOFFLINE-1515-update-location-ids',
        author: 'ginchauspe',
        comment: 'Go online to retrieve new ids for amp locations.',
        preConditions: [],
        context: MC.CONTEXT_AFTER_LOGIN,
        changes: [{
          func: () => {
            return ConnectionHelper.doGet({ url: ACTIVITY_LOCATION_FIX_OLD_IDS, shouldRetry: true }).then((data) => {
              logger.error(data);
              const errors = false;
              if (data) {
                DatabaseManager._getCollection(Constants.COLLECTION_ACTIVITIES)
                  .then(collection => {
                    DatabaseManager.createIndex(collection, { fieldName: 'locations.location' });
                    let i = -1;
                      // TODO: Create a promise for all subqueries.
                    data.forEach(d => {
                      i++;
                      console.error(d);
                      console.info(i);
                        // NOTE: locations: { $exists: true } makes the query slower.
                      return ActivityHelper.findAll({ 'locations.location': d.extra_info.old_location_id }).then(activities => {
                        if (activities.length > 0) {
                          console.info(activities);
                        }
                        return activities;
                      });
                    });
                  });
              }
              throw new Error();
            });
          }
        }],
        rollback: {
          func: () => logger.error('rollback')
        }
      }
    ]
  },
});
