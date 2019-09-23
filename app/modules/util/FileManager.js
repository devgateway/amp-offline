import { Constants, UIUtils } from 'amp-ui';
import fs from 'fs-extra';
import os from 'os';
import * as path from 'path';
import mimeTypes from 'mime-types';
import readChunk from 'read-chunk';
import rimraf from 'rimraf';
import { ELECTRON_APP } from './ElectronApp';

const fileType = require('file-type');

const app = ELECTRON_APP;

let dataPath;
let resourcesPath;
let downloadPath;
let testPath;

/**
 * System File Manager that is intended to handle proper root directory detection in dev & prod mode. It servers as a
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
    if (!dataPath) {
      if (process.env.NODE_ENV === 'production') {
        dataPath = app.getPath('userData');
      } else {
        dataPath = path.resolve('.');
      }
    }
    return dataPath;
  },

  /**
   * Provides the root path of the prebuilt resources root directory like master language file, static resources
   * @return {string}
   */
  getResourcesPath() {
    if (!resourcesPath) {
      if (process.env.NODE_ENV === 'production') {
        resourcesPath = path.join(process.resourcesPath, Constants.ASAR_DIR);
      } else {
        resourcesPath = path.resolve(Constants.APP_DIRECTORY);
      }
    }
    return resourcesPath;
  },

  /**
   * Provides the user default download directory
   * @return {*}
   */
  getDownloadPath() {
    if (!downloadPath) {
      downloadPath = app.getPath('downloads');
    }
    return downloadPath;
  },

  getTestsPath(...pathParts) {
    if (!testPath) {
      testPath = path.resolve(Constants.TEST_DIRECTORY);
    }
    return this.joinPath(testPath, ...pathParts);
  },

  /**
   * Builds the full path including root and one or more path parts
   * @param pathParts
   * @return {string}
   */
  getFullPath(...pathParts) {
    return this.joinPath(this.getDataPath(), ...pathParts);
  },

  joinPath(...pathParts) {
    return path.join(...pathParts);
  },

  splitPath(somePath) {
    return somePath.split(path.sep);
  },

  basename(fromPath) {
    return path.basename(fromPath);
  },

  extname(fromPath) {
    return path.extname(fromPath);
  },

  /**
   * Builds the full path for built-in resources
   * @param pathParts
   */
  getFullPathForBuiltInResources(...pathParts) {
    return path.join(this.getResourcesPath(), ...pathParts);
  },

  /**
   * Creates a data directory synchronously if it doesn't exist
   * @param pathParts
   */
  createDataDir(...pathParts) {
    const fullPath = this.getFullPath(...pathParts);
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
    this.deleteFileSync(fullPath);
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
    this.deleteFileSync(fullPath);
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
   * Creates a read stream
   * @param pathParts
   * @return {*}
   */
  createReadStream(...pathParts) {
    const fullPath = this.getFullPath(...pathParts);
    return fs.createReadStream(fullPath);
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
   * Reads any file from given path synchronously and with the given options
   * @param options
   * @param _path
   * @returns {Buffer | string | * | void}
   */
  readFileInPathSync(options, _path) {
    return fs.readFileSync(_path, options);
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
   * Copies asynchronously a file from a full path to the relative path (specified as parts if needed)
   * @param fromPath full source path
   * @param toPathParts relative path parts of the destination
   * @return {Promise}
   */
  copyDataFileAsync(fromPath, ...toPathParts) {
    const toPath = this.getFullPath(...toPathParts);
    return new Promise((resolve, reject) => fs.copy(fromPath, toPath, err => {
      if (err) reject(err);
      resolve();
    }));
  },

  /**
   * Copies synchronously a file from a full path to another full path
   * @param fromPath full source path
   * @param toPath full destination path
   */
  copyDataFileSyncUsingFullPaths(fromPath, toPath) {
    fs.copySync(fromPath, toPath);
  },

  /**
   * Renames synchronously
   * @param fromPath full source path
   * @param toPathParts relative paths parts of the destination
   */
  renameSync(fromPath, ...toPathParts) {
    const fullPath = this.getFullPath(...toPathParts);
    return this.renameSyncAllFullPaths(fromPath, fullPath);
  },

  /**
   * Renames synchronously
   * @param fromPath full source path
   * @param toPath full destination path
   */
  renameSyncAllFullPaths(fromPath, toPath) {
    fs.renameSync(fromPath, toPath);
  },

  /**
   * Deletes specified path synchronously
   * @param fullPath
   */
  deleteFileSync(fullPath) {
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    }
  },

  rmdirSync(...pathParts) {
    const fullPath = this.getFullPath(...pathParts);
    fs.rmdirSync(fullPath);
  },

  rmNotEmptyDirSync(...pathParts) {
    const fullPath = this.getFullPath(...pathParts);
    rimraf.sync(fullPath);
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
   * Provides statistics synchronously for a full path
   * @param fullPath
   * @return {*}
   */
  statSyncFullPath(fullPath) {
    if (fs.existsSync(fullPath)) {
      return fs.statSync(fullPath);
    }
  },

  /**
   * Detects actual mime type based on binary file, with fallback to file extension and lastly to octet-stream
   * @param fullPath
   * @return {string}
   */
  mimeType(fullPath) {
    const buffer = readChunk.sync(fullPath, 0, 4100);
    const fType = fileType(buffer);
    return (fType && fType.mime) || mimeTypes.lookup(path.extname(fullPath)) || 'application/octet-stream';
  },

  /**
   * Detects content type including actual mime based on binary file if possible
   * @param fullPath
   * @return {string}
   */
  contentType(fullPath) {
    const mime = this.mimeType(fullPath);
    const charset = mimeTypes.charset(mime) || 'utf8';
    return `${mime}; charset=${charset}`;
  },

  /**
   * Lists files from the folder synchronously
   * @param pathParts
   * @return {*}
   */
  readdirSync(...pathParts) {
    return this.readdirSyncFullPath(this.getFullPath(...pathParts));
  },

  /**
   * Lists files from the folder synchronously
   * @param fullPath folder path
   * @return {string[]}
   */
  readdirSyncFullPath(fullPath) {
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
  },

  /**
   * Copy a file to the OS's temporal directory and return the full path. The new file will have a random name.
   * @param file
   * @param fullPath
   * @return {string}
   */
  copyDataFileToTmpSync(file, fullPath) {
    const from = path.join(fullPath, file);
    const to = path.join(os.tmpdir(), `${UIUtils.numberRandom()}-${file}`);
    fs.writeFileSync(to, fs.readFileSync(from));
    return to;
  },

  /**
   * Returns the full absolute path.
   * ie: C:\Users\user1\App Data\Local\AmpOffline
   * @param pathParts
   * @returns {*|string}
   */
  getAbsolutePath(...pathParts) {
    if (process.env.NODE_ENV === 'production') {
      return this.getFullPath(...pathParts);
    } else {
      // Notice the '..' because __dirname points to /app subdir.
      return this.joinPath(global.__dirname, '..', ...pathParts);
    }
  }
};

export default FileManager;
