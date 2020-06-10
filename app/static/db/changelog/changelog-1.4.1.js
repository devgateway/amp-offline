/* eslint-disable max-len */
import { Constants, FieldPathConstants, ActivityConstants } from 'amp-ui';
import * as MC from '../../../utils/constants/MigrationsConstants';
import * as CSC from '../../../utils/constants/ClientSettingsConstants';
import * as ActivityHelper from '../../../modules/helpers/ActivityHelper';
import logger from '../ChangelogLogger';
import { ACTIVITY_PUBLIC_FIELD_VALUES } from '../../../modules/connectivity/AmpApiConstants';
import * as DatabaseManager from '../../../modules/database/DatabaseManager';
import * as ClientSettingsHelper from '../../../modules/helpers/ClientSettingsHelper';
import PossibleValuesHelper from '../../../modules/helpers/PossibleValuesHelper';

// AMPOFFLINE-1515: DO NOT LOAD ConnectionHelper WITH IMPORT BECAUSE IT WILL BREAK MOCHA-TESTS.
let ConnectionHelper = {};
if (process.env.NODE_ENV !== 'test') {
// eslint-disable-next-line global-require
  ConnectionHelper = require('../../../modules/connectivity/ConnectionHelper');
}

// AMPOFFLINE-1515.
const locationsField = 'locations.location';
let newIdsData = [];

export default ({
  changelog: {
    preConditions: [],
    changesets: [
      {
        changeid: 'AMPOFFLINE-1515-update-location-ids-activities',
        author: 'ginchauspe',
        comment: 'Go online to retrieve new ids for amp locations (Part 1 of 2)',
        preConditions: [{
          func: () => ActivityHelper.count().then(nr => nr > 0),
          onFail: MC.ON_FAIL_ERROR_MARK_RAN,
          onError: MC.ON_FAIL_ERROR_CONTINUE
        }],
        context: MC.CONTEXT_AFTER_LOGIN,
        changes: [{
          func: () => {
            const activitiesToUpdate = [];
            return Promise.all([DatabaseManager._getCollection(Constants.COLLECTION_ACTIVITIES).then(collection => {
              logger.info('Create index for locations.');
              DatabaseManager.createIndex(collection, { fieldName: locationsField });
              return Promise.resolve();
            }), ConnectionHelper.doPost({ url: ACTIVITY_PUBLIC_FIELD_VALUES, shouldRetry: true, body: [FieldPathConstants.LOCATION_PATH] })
              .then(data => {
                logger.info('Got new ids for locations.');
                newIdsData = data[FieldPathConstants.LOCATION_PATH];
                return Promise.resolve();
              })]).then(() => (
              Promise.all(newIdsData.map(d =>
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
                  }))).then(() => ActivityHelper.saveOrUpdateCollection(activitiesToUpdate))
            ));
          }
        }],
        rollback: {
          func: () => logger.error('rollback')
        }
      },
      {
        changeid: 'AMPOFFLINE-1515-update-location-ids-locations',
        author: 'ginchauspe',
        comment: 'Cleanup possible-values element and force a syncup (Part 2 of 2)',
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
      },
      {
        changeid: 'AMPOFFLINE-1520-update-ids-financial-instrument',
        author: 'ginchauspe',
        comment: 'Change financial_instrument id type from single value to an array.',
        preConditions: [{
          func: () => ActivityHelper.count().then(nr => nr > 0),
          onFail: MC.ON_FAIL_ERROR_MARK_RAN,
          onError: MC.ON_FAIL_ERROR_CONTINUE
        }],
        context: MC.CONTEXT_STARTUP,
        changes: [{
          func: () => ActivityHelper.findAll({}).then(activities => {
            activities.forEach(activity => {
              const currentId = activity[ActivityConstants.FINANCIAL_INSTRUMENT];
              if (currentId) {
                activity[ActivityConstants.FINANCIAL_INSTRUMENT] = [currentId];
              } else {
                activity[ActivityConstants.FINANCIAL_INSTRUMENT] = [];
              }
            });
            return Promise.resolve(activities);
          }).then((activities) => ActivityHelper.saveOrUpdateCollection(activities, false)
            .then(result => result))
        },
        {
          update: {
            table: Constants.COLLECTION_CLIENT_SETTINGS,
            field: 'value',
            value: true,
            filter: { name: CSC.FORCE_SYNC_UP }
          }
        }],
        rollback: {
          func: () => logger.error('rollback')
        }
      }
    ]
  },
});
