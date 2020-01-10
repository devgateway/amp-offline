/* eslint-disable class-methods-use-this */
import * as path from 'path';
// import AdmZip from 'adm-zip';
import FileManager from '../util/FileManager';
import Logger from '../util/LoggerManager';
import AbstractArchiver from './AbstractArchiver';

const logger = new Logger('AdmArchive');

/**
 * Archive using 'adm-zip'
 * @author Nadejda Mandrescu
 */
export default class AdmArchive extends AbstractArchiver {
  constructor(...archivePathParts) {
    super(...archivePathParts);
    logger.log('constructor');
    this._zip = null; // new AdmZip();
    if (!this._zip) {
      throw new Error('Needs adm-zip package installed');
    }
  }

  addFile(...fileParts) {
    logger.log(`addFile: ${fileParts}`);
    // this._addFileAdm1(...fileParts);
    this._addFileAdm2(...fileParts);
  }

  _addFileAdm1(...fileParts) {
    const fullFileName = FileManager.getFullPath(...fileParts);
    const zipFolder = fileParts.length > 1 ? fileParts[fileParts.length - 2] : null;
    this._zip.addLocalFile(fullFileName, zipFolder);
  }

  _addFileAdm2(...fileParts) {
    const zipPath = path.join(...fileParts.slice(fileParts.length > 1 ? -2 : -1));
    const input = FileManager.readDataFileSync(null, ...fileParts);
    this._zip.addFile(zipPath, input, '', 0o0644);
  }

  addFolder(filter, ...folderParts) {
    logger.log(`addFolder: ${folderParts}`);
    // this._addFolderAdm1(filter, ...folderParts);
    this._addFolderAdm2(filter, ...folderParts);
  }

  _addFolderAdm1(filter, ...folderParts) {
    const fullFolderName = FileManager.getFullPath(...folderParts);
    this._zip.addLocalFolder(fullFolderName, folderParts[folderParts.length - 1], filter || undefined);
  }

  _addFolderAdm2(filter, ...folderParts) {
    const files = FileManager.readdirSync(...folderParts);
    files.forEach(file => this._addFileAdm2(...folderParts, file));
  }

  generateZip() {
    logger.log('generateZip');
    return new Promise((resolve, reject) => {
      const callbackFn = (result) => (result ? reject(result) : resolve(result));
      this._zip.writeZip(this._fullArchivePath, callbackFn);
    });
  }

}
