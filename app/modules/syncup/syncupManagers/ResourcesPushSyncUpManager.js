/* eslint-disable class-methods-use-this */
import { Constants } from 'amp-ui';
import SyncUpManagerInterface from './SyncUpManagerInterface';
import ResourceHelper from '../../helpers/ResourceHelper';
import Logger from '../../util/LoggerManager';
import { RESOURCE_PUSH_URL } from '../../connectivity/AmpApiConstants';
import * as ConnectionHelper from '../../connectivity/ConnectionHelper';
import * as Utils from '../../../utils/Utils';
import * as ActivityHelper from '../../helpers/ActivityHelper';
import * as AC from '../../../utils/constants/ActivityConstants';
import { CONTENT_ID, CONTENT_TYPE, FILE_NAME, UUID } from '../../../utils/constants/ResourceConstants';
import RepositoryHelper from '../../helpers/RepositoryHelper';
import RepositoryManager from '../../repository/RepositoryManager';
import MultipartFormBuilder from '../../connectivity/MultipartFormBuilder';
import Notification from '../../helpers/NotificationHelper';
import * as EC from '../../../utils/constants/ErrorConstants';

const logger = new Logger('ResourcesPushSyncUpManager');

/**
 * Pushes new resources to AMP. It is not possible in AMP to edit resources from AF, hence in AMP Offline either.
 * Therefore no updated resources will be push unless we add Resources Manager in AMP Offline as well.
 *
 * @author Nadejda Mandrescu
 */
export default class ResourcesPushSyncUpManager extends SyncUpManagerInterface {
  constructor() {
    super(Constants.SYNCUP_TYPE_RESOURCES_PUSH);
    this._cancel = false;
    this.diff = [];
    this._processed = new Set();
  }

  cancel() {
    this._cancel = true;
  }

  getDiffLeftover() {
    this.diff = this.diff.filter(id => !this._processed.has(id));
    return this.diff;
  }

  doSyncUp() {
    return ResourceHelper.findAllResourcesModifiedOnClient()
      .then(this._ignoreUnreferencedResources.bind(this))
      .then(this._getResourcesWithContent.bind(this))
      .then(this._pushResources.bind(this))
      .then(() => {
        this.done = true;
        return this.done;
      });
  }

  /**
   * Ignores pushing resources that are not currently used in any activity.
   *
   * As of now, resources support is available only through Activity Form in AMP Offline. When a resource is removed
   * from activity, we follow the same approach as in AMP and only remove the link, but not the resource itself.
   * However we'll skip pushing such orphan resource in order so that AF doesn't become a hack
   * solution for the Resource Manager. Confirmed with Vanessa Goas.
   * @param resources
   * @return {Promise<T>}
   * @private
   */
  _ignoreUnreferencedResources(resources) {
    const resByUuid = Utils.toMapByKey(resources, UUID);
    const uuids = Array.from(resByUuid.keys());
    const filter = Utils.toMap(AC.ACTIVITY_DOCUMENTS, { $elemMatch: Utils.toMap(UUID, { $in: uuids }) });
    return ActivityHelper.findAllNonRejected(filter, Utils.toMap(AC.ACTIVITY_DOCUMENTS, 1))
      .then(activities => Utils.arrayFlatMap(activities.map(a => a[AC.ACTIVITY_DOCUMENTS].map(ad => ad[UUID]))))
      .then(usedUuids => usedUuids.map(uuid => resByUuid.get(uuid)).filter(r => r));
  }

  _getResourcesWithContent(resources) {
    if (!resources.length) {
      return resources;
    }
    const contentIds = resources.map(r => r[CONTENT_ID]).filter(cId => cId);
    return RepositoryHelper.findContentsByIds(contentIds).then(Utils.toMapByKey)
      .then(contentsById => resources.map(resource => ({
        resource,
        content: resource[CONTENT_ID] && contentsById.get(resource[CONTENT_ID])
      })));
  }

  _pushResources(resourcesWithContent) {
    logger.debug('_pushResources');
    this.diff = resourcesWithContent.map(({ resource }) => resource.id);
    if (!resourcesWithContent.length) {
      return Promise.resolve();
    }
    // executing push one by one for now and sequentially to avoid AMP / client overload and more granular cancel
    return resourcesWithContent.reduce((currentPromise, nextResourceWithContent) =>
      currentPromise.then(() => {
        if (this._cancel === true) {
          return Promise.resolve();
        }
        // uninterruptible call
        return this._pushResource(nextResourceWithContent);
      }), Promise.resolve());
  }

  _pushResource({ resource, content }) {
    const request = {
      url: RESOURCE_PUSH_URL,
      body: this._buildFormData(resource, content),
      shouldRetry: false
    };
    return ConnectionHelper.doPut(request)
      .then(pushResult => this._processResult({ resource, pushResult }))
      .catch(error => this._processResult({ resource, error }));
  }

  _buildFormData(resource, content) {
    const form = new MultipartFormBuilder().addJsonParam('resource', resource);
    if (content) {
      const readStream = RepositoryManager.createContentReadStream(content);
      form.addFileParam('file', resource[FILE_NAME], resource[CONTENT_TYPE], readStream);
    }
    return form.getMultipartForm();
  }

  _processResult({ resource, pushResult, error }) {
    const isConnectivityError = error instanceof Notification && error.errorCode === EC.ERROR_CODE_NO_CONNECTIVITY;
    if (pushResult || !isConnectivityError) {
      this._processed.add(resource.id);
    }
    const errorData = (error && error.message) || error || (pushResult && pushResult.error) || undefined;
    if (errorData) {
      logger.error(errorData);
      this.addError(errorData);
      return Promise.resolve();
    } else {
      return this._replaceResource(resource, pushResult);
    }
  }

  _replaceResource(resource, pushResult) {
    ResourceHelper.copyLocalData(resource, pushResult);
    return ResourceHelper.deleteResourceById(resource.id)
      .then(() => ResourceHelper.saveOrUpdateResource(pushResult))
      .then(() => this._updateResourceToActualIdInActivities(resource[UUID], pushResult[UUID]));
  }

  _updateResourceToActualIdInActivities(tmpResourceUuid, newResourceUuid) {
    const filter = Utils.toMap(AC.ACTIVITY_DOCUMENTS, { $elemMatch: Utils.toMap(UUID, tmpResourceUuid) });
    return ActivityHelper.findAllNonRejected(filter).then(activities => {
      activities.forEach(activity => {
        activity[AC.ACTIVITY_DOCUMENTS].forEach(ad => {
          if (ad[UUID] === tmpResourceUuid) {
            ad[UUID] = newResourceUuid;
          }
        });
      });
      return ActivityHelper.saveOrUpdateCollection(activities);
    });
  }

}
