import { ActivityConstants, Constants, ErrorConstants } from 'amp-ui';
import * as ActivityHelper from '../../helpers/ActivityHelper';
import * as Utils from '../../../utils/Utils';
import { ACTIVITY_EXPORT_BATCHES_URL } from '../../connectivity/AmpApiConstants';
import BatchPullSavedAndRemovedSyncUpManager from './BatchPullSavedAndRemovedSyncUpManager';
import Logger from '../../util/LoggerManager';
import ActivitiesPushToAMPManager from './ActivitiesPushToAMPManager';
import Notification from '../../helpers/NotificationHelper';
import ApiErrorConverter from '../../connectivity/ApiErrorConverter';

const logger = new Logger('Activities pull from AMP manager');

/* eslint-disable class-methods-use-this */

/**
 * Pulls the latest activities state from AMP
 * @author Nadejda Mandrescu
 */
export default class ActivitiesPullFromAMPManager extends BatchPullSavedAndRemovedSyncUpManager {

  constructor() {
    super(Constants.SYNCUP_TYPE_ACTIVITIES_PULL);
    this._saveNewActivities = this._saveNewActivities.bind(this);
    this._details[Constants.SYNCUP_DETAILS_SYNCED] = [];
    this._details[Constants.SYNCUP_DETAILS_UNSYNCED] = [];
  }

  set activitiesPushToAMPManager(activitiesPushToAMPManager: ActivitiesPushToAMPManager) {
    this._activitiesPushToAMPManager = activitiesPushToAMPManager;
  }

  mergeDetails(previousDetails) {
    const synced = this._details[Constants.SYNCUP_DETAILS_SYNCED];
    const prevSynced = previousDetails && previousDetails[Constants.SYNCUP_DETAILS_SYNCED];
    if (prevSynced && prevSynced.length) {
      const syncedAmpIds = new Set(synced.map(detail => detail[ActivityConstants.AMP_ID]));
      synced.push(...prevSynced.filter(detail => !syncedAmpIds.has(detail[ActivityConstants.AMP_ID])));
    }
    const merged = Utils.toMap(Constants.SYNCUP_DETAILS_SYNCED, synced);
    /* If the current sync didn't even start (e.g. connection interruption or canceled before 2nd run), then keep
    previous result, otherwise only the latest unsyced are relevant, since those from the previous attempt were retried
    this time */
    const unsycedSource = this.diff ? this._details : (previousDetails || []);
    merged[Constants.SYNCUP_DETAILS_UNSYNCED] = unsycedSource[Constants.SYNCUP_DETAILS_UNSYNCED];
    return merged;
  }

  static mergeDetails(...details) {
    const result = Utils.toMap(Constants.SYNCUP_DETAILS_SYNCED, []);
    result[Constants.SYNCUP_DETAILS_UNSYNCED] = [];
    details.forEach(detail => {
      result[Constants.SYNCUP_DETAILS_SYNCED].push(...(detail[Constants.SYNCUP_DETAILS_SYNCED] || []));
      result[Constants.SYNCUP_DETAILS_UNSYNCED].push(...(detail[Constants.SYNCUP_DETAILS_UNSYNCED] || []));
    });
    return result;
  }


  removeEntries() {
    const ampIdsFilter = Utils.toMap(ActivityConstants.AMP_ID, { $in: this.diff.removed });
    // remove both rejected and non rejected if the activity is removed
    return ActivityHelper.removeAll(ampIdsFilter).then((result) => {
      this.diff.removed = [];
      return result;
    });
  }

  pullNewEntries() {
    const requestConfigurations = [];
    const { saved } = this.diff;
    for (let idx = 0; idx < saved.length; idx += Constants.SYNCUP_ACTIVITIES_PULL_BATCH_SIZE) {
      const batchAmpIds = saved.slice(idx, idx + Constants.SYNCUP_ACTIVITIES_PULL_BATCH_SIZE);
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
            return this.onActivitiesWithErrors(activitiesPullErrors);
          }
          return result;
        });
    }
    return this.onActivitiesPullError(error, activities);
  }

  /**
   * Removes existing activities, unless were modified and local version matches the one from AMP
   * @param activities the pulled activities
   * @return {Object} the activity to save
   * @private
   */
  _removeExistingNonRejected(activities) {
    const activitiesByAmpId = new Map();
    activities.forEach(a => activitiesByAmpId.set(a[ActivityConstants.AMP_ID], a));
    return ActivityHelper.findAllNonRejectedByAmpIds(Array.from(activitiesByAmpId.keys())).then(dbActivities => {
      if (!dbActivities || !dbActivities.length) {
        return activities;
      }
      const rejectActivityPromises = [];
      dbActivities = dbActivities.filter(dbActivity => {
        if (ActivityHelper.isModifiedOnClient(dbActivity)) {
          const activity = activitiesByAmpId.get(dbActivity[ActivityConstants.AMP_ID]);
          /*
          Use case to get here (see AMPOFFLINE-1363):
          1) Add/Edit activity in AMP Offline.
          2) Put break point in activities pull and during sync, allow only the push to go (do conn loss in pull)
          3) Edit activity in AMP Offline. Do not change activity in AMP.
          4) Sync normally (without conn loss). Offline activity changes must be visible in online.
          Here we'll get previously unpulled activity, but it is the same as local and can be ignored.
           */
          if (ActivityHelper.getVersion(dbActivity) === ActivityHelper.getVersion(activity)) {
            // update the minimum info for reference in case next pull will fail (e.g. connection loss)
            [ActivityConstants.CREATED_BY, ActivityConstants.CREATED_ON, ActivityConstants.MODIFIED_BY,
              ActivityConstants.MODIFIED_ON].forEach(field => {
                dbActivity[field] = activity[field];
              });
            activities[activities.findIndex(a => a === activity)] = dbActivity;
            return false;
          }
          const error = new Notification({
            message: 'rejectedStaleActivity',
            origin: ErrorConstants.NOTIFICATION_ORIGIN_API_SYNCUP
          });
          rejectActivityPromises.push(this._activitiesPushToAMPManager.rejectActivityClientSide(dbActivity, error)
            .catch(err => {
              logger.error(err);
              return Promise.resolve();
            }));
        }
        return true;
      });
      const ids = dbActivities.map(a => a.id);
      return Promise.all(rejectActivityPromises).then(() =>
        ActivityHelper.removeAllNonRejectedByIds(ids).then(() => activities));
    });
  }

  _saveNewActivities(activities) {
    return ActivityHelper.saveOrUpdateCollection(activities, false)
      .then(() => {
        activities.forEach(a => this.pulled.add(a[ActivityConstants.AMP_ID]));
        return this._updateDetails(activities);
      }).catch((err) => {
        activities.forEach(a => { a.error = err; });
        return this.onActivitiesWithErrors(activities);
      });
  }

  onPullError(error, ...ampIds) {
    logger.error(`Activity amp-ids=${ampIds} pull error: ${error}`);
    const notFoundInDBAmpIds = new Set(ampIds);
    return ActivityHelper.findAllNonRejectedByAmpIds(ampIds).then(activitiesWithPullError => {
      activitiesWithPullError.forEach(dbA => {
        dbA.error = error;
        notFoundInDBAmpIds.delete(dbA[ActivityConstants.AMP_ID]);
      });
      notFoundInDBAmpIds.forEach(ampId => {
        activitiesWithPullError.push({
          [ActivityConstants.AMP_ID]: ampId,
          error
        });
      });
      return this._updateDetails(activitiesWithPullError);
    });
  }

  onActivitiesPullError(error, activities) {
    const ampIds = activities.map(a => a[ActivityConstants.AMP_ID]);
    error = ApiErrorConverter.toLocalError(error);
    logger.error(`Activity amp-ids=${ampIds} pull error: ${error}`);
    activities.forEach(a => { a.error = error; });
    return this._updateDetails(activities);
  }

  onActivitiesWithErrors(activitiesWithPullError) {
    activitiesWithPullError.forEach(a => {
      a.error = ApiErrorConverter.toLocalError(a.error);
      logger.error(`Activity amp-id=${a[ActivityConstants.AMP_ID]} pull error: ${a.error}`);
    });
    return this._updateDetails(activitiesWithPullError);
  }

  _updateDetails(activities) {
    activities.forEach(activity => {
      const detailType = activity.error ? Constants.SYNCUP_DETAILS_UNSYNCED : Constants.SYNCUP_DETAILS_SYNCED;
      const detail = Utils.toMap(ActivityConstants.AMP_ID, activity[ActivityConstants.AMP_ID]);
      if (activity[ActivityConstants.INTERNAL_ID]) {
        detail[ActivityConstants.PROJECT_TITLE] = activity[ActivityConstants.PROJECT_TITLE];
        detail.id = activity[ActivityConstants.INTERNAL_ID];
      }
      this._details[detailType].push(detail);
    });
  }

}
