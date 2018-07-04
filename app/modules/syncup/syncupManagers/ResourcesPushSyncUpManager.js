/* eslint-disable class-methods-use-this */
import SyncUpManagerInterface from './SyncUpManagerInterface';
import { SYNCUP_TYPE_RESOURCES_PUSH } from '../../../utils/Constants';
import ResourceHelper from '../../helpers/ResourceHelper';
import Logger from '../../util/LoggerManager';
import { RESOURCE_PUSH_URL } from '../../connectivity/AmpApiConstants';
import * as ConnectionHelper from '../../connectivity/ConnectionHelper';
import * as Utils from '../../../utils/Utils';
import * as ActivityHelper from '../../helpers/ActivityHelper';
import { ACTIVITY_DOCUMENTS } from '../../../utils/constants/ActivityConstants';
import { CONTENT_ID, CONTENT_TYPE, FILE_NAME, UUID } from '../../../utils/constants/ResourceConstants';
import RepositoryHelper from '../../helpers/RepositoryHelper';
import RepositoryManager from '../../repository/RepositoryManager';

const logger = new Logger('ResourcesPushSyncUpManager');

/**
 * Pushes new resources to AMP. It is not possible in AMP to edit resources from AF, hence in AMP Offline either.
 * Therefore no updated resources will be push unless we add Resources Manager in AMP Offline as well.
 *
 * @author Nadejda Mandrescu
 */
export default class ResourcesPushSyncUpManager extends SyncUpManagerInterface {
  constructor() {
    super(SYNCUP_TYPE_RESOURCES_PUSH);
    this._cancel = false;
    this.diff = [];
    this.pushed = new Set();
  }

  cancel() {
    this._cancel = true;
  }

  getDiffLeftover() {
    this.diff = this.diff.filter(id => !this.pushed.has(id));
    return this.diff;
  }

  doSyncUp() {
    return ResourceHelper.findAllResourcesModifiedOnClient()
      .then(this._getResourcesWithContent.bind(this))
      .then(this._pushResources.bind(this))
      .then(() => {
        this.done = true;
        return this.done;
      });
  }

  _getResourcesWithContent(resources) {
    if (!resources.length) {
      return resources;
    }
    const contentIds = resources.map(r => r[CONTENT_ID]).filter(cId => cId);
    return RepositoryHelper.findContentsByIds(contentIds).then(Utils.toMapByKey)
      .then(contentsById => resources.map(resource => ({
        resource,
        content: resource[CONTENT_ID] && contentsById[resource[CONTENT_ID]]
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
    const formData = {
      resource: ResourceHelper.cleanupLocalData(resource)
    };
    if (content) {
      formData.file = {
        value: RepositoryManager.createContentReadStream(content),
        options: {
          filename: resource[FILE_NAME],
          contentType: resource[CONTENT_TYPE]
        }
      };
    }
    return formData;
  }

  _processResult({ resource, pushResult, error }) {
    if (pushResult) {
      this.pushed.add(resource.id);
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
    const filter = Utils.toMap(ACTIVITY_DOCUMENTS, { $elemMatch: Utils.toMap(UUID, tmpResourceUuid) });
    return ActivityHelper.findAllNonRejected(filter).then(activities => {
      activities.forEach(activity => {
        activity[ACTIVITY_DOCUMENTS].forEach(ad => {
          if (ad[UUID] === tmpResourceUuid) {
            ad[UUID] = newResourceUuid;
          }
        });
      });
      return ActivityHelper.saveOrUpdateCollection(activities);
    });
  }

}
