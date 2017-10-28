import { autoUpdater } from 'electron-updater';
import { IS_DEV_MODE, IS_RENDERER_PROCESS } from '../util/ElectronApp';
import { VERSION } from '../../utils/Constants';
import Logger from '../util/LoggerManager';

const { remote } = require('electron');

const logger = IS_DEV_MODE ? console : new Logger('Electron updater');

let electronUpdater;

/**
 * Electron Updater wrapper that is needed to handle linking between main and remote processes.
 *
 * @author Nadejda Mandrescu
 */
const ElectronUpdater = {
  /**
   * We are forced to initialize autoUpdater within the main process to do less intrusive autoUpdater configuration
   * and relying on it more as a black box:
   * 1) if we try to get the autoUpdater directly within renderer process, then it fails because it requires electron
   * app object as from main process, not from electron.remote.
   * 2) if I try to create autoUpdater manually e.g. via AppUpdater by passing the right remote "app" object, then
   * the autoUpdater is initialized successfully, however in this case ".httpExecutor" is not configured (a bug?).
   * autoUpdater.httpExecutor is later on used to do the actual http request. Initializing httpExecutor ourselves is
   * more intrusive. Also with this approach we would have to use the right AppUpdater child class per platform,
   * while it is managed already when the default autoUpdater object is initialization.
   */

  /**
   * Gets autoUpdate global instance. It is initialized in the main process.
   * @return {*}
   */
  getElectronUpdater() {
    if (!electronUpdater) {
      if (!IS_RENDERER_PROCESS) {
        electronUpdater = this._init();
        global.electronUpdater = autoUpdater;
      } else {
        electronUpdater = remote.getGlobal('electronUpdater');
        // in dev mode it detects Chromium version, instead of the apps version
        electronUpdater.currentVersion = VERSION;
      }
    }
    return electronUpdater;
  },

  _init() {
    autoUpdater.autoDownload = false;
    // TODO see why methods are not accessible in renderer process, workaround until then with:
    Object.getOwnPropertyNames(autoUpdater).filter(n => typeof autoUpdater[n] === 'function').forEach(method => {
      global.electronUpdater[method] = autoUpdater[method];
    });
    autoUpdater.logger = logger;
    logger.log('ElectronUpdater initialized');
    return autoUpdater;
  }
};

export default ElectronUpdater;
