import ResourceHelper from '../../helpers/ResourceHelper';
import { SYNCUP_TYPE_ACTIVITIES_PULL, SYNCUP_TYPE_RESOURCES_PULL } from '../../../utils/Constants';
import { RESOURCE_PULL_URL } from '../../connectivity/AmpApiConstants';
import BatchPullSavedAndRemovedSyncUpManager from './BatchPullSavedAndRemovedSyncUpManager';
import Logger from '../../util/LoggerManager';
import { ACTIVITY_DOCUMENTS, AMP_ID } from '../../../utils/constants/ActivityConstants';
import * as Utils from '../../../utils/Utils';
import * as ActivityHelper from '../../helpers/ActivityHelper';
import ResourceManager from '../../resource/ResourceManager';
import { UUID } from '../../../utils/constants/ResourceConstants';

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
    return ResourceManager.deleteAllResourcesWithContent(removedResourcesIds).then(() => {
      // clear diff immediately
      this.diff.removed = [];
      return this.unlinkRemovedResourcesFromActivities(removedResourcesIds);
    });
  }

  unlinkRemovedResourcesFromActivities(removedResourcesIds) {
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
    const activitiesPullDiff = this.totalSyncUpDiff.get(SYNCUP_TYPE_ACTIVITIES_PULL);
    const activityIdsToIgnore = [].concat(activitiesPullDiff.saved || []).concat(activitiesPullDiff.removed || []);
    const uuidFilter = Utils.toMap(ACTIVITY_DOCUMENTS, { [UUID]: { $in: removedResourcesIds } });
    const ampIdFilter = activityIdsToIgnore.length && Utils.toMap(AMP_ID, { $nin: activityIdsToIgnore });
    const filter = activityIdsToIgnore.length ? { $and: [uuidFilter, ampIdFilter] } : uuidFilter;

    return ActivityHelper.findAllNonRejected(filter).then(activities => {
      activities.forEach(activity => this.unlinkRemovedResourcesFromActivity(activity, removedResourcesIds));
      return ActivityHelper.saveOrUpdateCollection(activities);
    });
  }

  unlinkRemovedResourcesFromActivity(activity, removedResourcesIds) {
    let resources = activity[ACTIVITY_DOCUMENTS];
    if (resources && resources.length) {
      resources = resources.filter(ar => !removedResourcesIds.includes(ar[UUID]));
      activity[ACTIVITY_DOCUMENTS] = resources;
    }
  }

  pullNewEntries() {
    const requestConfigurations = this.diff.saved.map(uuid => {
      const pullConfig = {
        getConfig: {
          shouldRetry: true,
          url: RESOURCE_PULL_URL,
          extraUrlParam: uuid
        },
        onPullError: [uuid]
      };
      return pullConfig;
    });
    return this.pullNewEntriesInBatches(requestConfigurations);
  }

  processEntryPullResult(resource, error) {
    if (!error && resource) {
      return this._saveResource(resource);
    }
    return this.onPullError(error, resource && resource[UUID]);
  }

  _saveResource(resource) {
    // in the current iteration we expect to pull only metadata
    return ResourceHelper.saveOrUpdateResource(resource)
      .then(() => {
        this.pulled.add(resource[UUID]);
        return resource;
      }).catch((err) => this.onPullError(err, resource[UUID]));
  }

  onPullError(error, uuid) {
    logger.error(`Resource uuid=${uuid} pull error: ${error}`);
    return error;
  }

}
