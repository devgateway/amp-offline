/* eslint-disable class-methods-use-this */
import Moment from 'moment';
import { Constants, ErrorConstants, NumberUtils } from 'amp-ui';
import ElectronUpdater from './ElectronUpdater';
import RequestConfig from '../connectivity/RequestConfig';
import Logger from '../util/LoggerManager';
import { ELECTRON_UPDATER_CHECK_URL } from '../connectivity/AmpApiConstants';
import * as Notification from '../helpers/NotificationHelper';
import translate from '../../utils/translate';
import * as Utils from '../../utils/Utils';

const autoUpdater = ElectronUpdater.getElectronUpdater();

const logger = new Logger('Electron update manager');

/**
 * Update Manager based on 'electron-updater'
 *
 * @author Nadejda Mandrescu
 */
export default class ElectronUpdaterManager {

  static _init() {
    logger.log('_init');
    const url = this._getURL();
    autoUpdater.setFeedURL(url);
  }

  static _getURL() {
    return RequestConfig.getFullURL({
      method: 'GET',
      url: ELECTRON_UPDATER_CHECK_URL,
      extraUrlParam: Utils.getPlatformDetails().arch
    });
  }

  static getUpdater(progressUpdateFunc) {
    logger.log('getUpdater');
    try {
      this._init();
      return new ElectronUpdaterManager(progressUpdateFunc);
    } catch (errorObject) {
      logger.error(`${errorObject}`);
      return Promise.reject(new Notification({ origin: ErrorConstants.NOTIFICATION_ORIGIN_UPDATE, errorObject }));
    }
  }

  constructor(progressUpdateFunc) {
    logger.log('constructor');
    this.cancellationToken = ElectronUpdater.getCancellationToken();
    this.progressUpdateFunc = progressUpdateFunc;
  }

  downloadUpdate() {
    logger.log('downloadUpdate');
    logger.log(`current version: ${autoUpdater.currentVersion}`);
    return new Promise((resolve, reject) => {
      try {
        autoUpdater.on('error', (ev, error) => {
          if (ev.message === 'Cancelled') {
            if (this.isTimeout) {
              return this._reportError(translate('AMPUnreachableError'), reject);
            } else {
              // TODO when actual download cancellation will be implemented, integrated this part as needed
              return this._reportError(translate('downloadCancelled'), reject);
            }
          }
          this._reportError(error, reject);
        });
        autoUpdater.on('update-not-available', () => {
          // we shouldn't get here, since we manage update startup, so something is wrong, thus reporting as error
          this._reportError(translate('updateNA'), reject);
        });
        autoUpdater.on('update-available', (ev) => {
          logger.log(`update-available: ${JSON.stringify(ev)}`);
          this._sendUpdates({ message: translate('updateConfirmed'), downloadingUpdate: true });
          autoUpdater.downloadUpdate(this.cancellationToken);
        });
        autoUpdater.on('download-progress', (progress) => {
          const message = this.getProgressMessage(progress);
          this._sendUpdates({ message, percent: progress.percent });
        });
        autoUpdater.on('update-downloaded', () => {
          // stop timeout checks
          this.lastUpdate = null;
          logger.log('update-downloaded');
          this._sendUpdates(translate('downloadComplete'));
          return resolve();
        });
        autoUpdater.checkForUpdates();
        this.lastUpdate = Moment();
        this.continueOrAbort();
      } catch (error) {
        logger.error('Unexpected error');
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
    logger.log('startUpdate');
    return new Promise((resolve, reject) => {
      autoUpdater.on('error', (ev, error) => {
        this._reportError(error, reject);
      });
      autoUpdater.quitAndInstall(true, true);
      return resolve();
    });
  }

  continueOrAbort() {
    const isTimeout = this.lastUpdate ? Moment().diff(this.lastUpdate) > Constants.CONNECTION_TIMEOUT : false;
    if (isTimeout) {
      logger.error('Update download timeout');
      this.cancellationToken.cancel();
      this.isTimeout = true;
    } else if (this.lastUpdate) {
      setTimeout(this.continueOrAbort.bind(this), Constants.TIMEOUT_CHECK_INTERVAL);
    }
  }

  _sendUpdates({ message, percent }) {
    this.lastUpdate = Moment();
    this.progressUpdateFunc({ message, percent });
  }

  _reportError(error, reject) {
    const message = JSON.stringify(error);
    logger.error(message);
    this._sendUpdates({ message });
    return reject(error);
  }
}
