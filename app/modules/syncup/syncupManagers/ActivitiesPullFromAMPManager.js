import * as ActivityHelper from '../../helpers/ActivityHelper';
import * as AC from '../../../utils/constants/ActivityConstants';
import { SYNCUP_TYPE_ACTIVITIES_PULL } from '../../../utils/Constants';
import * as Utils from '../../../utils/Utils';
import DateUtils from '../../../utils/DateUtils';
import { ACTIVITY_EXPORT_URL } from '../../connectivity/AmpApiConstants';
import * as ConnectionHelper from '../../connectivity/ConnectionHelper';
import SyncUpManagerInterface from './SyncUpManagerInterface';
import store from '../../../index';
import LoggerManager from '../../util/LoggerManager';

/* eslint-disable class-methods-use-this */

const PULL_END = 'PULL_END';
/*
 On my local, with the current solution, there was no significant difference if using 4 or 100 queue limit,
 or if using 10 or 100 check interval. I will stick to 4 queue limit (for pull requests mainly), to avoid AMP server
 overload in case multiple clients will run simultaneously.

 On remove there was no difference between check interval. While with a queue limit of 100, results processing was
 taking more than requests and sometime pull wait was aborted over the current 5sec timeout.
 */
const CHECK_INTERVAL = 100;
const QUEUE_LIMIT = 4;
const ABORT_INTERVAL = 600000; // milliseconds

/**
 * Pulls the latest activities state from AMP
 * @author Nadejda Mandrescu
 */
export default class ActivitiesPullFromAMPManager extends SyncUpManagerInterface {

  constructor() {
    super(SYNCUP_TYPE_ACTIVITIES_PULL);
    this._cancel = false;
    // TODO update this once AMPOFFLINE-319 is done
    let translations = store.getState().translationReducer.languageList;
    if (!translations) {
      translations = ['en', 'pt', 'tm', 'fr']; // using explicitly Timor and Niger langs until 319 is done
    }
    this._translations = translations.join('|');
    this.resultStack = [];
    this.requestsToProcess = 0;
    this._onPullError = this._onPullError.bind(this);
    this._processResult = this._processResult.bind(this);
    this._waitWhile = this._waitWhile.bind(this);
  }

  /**
   * Pulls activities from AMP by adding/updating them to the client DB
   * @param saved the activities saved as new or update on AMP
   * @param removed deleted activities on AMP
   * Parameters are comming for the from sync diff EP as:
   * {
   *  "activities": {
   *    "saved" : [ampId1, ...],
   *    "removed" : [ampId2, ...]
   *  },
   *  ...
   * }
   * @return {Promise}
   */
  doSyncUp({ saved, removed }) {
    this.diff = { saved, removed };
    this.pulled = new Set();
    this.syncStartedAt = new Date();
    return this._pullActivitiesFromAMP();
  }

  getDiffLeftover() {
    if (this.syncStartedAt) {
      const duration = DateUtils.duration(this.syncStartedAt, new Date());
      LoggerManager.log(`Activities pull duration = ${duration}`);
      LoggerManager.log(`saved = ${this.diff.saved.length}, removed = ${this.diff.removed.length}`);
      this.diff.saved = this.diff.saved.filter(ampId => !this.pulled.has(ampId));
      LoggerManager.log(`unsynced = ${this.diff.saved.length}`);
    }
    return this.diff;
  }

  cancel() {
    this._cancel = true;
  }

  _pullActivitiesFromAMP() {
    LoggerManager.log('_pullActivitiesFromAMP');
    return Promise.all([this._removeActivities(), this._getLatestActivities()]);
  }

  _removeActivities() {
    const ampIdsFilter = Utils.toMap(AC.AMP_ID, { $in: this.diff.removed });
    // remove both rejected and non rejected if the activity is removed
    return ActivityHelper.removeAll(ampIdsFilter).then((result) => {
      this.diff.removed = [];
      return result;
    });
  }

  _getLatestActivities() {
    const pFactories = this.diff.saved.map(ampId => this._pullActivity.bind(this, ampId));
    // this is a sequential execution of promises through reduce (e.g. https://goo.gl/g44HvG)
    const pullActivitiesPromise = pFactories.reduce((currentPromise, pFactory) => currentPromise
      .then(pFactory), Promise.resolve())
      .then((result) => this._waitWhile(this._hasPendingRequests).then(() => {
        this.resultStack.push(PULL_END);
        return result;
      }));
    return Promise.all([pullActivitiesPromise, this._processResult()]);
  }

  _hasPendingRequests() {
    return this.requestsToProcess > 0;
  }

  _isPullDenied() {
    return this.requestsToProcess > QUEUE_LIMIT;
  }

  _incRequestsToProcess() {
    this.requestsToProcess += 1;
  }

  _decRequestsToProcess() {
    this.requestsToProcess -= 1;
  }

  _pullActivity(ampId) {
    // TODO content translations (iteration 2)
    return this._waitWhile(this._isPullDenied).then(() => {
      ConnectionHelper.doGet({
        url: ACTIVITY_EXPORT_URL,
        paramsMap: { 'amp-id': ampId, translations: this._translations }
      }).then((activity, error) => {
        this.resultStack.push([activity, error]);
        return this._decRequestsToProcess();
      }).catch((error) => {
        this._decRequestsToProcess();
        this._onPullError(ampId, error);
      });
      // increase the count immediately it sent and decrease immediately the reply is received
      this._incRequestsToProcess();
      return Promise.resolve();
    });
  }

  _isNoResultToProcess() {
    return this.resultStack.length === 0;
  }

  _processResult() {
    return this._waitWhile(this._isNoResultToProcess).then(() => {
      const pFactories = [];
      let next = this._processResult;
      while (this.resultStack.length > 0) {
        const entry = this.resultStack.shift();
        if (entry === PULL_END) {
          LoggerManager.log('Activities PULL_END flag reached on results stack.');
          this.done = true;
          next = () => Promise.resolve();
        } else {
          const [activity, error] = entry;
          pFactories.push(
            this._removeExistingNonRejected(activity, error)
              .then(this._saveNewActivity.bind(this))
              .then(this._onPullError.bind(this)));
        }
      }
      return Promise.all(pFactories)
        .then(next)
        // TODO continue sync up of other activities if the error is not a connection issue
        .catch(error => Promise.reject(error));
    });
  }

  _removeExistingNonRejected(activity, error) {
    if (error || !activity) {
      return Promise.resolve(activity, error);
    }
    return ActivityHelper.removeNonRejectedByAmpId(activity[AC.AMP_ID])
      .then(() => activity);
  }

  _saveNewActivity(activity, error) {
    if (error || !activity) {
      return Promise.resolve(activity, error);
    }
    return ActivityHelper.saveOrUpdate(activity)
      .then(() => activity[AC.AMP_ID])
      .catch((err) => this._onPullError(activity ? activity[AC.AMP_ID] : null, err));
  }

  _onPullError(ampId, error) {
    LoggerManager.log('_onPullError');
    if (error) {
      LoggerManager.error(error);
    } else if (ampId) {
      this.pulled.add(ampId);
    }
    return Promise.resolve();
  }

  _waitWhile(conditionFunc) {
    return Utils.waitWhile(conditionFunc.bind(this), CHECK_INTERVAL, ABORT_INTERVAL);
  }
}
