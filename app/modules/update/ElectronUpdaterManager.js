/* eslint-disable class-methods-use-this */
import { CancellationToken } from 'electron-updater';
import ElectronUpdater from './ElectronUpdater';
import RequestConfig from '../connectivity/RequestConfig';
import LoggerManager from '../util/LoggerManager';
import { ELECTRON_UPDATER_CHECK_URL } from '../connectivity/AmpApiConstants';
import * as Notification from '../helpers/NotificationHelper';
import { NOTIFICATION_ORIGIN_UPDATE } from '../../utils/constants/ErrorConstants';
import translate from '../../utils/translate';
import * as Utils from '../../utils/Utils';
import NumberUtils from '../../utils/NumberUtils';

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
    return new Promise((resolve, reject) => {
      try {
        autoUpdater.on('error', (ev, error) => {
          this._reportError(error, reject);
        });
        autoUpdater.on('update-not-available', () => {
          // we shouldn't get here, since we manage update startup, so something is wrong, thus reporting as error
          this._reportError(translate('updateNA'), reject);
        });
        autoUpdater.on('update-available', (ev) => {
          LoggerManager.log(`update-available: ${JSON.stringify(ev)}`);
          this._sendUpdates({ message: translate('updateConfirmed'), downloadingUpdate: true });
          autoUpdater.downloadUpdate();
        });
        autoUpdater.on('download-progress', (progress) => {
          const message = this.getProgressMessage(progress);
          this._sendUpdates({ message, percent: progress.percent });
        });
        autoUpdater.on('update-downloaded', () => {
          LoggerManager.log('update-downloaded');
          this._sendUpdates(translate('downloadComplete'));
          return resolve();
        });
        autoUpdater.checkForUpdates();
      } catch (error) {
        LoggerManager.error('Unexpected error');
        this._reportError(error, reject);
      }
    });
  }

  getProgressMessage(progress) {
    const totalData = Utils.simplifyDataSize(progress.total);
    const total = NumberUtils.rawNumberToFormattedString(totalData.value);
    let transferred = Utils.simplifyDataSize(progress.transferred, totalData.label).value;
    transferred = NumberUtils.rawNumberToFormattedString(transferred);
    const speedData = Utils.simplifyDataSize(progress.bytesPerSecond);
    const speedUnitTrn = translate(`${speedData.label}/s`);
    const speed = `${NumberUtils.rawNumberToFormattedString(speedData.value)} ${speedUnitTrn}`;
    return translate('downloadProgressDetails')
      .replace('%transferred%', transferred)
      .replace('%total%', total)
      .replace('%unit%', translate(totalData.label))
      .replace('%percent%', NumberUtils.rawNumberToFormattedString(progress.percent))
      .replace('%speed%', speed);
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
