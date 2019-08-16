import { Constants } from 'amp-ui';
import * as DatabaseManager from '../database/DatabaseManager';
import * as Utils from '../../utils/Utils';
import Logger from '../../modules/util/LoggerManager';
import {
  CLIENT_CHANGE_ID,
  CLIENT_CHANGE_ID_PREFIX,
  INTERNAL_ID,
  VALIDATE_ON_CHANGE_ONLY
} from '../../utils/constants/EntityConstants';
import {
  CLIENT_ADDING_DATE,
  CLIENT_YEAR_OF_PUBLICATION,
  CONTENT_ID,
  CONTENT_TYPE,
  UUID
} from '../../utils/constants/ResourceConstants';

const logger = new Logger('ResourceHelper');

/**
 * A simplified helper to load/search/filter/save/delete resources metadata storage.
 *
 * @author Nadejda Mandrescu
 */
const ResourceHelper = {

  findResourceByUuid(uuid) {
    logger.debug('findResourceByUuid');
    const filterRule = { uuid };
    return ResourceHelper.findResource(filterRule);
  },

  findResourceByInternalId(internalId) {
    logger.debug('findResourceByInternalId');
    const filterRule = Utils.toMap(INTERNAL_ID, internalId);
    return ResourceHelper.findResource(filterRule);
  },

  findResource(filterRule) {
    logger.debug('findResource');
    return DatabaseManager.findOne(filterRule, Constants.COLLECTION_RESOURCES);
  },

  findResourcesByUuids(uuids) {
    logger.debug('findResourcesByUuids');
    const filterRule = { uuid: { $in: uuids } };
    return ResourceHelper.findAllResources(filterRule);
  },

  findResourcesByUuidsWithLocalContent(uuids) {
    const filter = { $and: [Utils.toMap(UUID, { $in: uuids }), Utils.toDefinedNotNullRule(CONTENT_ID)] };
    return ResourceHelper.findAllResources(filter);
  },

  /**
   * Finds all resource by uuids that were modified on the AMP Offline client
   * @param uuids
   * @return {Promise}
   */
  findAllResourcesModifiedOnClientByUuids(uuids) {
    logger.debug('findResourcesByUuids');
    const filterRule = { uuid: { $in: uuids } };
    return ResourceHelper.findAllResourcesModifiedOnClient(filterRule);
  },

  /**
   * Finds all resources modified on the AMP Offline client
   * @param filterRule optional additional filter rule
   * @return {Promise}
   */
  findAllResourcesModifiedOnClient(filterRule = {}) {
    logger.debug('findAllResourcesModifiedOnClient');
    filterRule[CLIENT_CHANGE_ID] = { $exists: true };
    return ResourceHelper.findAllResources(filterRule);
  },

  findAllResources(filterRule, projections) {
    logger.debug('findAllResources');
    return DatabaseManager.findAll(filterRule, Constants.COLLECTION_RESOURCES, projections);
  },

  countAllResourcesModifiedOnClient(filterRule = {}) {
    logger.debug('countAllResourcesModifiedOnClient');
    filterRule[CLIENT_CHANGE_ID] = { $exists: true };
    return ResourceHelper.countAllResources(filterRule);
  },

  countAllResources(filterRule = {}) {
    logger.debug('countAllResources');
    return DatabaseManager.count(filterRule, Constants.COLLECTION_RESOURCES);
  },

  stampClientChange(resource) {
    if (!resource[CLIENT_CHANGE_ID]) {
      resource[CLIENT_CHANGE_ID] = `${CLIENT_CHANGE_ID_PREFIX}-${Utils.stringToUniqueId(CLIENT_CHANGE_ID_PREFIX)}`;
    }
    if (!resource.id) {
      resource.id = resource[CLIENT_CHANGE_ID];
    }
    if (!resource.uuid) {
      resource.uuid = resource.id;
    }
    if (!resource[INTERNAL_ID]) {
      resource[INTERNAL_ID] = resource.id;
    }
    return resource;
  },

  isNewResource(resource) {
    return resource.id && `${resource.id}`.startsWith(CLIENT_CHANGE_ID_PREFIX);
  },

  /**
   * Checks if the resource is stamped as modified on client (i.e. not yet pushed to AMP)
   * @param resource
   */
  isModifiedOnClient(resource) {
    return !!resource[CLIENT_CHANGE_ID];
  },

  /**
   * Cleans up local fields. This is not currently needed for AMP.
   * @param resource
   * @return {{}} a resource copy without local fields
   */
  cleanupLocalData(resource) {
    const cleanResource = { ...resource };
    if (this.isNewResource(resource)) {
      delete cleanResource.uuid;
    }
    delete cleanResource[CLIENT_CHANGE_ID];
    delete cleanResource.id;
    delete cleanResource._id;
    delete cleanResource[INTERNAL_ID];
    delete cleanResource[CONTENT_ID];
    delete cleanResource[CONTENT_TYPE];
    delete cleanResource[CLIENT_ADDING_DATE];
    delete cleanResource[CLIENT_YEAR_OF_PUBLICATION];
    delete cleanResource[VALIDATE_ON_CHANGE_ONLY];
    return cleanResource;
  },

  /**
   * Copy local specific data from source resource to destination resource
   * @param src the source resource
   * @param dst the destination resource
   */
  copyLocalData(src, dst) {
    dst[CONTENT_ID] = src[CONTENT_ID];
    dst[CONTENT_TYPE] = src[CONTENT_TYPE];
  },

  /**
   * Save the resource
   * @param resource
   * @returns {Promise}
   */
  saveOrUpdateResource(resource) {
    logger.log('saveOrUpdateResource');
    ResourceHelper._setOrUpdateIds(resource);
    return DatabaseManager.saveOrUpdate(resource.id, resource, Constants.COLLECTION_RESOURCES);
  },

  saveOrUpdateResourceCollection(resources) {
    logger.log('saveOrUpdateResourceCollection');
    resources.forEach(resource => { ResourceHelper._setOrUpdateIds(resource); });
    return DatabaseManager.saveOrUpdateCollection(resources, Constants.COLLECTION_RESOURCES);
  },

  _setOrUpdateIds(resource) {
    resource.uuid = resource.uuid || resource[INTERNAL_ID] || Utils.stringToId(resource);
    resource.id = resource.id || resource.uuid;
    return resource;
  },

  replaceResources(resources) {
    logger.log('replaceResources');
    resources.forEach(resource => { ResourceHelper._setOrUpdateIds(resource); });
    return DatabaseManager.replaceCollection(resources, Constants.COLLECTION_RESOURCES);
  },

  /**
   * Delete the resource by id
   * @param id
   * @returns {Promise}
   */
  deleteResourceById(id) {
    logger.log('deleteResourceById');
    return DatabaseManager.removeById(id, Constants.COLLECTION_RESOURCES);
  },

  deleteResourceByInternalId(internalId) {
    logger.log('deleteResourceByInternalId');
    const filterRule = Utils.toMap(INTERNAL_ID, internalId);
    return DatabaseManager.removeAll(filterRule, Constants.COLLECTION_RESOURCES);
  },

  removeAllByIds(ids) {
    logger.log('removeAllByIds');
    const idsFilter = { id: { $in: ids } };
    return DatabaseManager.removeAll(idsFilter, Constants.COLLECTION_RESOURCES);
  }
};

export default ResourceHelper;
