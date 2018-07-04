import FileManager from '../util/FileManager';
import { PATH, REPOSITORY_DIR } from '../../utils/constants/ResourceConstants';
import * as Utils from '../../utils/Utils';
import Logger from '../util/LoggerManager';

const logger = new Logger('RepositoryManager');

/**
 * Repository Manager
 *
 * @author Nadejda Mandrescu
 */
const RepositoryManager = {
  _initialized: false,

  /**
   * Initialization routine
   * @param silent if true, then will only log initialization error and stop the error propagation
   */
  init(silent) {
    logger.debug('init if needed');
    if (this._initialized) {
      return;
    }
    logger.log('Initializing the repository...');
    try {
      FileManager.createDataDir(REPOSITORY_DIR);
      this._initialized = true;
      logger.log('Repository initialized');
    } catch (error) {
      logger.error(`Could not initialize the repository. Error: ${error}`);
      if (!silent) {
        throw error;
      }
    }
  },

  /**
   * Stores a local file to the repository directory
   * @param srcFilePath
   * @return the content metadata
   */
  storeLocalFileToRepository(srcFilePath) {
    this.init(false);
    const content = this._buildContent(srcFilePath);
    FileManager.copyDataFileSync(srcFilePath, REPOSITORY_DIR, content[PATH]);
    return content;
  },

  _buildContent(srcFilePath) {
    const fileNameHashBase16 = Utils.stringToId(srcFilePath).toString(16);
    const level1Dir = fileNameHashBase16.substring(0, 2);
    const level2Dir = fileNameHashBase16.substring(2, 4);
    const id = Utils.stringToUniqueId(srcFilePath);
    return {
      id,
      [PATH]: FileManager.joinPath(level1Dir, level2Dir, id),
    };
  },

  /**
   * Copies a file from repository to the destination path
   * @param dstFilePath the full file destination path
   * @param content the file content metadata information
   */
  copyToDestination(dstFilePath, content) {
    const srcFilePath = this.getFullContentFilePath(content);
    // if we ever decide to archive files, then we will unarchive first before the copy
    FileManager.copyDataFileSyncUsingFullPaths(srcFilePath, dstFilePath);
  },

  /**
   * Get full path to the content from repository
   * @param content
   * @return {*|string}
   */
  getFullContentFilePath(content) {
    return FileManager.getFullPath(REPOSITORY_DIR, this._getContentPath(content));
  },

  /**
   * Create a read stream for a content stored in the repository
   * @param content
   * @return {*}
   */
  createContentReadStream(content) {
    return FileManager.createReadStream(REPOSITORY_DIR, this._getContentPath(content));
  },

  /**
   * Deletes a file from the repository
   * @param content the file metadata
   */
  deleteFromRepository(content) {
    const fullFilePath = FileManager.getFullPath(REPOSITORY_DIR, this._getContentPath(content));
    FileManager.deleteFile(fullFilePath);
  },

  /**
   * Provides content path. Having a dedicated method can allow us to calculate the path differently later if needed.
   * @param content
   * @return {String}
   * @private
   */
  _getContentPath(content: Object) {
    return content[PATH];
  },

};

export default RepositoryManager;
