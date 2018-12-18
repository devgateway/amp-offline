import * as ActivityHelper from '../../helpers/ActivityHelper';
import * as AC from '../../../utils/constants/ActivityConstants';
import {
  SYNCUP_DETAILS_SYNCED,
  SYNCUP_DETAILS_UNSYNCED,
  SYNCUP_TYPE_ACTIVITIES_PULL
} from '../../../utils/Constants';
import * as Utils from '../../../utils/Utils';
import { ACTIVITY_EXPORT_URL } from '../../connectivity/AmpApiConstants';
import BatchPullSavedAndRemovedSyncUpManager from './BatchPullSavedAndRemovedSyncUpManager';
import Logger from '../../util/LoggerManager';

const logger = new Logger('Activities pull from AMP manager');

/* eslint-disable class-methods-use-this */

/**
 * Pulls the latest activities state from AMP
 * @author Nadejda Mandrescu
 */
export default class ActivitiesPullFromAMPManager extends BatchPullSavedAndRemovedSyncUpManager {

  constructor() {
    super(SYNCUP_TYPE_ACTIVITIES_PULL);
    this._saveNewActivity = this._saveNewActivity.bind(this);
    this._details[SYNCUP_DETAILS_SYNCED] = [];
    this._details[SYNCUP_DETAILS_UNSYNCED] = [];
  }

  mergeDetails(previousDetails) {
    const synced = this._details[SYNCUP_DETAILS_SYNCED];
    const prevSynced = previousDetails && previousDetails[SYNCUP_DETAILS_SYNCED];
    if (prevSynced && prevSynced.length) {
      const syncedAmpIds = new Set(synced.map(detail => detail[AC.AMP_ID]));
      synced.push(...prevSynced.filter(detail => !syncedAmpIds.has(detail[AC.AMP_ID])));
    }
    const merged = Utils.toMap(SYNCUP_DETAILS_SYNCED, synced);
    /* If the current sync didn't even start (e.g. connection interruption or canceled before 2nd run), then keep
    previous result, otherwise only the latest unsyced are relevant, since those from the previous attempt were retried
    this time */
    const unsycedSource = this.diff ? this._details : (previousDetails || []);
    merged[SYNCUP_DETAILS_UNSYNCED] = unsycedSource[SYNCUP_DETAILS_UNSYNCED];
    return merged;
  }

  static mergeDetails(...details) {
    const result = Utils.toMap(SYNCUP_DETAILS_SYNCED, []);
    result[SYNCUP_DETAILS_UNSYNCED] = [];
    details.forEach(detail => {
      result[SYNCUP_DETAILS_SYNCED].push(...(detail[SYNCUP_DETAILS_SYNCED] || []));
      result[SYNCUP_DETAILS_UNSYNCED].push(...(detail[SYNCUP_DETAILS_UNSYNCED] || []));
    });
    return result;
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

  /**
   * Removes existing activity, unless was modified and local version matches the one from AMP
   * @param activity the pulled activity
   * @return {Object} the activity to save
   * @private
   */
  _removeExistingNonRejected(activity) {
    return ActivityHelper.findNonRejectedByAmpId(activity[AC.AMP_ID]).then(dbActivity => {
      if (ActivityHelper.isModifiedOnClient(dbActivity)) {
        if (ActivityHelper.getVersion(dbActivity) === ActivityHelper.getVersion(activity)) {
          // update the minimum info for reference in case next pull will fail (e.g. connection loss)
          [AC.CREATED_BY, AC.CREATED_ON, AC.MODIFIED_BY, AC.MODIFIED_ON].forEach(field => {
            dbActivity[field] = activity[field];
          });
          return dbActivity;
        }
      }
      return ActivityHelper.removeNonRejectedById(dbActivity.id).then(() => activity);
    });
  }

  _saveNewActivity(activity) {
    const ampId = activity[AC.AMP_ID];
    return ActivityHelper.saveOrUpdate(activity)
      .then(() => {
        this.pulled.add(ampId);
        return this._updateDetails(ampId, activity);
      }).catch((err) => this.onPullError(err, ampId));
  }

  onPullError(error, ampId) {
    logger.error(`Activity amp-id=${ampId} pull error: ${error}`);
    return this._updateDetails(ampId, null, error);
  }

  _updateDetails(ampId, activity, error) {
    const detailType = error ? SYNCUP_DETAILS_UNSYNCED : SYNCUP_DETAILS_SYNCED;
    const detail = Utils.toMap(AC.AMP_ID, ampId);
    return this._maybeLookupActivityInDB(ampId, activity).then(currentOrDbActivity => {
      if (currentOrDbActivity) {
        detail[AC.PROJECT_TITLE] = currentOrDbActivity[AC.PROJECT_TITLE];
        detail.id = currentOrDbActivity.id;
      }
      this._details[detailType].push(detail);
      return detail;
    });
  }

  _maybeLookupActivityInDB(ampId, activity) {
    if (activity) {
      return Promise.resolve(activity);
    }
    return ActivityHelper.findNonRejectedByAmpId(ampId);
  }
}
