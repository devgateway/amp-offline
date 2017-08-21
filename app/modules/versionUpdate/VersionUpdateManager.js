import * as child from 'child_process';
import * as path from 'path';
import { app } from 'electron';
import fs from 'fs';
import LoggerManager from '../util/LoggerManager';
import ConnectionHelper from '../connectivity/ConnectionHelper';
import { DOWNLOAD_UPDATE_BINARY_URL } from '../connectivity/AmpApiConstants';
import { UPDATES_DIR } from '../../utils/Constants';

export default class VersionUpdateManager {

  /**
   * Download the binary installer executable.
   */
  static downloadInstaller(id) {
    LoggerManager.log('downloadInstaller');
    return new Promise((resolve, reject) => (
      ConnectionHelper.doGet({
        url: DOWNLOAD_UPDATE_BINARY_URL,
        shouldRetry: true,
        extraUrlParam: id
      }).then((data) => {
        LoggerManager.log('Save file to disk.');
        if (!fs.existsSync(UPDATES_DIR)) {
          fs.mkdirSync(UPDATES_DIR);
        }
        const fileName = `./${UPDATES_DIR}/amp-offline.exe`;
        if (fs.existsSync(fileName)) {
          fs.unlinkSync(fileName);
        }
        fs.writeFileSync(fileName, data);
        return resolve(fileName);
      }).catch(reject)
    ));
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
    // TODO: chequear q el archivo exista.
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
