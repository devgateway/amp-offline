import * as child from 'child_process';
import * as path from 'path';
import { app } from 'electron';
import Logger from '../util/LoggerManager';
import * as ConnectionHelper from '../connectivity/ConnectionHelper';
import { DOWNLOAD_UPDATE_BINARY_URL } from '../connectivity/AmpApiConstants';
import { CONTENT_DISPOSITION_HEADER, UPDATES_DIR, UPDATE_TMP_FILE } from '../../utils/Constants';
import FileManager from '../util/FileManager';

const logger = new Logger('Update manager');

export default class UpdateManager {

  /**
   * Download the binary installer executable.
   */
  static downloadInstaller(id) {
    logger.log('downloadInstaller');
    const installerTmpFile = FileManager.getFullPath(UPDATES_DIR, UPDATE_TMP_FILE);
    FileManager.createDataDir(UPDATES_DIR);
    FileManager.deleteFile(installerTmpFile);
    const writeStream = FileManager.createWriteStream(UPDATES_DIR, UPDATE_TMP_FILE);
    return ConnectionHelper.doGet({
      url: DOWNLOAD_UPDATE_BINARY_URL,
      shouldRetry: true,
      extraUrlParam: id,
      writeStream
    }).then((response) => {
      logger.log('Save file to disk.');
      const actualFileName = UpdateManager.getActualFileName(response);
      if (actualFileName) {
        FileManager.renameSync(installerTmpFile, UPDATES_DIR, actualFileName);
      }
      return actualFileName;
    });
  }

  static getActualFileName(response) {
    const { statusCode, rawHeaders } = response;
    if (statusCode === 200) {
      const contentDispositionIndex = rawHeaders.findIndex(header => header === CONTENT_DISPOSITION_HEADER);
      const fileHeader = rawHeaders[contentDispositionIndex + 1].split(';').filter(e => e.includes('filename'))[0];
      const actualFileName = fileHeader.split('=')[1];
      return actualFileName.substring(1, actualFileName.length - 1);
    }
  }

  /**
   * This code is based on NsisUpdater.js from electron-updater module and adapted to our needs.
   * It will try and execute the installer as an external process and then quit the app.
   * @returns {boolean}
   */
  static runInstaller(installPath) {
    logger.log('runInstaller');
    const isSilent = true;
    if (this.quitAndInstallCalled) {
      return false;
    }
    this.quitAndInstallCalled = true;
    const args = ['--updated'];
    if (isSilent) {
      args.push('/S');
    }
    const spawnOptions = {
      detached: true,
      stdio: 'ignore'
    };
    if (!FileManager.existsSync(UPDATES_DIR, installPath)) {
      const fullFilePath = FileManager.getFullPath(UPDATES_DIR, installPath);
      logger.error(`Cant find file ${fullFilePath}, update will stop.`);
      return false;
    }
    installPath = FileManager.getFullPath(UPDATES_DIR, installPath);
    try {
      (0, (child).spawn)(installPath, args, spawnOptions).unref();
      app.quit();
    } catch (e) {
      // yes, such errors dispatched not as error event
      // https://github.com/electron-userland/electron-builder/issues/1129
      if (e.code === 'UNKNOWN') {
        logger.error('UNKNOWN error code on spawn, will be executed again using elevate');
        try {
          (0, (child).spawn)(path.join(process.resourcesPath, 'elevate.exe'), [installPath].concat(args), spawnOptions)
            .unref();
          app.quit();
        } catch (e2) {
          logger.error(e2);
        }
      } else {
        logger.error(e);
      }
    }
    return true;
  }
}
