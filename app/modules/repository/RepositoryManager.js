import { UIUtils } from 'amp-ui';
import FileManager from '../util/FileManager';
import { PATH, REPOSITORY_DIR } from '../../utils/constants/ResourceConstants';
import Logger from '../util/LoggerManager';

const logger = new Logger('RepositoryManager');

const DO_NOT_DELETE = ['.gitignore'];

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
   * Deletes files and directories that are not found under the specified tree of used content paths
   * @param usedPathsTree use tree of content paths
   */
  cleanupUnusedContent(usedPathsTree) {
    this._didCleanUp(usedPathsTree);
  },

  _didCleanUp(usedTree, ...pathParts) {
    const currentPath = (pathParts && pathParts.length && pathParts[pathParts.length - 1]) || null;
    let canDelete = currentPath && (!usedTree || !usedTree.has(currentPath)) && !DO_NOT_DELETE.includes(currentPath);
    try {
      const fullPath = FileManager.getFullPath(REPOSITORY_DIR, ...pathParts);
      const stat = FileManager.statSyncFullPath(fullPath);
      if (!stat) {
        logger.warn(`Path not found: ${fullPath}`);
      } if (stat.isFile()) {
        // FILE
        if (canDelete) {
          FileManager.deleteFileSync(fullPath);
        }
      } else {
        // DIR
        const filesOrDirs = FileManager.readdirSync(REPOSITORY_DIR, ...pathParts);
        let isEmpty = !filesOrDirs.length;
        if (filesOrDirs.length) {
          const subTree = currentPath ? ((usedTree && usedTree.get(currentPath)) || null) : usedTree;
          isEmpty = !filesOrDirs.filter(fileOrDir => !this._didCleanUp(subTree, ...pathParts, fileOrDir)).length;
        }
        if (canDelete && isEmpty) {
          FileManager.rmdirSync(REPOSITORY_DIR, ...pathParts);
        }
      }
    } catch (error) {
      logger.error(error);
      canDelete = false;
    }
    return canDelete;
  },

  /**
   * Stores a local file to the repository directory
   * @param srcFilePath
   * @param sync if to copy the file synchronously or provide a promise
   * @return the content metadata
   */
  storeLocalFileToRepository(srcFilePath, sync) {
    this.init(false);
    const content = this._buildContent(srcFilePath);
    if (sync) {
      FileManager.copyDataFileSync(srcFilePath, REPOSITORY_DIR, content[PATH]);
      return content;
    }
    return FileManager.copyDataFileAsync(srcFilePath, REPOSITORY_DIR, content[PATH]).then(() => content);
  },

  _buildContent(srcFilePath) {
    const fileNameHashBase16 = UIUtils.stringToId(srcFilePath).toString(16);
    const level1Dir = fileNameHashBase16.substring(0, 2);
    const level2Dir = fileNameHashBase16.substring(2, 4);
    const id = UIUtils.stringToUniqueId(srcFilePath);
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
    return content && FileManager.getFullPath(REPOSITORY_DIR, this._getContentPath(content));
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
   * Attempts to delete safely a content from repository files
   * @param content
   */
  attemptToDeleteContent(content) {
    logger.info('attemptToDeleteContent');
    try {
      RepositoryManager.deleteFromRepository(content);
    } catch (error) {
      const tmpPath = RepositoryManager.getFullContentFilePath(content);
      logger.error(`Could not properly cleanup temporary content or its folders (${tmpPath}): "${error}". 
          A new atempt will be done later by the cleanup task.`);
    }
  },

  /**
   * Deletes a file from the repository
   * @param content the file metadata
   */
  deleteFromRepository(content) {
    const relativePath = this._getContentPath(content);
    if (!relativePath) {
      return;
    }
    const fullFilePath = FileManager.getFullPath(REPOSITORY_DIR, relativePath);
    FileManager.deleteFileSync(fullFilePath);

    let dirsToCheck = FileManager.splitPath(relativePath).filter(p => p);
    while (dirsToCheck && dirsToCheck.length > 1) {
      dirsToCheck.pop();
      if (FileManager.readdirSync(REPOSITORY_DIR, ...dirsToCheck).length) {
        dirsToCheck = null;
      } else {
        FileManager.rmdirSync(REPOSITORY_DIR, ...dirsToCheck);
      }
    }
  },

  /**
   * Provides content path. Having a dedicated method can allow us to calculate the path differently later if needed.
   * @param content
   * @return {String}
   * @private
   */
  _getContentPath(content: Object) {
    return content && content[PATH];
  },

};

export default RepositoryManager;
