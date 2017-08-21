import * as child from 'child_process';
import * as path from 'path';
import { app } from 'electron';
import LoggerManager from '../util/LoggerManager';

export default class versionUpdateManager {

  static downloadInstaller() {

  }

  /**
   * This code is based on NsisUpdater.js from electron-updater module and adapted to our needs.
   * @returns {boolean}
   */
  static runInstaller(installerPath) {
    LoggerManager.log('runInstaller');
    const isSilent = true;
    if (this.quitAndInstallCalled) {
      return false;
    }
    const setupPath = path.join('C:\\amp\\AMPOffline\\dist', 'amp-offline-1.0.0.exe');
    // prevent calling several times
    this.quitAndInstallCalled = true;
    const args = ['--updated'];
    if (isSilent) {
      args.push('/S');
    }
    const spawnOptions = {
      detached: true,
      stdio: 'ignore'
    };
    try {
      (0, (child).spawn)(setupPath, args, spawnOptions).unref();
      app.quit();
    } catch (e) {
      // yes, such errors dispatched not as error event
      // https://github.com/electron-userland/electron-builder/issues/1129
      if (e.code === 'UNKNOWN') {
        LoggerManager.error('UNKNOWN error code on spawn, will be executed again using elevate');
        try {
          (0, (child).spawn)(path.join(process.resourcesPath, 'elevate.exe'), [setupPath].concat(args), spawnOptions)
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
