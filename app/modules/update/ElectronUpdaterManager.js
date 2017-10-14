import { CancellationToken } from 'electron-updater';
import ElectronUpdater from './ElectronUpdater';
import RequestConfig from '../connectivity/RequestConfig';
import LoggerManager from '../util/LoggerManager';
import { ELECTRON_UPDATER_CHECK_URL } from '../connectivity/AmpApiConstants';
import * as Notification from '../helpers/NotificationHelper';
import { NOTIFICATION_ORIGIN_UPDATE } from '../../utils/constants/ErrorConstants';

const autoUpdater = ElectronUpdater.getElectronUpdater();

/**
 * Update Manager based on 'electron-updater'
 *
 * @author Nadejda Mandrescu
 */
export default class ElectronUpdaterManager {

  static init() {
    LoggerManager.log('init');
    const url = this._getURL();
    autoUpdater.setFeedURL(url);
  }

  static _getURL() {
    return RequestConfig.getFullURL({
      method: 'GET',
      url: ELECTRON_UPDATER_CHECK_URL,
      extraUrlParam: RequestConfig.getArch()
    });
  }

  static getUpdater(progressUpdateFunc) {
    LoggerManager.log('getUpdater');
    try {
      this.init();
      return new ElectronUpdaterManager(progressUpdateFunc);
    } catch (errorObject) {
      LoggerManager.error(`${errorObject}`);
      return Promise.reject(new Notification({ origin: NOTIFICATION_ORIGIN_UPDATE, errorObject }));
    }
  }

  constructor(progressUpdateFunc) {
    LoggerManager.log('constructor');
    this.cancellationToken = new CancellationToken();
    this.progressUpdateFunc = progressUpdateFunc;
  }

  downloadUpdate() {
    LoggerManager.log('downloadUpdate');
    LoggerManager.log(`current version: ${autoUpdater.currentVersion}`);
    LoggerManager.log(`httpExecutor present: ${!!autoUpdater.httpExecutor}`);
    LoggerManager.log(`checkForUpdatesPromise present: ${!!autoUpdater.checkForUpdatesPromise}`);
    return new Promise((resolve, reject) => {
      try {
        LoggerManager.debug('before .on(\'error');
        autoUpdater.on('error', (ev, error) => {
          this._reportError(error, reject);
        });
        LoggerManager.debug('before .on(\'update-not-available\'');
        autoUpdater.on('update-not-available', () => {
          // we shouldn't get here, since we manage update startup, so something is wrong, thus reporting as error
          this._reportError('Update not available', reject);
        });
        LoggerManager.debug('before .on(\'update-available');
        autoUpdater.on('update-available', (ev) => {
          LoggerManager.log(`update-available: ${JSON.stringify(ev)}`);
          // TODO translate
          this._sendUpdates({ message: 'Update detection confirmed', downloadingUpdate: true });
          autoUpdater.downloadUpdate();
        });
        LoggerManager.debug('before .on(\'download-progress');
        autoUpdater.on('download-progress', (progress) => {
          this._sendUpdates({ message: JSON.stringify(progress), percent: progress.percent });
        });
        LoggerManager.debug('before .on(\'update-downloaded');
        autoUpdater.on('update-downloaded', () => {
          LoggerManager.log('update-downloaded');
          // TODO translate
          this._sendUpdates('Update downloaded');
          return resolve();
        });
        LoggerManager.debug('before .checkForUpdates');
        autoUpdater.checkForUpdates();
      } catch (error) {
        LoggerManager.error('Unexpected error');
        this._reportError(error, reject);
      }
    });
  }

  startUpdate() {
    LoggerManager.log('startUpdate');
    return new Promise((resolve, reject) => {
      autoUpdater.on('error', (ev, error) => {
        this._reportError(error, reject);
      });
      autoUpdater.quitAndInstall(true, true);
      return resolve();
    });
  }

  _sendUpdates({ message, percent }) {
    this.progressUpdateFunc({ message, percent });
  }

  _reportError(error, reject) {
    const message = JSON.stringify(error);
    LoggerManager.error(message);
    this._sendUpdates({ message });
    return reject(error);
  }
}
