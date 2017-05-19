import * as ActivityHelper from '../../helpers/ActivityHelper';
import * as AC from '../../../utils/constants/ActivityConstants';
import * as Utils from '../../../utils/Utils';
import { ACTIVITY_EXPORT_URL } from '../../connectivity/AmpApiConstants';
import * as ConnectionHelper from '../../connectivity/ConnectionHelper';
import { FIRST_ACTIVITIES_PULL_FROM_AMP_LIMIT } from '../../../utils/Constants';
import SyncUpManagerInterface from './SyncUpManagerInterface';
import store from '../../../index';
import LoggerManager from '../../util/LoggerManager';

/* eslint-disable class-methods-use-this */

const PULL_END = 'PULL_END';
const CHECK_INTERVAL = 50;

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
    return this._pullActivitiesFromAMP();
  }

  getDiffLeftover() {
    this.diff.saved = this.diff.saved.filter(ampId => !this.pulled.has(ampId));
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
    // TODO remove as part of AMPOFFLINE-273 or AMPOFFLINE-274 (or other dervided tasks)
    this.diff.saved = this.diff.saved.slice(0, FIRST_ACTIVITIES_PULL_FROM_AMP_LIMIT);
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
    return this.resultStack.length > 4;
  }

  _pullActivity(ampId) {
    // TODO content translations (iteration 2)
    return Utils.waitWhile(this._isPullDenied.bind(this), CHECK_INTERVAL).then(() => ConnectionHelper.doGet({
      url: ACTIVITY_EXPORT_URL,
      paramsMap: { 'amp-id': ampId, translations: this._translations }
    }).then(this._pushResultToProcess)
      .catch((error) => this._onPullError(ampId, error)));
  }

  _pushResultToProcess(activity, error) {
    this.resultStack.push([activity, error]);
  }

  _isNoResultToProcess() {
    return this.resultStack.length === 0;
  }

  _processResult() {
    return new Promise((resolve, reject) =>
      Utils.waitWhile(this._isNoResultToProcess.bind(this), CHECK_INTERVAL).then(() => {
        if (this.resultStack[0] === PULL_END) {
          return resolve();
        }
        const pFactories = this.resultStack.map(([activity, error]) =>
          this._removeExistingNonRejected(activity, error).then(this._saveNewActivity).then(this._onPullError));
        return pFactories.reduce((currentPromise, pFactory) =>
          currentPromise.then(pFactory), Promise.resolve())
          .then(this._processResult)
          // TODO continue sync up of other activities if the error is not a connection issue
          .catch(reject);
      })
    );
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
