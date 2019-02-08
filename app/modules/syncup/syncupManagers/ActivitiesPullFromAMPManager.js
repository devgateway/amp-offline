import * as ActivityHelper from '../../helpers/ActivityHelper';
import * as AC from '../../../utils/constants/ActivityConstants';
import {
  SYNCUP_ACTIVITIES_PULL_BATCH_SIZE,
  SYNCUP_DETAILS_SYNCED,
  SYNCUP_DETAILS_UNSYNCED,
  SYNCUP_TYPE_ACTIVITIES_PULL
} from '../../../utils/Constants';
import * as Utils from '../../../utils/Utils';
import { ACTIVITY_EXPORT_BATCHES_URL } from '../../connectivity/AmpApiConstants';
import BatchPullSavedAndRemovedSyncUpManager from './BatchPullSavedAndRemovedSyncUpManager';
import Logger from '../../util/LoggerManager';
import ActivitiesPushToAMPManager from './ActivitiesPushToAMPManager';
import Notification from '../../helpers/NotificationHelper';
import * as EC from '../../../utils/constants/ErrorConstants';

const logger = new Logger('Activities pull from AMP manager');

/* eslint-disable class-methods-use-this */

/**
 * Pulls the latest activities state from AMP
 * @author Nadejda Mandrescu
 */
export default class ActivitiesPullFromAMPManager extends BatchPullSavedAndRemovedSyncUpManager {

  constructor() {
    super(SYNCUP_TYPE_ACTIVITIES_PULL);
    this._saveNewActivities = this._saveNewActivities.bind(this);
    this._details[SYNCUP_DETAILS_SYNCED] = [];
    this._details[SYNCUP_DETAILS_UNSYNCED] = [];
  }

  set activitiesPushToAMPManager(activitiesPushToAMPManager: ActivitiesPushToAMPManager) {
    this._activitiesPushToAMPManager = activitiesPushToAMPManager;
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
    const requestConfigurations = [];
    const { saved } = this.diff;
    for (let idx = 0; idx < saved.length; idx += SYNCUP_ACTIVITIES_PULL_BATCH_SIZE) {
      const batchAmpIds = saved.slice(idx, idx + SYNCUP_ACTIVITIES_PULL_BATCH_SIZE);
      requestConfigurations.push({
        postConfig: {
          shouldRetry: true,
          url: ACTIVITY_EXPORT_BATCHES_URL,
          body: batchAmpIds
        },
        onPullError: batchAmpIds
      });
    }
    return this.pullNewEntriesInBatches(requestConfigurations);
  }

  processEntryPullResult(activities, error) {
    if (!error && activities) {
      const activitiesPullErrors = [];
      activities = activities.filter(a => {
        if (a.error) {
          activitiesPullErrors.push(a);
          return false;
        }
        return true;
      });
      return this._removeExistingNonRejected(activities)
        .then(this._saveNewActivities)
        .then(result => {
          if (activitiesPullErrors.length) {
            return this.onActivitiesPullErrorAndLog(activitiesPullErrors);
          }
          return result;
        });
    }
    return this.onPullError(error, activities);
  }

  /**
   * Removes existing activities, unless were modified and local version matches the one from AMP
   * @param activities the pulled activities
   * @return {Object} the activity to save
   * @private
   */
  _removeExistingNonRejected(activities) {
    const activitiesByAmpId = new Map();
    activities.forEach(a => activitiesByAmpId.set(a[AC.AMP_ID], a));
    return ActivityHelper.findAllNonRejectedByAmpIds(Array.from(activitiesByAmpId.keys())).then(dbActivities => {
      if (!dbActivities || !dbActivities.length) {
        return activities;
      }
      const ids = dbActivities.map(a => a.id);
      const rejectActivityPromises = [];
      dbActivities.forEach(dbActivity => {
        if (ActivityHelper.isModifiedOnClient(dbActivity)) {
          const activity = activitiesByAmpId.get(dbActivity[AC.AMP_ID]);
          if (ActivityHelper.getVersion(dbActivity) === ActivityHelper.getVersion(activity)) {
            // update the minimum info for reference in case next pull will fail (e.g. connection loss)
            [AC.CREATED_BY, AC.CREATED_ON, AC.MODIFIED_BY, AC.MODIFIED_ON].forEach(field => {
              dbActivity[field] = activity[field];
            });
            return dbActivity;
          }
          const error = new Notification({
            message: 'rejectedStaleActivity',
            origin: EC.NOTIFICATION_ORIGIN_API_SYNCUP
          });
          rejectActivityPromises.push(this._activitiesPushToAMPManager.rejectActivityClientSide(dbActivity, error)
            .catch(err => {
              logger.error(err);
              return Promise.resolve();
            }));
        }
      });
      return Promise.all(rejectActivityPromises).then(() =>
        ActivityHelper.removeAllNonRejectedByIds(ids).then(() => activities));
    });
  }

  _saveNewActivities(activities) {
    return ActivityHelper.saveOrUpdateCollection(activities, false)
      .then(() => {
        activities.forEach(a => this.pulled.add(a[AC.AMP_ID]));
        return this._updateDetails(activities);
      }).catch((err) => {
        activities.forEach(a => { a.error = err; });
        return this.onActivitiesPullErrorAndLog(activities);
      });
  }

  onPullError(error, ampIds) {
    logger.error(`Activity amp-ids=${ampIds} pull error: ${error}`);
    const notFoundInDBAmpIds = new Set(ampIds);
    return ActivityHelper.findAllNonRejectedByAmpIds(ampIds).then(activitiesWithPullError => {
      activitiesWithPullError.forEach(dbA => {
        dbA.error = error;
        notFoundInDBAmpIds.delete(dbA[AC.AMP_ID]);
      });
      notFoundInDBAmpIds.forEach(ampId => {
        activitiesWithPullError.push({
          [AC.AMP_ID]: ampId,
          error
        });
      });
      return this._updateDetails(activitiesWithPullError);
    });
  }

  onActivitiesPullErrorAndLog(activitiesWithPullError) {
    activitiesWithPullError.forEach(a => logger.error(`Activity amp-id=${a[AC.AMP_ID]} pull error: ${a.error}`));
    return this._updateDetails(activitiesWithPullError);
  }

  _updateDetails(activities) {
    activities.forEach(activity => {
      const detailType = activity.error ? SYNCUP_DETAILS_UNSYNCED : SYNCUP_DETAILS_SYNCED;
      const detail = Utils.toMap(AC.AMP_ID, activity[AC.AMP_ID]);
      if (activity[AC.INTERNAL_ID]) {
        detail[AC.PROJECT_TITLE] = activity[AC.PROJECT_TITLE];
        detail.id = activity[AC.INTERNAL_ID];
      }
      this._details[detailType].push(detail);
    });
  }

}
