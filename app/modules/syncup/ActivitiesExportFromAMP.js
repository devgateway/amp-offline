import * as ActivityHelper from '../helpers/ActivityHelper';
import * as AC from '../../utils/constants/ActivityConstants';
import * as Utils from '../../utils/Utils';
import { ACTIVITY_EXPORT_URL } from '../connectivity/AmpApiConstants';
import * as ConnectionHelper from '../connectivity/ConnectionHelper';

export default class ActivitiesExportFromAMP {
  constructor() {
    this._cancel = false;
  }

  /**
   * Exports activities from AMP by adding/updating them to the client DB
   * @param activitiesDiff the activities difference from the general syncup EP
   * activitiesDiff : {
   *    "saved" : [ampId1, ...],
   *    "removed" : [ampId2, ...]
   * }
   * @return {Promise}
   */
  exportActivitiesFromAMP(activitiesDiff) {
    console.log('exportActivitiesFromAMP');
    return Promise.all([this._removeActivities(activitiesDiff.removed),
      this._getLatestActivities(activitiesDiff.saved)]);
  }

  static _removeActivities(ampIds) {
    const ampIdsFilter = Utils.toMap(AC.AMP_ID, { $in: ampIds });
    // remove both rejected and non rejected if the activity is removed
    return ActivityHelper.removeAll(ampIdsFilter);
  }

  _getLatestActivities(ampIds) {
    return new Promise((resolve, reject) =>
      ampIds.reduce((currentPromise, nextAmpId) => currentPromise.then(
        () => {
          if (this._cancel) {
            return resolve();
          }
          return this._exportActivity(nextAmpId);
        }), Promise.resolve()).then(resolve).catch(reject));
  }

  _exportActivity(ampId) {
    // TODO content translations (iteration 2)
    return ConnectionHelper.doGet({ url: ACTIVITY_EXPORT_URL, paramasMap: { 'amp-id': ampId } })
      .then(this._processActivityExport, this._onExportError);
  }

  static _onExportError(error) {
    console.error(error);
    // TODO any special handling
    // normally shouldn't happen
  }

  static _processActivityExport(activity) {
    return ActivityHelper.removeNonRejectedByAmpId(activity[AC.AMP_ID])
      .then(() => ActivityHelper.saveOrUpdate(activity));
  }
}
