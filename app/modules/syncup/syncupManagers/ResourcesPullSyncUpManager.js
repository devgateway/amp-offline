import ResourceHelper from '../../helpers/ResourceHelper';
import {
  SYNCUP_RESOURCE_PULL_BATCH_SIZE,
  SYNCUP_TYPE_ACTIVITIES_PULL,
  SYNCUP_TYPE_RESOURCES_PULL
} from '../../../utils/Constants';
import { RESOURCE_PULL_URL } from '../../connectivity/AmpApiConstants';
import BatchPullSavedAndRemovedSyncUpManager from './BatchPullSavedAndRemovedSyncUpManager';
import Logger from '../../util/LoggerManager';
import { ACTIVITY_DOCUMENTS, AMP_ID, PROJECT_TITLE } from '../../../utils/constants/ActivityConstants';
import * as Utils from '../../../utils/Utils';
import * as ActivityHelper from '../../helpers/ActivityHelper';
import ResourceManager from '../../resource/ResourceManager';
import { TITLE, UUID } from '../../../utils/constants/ResourceConstants';
import NotificationHelper from '../../helpers/NotificationHelper';
import { NOTIFICATION_SEVERITY_WARNING } from '../../../utils/constants/ErrorConstants';

const logger = new Logger('ResourcesPullSyncUpManager');

/* eslint-disable class-methods-use-this */

/**
 * Pulls the latest resources data from AMP.
 * @since AMP Offline 1.2.0 pulls only resources metadata
 *
 * @author Nadejda Mandrescu
 */
export default class ResourcesPullSyncUpManager extends BatchPullSavedAndRemovedSyncUpManager {

  constructor() {
    super(SYNCUP_TYPE_RESOURCES_PULL);
    this.unlinkRemovedResourcesFromActivities = this.unlinkRemovedResourcesFromActivities.bind(this);
    this.unlinkRemovedResourcesFromActivity = this.unlinkRemovedResourcesFromActivity.bind(this);
  }

  removeEntries() {
    const removedResourcesIds = this.diff.removed;
    return ResourceManager.findResourcesByUuidsWithContent(removedResourcesIds)
      .then(deletedResources => ResourceManager.deleteAllResourcesWithContent(removedResourcesIds).then(() => {
        // clear diff immediately
        this.diff.removed = [];
        return this.unlinkRemovedResourcesFromActivities(removedResourcesIds, Utils.toMapByKey(deletedResources, UUID));
      }));
  }

  unlinkRemovedResourcesFromActivities(removedResourcesIds, removedResourcesMap) {
    if (!removedResourcesIds || !removedResourcesIds.length) {
      return removedResourcesIds;
    }
    // A resource can be deleted in AMP only when it is no longer used in activities. Hence if some offline activities
    // still have the link(s) to a removed resource then either those activities no longer have the link on AMP
    // and will be updated as part of the sync or the link is present for an activity that could not be sync yet to AMP.
    // In the 1st case we'll skip changing activities that will be updated as part of activities pull. There is
    // a dependency to pull resources after activities, but if some activity pull fails, we should still skip it here.
    // In the 2nd fringe case we agreed that for simplicity we'll remove the resource link from activity
    // and notify the user.
    const activitiesPullDiff = this.totalSyncUpDiff[SYNCUP_TYPE_ACTIVITIES_PULL] || {};
    const activityIdsToIgnore = [].concat(activitiesPullDiff.saved || []).concat(activitiesPullDiff.removed || []);
    const uuidFilter = Utils.toMap(ACTIVITY_DOCUMENTS, { $elemMatch: Utils.toMap(UUID, { $in: removedResourcesIds }) });
    const ampIdFilter = activityIdsToIgnore.length && Utils.toMap(AMP_ID, { $nin: activityIdsToIgnore });
    const filter = activityIdsToIgnore.length ? { $and: [uuidFilter, ampIdFilter] } : uuidFilter;

    return ActivityHelper.findAllNonRejected(filter).then(activities => {
      activities.forEach(activity =>
        this.unlinkRemovedResourcesFromActivity(activity, removedResourcesIds, removedResourcesMap));
      return ActivityHelper.saveOrUpdateCollection(activities);
    });
  }

  unlinkRemovedResourcesFromActivity(activity, removedResourcesIds, removedResourcesMap) {
    let resources = activity[ACTIVITY_DOCUMENTS];
    if (resources && resources.length) {
      const removedResources = [];
      resources = resources.filter(ar => {
        const uuid = ar[UUID];
        if (removedResourcesIds.includes(uuid)) {
          removedResources.push(removedResourcesMap.get(uuid) || uuid);
          return false;
        }
        return true;
      });
      activity[ACTIVITY_DOCUMENTS] = resources;
      if (removedResources.length) {
        const titles = removedResources.map(r => `"${r[TITLE] || r[UUID] || r}"`).join(', ');
        const formattedAmpId = activity[AMP_ID] ? `(${activity[AMP_ID]}) ` : '';
        const activityInfo = `"${formattedAmpId}${activity[PROJECT_TITLE]}"`;
        const replacePairs = [['%titles%', titles], ['%activityInfo%', activityInfo]];
        const message = 'resourcesDeletedFromActivity';
        const warn = new NotificationHelper({ message, replacePairs, severity: NOTIFICATION_SEVERITY_WARNING });
        this.addWarning(warn);
        logger.warn(warn.message);
      }
    }
  }

  pullNewEntries() {
    const requestConfigurations = [];
    for (let idx = 0; idx < this.diff.saved.length; idx += SYNCUP_RESOURCE_PULL_BATCH_SIZE) {
      const uuids = this.diff.saved.slice(idx, idx + SYNCUP_RESOURCE_PULL_BATCH_SIZE);
      requestConfigurations.push({
        postConfig: {
          shouldRetry: true,
          url: RESOURCE_PULL_URL,
          body: uuids
        },
        onPullError: [uuids]
      });
    }
    return this.pullNewEntriesInBatches(requestConfigurations);
  }

  processEntryPullResult(resources, error) {
    if (!error && resources) {
      return this._saveResources(resources);
    }
    return this.onPullError(error, resources && resources.map(r => r[UUID]));
  }

  _saveResources(resources) {
    // in the current iteration we expect to pull only metadata
    return ResourceHelper.saveOrUpdateResourceCollection(resources)
      .then(() => {
        resources.forEach(r => this.pulled.add(r[UUID]));
        return resources;
      }).catch((err) => this.onPullError(err, resources.map(r => r[UUID])));
  }

  onPullError(error, uuids) {
    logger.error(`Resources uuids=${uuids} pull error: ${error}`);
    return error;
  }

}
