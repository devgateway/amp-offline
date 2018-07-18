import RepositoryManager from '../repository/RepositoryManager';
import FileManager from '../util/FileManager';
import {
  CONTENT_ID,
  CONTENT_TYPE,
  FILE_NAME,
  FILE_SIZE,
  ORPHAN,
  PATH,
} from '../../utils/constants/ResourceConstants';
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
      const content = RepositoryManager.storeLocalFileToRepository(srcFilePath, true);
      resource[FILE_NAME] = FileManager.basename(srcFilePath);
      resource[CONTENT_ID] = content.id;
      return RepositoryHelper.saveOrUpdateContent(content)
        .then(() => ResourceHelper.saveOrUpdateResource(resource));
    }
    return ResourceHelper.saveOrUpdateResource(resource);
  },

  /**
   * Uploads async a file to a hydrated resource, by storing the content hydrated as well. No DB calls are done.
   * @param resource the hydrated resource
   * @param srcFilePath the file to store
   * @return {Promise}
   */
  uploadFileToHydratedResource(resource, srcFilePath) {
    logger.info('uploadFileToHydratedResource');
    if (resource && srcFilePath) {
      RepositoryManager.init(false);
      // it is not possible to change a saved resource, hence this is a temporary content that will be replaced
      const tmpContent = resource[CONTENT_ID];
      if (tmpContent) {
        this._attemptToDeleteContent(tmpContent);
      }
      [CONTENT_ID, FILE_NAME, FILE_SIZE, CONTENT_TYPE].forEach(field => (resource[field] = null));
      return RepositoryManager.storeLocalFileToRepository(srcFilePath, false)
        .then(content => {
          const size = FileManager.statSyncFullPath(srcFilePath).size;
          resource[FILE_NAME] = FileManager.basename(srcFilePath);
          resource[CONTENT_ID] = content;
          resource[CONTENT_TYPE] = FileManager.contentType(srcFilePath);
          resource[FILE_SIZE] = Utils.simplifyDataSize(size, 'MB').value;
          return content;
        });
    }
    return Promise.resolve();
  },

  _attemptToDeleteContent(content) {
    logger.info('_attemptToDeleteContent');
    try {
      RepositoryManager.deleteFromRepository(content);
    } catch (error) {
      const tmpPath = RepositoryManager.getFullContentFilePath(content);
      logger.error(`Could not properly cleanup temporary content or its folders (${tmpPath}): "${error}". 
          A new atempt will be done later by the cleanup task.`);
    }
  },

  /**
   * 1. Deletes content that is not referenced in resources
   * 2. Deletes files and folders that are not referenced in used content
   * @return {Promise}
   */
  cleanupUnreferencedContent() {
    logger.info('cleanupUnreferencedContent');
    return Promise.all([
      ResourceHelper.findAllResources(Utils.toMap(CONTENT_ID, { $exists: true }), Utils.toMap(CONTENT_ID, 1)),
      RepositoryHelper.findAllContents()
    ]).then(([resources, contents]) => {
      const usedCIds = new Set(Utils.flattenToListByKey(resources, CONTENT_ID));
      const usedTree = new Map();
      const contentsToDelete = [];
      contents.forEach(c => {
        if (usedCIds.has(c.id)) {
          ResourceManager._addUsedPathsTree(usedTree, c[PATH]);
        } else {
          contentsToDelete.push(c);
        }
      });
      return Promise.all(contentsToDelete.map(c => ResourceManager.deleteContent(c)))
        .then(() => RepositoryManager.cleanupUnusedContent(usedTree));
    });
  },

  _addUsedPathsTree(usedTree, cPath) {
    const pathParts = FileManager.splitPath(cPath).filter(p => p);
    let subTree = usedTree;
    pathParts.forEach(p => {
      if (!subTree.has(p)) {
        subTree.set(p, new Map());
      }
      subTree = subTree.get(p);
    });
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
            resource[CONTENT_ID] = cId && cMap.get(cId);
            return resource;
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
