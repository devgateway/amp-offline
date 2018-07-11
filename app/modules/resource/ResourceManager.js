import RepositoryManager from '../repository/RepositoryManager';
import FileManager from '../util/FileManager';
import { CONTENT_ID, FILE_NAME, ORPHAN } from '../../utils/constants/ResourceConstants';
import RepositoryHelper from '../helpers/RepositoryHelper';
import ResourceHelper from '../helpers/ResourceHelper';
import * as Utils from '../../utils/Utils';
import Logger from '../util/LoggerManager';

const logger = new Logger('ResourceManager');

/**
 * Resource Manager
 *
 * @author Nadejda Mandrescu
 */
const ResourceManager = {
  /**
   * A wrapper to save the resource with a file attached (if any)
   * @param resource metadata
   * @param srcFilePath (optional)
   */
  saveOrUpdateResource(resource, srcFilePath = null) {
    logger.log('saveOrUpdateResource');
    if (srcFilePath) {
      RepositoryManager.init(false);
      const content = RepositoryManager.storeLocalFileToRepository(srcFilePath);
      resource[FILE_NAME] = FileManager.basename(srcFilePath);
      resource[CONTENT_ID] = content.id;
      return RepositoryHelper.saveOrUpdateContent(content)
        .then(() => ResourceHelper.saveOrUpdateResource(resource));
    }
    return ResourceHelper.saveOrUpdateResource(resource);
  },

  /**
   * Retrieves { resource, content } information
   * @param uuid resource uuid
   * @return {{ resource, content }}
   */
  findResourceByUuidWithContent(uuid) {
    return ResourceHelper.findResourceByUuid(uuid)
      .then(resource => {
        if (resource && resource[CONTENT_ID]) {
          return RepositoryHelper.findContentById(resource[CONTENT_ID]).then(content => ({ resource, content }));
        }
        return { resource };
      });
  },

  /**
   * Retrieves [{ resource, content }] information
   * @param uuids resources uuids
   * @return {[{ resource, content }]}
   */
  findResourcesByUuidsWithContent(uuids) {
    return ResourceHelper.findResourcesByUuids(uuids)
      .then(resources => {
        const cIds = resources.map(r => r[CONTENT_ID]).filter(id => id);
        return RepositoryHelper.findContentsByIds(cIds).then(Utils.toMapByKey).then(cMap =>
          resources.map(resource => {
            const cId = resource && resource[CONTENT_ID];
            const content = cId && cMap.get(cId);
            return { resource, content };
          }));
      });
  },

  /**
   * Delete resource together with content
   * @param uuid
   * @return {*}
   */
  deleteResourceWithContent(uuid) {
    logger.log('deleteResourceWithContent');
    return ResourceHelper.findResourceByUuid(uuid).then(r => {
      const contentId = r[CONTENT_ID];
      if (contentId) {
        return RepositoryHelper.findContentById(contentId).then(ResourceManager.deleteContent);
      }
      return contentId;
    }).then(() => ResourceHelper.deleteResourceById(uuid));
  },

  /**
   * Delete all resources identified with uuid from the input list and its related content if any exists
   * @param uuids
   * @return {Promise}
   */
  deleteAllResourcesWithContent(uuids) {
    logger.log('deleteAllResourcesWithContent');
    return ResourceHelper.findAllResources({ uuid: { $in: uuids } }, Utils.toMap(CONTENT_ID, 1))
      .then(resources => Utils.flattenToListByKey(resources, CONTENT_ID))
      .then(RepositoryHelper.findContentsByIds)
      .then(contents => Promise.all(contents.map(ResourceManager.deleteContent)))
      .then(() => ResourceHelper.removeAllByIds(uuids));
  },

  /**
   * Delete content and its related physical file
   * @param content
   * @return {Promise}
   */
  deleteContent(content) {
    logger.log(`deleteContent id=${content && content.id}`);
    if (content) {
      try {
        RepositoryManager.deleteFromRepository(content);
        return RepositoryHelper.deleteContentById(content.id);
      } catch (error) {
        logger.error(`Could not delete content id = ${content.id}, error: ${error}`);
        content[ORPHAN] = true;
        return RepositoryHelper.saveOrUpdateContent(content);
      }
    }
    return Promise.resolve();
  },

};

export default ResourceManager;
