/**
 * Resource Manager
 *
 * @author Nadejda Mandrescu
 */
import RepositoryManager from '../repository/RepositoryManager';
import FileManager from '../util/FileManager';
import { CONTENT_ID, FILE_NAME } from '../../utils/constants/ResourceConstants';
import RepositoryHelper from '../helpers/RepositoryHelper';
import ResourceHelper from '../helpers/ResourceHelper';

const ResourceManager = {
  /**
   * A wrapper to save the resource with a file attached (if any)
   * @param resource metadata
   * @param srcFilePath (optional)
   */
  saveOrUpdateResource(resource, srcFilePath = null) {
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

};

export default ResourceManager;
