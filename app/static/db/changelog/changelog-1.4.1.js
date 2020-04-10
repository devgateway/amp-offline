/* eslint-disable max-len */
import { Constants, FieldPathConstants, ActivityConstants } from 'amp-ui';
import * as MC from '../../../utils/constants/MigrationsConstants';
import * as CSC from '../../../utils/constants/ClientSettingsConstants';
import * as ActivityHelper from '../../../modules/helpers/ActivityHelper';
import logger from '../ChangelogLogger';
import { ACTIVITY_LOCATION_FIX_OLD_IDS } from '../../../modules/connectivity/AmpApiConstants';
import * as ConnectionHelper from '../../../modules/connectivity/ConnectionHelper';
import * as DatabaseManager from '../../../modules/database/DatabaseManager';
import * as ClientSettingsHelper from '../../../modules/helpers/ClientSettingsHelper';
import PossibleValuesHelper from '../../../modules/helpers/PossibleValuesHelper';

// AMPOFFLINE-1515.
let newAndOldLocationIds = [];
let activitiesTable;
const getNewLocationIds = () => (
  ConnectionHelper.doGet({ url: ACTIVITY_LOCATION_FIX_OLD_IDS, shouldRetry: true })
    .then(data => {
      logger.info(`Got data from ${ACTIVITY_LOCATION_FIX_OLD_IDS}`);
      logger.info(data); // TODO: remove this line.
      newAndOldLocationIds = data;
      return newAndOldLocationIds.length > 0;
    })
);

export default ({
  changelog: {
    preConditions: [],
    changesets: [
      {
        changeid: 'AMPOFFLINE-1515-update-location-ids-activities',
        author: 'ginchauspe',
        comment: 'Go online to retrieve new ids for amp locations (Part 1 of 2)',
        preConditions: [
          {
            // Get new and old location ids from the EP.
            // TODO: First check if we have any data in activities to save time.
            func: () => getNewLocationIds(),
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
            const activitiesToUpdate = [];
            return Promise.all(newAndOldLocationIds.map(d =>
              // NOTE: Filtering first by 'locations: $exists' made it slower.
              ActivityHelper.findAll({ 'locations.location': d[ActivityConstants.EXTRA_INFO].old_location_id })
                .then(activities => {
                  if (activities.length > 0) {
                    activities.forEach(a => {
                      a.locations.filter(l => l.location === d[ActivityConstants.EXTRA_INFO].old_location_id)
                        .forEach(l => {
                          l.location = d.id;
                        });
                      activitiesToUpdate.push(a);
                    });
                  }
                  return Promise.resolve();
                }))).then(() => ActivityHelper.saveOrUpdateCollection(activitiesToUpdate));
          }
        }],
        rollback: {
          func: () => logger.error('rollback')
        }
      },
      {
        changeid: 'AMPOFFLINE-1515-update-location-ids-locations',
        author: 'ginchauspe',
        comment: 'Go online to retrieve new ids for amp locations (Part 2 of 2)',
        preConditions: [
          {
            changeid: 'AMPOFFLINE-1515-update-location-ids-activities',
            author: 'ginchauspe',
            file: 'changelog-1.4.1.js',
            onFail: MC.ON_FAIL_ERROR_CONTINUE,
            onError: MC.ON_FAIL_ERROR_CONTINUE
          }
        ],
        context: MC.CONTEXT_AFTER_LOGIN,
        changes: [{
          func: () => Promise.all([PossibleValuesHelper.deleteById(FieldPathConstants.LOCATION_PATH),
            ClientSettingsHelper.updateSettingValue(CSC.FORCE_SYNC_UP, true)])
        }],
        rollback: {
          func: () => logger.error('rollback')
        }
      }
    ]
  },
});
