import DatabaseManager from '../database/DatabaseManager';
import { COLLECTION_SYNCUP_LOG } from '../../utils/Constants';
import LoggerManager from '../../modules/util/LoggerManager';

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

  saveOrUpdateSyncUpCollection(syncupData) {
    LoggerManager.log('saveOrUpdateSyncUpCollection');
    return DatabaseManager.saveOrUpdateCollection(syncupData, COLLECTION_SYNCUP_LOG);
  }
};

module.exports = SyncUpHelper;
