import * as ActivityHelper from '../helpers/ActivityHelper';
import * as AC from '../../utils/constants/ActivityConstants';
import * as Utils from '../../utils/Utils';
import { ACTIVITY_EXPORT_URL } from '../connectivity/AmpApiConstants';
import * as ConnectionHelper from '../connectivity/ConnectionHelper';
// TODO remove this limitation once at least first export is optimized
import { FIRST_ACTIVITIES_EXPORT_LIMIT } from '../../utils/Constants';

/* eslint-disable class-methods-use-this */
/**
 * Activity Export from AMP
 * @author Nadejda Mandrescu
 */
export default class ActivitiesExportFromAMP {
  constructor() {
    this._cancel = false;
  }

  /**
   * Exports activities from AMP by adding/updating them to the client DB
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
  exportActivitiesFromAMP(saved, removed) {
    console.log('exportActivitiesFromAMP');
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
    ampIds = ampIds.slice(0, FIRST_ACTIVITIES_EXPORT_LIMIT); // eslint-disable-line no-param-reassign
    return new Promise(
      (resolve, reject) => {
        // we need to ensure we run chain promises execution in order: get, remove existing, save, process error
        const pFactories = [];
        ampIds.forEach(ampId => {
          const fnExport = this._exportActivity.bind(this, ampId);
          pFactories.push(...[fnExport, this._removeExistingNonRejected, this._saveExport, this._onExportError]);
        });

        return pFactories.reduce((currentPromise, pFactory) =>
            currentPromise.then(pFactory), Promise.resolve()).then(resolve).catch(reject);
      });
  }

  _exportActivity(ampId) {
    // TODO content translations (iteration 2)
    return Promise.resolve()
      .then(() => ConnectionHelper.doGet({ url: ACTIVITY_EXPORT_URL, paramsMap: { 'amp-id': ampId } }))
      .catch((error) => this._onExportError(null, error));
  }

  _removeExistingNonRejected(activity, error) {
    if (error) {
      return Promise.resolve(activity, error);
    }
    return ActivityHelper.removeNonRejectedByAmpId(activity[AC.AMP_ID])
      .then(() => activity);
  }

  _saveExport(activity, error) {
    if (error) {
      return Promise.resolve(activity, error);
    }
    return ActivityHelper.saveOrUpdate(activity)
      .then(() => activity)
      .catch((err) => this._onExportError(null, err));
  }

  _onExportError(activity, error) {
    console.log('_onExportError');
    // TODO the un-synced activity should be remembered and re-synced on next attempt AMPOFFLINE-256
    if (error) {
      console.error(error);
    }
    return Promise.resolve();
  }
}
