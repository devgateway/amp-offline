/**
 data example:
 {
    "timestamp": "2017-03-13T18:52:33.694-0300",
    "status": "SUCCESS",
    "requested-by": 19,
    "types": [
      {
        "status": "SUCCESS",
        "name": "translations"
      },
      {
        "status": "SUCCESS",
        "name": "users"
      }
    ]
  }
 */
import * as DatabaseManager from '../database/DatabaseManager';
import { COLLECTION_SYNCUP_LOG, SYNCUP_DATETIME_FIELD } from '../../utils/Constants';
import Logger from '../../modules/util/LoggerManager';
import * as Utils from '../../utils/Utils';

const logger = new Logger('Syncup helper');

const SyncUpHelper = {

  findSyncUpByExample(example) {
    logger.debug('findSyncUpByExample');
    return DatabaseManager.findOne(example, COLLECTION_SYNCUP_LOG);
  },

  findAllSyncUpByExample(example) {
    logger.debug('findSyncUpByExample');
    return DatabaseManager.findAll(example, COLLECTION_SYNCUP_LOG);
  },

  saveOrUpdateSyncUp(syncupData) {
    logger.log('saveOrUpdateSyncUp');
    return DatabaseManager.saveOrUpdate(syncupData.id, syncupData, COLLECTION_SYNCUP_LOG, {});
  },

  getLatestId(example = {}) {
    logger.debug('getLatestId');
    return DatabaseManager.findAll(example, COLLECTION_SYNCUP_LOG, { id: 1 }).then(ids =>
      Math.max(...[0].concat(ids.map(idObj => idObj.id))));
  },

  saveOrUpdateSyncUpCollection(syncupData) {
    logger.log('saveOrUpdateSyncUpCollection');
    return DatabaseManager.saveOrUpdateCollection(syncupData, COLLECTION_SYNCUP_LOG);
  },

  /**
   * Updates sync up collection with the specified fields modifier rule
   * @param filter delimits which collection elements must be updated
   * @param fieldsModifier the fields modifier
   * @return {Promise}
   */
  updateCollectionFields(filter, fieldsModifier) {
    logger.log('updateCollectionFields');
    return DatabaseManager.updateCollectionFields(filter, fieldsModifier, COLLECTION_SYNCUP_LOG);
  },

  /**
   * Retrieves the latest sync up log
   */
  getLastSyncUpLog() {
    logger.debug('getLastSyncUpLog');
    return SyncUpHelper.getLatestId().then(id => {
      if (id === 0) {
        return {};
      }
      return SyncUpHelper.findSyncUpByExample({ id });
    });
  },

  /**
   * Retrieves the latest sync up log when we managed to request sync diff EP and hence to store the timestamp
   * @return {Promise}
   */
  getLastSyncUpLogWithSyncDiffTimestamp() {
    const filter = Utils.toDefinedNotNullRule(SYNCUP_DATETIME_FIELD);
    return DatabaseManager.findTheFirstOne(filter, { id: -1 }, COLLECTION_SYNCUP_LOG).then((log) => {
      if (log === null) {
        return {};
      }
      return log;
    });
  },

  /**
   * Retrieves the latest 'count' sync up logs
   * @param count the number of the latest sync up logs to retrieve
   * @param projections (optional)
   * @return {Promise}
   */
  getLastSyncUpLogs(count, projections) {
    logger.debug('getLastSyncUpLogs');
    return DatabaseManager.findAllWithProjectionsAndOtherCriteria(
      {}, COLLECTION_SYNCUP_LOG, projections, { id: -1 }, 0, count);
  },

  /**
   * Deletes sync up logs based on the specified filter
   * @param filter
   * @return {Promise}
   */
  deleteSyncUpLogs(filter) {
    logger.log('deleteSyncUpLogs');
    return DatabaseManager.removeAll(filter, COLLECTION_SYNCUP_LOG);
  }
};

export default SyncUpHelper;
