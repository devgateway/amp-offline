import fs from 'fs-extra';
import { ELECTRON_APP } from './ElectronApp';

const app = ELECTRON_APP;

let rootPath;

/**
 * System File Manager that is intented to handle proper root directory detection in dev & prod mode. It servers as a
 * wrapper over 'fs' package. Use it only with relative paths against an app data folder.
 *
 * @author Nadejda Mandrescu
 */
const FileManager = {
  /**
   * Provides the root path of the data directory where logs, lang, DB and other files are stored
   * @return {string}
   */
  getDataPath() {
    // development
    if (!rootPath) {
      if (process.env.NODE_ENV === 'production') {
        rootPath = app.getPath('userData');
      } else {
        rootPath = '.';
      }
    }
    return rootPath;
  },

  /**
   * Builds the full path including root and one or more path parts
   * @param pathParts
   * @return {string}
   */
  getFullPath(...pathParts) {
    return `${this.getDataPath()}/${pathParts.join('/')}`;
  },

  /**
   * Creates a data directory synchronously if it doesn't exist
   * @param dirName
   */
  createDataDir(dirName) {
    const fullPath = this.getFullPath(dirName);
    fs.ensureDirSync(fullPath);
    return fullPath;
  },

  /**
   * Write some data to the file specified through relative path parts in asynchronous mode.
   * @param data
   * @param pathParts
   * @return {Promise}
   */
  writeDataFile(data, ...pathParts) {
    const fullPath = this.getFullPath(...pathParts);
    this.deleteFile(fullPath);
    return new Promise((resolve, reject) => fs.writeFile(fullPath, data, (err) => {
      if (err) {
        return reject(err);
      }
      return resolve();
    }));
  },

  /**
   * Writes synchronously some data to the file specified through relative path parts.
   * @param data
   * @param pathParts
   */
  writeDataFileSync(data, ...pathParts) {
    const fullPath = this.getFullPath(...pathParts);
    this.deleteFile(fullPath);
    fs.writeFileSync(fullPath, data);
  },

  /**
   * Creates a write stream
   * @param pathParts
   * @return {*}
   */
  createWriteStream(...pathParts) {
    const fullPath = this.getFullPath(...pathParts);
    return fs.createWriteStream(fullPath);
  },

  /**
   * Reads a text file synchronously
   * @param pathParts
   * @return {*}
   */
  readTextDataFileSync(...pathParts) {
    return this.readDataFileSync({ encoding: 'utf-8' }, ...pathParts);
  },

  /**
   * Reads a binary file synchronously
   * @param pathParts
   * @return {*}
   */
  readBinaryDataFileSync(...pathParts) {
    return this.readDataFileSync(null, ...pathParts);
  },

  /**
   * Reads any file synchronously and with the given options
   * @param options
   * @param pathParts
   * @return {*}
   */
  readDataFileSync(options, ...pathParts) {
    const fullPath = this.getFullPath(...pathParts);
    return fs.readFileSync(fullPath, options);
  },

  /**
   * Copies synchronously a file from a full path to the relative path (specified as parts if needed)
   * @param fromPath full source path
   * @param toPathParts relative path parts of the destination
   */
  copyDataFileSync(fromPath, ...toPathParts) {
    const fullPath = this.getFullPath(...toPathParts);
    fs.copySync(fromPath, fullPath);
  },

  /**
   * Renames synchronously
   * @param fromPath full source path
   * @param toPathParts relative paths parts of the destination
   */
  renameSync(fromPath, ...toPathParts) {
    const fullPath = this.getFullPath(...toPathParts);
    fs.renameSync(fromPath, fullPath);
  },

  /**
   * Deletes specified path synchronously
   * @param fullPath
   */
  deleteFile(fullPath) {
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    }
  },

  /**
   * Provides statistics synchronously
   * @param pathParts
   * @return {*}
   */
  statSync(...pathParts) {
    const fullPath = this.getFullPath(...pathParts);
    if (fs.existsSync(fullPath)) {
      return fs.statSync(fullPath);
    }
  },

  /**
   * Lists files from the folder synchronously
   * @param pathParts
   * @return {*}
   */
  readdirSync(...pathParts) {
    const fullPath = this.getFullPath(...pathParts);
    return fs.readdirSync(fullPath);
  },

  /**
   * Checks synchronously if the specified path exists
   * @param pathParts
   * @return {*}
   */
  existsSync(...pathParts) {
    const fullPath = this.getFullPath(...pathParts);
    return fs.existsSync(fullPath);
  }
};

export default FileManager;
