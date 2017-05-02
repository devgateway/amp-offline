import * as ActivityHelper from '../helpers/ActivityHelper';
import * as AC from '../../utils/constants/ActivityConstants';
import * as Utils from '../../utils/Utils';
import { ACTIVITY_EXPORT_URL } from '../connectivity/AmpApiConstants';
import * as ConnectionHelper from '../connectivity/ConnectionHelper';
import { FIRST_ACTIVITIES_PULL_FROM_AMP_LIMIT } from '../../utils/Constants';
import store from '../../index';
import LoggerManager from '../../modules/util/LoggerManager';

/* eslint-disable class-methods-use-this */
/**
 * Pulls the latest activities state from AMP
 * @author Nadejda Mandrescu
 */
export default class ActivitiesPullFromAMPManager {
  constructor() {
    this._cancel = false;
    // TODO update this once AMPOFFLINE-319 is done
    let translations = store.getState().translationReducer.languageList;
    if (!translations) {
      translations = ['en', 'pt', 'tm', 'fr']; // using explicitly Timor and Niger langs until 319 is done
    }
    this._translations = translations.join('|');
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
  pullActivitiesFromAMP(saved, removed) {
    LoggerManager.log('pullActivitiesFromAMP');
    return Promise.all([this._removeActivities(removed),
      this._getLatestActivities(saved)]);
  }

  _removeActivities(ampIds) {
    const ampIdsFilter = Utils.toMap(AC.AMP_ID, { $in: ampIds });
    // remove both rejected and non rejected if the activity is removed
    return ActivityHelper.removeAll(ampIdsFilter);
  }

  _getLatestActivities(ampIds) {
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
    }).catch((error) => this._onPullError(null, error));
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
      .catch((err) => this._onPullError(null, err));
  }

  _onPullError(activity, error) {
    LoggerManager.log('_onPullError');
    // TODO the un-synced activity should be remembered and re-synced on next attempt AMPOFFLINE-256
    if (error) {
      LoggerManager.error(error);
    }
    return Promise.resolve();
  }
}
