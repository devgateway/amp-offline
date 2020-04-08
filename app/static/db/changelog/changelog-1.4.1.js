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

// AMPOFFLINE-1515.
let newAndOldLocationIds = [];
let activitiesTable;

export default ({
  changelog: {
    preConditions: [],
    changesets: [
      {
        changeid: 'AMPOFFLINE-1515-update-location-ids',
        author: 'ginchauspe',
        comment: 'Go online to retrieve new ids for amp locations.',
        preConditions: [
          {
            // Get new and old location ids from the EP.
            // TODO: First check if we have any data in activities to save time.
            func: () => ConnectionHelper.doGet({ url: ACTIVITY_LOCATION_FIX_OLD_IDS, shouldRetry: true })
              .then(data => {
                logger.info(`Got data from ${ACTIVITY_LOCATION_FIX_OLD_IDS}`);
                logger.info(data);
                newAndOldLocationIds = data;
                return newAndOldLocationIds.length > 0;
              }),
            onFail: MC.ON_FAIL_ERROR_MARK_RAN,
            onError: MC.ON_FAIL_ERROR_CONTINUE
          },
          {
            // Open "table" activities.
            func: () => DatabaseManager._getCollection(Constants.COLLECTION_ACTIVITIES)
              .then(collection => {
                logger.info('Create index for locations.');
                activitiesTable = collection;
                DatabaseManager.createIndex(activitiesTable, { fieldName: 'locations.location' });
                return activitiesTable !== undefined;
              }),
            onFail: MC.ON_FAIL_ERROR_MARK_RAN,
            onError: MC.ON_FAIL_ERROR_CONTINUE
          }
        ],
        context: MC.CONTEXT_AFTER_LOGIN,
        changes: [{
          func: () => {
            const promise = Promise.all(newAndOldLocationIds.map(d =>
              ActivityHelper.findAll({ 'locations.location': d.extra_info.old_location_id })
                .then(activities => {
                  if (activities.length > 0) {
                    activities.forEach(a => {
                      a.locations.filter(l => l.location === d.extra_info.old_location_id).forEach(l => {
                        l.location = d.id;
                      });
                    });
                    // TODO: Compare time with single activity update AND just 1 saveOrUpdateCollection for all.
                    return ActivityHelper.saveOrUpdateCollection(activities);
                  }
                  return Promise.resolve();
                })));
            return promise;
          }
        }],
        rollback: {
          func: () => logger.error('rollback')
        }
      }
    ]
  },
});
