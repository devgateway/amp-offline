/* eslint "no-nested-ternary": 0 */
import syncUpUsers from './SyncUpUsers';
import ConnectionHelper from '../connectivity/ConnectionHelper';
import {
  TEST_URL,
  SYNC_URL
} from '../connectivity/AmpApiConstants';
import SyncUpHelper from '../helpers/SyncUpHelper';
import TranslationSyncUpManager from './TranslationSyncUpManager';
import { loadAllLanguages } from '../../actions/TranslationAction';
import store from '../../index';
import {
  SYNCUP_TYPE_TRANSLATIONS,
  SYNCUP_TYPE_GS,
  SYNCUP_TYPE_USERS,
  SYNCUP_TYPE_WORKSPACE_MEMBERS,
  SYNCUP_TYPE_WORKSPACES,
  SYNCUP_TYPE_ACTIVITIES,
  SYNCUP_STATUS_SUCCESS,
  SYNCUP_STATUS_FAIL,
  SYNCUP_DATETIME_FIELD,
  SYNCUP_NO_DATE,
} from '../../utils/Constants';
import WorkspaceSyncUpManager from './WorkspaceSyncUpManager';
import GlobalSettingsSyncUpManager from './GlobalSettingsSyncUpManager';
import WorkspaceMemberSyncUpManager from './WorkspaceMemberSyncUpManager';
import ActivitiesPushToAMPManager from './ActivitiesPushToAMPManager';
import ActivitiesPullFromAMPManager from './ActivitiesPullFromAMPManager';

const SyncUpManager = {

  /* This list allow us to un-hardcode and simplify the syncup process. */
  syncUpModuleList: [
    { type: SYNCUP_TYPE_USERS, fn: syncUpUsers },
    {
      type: SYNCUP_TYPE_WORKSPACE_MEMBERS,
      fn: WorkspaceMemberSyncUpManager.syncWorkspaceMembers,
      context: WorkspaceMemberSyncUpManager
    },
    // keep import placeholder first or, if needed, change _configureActivitiesImportSyncUp, or AMPOFFLINE-209
    { type: SYNCUP_TYPE_ACTIVITIES },
    {
      type: SYNCUP_TYPE_ACTIVITIES,
      fn: (saved, removed) => {
        const exporter = new ActivitiesPullFromAMPManager();
        return exporter.pullActivitiesFromAMP(saved, removed);
      }
    },
    { type: SYNCUP_TYPE_TRANSLATIONS, fn: TranslationSyncUpManager.syncUpLangList.bind(TranslationSyncUpManager) },
    { type: SYNCUP_TYPE_WORKSPACES, fn: WorkspaceSyncUpManager.syncUpWorkspaces },
    { type: SYNCUP_TYPE_GS, fn: GlobalSettingsSyncUpManager.syncUpGlobalSettings }
  ],

  _noActivitiesImport: { type: SYNCUP_TYPE_ACTIVITIES },

  _activitiesImport: {
    type: SYNCUP_TYPE_ACTIVITIES,
    fn: (saved, removed) => {
      // passing importer as a context doesn't work (this is undefined, even though in debug it is set)
      const importer = new ActivitiesPushToAMPManager();
      return importer.pushActivitiesToAMP(saved, removed);
    }
  },

  /**
   * Return the most recent successful syncup in general (not of every type).
   * @returns {Promise}
   */
  getLastSuccessfulSyncUp() {
    console.log('getLastSuccessfulSyncUps');
    return new Promise((resolve, reject) => (
      SyncUpHelper.findAllSyncUpByExample({
        status: SYNCUP_STATUS_SUCCESS,
        $not: { timestamp: null }
      }).then(data => {
        const sortedData = data.sort(this._sortByLastSyncDateDesc);
        if (sortedData.length > 0) {
          return resolve(sortedData[0]);
        }
        const emptyDateItem = {};
        emptyDateItem[SYNCUP_DATETIME_FIELD] = SYNCUP_NO_DATE; // just not to leave it undefined.
        return resolve(emptyDateItem);
      }).catch(reject)
    ));
  },

  /**
   * Sort by date descending.
   * @param a
   * @param b
   * @returns {number}
   * @private
   */
  _sortByLastSyncDateDesc(a, b) {
    console.log('_sortByLastSyncDateDesc');
    return (a[SYNCUP_DATETIME_FIELD] > b[SYNCUP_DATETIME_FIELD]
      ? -1
      : a[SYNCUP_DATETIME_FIELD] < b[SYNCUP_DATETIME_FIELD] ? 1 : 0);
  },

  /**
   * Check the timestamp of the newest successful syncup older than N days (or none),
   * produce a sublist from 'syncUpModuleList' and call _syncUpTypes with it.
   */
  syncUpTooOldTypes(/* days */) {
    console.log('syncUpTooOldTypes');
    // TODO: To be implemented.
  },

  _saveMainSyncUpLog({ status, userId, modules, newTimestamp }) {
    console.log('_saveMainSyncUpLog');
    const syncDate = new Date();
    const log = {
      id: Math.random(),
      status,
      'requested-by': userId,
      modules,
      'sync-date': syncDate.toISOString()
    };
    log[SYNCUP_DATETIME_FIELD] = newTimestamp;
    return SyncUpHelper.saveOrUpdateSyncUp(log);
  },

  /**
   * Get the timestamp (comes from server) from the newest successful syncup, use that date to query what changed
   * and then call the EPs from the types that need to be synced.
   */
  syncUpAllTypesOnDemand() {
    console.log('syncUpAllTypesOnDemand');
    // run sync up with activities import first time, then with activities export
    // TODO a better solution can be done through AMPOFFLINE-209
    this._configureActivitiesImportSyncUp(this._activitiesImport);
    return this._doSyncUp().then(() => {
      this._configureActivitiesImportSyncUp(this._noActivitiesImport);
      return this._doSyncUp();
    });
  },

  _configureActivitiesImportSyncUp(activitiesImport) {
    const activitiesStep = this.syncUpModuleList.findIndex(el => el.type === SYNCUP_TYPE_ACTIVITIES);
    this.syncUpModuleList[activitiesStep] = activitiesImport;
  },

  _doSyncUp() {
    console.log('_doSyncUp');
    /* We can save time by running these 2 promises in parallel because they are not related (one uses the network
     and the other the local database. */
    return new Promise((resolve, reject) => (
      Promise.all([this.prepareNetworkForSyncUp(TEST_URL), this.getLastSuccessfulSyncUp()]).then((promises) => {
        const lastSuccessfulSyncUp = promises[1];
        const userId = store.getState().user.userData.id;
        const oldTimestamp = lastSuccessfulSyncUp[SYNCUP_DATETIME_FIELD];
        return this.getWhatChangedInAMP(userId, oldTimestamp).then((changes) => {
          // Get list of types that need to be synced.
          const toSyncList = this._filterOutModulesToSync(changes);
          // Call each sync EP in parallel.
          return this._syncUpTypes(toSyncList, changes).then((modules) => {
            console.log('SyncUp Ok');
            const status = SYNCUP_STATUS_SUCCESS;
            const newTimestamp = changes[SYNCUP_DATETIME_FIELD];
            return this._saveMainSyncUpLog({ status, userId, modules, newTimestamp }).then((log) => {
              const restart = true;
              return store.dispatch(loadAllLanguages(restart).then(resolve(log)));
            }).catch(reject);
          }).catch(err => {
            console.log('SyncUp Fail');
            // Always reject so we can display the error after saving the log.
            return this._saveMainSyncUpLog(SYNCUP_STATUS_FAIL).then(reject(err)).catch(reject);
          });
        }).catch(reject);
      }).catch(reject)
    ));
  },

  _filterOutModulesToSync(changes) {
    console.log('_filterOutModulesToSync');
    // Filter out syncUpModuleList and keep only what needs to be resynced.
    return this.syncUpModuleList.filter((item) => {
      const changeItem = changes[item.type];
      if (changeItem instanceof Object) {
        // Activities, users, etc.
        if (changeItem.removed.length > 0 || changeItem.saved.length > 0) {
          return item;
        }
        return undefined;
      } else if (changeItem === true) { // Workspaces, translations, etc.
        return item;
      }
      return undefined;
    });
  },

  /**
   * Iterate the list of types (which is a sublist of 'syncUpModuleList') and perform all 'fn' functions.
   * @param types
   */
  _syncUpTypes(types, changes) {
    console.log('_syncUpTypes');

    const fnSync = (type) => (
      new Promise((resolve, reject) => {
        const changeItem = changes[type.type];
        const ret = { type: type.type, status: SYNCUP_STATUS_SUCCESS };
        if (changeItem instanceof Object) {
          // Activities, ws members, etc.
          const saved = changeItem.saved;
          const removed = changeItem.removed;
          return type.fn.call(type.context, saved, removed).then(() => resolve(ret)).catch(reject);
        } else {
          return type.fn().then(resolve(ret)).catch(reject);
        }
      })
    );

    const promises = types.map(fnSync);
    return Promise.all(promises);
  },

  /**
   * This function is used to call a testing EP that will force the online login (just one time) if needed.
   * This way we avoid having multiple concurrent online logins for each sync call.
   * @returns {*}
   */
  prepareNetworkForSyncUp() {
    console.log('prepareNetworkForSyncUp');
    return ConnectionHelper.doGet({ url: TEST_URL });
  },

  getSyncUpHistory() {
    console.log('getSyncUpHistory');
    return SyncUpHelper.findAllSyncUpByExample({});
  },

  getWhatChangedInAMP(user, time) {
    console.log('getWhatChangedInAMP');
    const paramsMap = { 'user-ids': user };
    // Dont send the date param at all on first-sync.
    if (time && time !== SYNCUP_NO_DATE) {
      paramsMap['last-sync-time'] = encodeURIComponent(time);
    }
    return ConnectionHelper.doGet({ url: SYNC_URL, paramsMap });
  }
};

module.exports = SyncUpManager;
