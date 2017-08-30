import * as ActivityHelper from '../../helpers/ActivityHelper';
import * as AC from '../../../utils/constants/ActivityConstants';
import { SYNCUP_TYPE_ACTIVITIES_PULL } from '../../../utils/Constants';
import * as Utils from '../../../utils/Utils';
import { ACTIVITY_EXPORT_URL } from '../../connectivity/AmpApiConstants';
import BatchPullSavedAndRemovedSyncUpManager from './BatchPullSavedAndRemovedSyncUpManager';
import LoggerManager from '../../util/LoggerManager';

/* eslint-disable class-methods-use-this */

/**
 * Pulls the latest activities state from AMP
 * @author Nadejda Mandrescu
 */
export default class ActivitiesPullFromAMPManager extends BatchPullSavedAndRemovedSyncUpManager {

  constructor() {
    super(SYNCUP_TYPE_ACTIVITIES_PULL);
    this._saveNewActivity = this._saveNewActivity.bind(this);
  }

  removeEntries() {
    const ampIdsFilter = Utils.toMap(AC.AMP_ID, { $in: this.diff.removed });
    // remove both rejected and non rejected if the activity is removed
    return ActivityHelper.removeAll(ampIdsFilter).then((result) => {
      this.diff.removed = [];
      return result;
    });
  }

  pullNewEntries() {
    const requestConfigurations = this.diff.saved.map(ampId => {
      const pullConfig = {
        getConfig: {
          shouldRetry: true,
          url: ACTIVITY_EXPORT_URL,
          paramsMap: { 'amp-id': ampId }
        },
        onPullError: [ampId]
      };
      return pullConfig;
    });
    return this.pullNewEntriesInBatches(requestConfigurations);
  }

  processEntryPullResult(activity, error) {
    if (!error && activity) {
      return this._removeExistingNonRejected(activity)
        .then(this._saveNewActivity);
    }
    return this.onPullError(error, activity);
  }

  _removeExistingNonRejected(activity) {
    return ActivityHelper.removeNonRejectedByAmpId(activity[AC.AMP_ID]).then(() => activity);
  }

  _saveNewActivity(activity) {
    const ampId = activity[AC.AMP_ID];
    return ActivityHelper.saveOrUpdate(activity)
      .then(() => {
        this.pulled.add(ampId);
        return activity;
      }).catch((err) => this.onPullError(err, ampId));
  }

  onPullError(error, ampId) {
    LoggerManager.error(`Activity amp-id=${ampId} pull error: ${error}`);
    return error;
  }

}
