import * as child from 'child_process';
import * as path from 'path';
import { app } from 'electron';
import fs from 'fs';
import LoggerManager from '../util/LoggerManager';
import * as ConnectionHelper from '../connectivity/ConnectionHelper';
import { DOWNLOAD_UPDATE_BINARY_URL } from '../connectivity/AmpApiConstants';
import { CONTENT_DISPOSITION_HEADER, UPDATES_DIR } from '../../utils/Constants';

export default class UpdateManager {

  /**
   * Download the binary installer executable.
   */
  static downloadInstaller(id) {
    LoggerManager.log('downloadInstaller');
    if (!fs.existsSync(UPDATES_DIR)) {
      fs.mkdirSync(UPDATES_DIR);
    }
    const fileName = `./${UPDATES_DIR}/amp-offline-installer.tmp`;
    if (fs.existsSync(fileName)) {
      fs.unlinkSync(fileName);
    }
    const writeStream = fs.createWriteStream(fileName);
    return ConnectionHelper.doGet({
      url: DOWNLOAD_UPDATE_BINARY_URL,
      shouldRetry: true,
      extraUrlParam: id,
      writeStream
    }).then((response) => {
      LoggerManager.log('Save file to disk.');
      const actualFileName = UpdateManager.getActualFileName(response);
      if (actualFileName) {
        fs.renameSync(fileName, actualFileName);
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
      return `./${UPDATES_DIR}/${actualFileName.substring(1, actualFileName.length - 1)}`;
    }
  }

  /**
   * This code is based on NsisUpdater.js from electron-updater module and adapted to our needs.
   * It will try and execute the installer as an external process and then quit the app.
   * @returns {boolean}
   */
  static runInstaller(installPath) {
    LoggerManager.log('runInstaller');
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
    if (!fs.existsSync(installPath)) {
      LoggerManager.error(`Cant find file ${installPath}, update will stop.`);
      return false;
    }
    try {
      (0, (child).spawn)(installPath, args, spawnOptions).unref();
      app.quit();
    } catch (e) {
      // yes, such errors dispatched not as error event
      // https://github.com/electron-userland/electron-builder/issues/1129
      if (e.code === 'UNKNOWN') {
        LoggerManager.error('UNKNOWN error code on spawn, will be executed again using elevate');
        try {
          (0, (child).spawn)(path.join(process.resourcesPath, 'elevate.exe'), [installPath].concat(args), spawnOptions)
            .unref();
          app.quit();
        } catch (e2) {
          LoggerManager.error(e2);
        }
      } else {
        LoggerManager.error(e);
      }
    }
    return true;
  }
}
