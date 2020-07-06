import { Constants } from 'amp-ui';
import SyncUpConfig from './SyncUpConfig';
import SyncUpUnits from './SyncUpUnits';
import SyncUpDiff from './SyncUpDiff';
import * as SS from './SyncUpUnitState';
import SyncUpManagerInterface from './syncupManagers/SyncUpManagerInterface';
import { SYNC_URL } from '../connectivity/AmpApiConstants';
import ConnectionHelper from '../connectivity/ConnectionHelper';
import Logger from '../../modules/util/LoggerManager';
import * as Utils from '../../utils/Utils';
import ActivitiesPullFromAMPManager from './syncupManagers/ActivitiesPullFromAMPManager';
import * as CSC from '../../utils/constants/ClientSettingsConstants';
import * as ClientSettingsHelper from '../helpers/ClientSettingsHelper';
import LocalSyncUpData from './LocalSyncUpData';


const logger = new Logger('Syncup runner');

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
   * Note: in a future iteration (with client-change-id processed by AMP, date-time synchronization, etc), we may
   * simplify the process.
   *
   * Nevertheless the "runner" should report back only one sync result, even if two sync up diff EP requests are done.
   */

  /** Sync up run no 1 */
  static _SYNC_RUN_1 = 1;
  /** Sync up run no 2 */
  static _SYNC_RUN_2 = 2;

  static _SECOND_RUN_SKIP = new Set([Constants.SYNCUP_TYPE_ACTIVITIES_PUSH, Constants.SYNCUP_TYPE_CONTACTS_PUSH,
    Constants.SYNCUP_TYPE_RESOURCES_PUSH]);

  /**
   * Generates a new instance of the Sync Up Runner. This must be only instance per user request.
   * @param userId the user id that initiates the sync up
   * @param lastTimestamp the timestamp from the latest sync up (if any)
   * @param syncUpDiffLeftOver the leftover from previous sync up (if any)
   */
  constructor(userId, lastTimestamp, syncUpDiffLeftOver: SyncUpDiff) {
    logger.log('SyncUpRunner');
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
    logger.log('run');
    this._selfBindMethods();
    return this._run(SyncUpRunner._SYNC_RUN_1).then(result => {
      // if we could not even request the sync diff EP or if the sync up is aborted, then no need to start the 2nd run
      if (!this._currentTimestamp || this._aborted) {
        return result;
      }
      return this._run(SyncUpRunner._SYNC_RUN_2, result);
    });
  }

  _run(syncRunNo, prevResult) {
    return this._prepare(syncRunNo).catch(error => {
      // normally means connectivity loss (even though connection was available when sync up button was pressed)
      logger.error(`Sync Up run #${syncRunNo} prepare error = ${error}`);
      this._aborted = true;
      if (syncRunNo === SyncUpRunner._SYNC_RUN_1) {
        // on 1st Run return generic result
        return SyncUpRunner.buildResult(
          { status: Constants.SYNCUP_STATUS_FAIL, userId: this._userId, errors: [error] });
      }
      // on 2nd Run flag "main" 2nd run units as failed (activities pull as of now)
      this._updateResultFor2ndRunDiffFailure(prevResult, error);
      return prevResult;
    }).then((prepareResult) => {
      if (this._aborted) {
        return prepareResult;
      }
      return this._runSyncUp();
    });
  }

  /**
   * Prepares the sync up for the current sync up run iteration. See detailed reasoning for iterations above.
   * @param syncRunNo the sync up run iteration number
   * @private
   */
  _prepare(syncRunNo) {
    logger.log('_prepare');
    this._syncUpConfig = new SyncUpConfig();
    this._syncUpCollection = this._syncUpConfig.syncUpCollection;
    this._syncUpDependency = this._syncUpConfig.syncUpDependencies;
    this._remainingSyncUpTypes = new Set(this._syncUpCollection.keys());
    this._syncUpUnitPromises = new SyncUpUnits();
    // this._currentTimestamp comes from RUN_1
    this._lastTimestamp = this._currentTimestamp || this._lastTimestamp;
    this._syncRunNo = syncRunNo;
    this._localData = new LocalSyncUpData();

    return this._localData.build().then(this._getCumulativeSyncUpChanges);
  }

  _getCumulativeSyncUpChanges() {
    logger.log('_getCumulativeSyncUpChanges');
    return this._getWhatChangedInAMP()
      .then(this._forceSyncUpIfNeeded)
      .then(this._mergeToLeftOverAndUpdateNoChanges);
  }

  _getWhatChangedInAMP() {
    logger.log('_getWhatChangedInAMP');
    const body = { 'user-ids': this._localData.registeredUserIds };
    // Don't send the date param at all on first-sync.
    if (this._lastTimestamp && this._lastTimestamp !== Constants.SYNCUP_NO_DATE) {
      body['last-sync-time'] = this._lastTimestamp;
    }
    // normally we would add amp-ids only if this is not a firs time sync, but due to AMP-26054 we are doing it always
    body['amp-ids'] = this._localData.ampIds;
    body[Constants.SYNCUP_TYPE_ACTIVITY_POSSIBLE_VALUES] = this._localData.activitiesPVsPaths;
    body[Constants.SYNCUP_TYPE_CONTACT_POSSIBLE_VALUES] = this._localData.contactPVsPaths;
    body[Constants.SYNCUP_TYPE_RESOURCE_POSSIBLE_VALUES] = this._localData.resourcePVsPaths;
    body[Constants.SYNCUP_TYPE_COMMON_POSSIBLE_VALUES] = this._localData.commonPVsPaths;
    body[Constants.SYNCUP_TYPE_ACTIVITY_FIELDS] = this._localData.activityFields;
    body[Constants.SYNCUP_TYPE_CONTACT_FIELDS] = this._localData.contactFields;
    body[Constants.SYNCUP_TYPE_RESOURCE_FIELDS] = this._localData.resourceFields;
    return ConnectionHelper.doPost({ url: SYNC_URL, body, shouldRetry: true }).then((changes) => {
      this._currentTimestamp = changes[Constants.SYNCUP_DATETIME_FIELD];
      return changes;
    });
  }

  _forceSyncUpIfNeeded(changes) {
    const sc = [Constants.SYNCUP_TYPE_ACTIVITY_FIELDS_STRUCTURAL_CHANGES,
      Constants.SYNCUP_TYPE_CONTACT_FIELDS_STRUCTURAL_CHANGES,
      Constants.SYNCUP_TYPE_RESOURCE_FIELDS_STRUCTURAL_CHANGES].filter(type => changes[type]);
    if (sc.length) {
      logger.log(`Forcing syncup: detected ${sc}`);
      return ClientSettingsHelper.updateSettingValue(CSC.FORCE_SYNC_UP, true).then(() => changes);
    }
    return changes;
  }

  _mergeToLeftOverAndUpdateNoChanges(changes) {
    logger.log('_mergeToLeftOverAndUpdateNoChanges');
    const isFirstRun = this._syncRunNo === SyncUpRunner._SYNC_RUN_1;
    changes[Constants.SYNCUP_TYPE_ACTIVITY_FIELDS] = changes[Constants.SYNCUP_TYPE_ALL_FIELDS];
    changes[Constants.SYNCUP_TYPE_CONTACT_FIELDS] = changes[Constants.SYNCUP_TYPE_ALL_FIELDS];
    changes[Constants.SYNCUP_TYPE_RESOURCE_FIELDS] = changes[Constants.SYNCUP_TYPE_ALL_FIELDS];
    // TODO query only if changed
    changes[Constants.SYNCUP_TYPE_ASSETS] = true;
    // not sure if still needed, but once removed, make sure to double check with CurrencyRatesHelper.hasExchangeRates
    changes[Constants.SYNCUP_TYPE_EXCHANGE_RATES] = true;
    // TODO workaround until AMPOFFLINE-908 with a more accurate activities to push detection will come
    const hasWsMembersChanges = SyncUpDiff.hasChanges(changes[Constants.SYNCUP_TYPE_WORKSPACE_MEMBERS]);
    changes[Constants.SYNCUP_TYPE_ACTIVITIES_PUSH] = isFirstRun && (this._localData.hasActivitiesToPush ||
      hasWsMembersChanges);
    changes[Constants.SYNCUP_TYPE_CONTACTS_PUSH] = isFirstRun && this._localData.hasContactsToPush;
    changes[Constants.SYNCUP_TYPE_RESOURCES_PUSH] = isFirstRun && this._localData.hasResourcesToPush;
    changes[Constants.SYNCUP_TYPE_TRANSLATIONS] = changes[Constants.SYNCUP_TYPE_TRANSLATIONS] ||
      this._localData.hasTranslationsToPush;
    for (const type of this._syncUpCollection.keys()) { // eslint-disable-line no-restricted-syntax
      this._syncUpDiffLeftOver.merge(type, changes[type]);
      if (this._syncUpDiffLeftOver.getSyncUpDiff(type) === undefined
        || (SyncUpRunner._SECOND_RUN_SKIP.has(type) && !isFirstRun)) {
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
      return Utils.delay(Constants.SYNCUP_DEPENDENCY_CHECK_INTERVAL).then(this._runSyncUp);
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
          const errorStack = error && error.stack;
          logger.error(`SyncUp Error for ${syncUpManager.type}: error = "${error}", stack = "${errorStack}"`);
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
    syncUpManager.totalSyncUpDiff = this._syncUpDiffLeftOver;
  }

  _buildUnitResult(syncUpManager: SyncUpManagerInterface, error) {
    const type = syncUpManager.type;
    logger.log(`_buildUnitResult: ${type}`);
    const originalDiff = this._syncUpDiffLeftOver.getSyncUpDiff(type);
    const wasSynUpPrevented = SS.STATES_PREVENTED.includes(this._syncUpDependency.getState(type));
    const latestDiff = wasSynUpPrevented ? originalDiff : syncUpManager.getDiffLeftover();
    this._syncUpDiffLeftOver.setDiff(type, latestDiff);
    const unitLeftOver = this._syncUpDiffLeftOver.getSyncUpDiff(type);
    const state = this._getStateOrSetBasedOnLeftOver(type, originalDiff, unitLeftOver, syncUpManager.done);
    const status = SS.STATE_TO_STATUS[state] || Constants.SYNCUP_STATUS_FAIL;
    const errors = error ? [error] : syncUpManager.errors;
    let unitResult = { type, status, state, errors, warnings: syncUpManager.warnings };
    // if no changes in the second run, keep run 1 result
    if (this._syncRunNo === SyncUpRunner._SYNC_RUN_2 && state === SS.NO_CHANGES) {
      unitResult = this._unitsResult.get(type);
    } else {
      this._addStats(syncUpManager, unitResult, this._unitsResult.get(type));
      this._unitsResult.set(type, unitResult);
    }
    this._remainingSyncUpTypes.delete(syncUpManager.type);
    return unitResult;
  }

  _addStats(syncUpManager: SyncUpManagerInterface, unitResult, prevUnitResult) {
    switch (syncUpManager.type) {
      case Constants.SYNCUP_TYPE_ACTIVITIES_PUSH:
        unitResult.details = syncUpManager.details;
        break;
      case Constants.SYNCUP_TYPE_ACTIVITIES_PULL:
        unitResult.details = syncUpManager.mergeDetails(prevUnitResult && prevUnitResult.details);
        break;
      default:
        break;
    }
  }

  _getStateOrSetBasedOnLeftOver(type, originalDiff, unitLeftOver, done) {
    // check if the state was already set due to other conditions, like NO_CHANGES, ABORTED, DEPENDENCY_FAIL
    let state = this._syncUpDependency.getState(type);
    if (!SS.STATES_FINISH.includes(state)) {
      if (unitLeftOver === undefined) {
        if (done) {
          state = SS.SUCCESS;
        } else {
          logger.error(`Unexpected use case for "${type}" that was not skipped through expected means, has no
          leftover, but still is not done. Possibly a bug. Fallback to FAIL state.`);
          state = (SS.STATES_PENDING.includes(state) || state === SS.IN_PROGRESS) ? SS.FAIL : state;
        }
      } else if (unitLeftOver !== true) {
        // this is not an atomic sync, let's compare original diff vs leftover to see if at least something was synced
        state = SyncUpDiff.equals(originalDiff, unitLeftOver) ? SS.FAIL : SS.PARTIAL;
        if (state === SS.FAIL) {
          logger.error(`Fail. No leftover for type ${type}`);
        }
      } else {
        // normally for the unitLeftOver = true for atomic syncs, but also fallback for unexpected use cases
        logger.error(`Fail type ${type}`);
        state = SS.FAIL;
      }
      this._syncUpDependency.setState(type, state);
    }
    return state;
  }

  /**
   * If we could not proceed to the 2nd sync run, then in case some data was pushed (like activities or new contacts)
   * for which we expect changes from AMP, then we'll report corresponding "pull" units as failed.
   * @param syncUp1Result
   * @param error
   * @private
   */
  _updateResultFor2ndRunDiffFailure(syncUp1Result, error) {
    syncUp1Result.units.forEach(unit => {
      if (unit.type === Constants.SYNCUP_TYPE_ACTIVITIES_PUSH) {
        const pullNeeded = {};
        pullNeeded[Constants.SYNCUP_DETAILS_UNSYNCED] =
          (unit.details && unit.details[Constants.SYNCUP_DETAILS_SYNCED]) || [];
        if (pullNeeded[Constants.SYNCUP_DETAILS_UNSYNCED].length) {
          const activitiesPull = syncUp1Result.units.find(u => u.type === Constants.SYNCUP_TYPE_ACTIVITIES_PULL);
          activitiesPull.state = this._getStateIf2ndRunChangesWereExpected(unit.state);
          activitiesPull.status = SS.STATE_TO_STATUS[activitiesPull.state];
          activitiesPull.details = ActivitiesPullFromAMPManager.mergeDetails(activitiesPull.details, pullNeeded);
        }
      } else if (unit.type === Constants.SYNCUP_TYPE_CONTACTS_PUSH && this._localData.hasContactsToPush) {
        // TODO AMPOFFLINE-758 detect if new contacts were pushed and changes were expected
      }
    });
    syncUp1Result.status = this._getStatus(syncUp1Result.units);
    if (error) {
      syncUp1Result.errors.push(error);
    }
  }

  _getStateIf2ndRunChangesWereExpected(stateForSyncUp1Run) {
    if (stateForSyncUp1Run === SS.NO_CHANGES) {
      return SS.FAIL;
    }
    if (stateForSyncUp1Run === SS.SUCCESS) {
      return SS.PARTIAL;
    }
    return stateForSyncUp1Run;
  }

  buildResult(errors) {
    logger.log('_buildResult');
    // build status for any remaining type
    this._remainingSyncUpTypes.forEach(type => this._buildUnitResult(this._syncUpCollection.get(type)));
    const unitsResult = Array.from(this._unitsResult.values());
    const status = this._getStatus(unitsResult);
    logger.log(`SyncUp ${status}`);
    const syncUpDiff = status === Constants.SYNCUP_STATUS_SUCCESS ? null : this._syncUpDiffLeftOver.syncUpDiff;
    let warnings;
    if (unitsResult.length) {
      const messages = this._collectMessages(unitsResult, errors);
      errors = messages.errors;
      warnings = messages.warnings;
    }
    return SyncUpRunner.buildResult({
      status,
      userId: this._userId,
      units: unitsResult,
      errors,
      warnings,
      syncUpDiff,
      syncTimestamp: this._currentTimestamp
    });
  }

  _getStatus(unitsResult: Array) {
    unitsResult = unitsResult.filter(unitResult => unitResult.state !== SS.NO_CHANGES);
    // if all are reported with NO_CHANGES, then all are mapped to SUCCESS
    if (unitsResult.length === 0) {
      return Constants.SYNCUP_STATUS_SUCCESS;
    }
    // now check the statuses for available changes
    const unitsStatuses: Set =
      unitsResult.reduce((statuses: Set, unitResult) => statuses.add(unitResult.state), new Set());
    if (unitsStatuses.has(Constants.SYNCUP_STATUS_CANCELED)) {
      return Constants.SYNCUP_STATUS_CANCELED;
    }
    if (unitsStatuses.has(Constants.SYNCUP_STATUS_FAIL) && unitsStatuses.size === 1) {
      return Constants.SYNCUP_STATUS_FAIL;
    }
    if (unitsStatuses.has(Constants.SYNCUP_STATUS_SUCCESS) && unitsStatuses.size === 1) {
      return Constants.SYNCUP_STATUS_SUCCESS;
    }
    return Constants.SYNCUP_STATUS_PARTIAL;
  }

  static buildResult({ status, userId, units, errors, warnings, syncUpDiff, syncTimestamp }) {
    const syncDate = new Date();
    const syncUpGlobalResult = {
      status,
      'requested-by': userId,
      units,
      errors,
      warnings,
      'sync-date': syncDate.toISOString()
    };
    syncUpGlobalResult[Constants.SYNCUP_DATETIME_FIELD] = syncTimestamp;
    if (syncUpDiff) {
      syncUpGlobalResult[Constants.SYNCUP_DIFF_LEFTOVER] = syncUpDiff;
    }
    return syncUpGlobalResult;
  }

  _collectMessages(unitsResult, errors = []) {
    const existingErrors = new Set();
    const existingWarnings = new Set();
    const warnings = [];
    errors = this._deduplicateMessages(errors, existingErrors);
    unitsResult.forEach(unitResult => {
      if (unitResult.errors) {
        errors.push(...this._deduplicateMessages(unitResult.errors, existingErrors));
      }
      if (unitResult.warnings) {
        warnings.push(...this._deduplicateMessages(unitResult.warnings, existingWarnings));
      }
    });
    return { errors, warnings };
  }

  _deduplicateMessages(messages, existingMsgs) {
    return messages.filter(msg => {
      // each unit must report a generic message if needs to be treated as a generic one
      const m = msg.message || msg.toString();
      if (existingMsgs.has(m)) {
        return false;
      }
      existingMsgs.add(m);
      return true;
    });
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
