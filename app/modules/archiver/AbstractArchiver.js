import FileManager from '../util/FileManager';
import Logger from '../util/LoggerManager';

const logger = new Logger('AbstractArchiver');

/**
 * Common archive base.
 * Each implementation should handle data/resources paths with FileManager.
 *
 * @author Nadejda Mandrescu
 */
export default class AbstractArchiver {
  /**
   * @param archivePathParts the archive path under data folder
   */
  constructor(...archivePathParts) {
    logger.log('constructor');
    this._archivePathParts = archivePathParts;
    if (archivePathParts && archivePathParts.length) {
      this._fullArchivePath = FileManager.getFullPath(...archivePathParts);
    }
    if (this.addFile === undefined || this.addFolder === undefined || this.generateZip === undefined) {
      throw new Error('Undefined methods');
    }
  }

  get fullArchivePath() {
    return this._fullArchivePath;
  }

}
