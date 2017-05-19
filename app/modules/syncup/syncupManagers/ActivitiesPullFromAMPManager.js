import * as ActivityHelper from '../../helpers/ActivityHelper';
import * as AC from '../../../utils/constants/ActivityConstants';
import * as Utils from '../../../utils/Utils';
import DateUtils from '../../../utils/DateUtils';
import { CONNECTION_TIMEOUT } from '../../../utils/Constants';
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
const ABORT_INTERVAL = CONNECTION_TIMEOUT;

/**
 * Pulls the latest activities state from AMP
 * @author Nadejda Mandrescu
 */
export default class ActivitiesPullFromAMPManager extends SyncUpManagerInterface {

  constructor() {
    super();
    this._cancel = false;
    // TODO update this once AMPOFFLINE-319 is done
    let translations = store.getState().translationReducer.languageList;
    if (!translations) {
      translations = ['en', 'pt', 'tm', 'fr']; // using explicitly Timor and Niger langs until 319 is done
    }
    this._translations = translations.join('|');
    this.resultStack = [];
    this._onPullError = this._onPullError.bind(this);
    this._isNoResultToProcess = this._isNoResultToProcess.bind(this);
    this._processResult = this._processResult.bind(this);
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
    const duration = DateUtils.duration(this.syncStartedAt, new Date());
    LoggerManager.log(`duration = ${duration}`);
    LoggerManager.log(`saved = ${this.diff.saved.length}, removed = ${this.diff.removed.length}`);
    this.diff.saved = this.diff.saved.filter(ampId => !this.pulled.has(ampId));
    LoggerManager.log(`unsynced = ${this.diff.saved.length}`);
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
    const pullActivitiesPromise = new Promise(
      (resolve, reject) => {
        const pFactories = this.diff.saved.map(ampId => this._pullActivity.bind(this, ampId));
        return pFactories.reduce((currentPromise, pFactory) =>
          currentPromise.then(pFactory), Promise.resolve())
          .then((result) => {
            this.resultStack.push(PULL_END);
            return resolve(result);
          }).catch(reject);
      });
    return Promise.all([pullActivitiesPromise, this._processResult()]);
  }

  _isPullDenied() {
    return this.resultStack.length > QUEUE_LIMIT;
  }

  _pullActivity(ampId) {
    // TODO content translations (iteration 2)
    return Utils.waitWhile(this._isPullDenied.bind(this), CHECK_INTERVAL, ABORT_INTERVAL).then(() =>
      ConnectionHelper.doGet({
        url: ACTIVITY_EXPORT_URL,
        paramsMap: { 'amp-id': ampId, translations: this._translations }
      }).then((activity, error) => this.resultStack.push([activity, error]))
        .catch((error) => this._onPullError(ampId, error)));
  }

  _isNoResultToProcess() {
    return this.resultStack.length === 0;
  }

  _processResult() {
    return Utils.waitWhile(this._isNoResultToProcess, CHECK_INTERVAL, ABORT_INTERVAL).then(() => {
      const pFactories = [];
      let next = this._processResult;
      while (this.resultStack.length > 0) {
        const entry = this.resultStack.pop();
        if (entry === PULL_END) {
          next = () => Promise.resolve();
        } else {
          const [activity, error] = entry;
          pFactories.push(
            this._removeExistingNonRejected(activity, error).then(this._saveNewActivity).then(this._onPullError));
        }
      }
      return pFactories.reduce((currentPromise, pFactory) =>
        currentPromise.then(pFactory), Promise.resolve())
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
}
