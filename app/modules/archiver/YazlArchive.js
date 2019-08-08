/* eslint-disable class-methods-use-this */
import * as path from 'path';
import * as yazl from 'yazl';
import FileManager from '../util/FileManager';
import Logger from '../util/LoggerManager';
import AbstractArchiver from './AbstractArchiver';

const logger = new Logger('YazlArchive');

/**
 * Archive using Yazl
 * @author Nadejda Mandrescu
 */
export default class YazlArchive extends AbstractArchiver {
  constructor(...archivePathParts) {
    super(...archivePathParts);
    logger.log('constructor');
    this._initYazl();
  }

  _initYazl() {
    this._zip = new yazl.ZipFile();
    FileManager.createDataDir(...this._archivePathParts.slice(0, -1));
    this._writeStream = this._zip.outputStream.pipe(FileManager.createWriteStream(...this._archivePathParts));
  }

  addFile(...fileParts) {
    logger.log(`addFile: ${fileParts}`);
    const fullFileName = FileManager.getFullPath(...fileParts);
    const zipPath = path.join(...fileParts.slice(fileParts.length > 1 ? -2 : -1));
    this._zip.addFile(fullFileName, zipPath);
  }

  /**
   * @param filter {RegExp|Function}
   * @param folderParts
   */
  addFolder(filter, ...folderParts) {
    logger.log(`addFolder: ${folderParts}`);
    const files = FileManager.readdirSync(...folderParts);
    files.forEach(file => this.addFile(...folderParts, file));
  }

  generateZip() {
    logger.log('generateZip');
    return new Promise((resolve, reject) => {
      const callbackFn = this._archiveEnded.bind(this, resolve, reject);
      try {
        this._writeStream.on('close', callbackFn);
        this._zip.on('error', callbackFn);
        this._zip.end();
      } catch (error) {
        callbackFn(error);
      }
    });
  }

  _archiveEnded(resolve, reject, error) {
    if (error) {
      logger.error('_archiveEnded with failure');
      return reject(error);
    } else {
      logger.log('_archiveEnded successfully');
      return resolve();
    }
  }

}
