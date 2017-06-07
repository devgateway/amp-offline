/* eslint "no-nested-ternary": 0 */
import UsersSyncUpManager from './syncupManagers/UsersSyncUpManager';
import SyncUpDiff from './SyncUpDiff';
import SyncUpUnits from './SyncUpUnits';
import * as Utils from '../../utils/Utils';
import { AMP_ID } from '../../utils/constants/ActivityConstants';
import ConnectionHelper from '../connectivity/ConnectionHelper';
import { SYNC_URL, TEST_URL } from '../connectivity/AmpApiConstants';
import * as ActivityHelper from '../helpers/ActivityHelper';
import SyncUpHelper from '../helpers/SyncUpHelper';
import * as UserHelper from '../helpers/UserHelper';
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
  SYNCUP_TYPE_ACTIVITIES_PULL,
  SYNCUP_TYPE_ACTIVITIES_PUSH,
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
import { loadNumberSettings, loadDateSettings } from '../../actions/StartUpAction';
import WorkspaceSettingsSyncUpManager from './syncupManagers/WorkspaceSettingsSyncUpManager';
import SyncUpManagerInterface from './syncupManagers/SyncUpManagerInterface';

/* This list allow us to un-hardcode and simplify the syncup process. */
const syncUpModuleList = [
  { type: SYNCUP_TYPE_ASSETS, SyncUpClass: AmpAssetManager },
  { type: SYNCUP_TYPE_USERS, SyncUpClass: UsersSyncUpManager },
  { type: SYNCUP_TYPE_WORKSPACE_MEMBERS, SyncUpClass: WorkspaceMemberSyncUpManager },
  // keep import placeholder first or, if needed, change _configureActivitiesImportSyncUp, or AMPOFFLINE-209
  { type: SYNCUP_TYPE_ACTIVITIES_PUSH },
  { type: SYNCUP_TYPE_ACTIVITIES_PULL, SyncUpClass: ActivitiesPullFromAMPManager },
  { type: SYNCUP_TYPE_FIELDS, SyncUpClass: FieldsSyncUpManager },
  { type: SYNCUP_TYPE_POSSIBLE_VALUES, SyncUpClass: PossibleValuesSyncUpManager },
  { type: SYNCUP_TYPE_TRANSLATIONS, SyncUpClass: TranslationSyncUpManager },
  { type: SYNCUP_TYPE_WORKSPACES, SyncUpClass: WorkspaceSyncUpManager },
  { type: SYNCUP_TYPE_GS, SyncUpClass: GlobalSettingsSyncUpManager },
  { type: SYNCUP_TYPE_WORKSPACE_SETTINGS, SyncUpClass: WorkspaceSettingsSyncUpManager }
];

const _noActivitiesPush = { type: SYNCUP_TYPE_ACTIVITIES_PUSH, SyncUpClass: null };

const _activitiesPush = { type: SYNCUP_TYPE_ACTIVITIES_PUSH, isForced: true, SyncUpClass: ActivitiesPushToAMPManager };

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

  /**
   * Get the timestamp (comes from server) from the newest successful syncup, use that date to query what changed
   * and then call the EPs from the types that need to be synced.
   */
  static syncUpAllTypesOnDemand() {
    LoggerManager.log('syncUpAllTypesOnDemand');
    // run sync up with activities import first time, then with activities export
    // an interim storage for errors, until AMPOFFLINE-209 and/or AMPOFFLINE-470
    const errors = [];
    // TODO a better solution can be done through AMPOFFLINE-209
    this._configureActivitiesImportSyncUp(_activitiesPush);
    return this._startSyncUp().then((result) => {
      if (result.errors) {
        errors.push(...result.errors);
      }
      this._configureActivitiesImportSyncUp(_noActivitiesPush);
      return this._startSyncUp();
    }).then((result) => this._postSyncUp().then(() => {
      if (result.errors) {
        errors.push(...result.errors);
      }
      if (errors.length) {
        return Promise.reject(errors.join('. '));
      }
      return result;
    }));
  }

  static _configureActivitiesImportSyncUp(activitiesImport) {
    const activitiesStep = syncUpModuleList.findIndex(el => el.type === SYNCUP_TYPE_ACTIVITIES_PUSH);
    syncUpModuleList[activitiesStep] = activitiesImport;
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

  /**
   * Get all unique existing amp-ids
   * @return {Promise.<Set>|*}
   */
  static getAmpIds() {
    return ActivityHelper.findAll(Utils.toDefinedNotNullRule(AMP_ID), Utils.toMap(AMP_ID, 1)).then(ampIds =>
      new Set(Utils.flattenToListByKey(ampIds, AMP_ID)));
  }

  static getWhatChangedInAMP(userIds, time, ampIds) {
    LoggerManager.log('getWhatChangedInAMP');
    userIds = Utils.flattenToListByKey(userIds, 'id');
    const body = { 'user-ids': userIds };
    // Dont send the date param at all on first-sync.
    if (time && time !== SYNCUP_NO_DATE) {
      body['last-sync-time'] = time;
    }
    // normally we would add amp-ids only if this is not a firs time sync, but due to AMP-26054 we are doing it always
    body['amp-ids'] = ampIds;
    return ConnectionHelper.doPost({ url: SYNC_URL, body });
  }

  static _startSyncUp() {
    LoggerManager.log('_startSyncUp');
    /* We can save time by running these 2 promises in parallel because they are not related (one uses the network
     and the other the local database. */
    return new Promise((resolve, reject) =>
      Promise.all([this.prepareNetworkForSyncUp(TEST_URL), this.getLastSyncUpLog(), this.getAmpIds(),
        UserHelper.getRegisteredUserIds()]
      ).then(([, lastSyncUpLog, ampIds, registeredUsersIds]) => {
        const userId = store.getState().userReducer.userData.id;
        const oldTimestamp = lastSyncUpLog[SYNCUP_DATETIME_FIELD];
        const syncUpDiffLeftOver = new SyncUpDiff(lastSyncUpLog[SYNCUP_DIFF_LEFTOVER]);
        return this.getWhatChangedInAMP(registeredUsersIds, oldTimestamp, ampIds)
          .then((changes) => resolve(this._runSyncUp(userId, changes, syncUpDiffLeftOver)))
          .catch(reject);
      }).catch(reject)
    );
  }

  static _runSyncUp(userId, changes, syncUpDiffLeftOver) {
    // Get list of types that need to be synced.
    const toSyncList = this._filterOutModulesToSync(changes, syncUpDiffLeftOver);
    const newTimestamp = changes[SYNCUP_DATETIME_FIELD];
    const syncUpUnits = new SyncUpUnits();
    // TODO: add dependency lists, but so far simply run sync EPs in parallel
    return new Promise((resolve, reject) =>
      this._syncUpItems(toSyncList, changes, syncUpDiffLeftOver, syncUpUnits)
        .then((modules) =>
          resolve(this._saveMainSyncUpLog({ userId, newTimestamp, syncUpDiffLeftOver, modules })))
        .catch((err) => {
          // partial sync up was done, some unexpected problem occurred
          LoggerManager.error(`Unexpected sync up error: ${err}`);
          return syncUpUnits.wait().then(errors =>
            // the above err is already included into errors, caught by syncUpUnits
            this._saveMainSyncUpLog({ userId, newTimestamp, syncUpDiffLeftOver, errors })
              .then(() => reject(errors.join('. ')))
              .catch((err2) => {
                errors.add(err2);
                return reject(errors.join('. '));
              })
          );
        })
    );
  }

  static _filterOutModulesToSync(changes, syncUpDiffLeftOver: SyncUpDiff) {
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
      } else if (changeItem === true) { // Workspaces, translations, etc.
        return item;
      }
      if (syncUpDiffLeftOver.syncUpDiff[item.type]) {
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
   * @param syncUpUnits
   */
  static _syncUpItems(syncUpItems, changes, syncUpDiffLeftOver: SyncUpDiff, syncUpUnits: SyncUpUnits) {
    LoggerManager.log('_syncUpItems');

    const fnSync = (syncUpItem) => {
      const syncUpUnitPromise = new Promise((resolve) => {
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
          return resolve(this._processResultStatus(type, itemSyncUpManager, syncUpDiffLeftOver, error));
        });
      });
      syncUpUnits.add(syncUpUnitPromise);
      return syncUpUnitPromise;
    };

    const promises = syncUpItems.map(fnSync);
    return Promise.all(promises);
  }

  static _processResultStatus(type, itemSyncUpManager: SyncUpManagerInterface, syncUpDiffLeftOver: SyncUpDiff, error) {
    syncUpDiffLeftOver.setDiff(type, itemSyncUpManager.getDiffLeftover());
    const status = syncUpDiffLeftOver.syncUpDiff[type] ? SYNCUP_STATUS_FAIL : SYNCUP_STATUS_SUCCESS;
    return { type, status, error };
  }

  static _saveMainSyncUpLog({ userId, newTimestamp, syncUpDiffLeftOver, modules, errors }) {
    LoggerManager.log('_saveMainSyncUpLog');
    const successful = Object.keys(syncUpDiffLeftOver.syncUpDiff).length === 0;
    LoggerManager.log(`SyncUp ${successful ? 'OK' : 'Fail'}`);
    const status = successful ? SYNCUP_STATUS_SUCCESS : SYNCUP_STATUS_FAIL;
    const syncUpDiff = successful ? null : syncUpDiffLeftOver.syncUpDiff;
    if (!successful && modules) {
      errors = this._collectErrors(modules, errors);
    }
    const syncDate = new Date();
    const log = {
      status,
      'requested-by': userId,
      modules,
      errors,
      'sync-date': syncDate.toISOString()
    };
    log[SYNCUP_DATETIME_FIELD] = newTimestamp;
    if (syncUpDiff) {
      log[SYNCUP_DIFF_LEFTOVER] = syncUpDiff;
    }
    return SyncUpHelper.getLatestId().then(id => {
      log.id = id + 1;
      return SyncUpHelper.saveOrUpdateSyncUp(log);
    });
  }

  static _collectErrors(modules, errors) {
    return modules.reduce((errorsList, module) => {
      if (module.error) {
        errorsList.push(module.error);
      }
      return errorsList;
    }, errors || []);
  }

  static _postSyncUp() {
    const restart = true;
    return Promise.all([
      loadAllLanguages(restart),
      loadDateSettings(),
      loadNumberSettings()]);
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
  static isForceSyncUp() {
    LoggerManager.log('isForceSyncUp');
    return SyncUpManager.getLastSyncInDays().then((days) => {
      const forceBecauseDays = days === undefined || days > SYNCUP_FORCE_DAYS;
      const user = store.getState().userReducer.userData; // No need to to go the DB in this stage.
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
