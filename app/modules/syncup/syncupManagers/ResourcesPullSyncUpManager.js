import ResourceHelper from '../../helpers/ResourceHelper';
import {
  SYNCUP_RESOURCE_PULL_BATCH_SIZE,
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
    // A resource can be deleted in AMP only when it is no longer used in activities. Hence if an offline activity
    // still references a resource that was removed in AMP, then:
    // 1) It was removed in this activity in AMP and the new activity version is reported for pull with this change
    //    a) however an activity may be reported for pull even if not changed, but only new field(s) enabled
    // 2) It is refenced by Offline activity only and during last sync this resource was pushed, while the activity not
    // and in the meantime until this new sync round started, this resource was deleted in AMP (fringe case).
    // So we will remove obsolete resource reference from pending activities to be pushed only. For the rest, the change
    // must have had happened in AMP. We will report a warning about removal for such pending to push activities.
    const uuidFilter = Utils.toMap(ACTIVITY_DOCUMENTS, { $elemMatch: Utils.toMap(UUID, { $in: removedResourcesIds }) });
    return ActivityHelper.findAllNonRejectedModifiedOnClient(uuidFilter).then(activities => {
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
