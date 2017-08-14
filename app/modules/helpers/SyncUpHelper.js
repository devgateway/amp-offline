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
import DatabaseManager from '../database/DatabaseManager';
import { COLLECTION_SYNCUP_LOG, SYNCUP_DATETIME_FIELD } from '../../utils/Constants';
import LoggerManager from '../../modules/util/LoggerManager';
import * as Utils from '../../utils/Utils';

const SyncUpHelper = {

  findSyncUpByExample(example) {
    LoggerManager.log('findSyncUpByExample');
    return DatabaseManager.findOne(example, COLLECTION_SYNCUP_LOG);
  },

  findAllSyncUpByExample(example) {
    LoggerManager.log('findSyncUpByExample');
    return DatabaseManager.findAll(example, COLLECTION_SYNCUP_LOG);
  },

  saveOrUpdateSyncUp(syncupData) {
    LoggerManager.log('saveOrUpdateSyncUp');
    return DatabaseManager.saveOrUpdate(syncupData.id, syncupData, COLLECTION_SYNCUP_LOG, {});
  },

  getLatestId(example: {}) {
    LoggerManager.log('saveOrUpdateSyncUp');
    return DatabaseManager.findAll(example, COLLECTION_SYNCUP_LOG, { id: 1 }).then(ids =>
      Math.max(...[0].concat(ids.map(idObj => idObj.id))));
  },

  saveOrUpdateSyncUpCollection(syncupData) {
    LoggerManager.log('saveOrUpdateSyncUpCollection');
    return DatabaseManager.saveOrUpdateCollection(syncupData, COLLECTION_SYNCUP_LOG);
  },

  /**
   * Retrieves the latest sync up log
   */
  getLastSyncUpLog() {
    LoggerManager.log('getLastSyncUpLog');
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
  }
};

module.exports = SyncUpHelper;
