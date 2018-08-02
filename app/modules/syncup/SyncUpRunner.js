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
  SYNCUP_DETAILS_SYNCED,
  SYNCUP_DETAILS_UNSYNCED,
  SYNCUP_DIFF_LEFTOVER,
  SYNCUP_NO_DATE,
  SYNCUP_STATUS_CANCELED,
  SYNCUP_STATUS_FAIL,
  SYNCUP_STATUS_PARTIAL,
  SYNCUP_STATUS_SUCCESS,
  SYNCUP_TYPE_ACTIVITIES_PULL,
  SYNCUP_TYPE_ACTIVITIES_PUSH,
  SYNCUP_TYPE_ACTIVITY_FIELDS,
  SYNCUP_TYPE_ASSETS,
  SYNCUP_TYPE_CONTACT_FIELDS,
  SYNCUP_TYPE_CONTACTS_PUSH,
  SYNCUP_TYPE_EXCHANGE_RATES,
  SYNCUP_TYPE_RESOURCE_FIELDS,
  SYNCUP_TYPE_RESOURCES_PUSH,
  SYNCUP_TYPE_TRANSLATIONS,
  SYNCUP_TYPE_WORKSPACE_MEMBERS
} from '../../utils/Constants';
import Logger from '../../modules/util/LoggerManager';
import * as Utils from '../../utils/Utils';
import ContactHelper from '../helpers/ContactHelper';
import ActivitiesPullFromAMPManager from './syncupManagers/ActivitiesPullFromAMPManager';
import TranslationSyncupManager from './syncupManagers/TranslationSyncUpManager';
import ResourceHelper from '../helpers/ResourceHelper';

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

  static _SECOND_RUN_SKIP = new Set([SYNCUP_TYPE_ACTIVITIES_PUSH, SYNCUP_TYPE_CONTACTS_PUSH,
    SYNCUP_TYPE_RESOURCES_PUSH]);

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
        return SyncUpRunner.buildResult({ status: SYNCUP_STATUS_FAIL, userId: this._userId, errors: [error] });
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

    return Promise.all([ActivityHelper.getUniqueAmpIdsList(), UserHelper.getNonBannedRegisteredUserIds(),
      ActivitiesPushToAMPManager.getActivitiesToPush(), ContactHelper.findAllContactsModifiedOnClient(),
      ResourceHelper.countAllResourcesModifiedOnClient(),
      TranslationSyncupManager.getNewTranslationsDifference()])
      .then(([ampIds, userIds, activitiesToPush, contactsToPush, resourcesToPushCount, newTranslations]) => {
        this._ampIds = ampIds;
        this._registeredUserIds = userIds;
        this._hasActivitiesToPush = activitiesToPush && activitiesToPush.length > 0;
        this._hasContactsToPush = contactsToPush && contactsToPush.length > 0;
        this._hasResourcesToPush = resourcesToPushCount > 0;
        this._hasTranslationsToPush = newTranslations && newTranslations.length > 0;
        return this._getCumulativeSyncUpChanges();
      });
  }

  _getCumulativeSyncUpChanges() {
    logger.log('_getCumulativeSyncUpChanges');
    return this._getWhatChangedInAMP().then(this._mergeToLeftOverAndUpdateNoChanges);
  }

  _getWhatChangedInAMP() {
    logger.log('_getWhatChangedInAMP');
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
    logger.log('_mergeToLeftOverAndUpdateNoChanges');
    const isFirstRun = this._syncRunNo === SyncUpRunner._SYNC_RUN_1;
    // TODO: remove this flag once AMP-25568 is done
    changes[SYNCUP_TYPE_ACTIVITY_FIELDS] = true;
    changes[SYNCUP_TYPE_CONTACT_FIELDS] = true;
    changes[SYNCUP_TYPE_RESOURCE_FIELDS] = true;
    // TODO query only if changed
    changes[SYNCUP_TYPE_ASSETS] = true;
    changes[SYNCUP_TYPE_EXCHANGE_RATES] = true;
    // TODO workaround until AMPOFFLINE-908 with a more accurate activities to push detection will come
    const hasWsMembersChanges = SyncUpDiff.hasChanges(changes[SYNCUP_TYPE_WORKSPACE_MEMBERS]);
    changes[SYNCUP_TYPE_ACTIVITIES_PUSH] = isFirstRun && (this._hasActivitiesToPush || hasWsMembersChanges);
    changes[SYNCUP_TYPE_CONTACTS_PUSH] = isFirstRun && this._hasContactsToPush;
    changes[SYNCUP_TYPE_RESOURCES_PUSH] = isFirstRun && this._hasResourcesToPush;
    changes[SYNCUP_TYPE_TRANSLATIONS] = changes[SYNCUP_TYPE_TRANSLATIONS] || this._hasTranslationsToPush;
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
          logger.error(`SyncUp Error for ${syncUpManager.type}: error = "${error}", stack = "${error.stack}"`);
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
    const status = SS.STATE_TO_STATUS[state] || SYNCUP_STATUS_FAIL;
    if (!error) {
      error = this._getMessages(syncUpManager.errors);
    }
    const warning = this._getMessages(syncUpManager.warnings);
    let unitResult = { type, status, state, error, warning };
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

  _getMessages(messages) {
    if (messages && messages.length) {
      return Utils.joinMessages(messages);
    }
  }

  _addStats(syncUpManager: SyncUpManagerInterface, unitResult, prevUnitResult) {
    switch (syncUpManager.type) {
      case SYNCUP_TYPE_ACTIVITIES_PUSH:
        unitResult.details = syncUpManager.details;
        break;
      case SYNCUP_TYPE_ACTIVITIES_PULL:
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
          state = SS.STATES_PENDING.includes(state) ? SS.FAIL : state;
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

  /**
   * If we could not proceed to the 2nd sync run, then in case some data was pushed (like activities or new contacts)
   * for which we expect changes from AMP, then we'll report corresponding "pull" units as failed.
   * @param syncUp1Result
   * @param error
   * @private
   */
  _updateResultFor2ndRunDiffFailure(syncUp1Result, error) {
    syncUp1Result.units.forEach(unit => {
      if (unit.type === SYNCUP_TYPE_ACTIVITIES_PUSH) {
        const pullNeeded = {};
        pullNeeded[SYNCUP_DETAILS_UNSYNCED] = (unit.details && unit.details[SYNCUP_DETAILS_SYNCED]) || [];
        if (pullNeeded[SYNCUP_DETAILS_UNSYNCED].length) {
          const activitiesPull = syncUp1Result.units.find(u => u.type === SYNCUP_TYPE_ACTIVITIES_PULL);
          activitiesPull.state = this._getStateIf2ndRunChangesWereExpected(unit.state);
          activitiesPull.status = SS.STATE_TO_STATUS[activitiesPull.state];
          activitiesPull.details = ActivitiesPullFromAMPManager.mergeDetails(activitiesPull.details, pullNeeded);
        }
      } else if (unit.type === SYNCUP_TYPE_CONTACTS_PUSH && this._hasContactsToPush) {
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
    const syncUpDiff = status === SYNCUP_STATUS_SUCCESS ? null : this._syncUpDiffLeftOver.syncUpDiff;
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
      return SYNCUP_STATUS_SUCCESS;
    }
    // now check the statuses for available changes
    const unitsStatuses: Set =
      unitsResult.reduce((statuses: Set, unitResult) => statuses.add(unitResult.state), new Set());
    if (unitsStatuses.has(SYNCUP_STATUS_CANCELED)) {
      return SYNCUP_STATUS_CANCELED;
    }
    if (unitsStatuses.has(SYNCUP_STATUS_FAIL) && unitsStatuses.size === 1) {
      return SYNCUP_STATUS_FAIL;
    }
    if (unitsStatuses.has(SYNCUP_STATUS_SUCCESS) && unitsStatuses.size === 1) {
      return SYNCUP_STATUS_SUCCESS;
    }
    return SYNCUP_STATUS_PARTIAL;
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
    syncUpGlobalResult[SYNCUP_DATETIME_FIELD] = syncTimestamp;
    if (syncUpDiff) {
      syncUpGlobalResult[SYNCUP_DIFF_LEFTOVER] = syncUpDiff;
    }
    return syncUpGlobalResult;
  }

  _collectMessages(unitsResult, errors = []) {
    const existingErrors = new Set();
    errors = errors.filter(err => {
      const errMsg = err.toString();
      if (existingErrors.has(errMsg)) {
        return false;
      }
      existingErrors.add(errMsg);
      return true;
    });
    errors = unitsResult.reduce((errorsList, unitResult) => {
      if (unitResult.error) {
        const errMsg = unitResult.error.toString();
        if (!existingErrors.has(errMsg)) {
          existingErrors.add(errMsg);
          errorsList.push(unitResult.error);
        }
      }
      return errorsList;
    }, errors);
    const warnings = unitsResult.map(ur => ur.warning).filter(w => w);
    return { errors, warnings };
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
