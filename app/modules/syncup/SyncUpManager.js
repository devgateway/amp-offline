/* eslint "no-nested-ternary": 0 */
import SyncUpDiff from './SyncUpDiff';
import SyncUpRunner from './SyncUpRunner';
import ConnectionHelper from '../connectivity/ConnectionHelper';
import { TEST_URL } from '../connectivity/AmpApiConstants';
import SyncUpHelper from '../helpers/SyncUpHelper';
import * as ErrorNotificationHelper from '../helpers/ErrorNotificationHelper';
import { loadAllLanguages } from '../../actions/TranslationAction';
import { loadWorkspaces, reloadSelectedWorkspace } from '../../actions/WorkspaceAction';
import store from '../../index';
import {
  NR_OLD_SYNC_LOGS_TO_KEEP_MINIMUM,
  NR_SYNC_HISTORY_ENTRIES,
  OLD_SYNC_LOGS_DURATION_ISO_8601,
  SYNCUP_BEST_BEFORE_DAYS,
  SYNCUP_DATETIME_FIELD,
  SYNCUP_DIFF_LEFTOVER,
  SYNCUP_FORCE_DAYS,
  SYNCUP_NO_DATE,
  SYNCUP_STATUS_FAIL,
  SYNCUP_STATUS_SUCCESS,
  SYNCUP_SYNC_REQUESTED_AT,
  SYNCUP_SYNC_REQUESTED_BY
} from '../../utils/Constants';
import Logger from '../../modules/util/LoggerManager';
import { loadCurrencyRatesOnStartup, loadFMTree, loadGlobalSettings } from '../../actions/StartUpAction';
import { checkIfShouldSyncBeforeLogout } from '../../actions/LoginAction';
import translate from '../../utils/translate';
import DateUtils from '../../utils/DateUtils';
import * as Utils from '../../utils/Utils';
import * as UserHelper from '../helpers/UserHelper';
import { NOTIFICATION_ORIGIN_SYNCUP_PROCESS } from '../../utils/constants/ErrorConstants';
import { addMessage } from '../../actions/NotificationAction';
import * as CSC from '../../utils/constants/ClientSettingsConstants';
import SetupManager from '../setup/SetupManager';

const logger = new Logger('Syncup manager');

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
    logger.debug('_sortByLastSyncDateDesc');
    if (a[SYNCUP_DATETIME_FIELD] === b[SYNCUP_DATETIME_FIELD]) {
      return a[SYNCUP_SYNC_REQUESTED_AT] > b[SYNCUP_SYNC_REQUESTED_AT] ? -1 : 1;
    }
    return a[SYNCUP_DATETIME_FIELD] > b[SYNCUP_DATETIME_FIELD] ? -1 : 1;
  }

  /**
   * Return the most recent successful syncup in general (not of every type).
   * @returns {Promise}
   */
  static getLastSuccessfulSyncUp() {
    logger.log('getLastSuccessfulSyncUp');
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
    logger.log('getLastSyncUpLog');
    return SyncUpHelper.getLatestId().then(id => {
      if (id === 0) {
        return {};
      }
      return SyncUpHelper.findSyncUpByExample({ id });
    });
  }

  static getLastSyncUpIdForCurrentUser() {
    logger.log('getLastSyncUpLog');
    const user = store.getState().userReducer.userData;
    return SyncUpHelper.getLatestId(Utils.toMap(SYNCUP_SYNC_REQUESTED_BY, user.id));
  }

  /**
   * Get the timestamp (comes from server) from the newest successful syncup, use that date to query what changed
   * and then call the EPs from the types that need to be synced.
   */
  static syncUpAllTypesOnDemand() {
    logger.log('syncUpAllTypesOnDemand');
    let syncResult;
    const startDate = new Date();
    return this._startSyncUp()
      .then(result => {
        if (result && result.status === SYNCUP_STATUS_FAIL && !result.units) {
          // if cannot start, there would be one reason only
          const error = result.errors && result.errors.length ? result.errors[0] : translate('unexpectedError');
          logger.error(JSON.stringify(error));
          return Promise.reject(error);
        }
        syncResult = result;
        syncResult.dateStarted = startDate.toISOString();
        return this._saveMainSyncUpLog(result);
      })
      .then(this._postSyncUp)
      .then(() => syncResult);
  }

  /**
   * This function is used to call a testing EP that will force the online login (just one time) if needed.
   * This way we avoid having multiple concurrent online logins for each sync call.
   * @returns {*}
   */
  static prepareNetworkForSyncUp() {
    logger.log('prepareNetworkForSyncUp');
    return ConnectionHelper.doGet({ url: TEST_URL });
  }

  static _startSyncUp() {
    logger.log('_startSyncUp');
    /* We can save time by running these 2 promises in parallel because they are not related (one uses the network
     and the other the local database. */
    const userId = store.getState().userReducer.userData.id;
    let syncUpRunner: SyncUpRunner;
    return Promise.all([this.prepareNetworkForSyncUp(TEST_URL), SyncUpHelper.getLastSyncUpLogWithSyncDiffTimestamp()])
      .then(([, lastSyncUpLog]) => {
        const oldTimestamp = lastSyncUpLog[SYNCUP_DATETIME_FIELD];
        const syncUpDiffLeftOver = new SyncUpDiff(lastSyncUpLog[SYNCUP_DIFF_LEFTOVER]);
        syncUpRunner = new SyncUpRunner(userId, oldTimestamp, syncUpDiffLeftOver);
        return syncUpRunner.run();
      }).catch(error => {
        // sync up runner should catch all errors and end gracefully
        // this is either an unexpected error (bug that has to be fixed) or a connectivity issue
        const errorType = syncUpRunner ? 'bug / unexpected' : 'normal / expected';
        logger.error(`A ${errorType} error occurred: error = "${error}", stack = "${error.stack}"`);
        const result = syncUpRunner ? syncUpRunner.buildResult([error])
          : SyncUpRunner.buildResult({ status: SYNCUP_STATUS_FAIL, userId, errors: [error] });
        return result;
      });
  }

  static _saveMainSyncUpLog(log) {
    logger.log('_saveMainSyncUpLog');
    return SyncUpHelper.getLatestId().then(id => {
      log.id = id + 1;
      return SyncUpHelper.saveOrUpdateSyncUp(log);
    });
  }

  static _postSyncUp() {
    return Promise.all([
      SyncUpManager.cleanupOldSyncUpLogs(),
      SyncUpManager.dispatchLoadAllLanguages(),
      loadGlobalSettings(),
      loadFMTree(),
      loadCurrencyRatesOnStartup(),
      checkIfShouldSyncBeforeLogout(),
      store.dispatch(loadWorkspaces()),
      reloadSelectedWorkspace()
    ]);
  }

  static dispatchLoadAllLanguages() {
    const restart = true;
    return store.dispatch(loadAllLanguages(restart));
  }

  static getSyncUpHistory() {
    logger.log('getSyncUpHistory');
    return SyncUpHelper.findAllSyncUpByExample({});
  }

  static getLastSyncInDays() {
    logger.log('getLastSyncInDays');
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
    logger.log('checkIfToForceSyncUp');
    return Promise.all([SyncUpManager.getLastSyncInDays(), SyncUpManager.getLastSuccessfulSyncUp(),
      SyncUpManager.getLastSyncUpIdForCurrentUser(), SetupManager.getCurrentVersionAuditLog()])
      .then(([days, lastSuccessful, lastSyncUpIdForCurrentUser, currVerAudit]) => {
        const didSyncUp = !!lastSyncUpIdForCurrentUser;
        const forceBecauseDays = days === undefined || days > SYNCUP_FORCE_DAYS;
        const user = store.getState().userReducer.userData; // No need to to go the DB in this stage.
        const hasUserData = lastSuccessful && lastSuccessful[SYNCUP_SYNC_REQUESTED_AT] > user.registeredOnClient;
        const currVerFirstStartedAt = currVerAudit[CSC.FIRST_STARTED_AT];
        const syncedForCurrVer = lastSuccessful && lastSuccessful[SYNCUP_SYNC_REQUESTED_AT] > currVerFirstStartedAt;
        const forceSyncUp = forceBecauseDays || !hasUserData || !syncedForCurrVer;
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
    logger.log('isWarnSyncUp');
    return SyncUpManager.getLastSyncInDays().then((days) =>
      (days === undefined || days > SYNCUP_BEST_BEFORE_DAYS)
    );
  }

  static getSyncUpStatusMessage() {
    const { didUserSuccessfulSyncUp, daysFromLastSuccessfulSyncUp, lastSuccessfulSyncUp, didSyncUp } =
      store.getState().syncUpReducer;
    // detect message & build notification
    let message = null;
    if (didUserSuccessfulSyncUp) {
      if (daysFromLastSuccessfulSyncUp > SYNCUP_FORCE_DAYS) {
        message = translate('tooOldSyncWarning');
      } else {
        const successAt = DateUtils.createFormattedDate(lastSuccessfulSyncUp[SYNCUP_SYNC_REQUESTED_AT]);
        message = `${translate('syncWarning')} ${translate('lastSuccessfulSyncupDate').replace('%date%', successAt)}`;
      }
    } else if (didSyncUp) {
      message = `${translate('syncWarning')} ${translate('allPreviousSyncUpFailed')}`;
    } else {
      message = translate('syncWarning');
    }
    return message;
  }

  static cleanupOldSyncUpLogs() {
    logger.log('cleanupOldSyncUpLogs');
    return SyncUpManager._deleteOldSyncUpLogs()
      .then(SyncUpManager._deleteOldDetails)
      .catch(errorObject => {
        // no need to reject and interrupt other actions, just log and notify
        logger.error(`Could not properly cleanup old sync up logs: ${errorObject}`);
        const notification = new ErrorNotificationHelper({ errorObject, origin: NOTIFICATION_ORIGIN_SYNCUP_PROCESS });
        store.dispatch(addMessage(notification));
      });
  }

  static _deleteOldSyncUpLogs() {
    logger.log('_deleteOldSyncUpLogs');
    return SyncUpManager._getMustKeepSyncUpLogsIds().then(syncUpLogIdsToKeep => {
      const dateStr = DateUtils.getDateFromNow(OLD_SYNC_LOGS_DURATION_ISO_8601).toISOString();
      const filter = { $and: [{ id: { $nin: syncUpLogIdsToKeep } }, { dateStarted: { $lt: dateStr } }] };
      return SyncUpHelper.deleteSyncUpLogs(filter);
    });
  }

  static _getMustKeepSyncUpLogsIds() {
    return Promise.all([
      SyncUpHelper.getLastSyncUpLogs(NR_OLD_SYNC_LOGS_TO_KEEP_MINIMUM, { id: 1 })
        .then(logs => Utils.flattenToListByKey(logs, 'id')),
      SyncUpManager._getUserMustKeepSyncUpLogIds()
    ]).then(([logsToKeepIds, mustKeepLogIds]) => logsToKeepIds.concat(mustKeepLogIds));
  }

  static _getUserMustKeepSyncUpLogIds() {
    return UserHelper.findAllClientRegisteredUsersByExample({}, { id: 1 })
      .then(registeredUsers =>
        Promise.all(Utils.flattenToListByKey(registeredUsers, 'id').map(userId => {
          const filter = Utils.toMap(SYNCUP_SYNC_REQUESTED_BY, userId);
          filter.status = SYNCUP_STATUS_SUCCESS;
          return SyncUpHelper.getLatestId(filter);
        })));
  }

  static _deleteOldDetails() {
    logger.log('_deleteOldDetails');
    // We cannot user .updateCollectionFields since our details are within units collection
    return SyncUpHelper.getLastSyncUpLogs(NR_SYNC_HISTORY_ENTRIES, { id: 1 })
      .then(logs => Utils.flattenToListByKey(logs, 'id'))
      .then(lastSyncUpLogIds => SyncUpHelper.findAllSyncUpByExample({ id: { $nin: lastSyncUpLogIds } }))
      .then(oldLogs => {
        if (oldLogs && oldLogs.length) {
          oldLogs.forEach(oldLog => oldLog.units && oldLog.units.forEach(unit => unit && delete unit.details));
          return SyncUpHelper.saveOrUpdateSyncUpCollection(oldLogs);
        }
        return Promise.resolve();
      });
  }
}
