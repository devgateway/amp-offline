/* eslint "no-nested-ternary": 0 */
import UsersSyncUpManager from './syncupManagers/UsersSyncUpManager';
import SyncUpDiff from './SyncUpDiff';
import ConnectionHelper from '../connectivity/ConnectionHelper';
import { SYNC_URL, TEST_URL } from '../connectivity/AmpApiConstants';
import SyncUpHelper from '../helpers/SyncUpHelper';
import TranslationSyncUpManager from './syncupManagers/TranslationSyncUpManager';
import { loadAllLanguages } from '../../actions/TranslationAction';
import store from '../../index';
import {
  SYNCUP_BEST_BEFORE_DAYS,
  SYNCUP_DATETIME_FIELD,
  SYNCUP_DIFF_LEFTOVER,
  SYNCUP_FORCE_DAYS,
  SYNCUP_NO_DATE,
  SYNCUP_STATUS_FAIL,
  SYNCUP_STATUS_SUCCESS,
  SYNCUP_TYPE_ACTIVITIES,
  SYNCUP_TYPE_ASSETS,
  SYNCUP_TYPE_FIELDS,
  SYNCUP_TYPE_GS,
  SYNCUP_TYPE_POSSIBLE_VALUES,
  SYNCUP_TYPE_TRANSLATIONS,
  SYNCUP_TYPE_USERS,
  SYNCUP_TYPE_WORKSPACE_MEMBERS,
  SYNCUP_TYPE_WORKSPACE_SETTINGS,
  SYNCUP_TYPE_WORKSPACES
} from '../../utils/Constants';
import WorkspaceSyncUpManager from './syncupManagers/WorkspaceSyncUpManager';
import GlobalSettingsSyncUpManager from './syncupManagers/GlobalSettingsSyncUpManager';
import WorkspaceMemberSyncUpManager from './syncupManagers/WorkspaceMemberSyncUpManager';
import AmpAssetManager from './syncupManagers/AmpAssetManager';
import ActivitiesPushToAMPManager from './syncupManagers/ActivitiesPushToAMPManager';
import ActivitiesPullFromAMPManager from './syncupManagers/ActivitiesPullFromAMPManager';
import FieldsSyncUpManager from './syncupManagers/FieldsSyncUpManager';
import PossibleValuesSyncUpManager from './syncupManagers/PossibleValuesSyncUpManager';
import translate from '../../utils/translate';
import LoggerManager from '../../modules/util/LoggerManager';
import { loadNumberSettings } from '../../actions/StartUpAction';
import WorkspaceSettingsSyncUpManager from './syncupManagers/WorkspaceSettingsSyncUpManager';
import SyncUpManagerInterface from './syncupManagers/SyncUpManagerInterface';

/* This list allow us to un-hardcode and simplify the syncup process. */
const syncUpModuleList = [
  { type: SYNCUP_TYPE_ASSETS, SyncUpClass: AmpAssetManager },
  { type: SYNCUP_TYPE_USERS, SyncUpClass: UsersSyncUpManager },
  { type: SYNCUP_TYPE_WORKSPACE_MEMBERS, SyncUpClass: WorkspaceMemberSyncUpManager },
  // keep import placeholder first or, if needed, change _configureActivitiesImportSyncUp, or AMPOFFLINE-209
  { type: SYNCUP_TYPE_ACTIVITIES },
  { type: SYNCUP_TYPE_ACTIVITIES, SyncUpClass: ActivitiesPullFromAMPManager },
  { type: SYNCUP_TYPE_FIELDS, SyncUpClass: FieldsSyncUpManager },
  { type: SYNCUP_TYPE_POSSIBLE_VALUES, SyncUpClass: PossibleValuesSyncUpManager },
  { type: SYNCUP_TYPE_TRANSLATIONS, SyncUpClass: TranslationSyncUpManager },
  { type: SYNCUP_TYPE_WORKSPACES, SyncUpClass: WorkspaceSyncUpManager },
  { type: SYNCUP_TYPE_GS, SyncUpClass: GlobalSettingsSyncUpManager },
  { type: SYNCUP_TYPE_WORKSPACE_SETTINGS, SyncUpClass: WorkspaceSettingsSyncUpManager }
];

const _noActivitiesImport = { type: SYNCUP_TYPE_ACTIVITIES, SyncUpClass: null };

const _activitiesImport = { type: SYNCUP_TYPE_ACTIVITIES, isForced: true, SyncUpClass: ActivitiesPushToAMPManager };

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
    LoggerManager.log('getLastSuccessfulSyncUps');
    return new Promise((resolve, reject) => (
      SyncUpHelper.findAllSyncUpByExample({
        status: SYNCUP_STATUS_SUCCESS,
        $not: { timestamp: null }
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

  static getSyncUpDiffLeftOver() {
    LoggerManager.log('getSyncUpDiffLeftOver');
    return SyncUpHelper.getLatestId().then(id => {
      if (id === 0) {
        return new SyncUpDiff();
      }
      return SyncUpHelper.findSyncUpByExample({ id }).then(lastSyncUpLog =>
        new SyncUpDiff(lastSyncUpLog ? lastSyncUpLog[SYNCUP_DIFF_LEFTOVER] : null)
      );
    });
  }

  static _saveMainSyncUpLog({ status, userId, modules, newTimestamp }) {
    LoggerManager.log('_saveMainSyncUpLog');
    const syncDate = new Date();
    const log = {
      status,
      'requested-by': userId,
      modules,
      'sync-date': syncDate.toISOString()
    };
    log[SYNCUP_DATETIME_FIELD] = newTimestamp;
    return SyncUpHelper.getLatestId().then(id => {
      log.id = id + 1;
      return SyncUpHelper.saveOrUpdateSyncUp(log);
    });
  }

  /**
   * Get the timestamp (comes from server) from the newest successful syncup, use that date to query what changed
   * and then call the EPs from the types that need to be synced.
   */
  static syncUpAllTypesOnDemand() {
    LoggerManager.log('syncUpAllTypesOnDemand');
    // run sync up with activities import first time, then with activities export
    // TODO a better solution can be done through AMPOFFLINE-209
    this._configureActivitiesImportSyncUp(_activitiesImport);
    return this._doSyncUp().then(() => {
      this._configureActivitiesImportSyncUp(_noActivitiesImport);
      return this._doSyncUp();
    });
  }

  static _configureActivitiesImportSyncUp(activitiesImport) {
    const activitiesStep = syncUpModuleList.findIndex(el => el.type === SYNCUP_TYPE_ACTIVITIES);
    syncUpModuleList[activitiesStep] = activitiesImport;
  }

  static _doSyncUp() {
    LoggerManager.log('_doSyncUp');
    /* We can save time by running these 2 promises in parallel because they are not related (one uses the network
     and the other the local database. */
    return new Promise((resolve, reject) =>
      Promise.all([
        this.prepareNetworkForSyncUp(TEST_URL), this.getLastSuccessfulSyncUp(), this.getSyncUpDiffLeftOver()]
      ).then(([, lastSuccessfulSyncUp, syncUpDiffFromDB]) => {
        const userId = store.getState().user.userData.id;
        const oldTimestamp = lastSuccessfulSyncUp[SYNCUP_DATETIME_FIELD];
        const syncUpDiffLeftOver = new SyncUpDiff(syncUpDiffFromDB);
        return this.getWhatChangedInAMP(userId, oldTimestamp).then((changes) => {
          // Get list of types that need to be synced.
          const toSyncList = this._filterOutModulesToSync(changes);
          // Call each sync EP in parallel.
          return this._syncUpItems(toSyncList, changes, syncUpDiffLeftOver).then((modules) => {
            const successful = Object.keys(syncUpDiffLeftOver.syncUpDiff).length === 1;
            LoggerManager.log(`SyncUp ${successful ? 'OK' : 'Fail'}`);
            const status = successful ? SYNCUP_STATUS_SUCCESS : SYNCUP_STATUS_FAIL;
            const newTimestamp = changes[SYNCUP_DATETIME_FIELD];
            const statusLog = { status, userId, modules, newTimestamp };
            if (!successful) {
              statusLog[SYNCUP_DIFF_LEFTOVER] = syncUpDiffLeftOver.syncUpDiff;
            }
            return this._saveMainSyncUpLog(statusLog).then((log) => {
              // Update translations.
              const restart = true;
              store.dispatch(loadAllLanguages(restart));
              // Update number format settings.
              return loadNumberSettings().then(() => (resolve(log))).catch(reject);
            }).catch(reject);
          }).catch((err) => {
            // this._syncUpItems must always resolve now, no rejection. This branch is an abnormal case.
            // TODO report to the app errors log to be addressed? or try to save partial sync up?
            LoggerManager.error(`Unexpected sync up error: ${err}`);
            const status = SYNCUP_STATUS_FAIL;
            // Always reject so we can display the error after saving the log.
            return this._saveMainSyncUpLog({ status, userId }).then(() => reject(err)).catch(reject);
          });
        }).catch(reject);
      }).catch(reject)
    );
  }

  static _filterOutModulesToSync(changes) {
    LoggerManager.log('_filterOutModulesToSync');
    // Filter out syncUpModuleList and keep only what needs to be resynced.
    // TODO: remove this flag once AMP-25568 is done
    changes[SYNCUP_TYPE_FIELDS] = true;
    changes[SYNCUP_TYPE_ASSETS] = true;
    return syncUpModuleList.filter((item) => {
      if (!item.SyncUpClass) {
        return undefined;
      }
      if (item.isForced === true) {
        return item;
      }
      const changeItem = changes[item.type];
      if (changeItem instanceof Object) {
        // Activities, users, etc.
        if ((Object.prototype.hasOwnProperty.call(changeItem, 'length') && changeItem.length > 0) ||
          (Object.prototype.hasOwnProperty.call(changeItem, 'removed') && changeItem.removed.length > 0) ||
          (Object.prototype.hasOwnProperty.call(changeItem, 'saved') && changeItem.saved.length > 0)) {
          return item;
        }
        return undefined;
      } else if (changeItem === true) { // Workspaces, translations, etc.
        return item;
      }
      return undefined;
    });
  }

  /**
   * Iterate the list of types (which is a sublist of 'syncUpModuleList') and perform all 'fn' functions.
   * @param syncUpItems
   * @param changes
   * @param syncUpDiffLeftOver
   */
  static _syncUpItems(syncUpItems, changes, syncUpDiffLeftOver: SyncUpDiff) {
    LoggerManager.log('_syncUpItems');

    const fnSync = (syncUpItem) => (
      new Promise((resolve) => {
        const type = syncUpItem.type;
        syncUpDiffLeftOver.merge(type, changes[type]);
        const itemDiff = syncUpDiffLeftOver.syncUpDiff[type];
        const itemSyncUpManager = new syncUpItem.SyncUpClass();
        return itemSyncUpManager.doSyncUp(itemDiff).then(() =>
          resolve(this._processResultStatus(type, itemSyncUpManager, syncUpDiffLeftOver))
        ).catch((error) => {
          LoggerManager.error(`SyncUp Error for ${syncUpItem.type}: ${error}`);
          /* We are not rolling back any data saved until here. This will be especially needed during canceling.
           Thus let's remember what we managed to sync, set sync up status to failed, but on next sync rather resume
           from where it stopped till the latest.
           Also we do not expect to interrupt the sync up for all failed syncup, but based on dependencies.
           TODO AMPOFFLINE-209
           */
          resolve(this._processResultStatus(type, itemSyncUpManager, syncUpDiffLeftOver));
        });
      })
    );

    const promises = syncUpItems.map(fnSync);
    return Promise.all(promises);
  }

  static _processResultStatus(type, itemSyncUpManager: SyncUpManagerInterface, syncUpDiffLeftOver: SyncUpDiff) {
    syncUpDiffLeftOver.setDiff(type, itemSyncUpManager.getDiffLeftover());
    const status = syncUpDiffLeftOver.syncUpDiff[type] ? SYNCUP_STATUS_FAIL : SYNCUP_STATUS_SUCCESS;
    return { type, status };
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

  static getSyncUpHistory() {
    LoggerManager.log('getSyncUpHistory');
    return SyncUpHelper.findAllSyncUpByExample({});
  }

  static getWhatChangedInAMP(user, time) {
    LoggerManager.log('getWhatChangedInAMP');
    const paramsMap = { 'user-ids': user };
    // Dont send the date param at all on first-sync.
    if (time && time !== SYNCUP_NO_DATE) {
      paramsMap['last-sync-time'] = encodeURIComponent(time);
    }
    return ConnectionHelper.doGet({ url: SYNC_URL, paramsMap });
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
  static isForceSyncUp() {
    LoggerManager.log('isForceSyncUp');
    return SyncUpManager.getLastSyncInDays().then((days) => {
      const forceBecauseDays = days === undefined || days > SYNCUP_FORCE_DAYS;
      const user = store.getState().user.userData; // No need to to go the DB in this stage.
      const hasUserData = !!user['first-name']; // Hint: this is the same as a ternary if :)
      const force = forceBecauseDays || !hasUserData;
      let message = '';
      if (force) {
        if (forceBecauseDays) {
          message = translate('tooOldSyncWarning');
        } else {
          message = translate('noUserDataSyncWarning');
        }
      }
      return { force, message };
    });
  }

  static isWarnSyncUp() {
    LoggerManager.log('isWarnSyncUp');
    return SyncUpManager.getLastSyncInDays().then((days) =>
      (days === undefined || days > SYNCUP_BEST_BEFORE_DAYS)
    );
  }
}
