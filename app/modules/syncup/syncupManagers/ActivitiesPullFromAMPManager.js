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
/**
 * Pulls the latest activities state from AMP
 * @author Nadejda Mandrescu
 */
export default class ActivitiesPullFromAMPManager extends SyncUpManagerInterface {

  constructor() {
    super();
    this._cancel = false;
    // TODO update this once AMPOFFLINE-319 is done
    let translations = store.getState().translation.languageList;
    if (!translations) {
      translations = ['en', 'pt', 'tm', 'fr']; // using explicitly Timor and Niger langs until 319 is done
    }
    this._translations = translations.join('|');
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
    this.diff.saved = this.diff.saved.filter(ampId => this.pulled.has(ampId));
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
    let ampIds = this.diff.saved;
    // TODO remove as part of AMPOFFLINE-273 or AMPOFFLINE-274 (or other dervided tasks)
    ampIds = ampIds.slice(0, FIRST_ACTIVITIES_PULL_FROM_AMP_LIMIT);
    return new Promise(
      (resolve, reject) => {
        // we need to ensure we run chain promises execution in order: get, remove existing, save, process error
        const pFactories = [];
        ampIds.forEach(ampId => {
          const fnPull = this._pullActivity.bind(this, ampId);
          pFactories.push(...[fnPull, this._removeExistingNonRejected, this._saveNewActivity, this._onPullError]);
        });

        return pFactories.reduce((currentPromise, pFactory) =>
          currentPromise.then(pFactory), Promise.resolve()).then(resolve).catch(reject);
      });
  }

  _pullActivity(ampId) {
    // TODO content translations (iteration 2)
    return ConnectionHelper.doGet({
      url: ACTIVITY_EXPORT_URL,
      paramsMap: { 'amp-id': ampId, translations: this._translations }
    }).catch((error) => this._onPullError(ampId, error));
  }

  _removeExistingNonRejected(activity, error) {
    if (error) {
      return Promise.resolve(activity, error);
    }
    return ActivityHelper.removeNonRejectedByAmpId(activity[AC.AMP_ID])
      .then(() => activity);
  }

  _saveNewActivity(activity, error) {
    if (error) {
      return Promise.resolve(activity, error);
    }
    return ActivityHelper.saveOrUpdate(activity)
      .then(() => activity)
      .catch((err) => this._onPullError(activity[AC.AMP_ID], err));
  }

  _onPullError(ampId, error) {
    LoggerManager.log('_onPullError');
    if (error) {
      LoggerManager.error(error);
    } else {
      this.pulled.add(ampId);
    }
    return Promise.resolve();
  }
}
