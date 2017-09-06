/* eslint "no-nested-ternary": 0 */
import SyncUpDiff from './SyncUpDiff';
import SyncUpRunner from './SyncUpRunner';
import ConnectionHelper from '../connectivity/ConnectionHelper';
import { TEST_URL } from '../connectivity/AmpApiConstants';
import SyncUpHelper from '../helpers/SyncUpHelper';
import { loadAllLanguages } from '../../actions/TranslationAction';
import { loadWorkspaces } from '../../actions/WorkspaceAction';
import store from '../../index';
import {
  SYNCUP_BEST_BEFORE_DAYS,
  SYNCUP_DATETIME_FIELD,
  SYNCUP_DIFF_LEFTOVER,
  SYNCUP_FORCE_DAYS,
  SYNCUP_NO_DATE,
  SYNCUP_SYNC_REQUESTED_AT,
  SYNCUP_STATUS_FAIL,
  SYNCUP_STATUS_SUCCESS
} from '../../utils/Constants';
import LoggerManager from '../../modules/util/LoggerManager';
import {
  loadCurrencyRatesOnStartup,
  loadDateSettings,
  loadFMTree,
  loadGlobalSettings,
  loadNumberSettings
} from '../../actions/StartUpAction';
import { checkIfShouldSyncBeforeLogout } from '../../actions/LoginAction';

// TODO: Evaluate in the future whats best: to have static functions or to create instances of SyncUpManager.
export default class SyncUpManager {

  /**
   * Sort by date descending.
   * @param a
   * @param b
   * @returns {number}
   * @private
   */
  static sortByLastSyncDateDesc(a, b) {
    LoggerManager.log('_sortByLastSyncDateDesc');
    return (a[SYNCUP_DATETIME_FIELD] > b[SYNCUP_DATETIME_FIELD]
      ? -1
      : a[SYNCUP_DATETIME_FIELD] < b[SYNCUP_DATETIME_FIELD] ? 1 : 0);
  }

  /**
   * Return the most recent successful syncup in general (not of every type).
   * @returns {Promise}
   */
  static getLastSuccessfulSyncUp() {
    LoggerManager.log('getLastSuccessfulSyncUp');
    return new Promise((resolve, reject) => (
      SyncUpHelper.findAllSyncUpByExample({
        status: SYNCUP_STATUS_SUCCESS
      }).then(data => {
        const sortedData = data.sort(SyncUpManager.sortByLastSyncDateDesc);
        if (sortedData.length > 0) {
          return resolve(sortedData[0]);
        }
        const emptyDateItem = {};
        emptyDateItem[SYNCUP_DATETIME_FIELD] = SYNCUP_NO_DATE; // just not to leave it undefined.
        return resolve(emptyDateItem);
      }).catch(reject)
    ));
  }

  /**
   * Retrieves the latest sync up log
   */
  static getLastSyncUpLog() {
    LoggerManager.log('getLastSyncUpLog');
    return SyncUpHelper.getLatestId().then(id => {
      if (id === 0) {
        return {};
      }
      return SyncUpHelper.findSyncUpByExample({ id });
    });
  }

  static getLastSyncUpIdForCurrentUser() {
    LoggerManager.log('getLastSyncUpLog');
    const user = store.getState().userReducer.userData;
    return SyncUpHelper.getLatestId({ 'requested-by': user.id });
  }

  /**
   * Get the timestamp (comes from server) from the newest successful syncup, use that date to query what changed
   * and then call the EPs from the types that need to be synced.
   */
  static syncUpAllTypesOnDemand() {
    LoggerManager.log('syncUpAllTypesOnDemand');
    let syncResult;
    return this._startSyncUp()
      .then(result => {
        syncResult = result;
        return this._saveMainSyncUpLog(result);
      })
      .then(this._postSyncUp)
      .then(() => {
        if (syncResult.errors.length) {
          return Promise.reject(syncResult.errors.join('. '));
        }
        return syncResult;
      });
  }

  /**
   * This function is used to call a testing EP that will force the online login (just one time) if needed.
   * This way we avoid having multiple concurrent online logins for each sync call.
   * @returns {*}
   */
  static prepareNetworkForSyncUp() {
    LoggerManager.log('prepareNetworkForSyncUp');
    return ConnectionHelper.doGet({ url: TEST_URL });
  }

  static _startSyncUp() {
    LoggerManager.log('_startSyncUp');
    /* We can save time by running these 2 promises in parallel because they are not related (one uses the network
     and the other the local database. */
    const userId = store.getState().userReducer.userData.id;
    let syncUpRunner: SyncUpRunner;
    return new Promise((resolve) =>
      Promise.all([this.prepareNetworkForSyncUp(TEST_URL), SyncUpHelper.getLastSyncUpLogWithSyncDiffTimestamp()]
      ).then(([, lastSyncUpLog]) => {
        const oldTimestamp = lastSyncUpLog[SYNCUP_DATETIME_FIELD];
        const syncUpDiffLeftOver = new SyncUpDiff(lastSyncUpLog[SYNCUP_DIFF_LEFTOVER]);
        syncUpRunner = new SyncUpRunner(userId, oldTimestamp, syncUpDiffLeftOver);
        return syncUpRunner.run().then(resolve);
      }).catch(error => {
        // sync up runner should catch all errors and end gracefully
        // this is either an unexpected error (bug that has to be fixed) or a connectivity issue
        console.error(`Possibly an unexpected error occurred: error = "${error}", stack = "${error.stack}"`);
        const result = syncUpRunner ? syncUpRunner.buildResult([error])
          : SyncUpRunner.buildResult({ status: SYNCUP_STATUS_FAIL, userId, errors: [error] });
        return resolve(result);
      })
    );
  }

  static _saveMainSyncUpLog(log) {
    LoggerManager.log('_saveMainSyncUpLog');
    return SyncUpHelper.getLatestId().then(id => {
      log.id = id + 1;
      return SyncUpHelper.saveOrUpdateSyncUp(log);
    });
  }

  static _postSyncUp() {
    return Promise.all([
      SyncUpManager.dispatchLoadAllLanguages(),
      loadDateSettings(),
      loadNumberSettings(),
      loadGlobalSettings(),
      loadFMTree(),
      loadCurrencyRatesOnStartup(),
      checkIfShouldSyncBeforeLogout(),
      SyncUpManager.reloadMenu()
    ]);
  }

   static dispatchLoadAllLanguages() {
   const restart = true;
   return store.dispatch(loadAllLanguages(restart));
   }

  static reloadMenu() {
    const loggedUserId = store.getState().userReducer.userData.id;
    return store.dispatch(loadWorkspaces(loggedUserId));
  }

  static getSyncUpHistory() {
    LoggerManager.log('getSyncUpHistory');
    return SyncUpHelper.findAllSyncUpByExample({});
  }

  static getLastSyncInDays() {
    LoggerManager.log('getLastSyncInDays');
    return new Promise((resolve, reject) => (
      SyncUpManager.getLastSuccessfulSyncUp().then(lastSync => {
        if (lastSync && lastSync['sync-date']) {
          const lastSyncDate = new Date(lastSync['sync-date']);
          const now = new Date();
          return resolve((now - lastSyncDate) / 1000 / 60 / 60 / 24);
        } else {
          return resolve(undefined);
        }
      }).catch(reject)
    ));
  }

  /**
   * Check if the last syncup is too old or there is not user data in storage, also set the message.
   */
  static checkIfToForceSyncUp() {
    LoggerManager.log('checkIfToForceSyncUp');
    return Promise.all([SyncUpManager.getLastSyncInDays(), SyncUpManager.getLastSuccessfulSyncUp(),
      SyncUpManager.getLastSyncUpIdForCurrentUser()])
      .then(([days, lastSuccessful, lastSyncUpIdForCurrentUser]) => {
        const didSyncUp = !!lastSyncUpIdForCurrentUser;
        const forceBecauseDays = days === undefined || days > SYNCUP_FORCE_DAYS;
        const user = store.getState().userReducer.userData; // No need to to go the DB in this stage.
        const hasUserData = lastSuccessful && lastSuccessful[SYNCUP_SYNC_REQUESTED_AT] > user.registeredOnClient;
        const forceSyncUp = forceBecauseDays || !hasUserData;
        return {
          forceSyncUp,
          didUserSuccessfulSyncUp: hasUserData,
          lastSuccessfulSyncUp: hasUserData ? lastSuccessful : null,
          didSyncUp,
          daysFromLastSuccessfulSyncUp: days
        };
      });
  }

  static isWarnSyncUp() {
    LoggerManager.log('isWarnSyncUp');
    return SyncUpManager.getLastSyncInDays().then((days) =>
      (days === undefined || days > SYNCUP_BEST_BEFORE_DAYS)
    );
  }
}
