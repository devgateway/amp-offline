import fs from 'fs-extra';
import os from 'os';
import path from 'path';
import { ELECTRON_APP } from './ElectronApp';
import { APP_DIRECTORY, ASAR_DIR } from '../../utils/Constants';
import Utils from '../../utils/Utils';

const app = ELECTRON_APP;

let dataPath;
let resourcesPath;

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
        dataPath = '.';
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
        resourcesPath = path.join(process.resourcesPath, ASAR_DIR);
      } else {
        resourcesPath = APP_DIRECTORY;
      }
    }
    return resourcesPath;
  },

  /**
   * Builds the full path including root and one or more path parts
   * @param pathParts
   * @return {string}
   */
  getFullPath(...pathParts) {
    return path.join(this.getDataPath(), pathParts.join('/'));
  },

  joinPath(...pathParts) {
    return path.join(pathParts);
  },

  basename(fromPath) {
    return path.basename(fromPath);
  },

  /**
   * Builds the full path for built-in resources
   * @param pathParts
   */
  getFullPathForBuiltInResources(...pathParts) {
    return path.join(this.getResourcesPath(), pathParts.join('/'));
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
    return this.readdirSyncFullPath(this.getFullPath(...pathParts));
  },

  /**
   * Lists files from the folder synchronously
   * @param full folder path
   * @return {*}
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
    const to = path.join(os.tmpdir(), `${Utils.numberRandom()}-${file}`);
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
      return this.getFullPath(global.__dirname, '..', ...pathParts);
    }
  }
};

export default FileManager;
