import SyncUpConfig from './SyncUpConfig';
import SyncUpUnits from './SyncUpUnits';
import SyncUpDiff from './SyncUpDiff';
import * as SS from './SyncUpUnitState';
import SyncUpManagerInterface from './syncupManagers/SyncUpManagerInterface';
import ActivitiesPushToAMPManager from './syncupManagers/ActivitiesPushToAMPManager';
import * as ActivityHelper from '../helpers/ActivityHelper';
import * as UserHelper from '../helpers/UserHelper';
import { SYNC_URL } from '../connectivity/AmpApiConstants';
import ConnectionHelper from '../connectivity/ConnectionHelper';
import {
  SYNCUP_DATETIME_FIELD,
  SYNCUP_DEPENDENCY_CHECK_INTERVAL,
  SYNCUP_DIFF_LEFTOVER,
  SYNCUP_NO_DATE,
  SYNCUP_STATUS_FAIL,
  SYNCUP_STATUS_SUCCESS,
  SYNCUP_TYPE_ACTIVITIES_PUSH,
  SYNCUP_TYPE_ASSETS,
  SYNCUP_TYPE_ACTIVITY_FIELDS,
  SYNCUP_TYPE_EXCHANGE_RATES
} from '../../utils/Constants';
import LoggerManager from '../../modules/util/LoggerManager';
import * as Utils from '../../utils/Utils';

/* eslint-disable class-methods-use-this */

/**
 * This class executes the sync up from the last sync up attempt including any leftover. The execution is controlled by
 * the dependency rules. The scope is to try to sync up as much as possible and skip any temporary connectivity issues.
 *
 * @author Nadejda Mandrescu
 */
export default class SyncUpRunner {
  /**
   * Sync up process:
   * 1. Query sync diff EP to get the changes diff. It also provides "timestamp" to be used for the next sync up.
   * 2. Sync the diff to AMP Offline client and push activities changed on the client
   * 3. Get latest data for pushed activities (like AMP server side updated/created timestamp)
   * 4. Record the leftover, so that on the next sync we resume from leftover plus new changes from the last sync.
   *
   * Activities that are pushed to AMP are recorded on AMP server at a later "timestamp" than the one provided by the
   * sync diff EP. We should not get them again on the next sync up (to avoid false positive rejection). Hence we need
   * to store a later sync up diff timestamp, that is newer than pushed activities timestamp. We cannot simply generate
   * it on the client side:
   * a) we do not track (for now at least) the server-client time diff to correctly compute it
   * b) there can be new AMP changes between initial timestamp and after all activities are pushed
   *
   * To overcome this, we do a double sync:
   * 1. First one will sync all units
   * 2. Second will sync all units except activities push. Those that were not pushed, will have to be pushed next time.
   * As a result we will have correct timestamp and synced data will be consistent (with an eventual leftover).
   *
   * Nevertheless the "runner" should report back only one sync result, even if two sync up diff EP requests are done.
   */

  /** Sync up run no 1 */
  static _SYNC_RUN_1 = 1;
  /** Sync up run no 2 */
  static _SYNC_RUN_2 = 2;

  /**
   * Generates a new instance of the Sync Up Runner. This must be only instance per user request.
   * @param userId the user id that initiates the sync up
   * @param lastTimestamp the timestamp from the latest sync up (if any)
   * @param syncUpDiffLeftOver the leftover from previous sync up (if any)
   */
  constructor(userId, lastTimestamp, syncUpDiffLeftOver: SyncUpDiff) {
    LoggerManager.log('SyncUpRunner');
    this._userId = userId;
    this._lastTimestamp = lastTimestamp;
    this._syncUpDiffLeftOver = syncUpDiffLeftOver;
    this._unitsResult = new Map();
    this._aborted = false;
  }

  _selfBindMethods() {
    Object.getOwnPropertyNames(Object.getPrototypeOf(this)).filter(prop => typeof this[prop] === 'function')
      .forEach(methodName => {
        this[methodName] = this[methodName].bind(this);
      });
  }

  /**
   * Initiates the sync up process
   */
  run() {
    LoggerManager.log('run');
    this._selfBindMethods();
    return this._prepare(SyncUpRunner._SYNC_RUN_1).then(this._runSyncUp).then(result => {
      // if we could not even request the sync diff EP or if the sync up is aborted, then no need to start the 2nd run
      if (!this._currentTimestamp || this._aborted) {
        return result;
      }
      return this._prepare(SyncUpRunner._SYNC_RUN_2).then(this._runSyncUp);
    });
  }

  /**
   * Prepares the sync up for the current sync up run iteration. See detailed reasoning for iterations above.
   * @param syncRunNo the sync up run iteration number
   * @private
   */
  _prepare(syncRunNo) {
    LoggerManager.log('_prepare');
    this._syncUpConfig = new SyncUpConfig();
    this._syncUpCollection = this._syncUpConfig.syncUpCollection;
    this._syncUpDependency = this._syncUpConfig.syncUpDependencies;
    this._remainingSyncUpTypes = new Set(this._syncUpCollection.keys());
    this._syncUpUnitPromises = new SyncUpUnits();
    // this._currentTimestamp comes from RUN_1
    this._lastTimestamp = this._currentTimestamp || this._lastTimestamp;
    this._syncRunNo = syncRunNo;

    return Promise.all([ActivityHelper.getUniqueAmpIdsList(), UserHelper.getNonBannedRegisteredUserIds(),
      ActivitiesPushToAMPManager.getActivitiesToPush()])
      .then(([ampIds, userIds, activitiesToPush]) => {
        this._ampIds = ampIds;
        this._registeredUserIds = userIds;
        this._hasActivitiesToPush = activitiesToPush && activitiesToPush.length > 0;
        return this._getCumulativeSyncUpChanges();
      });
  }

  _getCumulativeSyncUpChanges() {
    LoggerManager.log('_getCumulativeSyncUpChanges');
    return this._getWhatChangedInAMP().then(this._mergeToLeftOverAndUpdateNoChanges);
  }

  _getWhatChangedInAMP() {
    LoggerManager.log('_getWhatChangedInAMP');
    const body = { 'user-ids': this._registeredUserIds };
    // Don't send the date param at all on first-sync.
    if (this._lastTimestamp && this._lastTimestamp !== SYNCUP_NO_DATE) {
      body['last-sync-time'] = this._lastTimestamp;
    }
    // normally we would add amp-ids only if this is not a firs time sync, but due to AMP-26054 we are doing it always
    body['amp-ids'] = this._ampIds;
    return ConnectionHelper.doPost({ url: SYNC_URL, body, shouldRetry: true }).then((changes) => {
      this._currentTimestamp = changes[SYNCUP_DATETIME_FIELD];
      return changes;
    });
  }

  _mergeToLeftOverAndUpdateNoChanges(changes) {
    LoggerManager.log('_mergeToLeftOverAndUpdateNoChanges');
    const isFirstRun = this._syncRunNo === SyncUpRunner._SYNC_RUN_1;
    // TODO: remove this flag once AMP-25568 is done
    changes[SYNCUP_TYPE_ACTIVITY_FIELDS] = true;
    // TODO query only if changed
    changes[SYNCUP_TYPE_ASSETS] = true;
    changes[SYNCUP_TYPE_EXCHANGE_RATES] = true;
    changes[SYNCUP_TYPE_ACTIVITIES_PUSH] = isFirstRun && this._hasActivitiesToPush;
    for (const type of this._syncUpCollection.keys()) { // eslint-disable-line no-restricted-syntax
      this._syncUpDiffLeftOver.merge(type, changes[type]);
      if (this._syncUpDiffLeftOver.getSyncUpDiff(type) === undefined
        || (type === SYNCUP_TYPE_ACTIVITIES_PUSH && !isFirstRun)) {
        this._syncUpDependency.setState(type, SS.NO_CHANGES);
        this._syncUpCollection.get(type).done = true;
      }
    }
  }

  _runSyncUp() {
    if (!this._syncUpDependency.hasPendingOrDependencyPending() || this._aborted) {
      return this._syncUpUnitPromises.wait().then(this.buildResult);
    }
    const syncUpPromise = this._startNextPending();
    if (syncUpPromise === null) {
      return Utils.delay(SYNCUP_DEPENDENCY_CHECK_INTERVAL).then(this._runSyncUp);
    }
    this._syncUpUnitPromises.add(syncUpPromise);
    // using a promise to avoid recursive call and risking a stack overflow on slow connections
    return Promise.resolve().then(this._runSyncUp);
  }

  /**
   * Starts next pending unit sync up
   * @return {Promise|null}
   */
  _startNextPending() {
    const type = this._syncUpDependency.nextPending;
    let unitPromise = null;
    if (type) {
      const syncUpManager = this._syncUpCollection.get(type);
      this._prepareForSync(syncUpManager);
      unitPromise = syncUpManager.doSyncUp(this._syncUpDiffLeftOver.getSyncUpDiff(type))
        .then(() => this._buildUnitResult(syncUpManager))
        .catch(error => {
          LoggerManager.error(`SyncUp Error for ${syncUpManager.type}: error = "${error}", stack = "${error.stack}"`);
          // We are not rolling back any data saved until here. We collect the leftover and resume the next sync from
          // where we left up to the latest. Dependencies will manage other units.
          return this._buildUnitResult(syncUpManager, error);
        });
      this._syncUpDependency.setState(type, SS.IN_PROGRESS);
    }
    return unitPromise;
  }

  _prepareForSync(syncUpManager) {
    syncUpManager.lastSyncUpDate = this._lastTimestamp;
  }

  _buildUnitResult(syncUpManager: SyncUpManagerInterface, error) {
    const type = syncUpManager.type;
    LoggerManager.log(`_buildUnitResult: ${type}`);
    const originalDiff = this._syncUpDiffLeftOver.getSyncUpDiff(type);
    this._syncUpDiffLeftOver.setDiff(type, syncUpManager.getDiffLeftover());
    const unitLeftOver = this._syncUpDiffLeftOver.getSyncUpDiff(type);
    const status = unitLeftOver ? SYNCUP_STATUS_FAIL : SYNCUP_STATUS_SUCCESS;
    const state = this._getStateOrSetBasedOnLeftOver(type, originalDiff, unitLeftOver, syncUpManager.done);
    if (!error && syncUpManager.errors && syncUpManager.errors.length) {
      error = syncUpManager.errors.join('. ');
    }
    let unitResult = { type, status, state, error };
    // if no changes in the second run, keep run 1 result
    if (this._syncRunNo === SyncUpRunner._SYNC_RUN_2 && state === SS.NO_CHANGES) {
      unitResult = this._unitsResult.get(type);
    } else {
      this._unitsResult.set(type, unitResult);
    }
    this._remainingSyncUpTypes.delete(syncUpManager.type);
    return unitResult;
  }

  _getStateOrSetBasedOnLeftOver(type, originalDiff, unitLeftOver, done) {
    // check if the state was already set due to other conditions, like NO_CHANGES, ABORTED, DEPENDENCY_FAIL
    let state = this._syncUpDependency.getState(type);
    if (!SS.STATES_FINISH.includes(state)) {
      if (unitLeftOver === undefined) {
        if (done) {
          state = SS.SUCCESS;
        } else {
          LoggerManager.error(`Unexpected use case for "${type}" that was not skipped through expected means, has no
          leftover, but still is not done. Possibly a bug. Fallback to FAIL state.`);
        }
      } else if (unitLeftOver !== true) {
        // this is not an atomic sync, let's compare original diff vs leftover to see if at least something was synced
        state = SyncUpDiff.equals(originalDiff, unitLeftOver) ? SS.FAIL : SS.PARTIAL;
      } else {
        // normally for the unitLeftOver = true for atomic syncs, but also fallback for unexpected use cases
        state = SS.FAIL;
      }
      this._syncUpDependency.setState(type, state);
    }
    return state;
  }

  buildResult(errors) {
    LoggerManager.log('_buildResult');
    // build status for any remaining type
    this._remainingSyncUpTypes.forEach(type => this._buildUnitResult(this._syncUpCollection.get(type)));
    // now compute the final result
    const successful = Object.keys(this._syncUpDiffLeftOver.syncUpDiff).length === 0;
    LoggerManager.log(`SyncUp ${successful ? 'OK' : 'Fail'}`);
    const status = successful ? SYNCUP_STATUS_SUCCESS : SYNCUP_STATUS_FAIL;
    const syncUpDiff = successful ? null : this._syncUpDiffLeftOver.syncUpDiff;
    const unitsResult = Array.from(this._unitsResult.values());
    if (!successful && unitsResult.length) {
      errors = this._collectErrors(unitsResult, errors);
    }
    return SyncUpRunner.buildResult({
      status, userId: this._userId, units: unitsResult, errors, syncUpDiff, syncTimestamp: this._currentTimestamp
    });
  }

  static buildResult({ status, userId, units, errors, syncUpDiff, syncTimestamp }) {
    const syncDate = new Date();
    const syncUpGlobalResult = {
      status,
      'requested-by': userId,
      units,
      errors,
      'sync-date': syncDate.toISOString()
    };
    syncUpGlobalResult[SYNCUP_DATETIME_FIELD] = syncTimestamp;
    if (syncUpDiff) {
      syncUpGlobalResult[SYNCUP_DIFF_LEFTOVER] = syncUpDiff;
    }
    return syncUpGlobalResult;
  }

  _collectErrors(unitsResult, errors) {
    return unitsResult.reduce((errorsList, unitResult) => {
      if (unitResult.error) {
        errorsList.push(unitResult.error);
      }
      return errorsList;
    }, errors || []);
  }

  /**
   * Interrupts sync up execution, without rollback of data that has been already synced up.
   * @param isForced (optional) default is false (graceful interruption)
   */
  abort(/* isForced: false */) {
    this._aborted = true;
    // TODO full support: send abort notification to each pending/running unit
  }

}
