import Logger from '../modules/util/LoggerManager';

const { BrowserWindow } = require('electron').remote;
const PDFWindow = require('electron-pdf-window');
const path = require('path');
const url = require('url');

const STATE_LOAD_SETTINGS = 'STATE_LOAD_SETTINGS';
export const STATE_LOAD_SETTINGS_PENDING = 'STATE_LOAD_SETTINGS_PENDING';
export const STATE_LOAD_SETTINGS_FULFILLED = 'STATE_LOAD_SETTINGS_FULFILLED';
export const STATE_LOAD_SETTINGS_REJECTED = 'STATE_LOAD_SETTINGS_REJECTED';
const STATE_SAVE_SETTINGS = 'STATE_SAVE_SETTINGS';
export const STATE_SAVE_SETTINGS_PENDING = 'STATE_SAVE_SETTINGS_PENDING';
export const STATE_SAVE_SETTINGS_FULFILLED = 'STATE_SAVE_SETTINGS_FULFILLED';
export const STATE_SAVE_SETTINGS_REJECTED = 'STATE_SAVE_SETTINGS_REJECTED';

const logger = new Logger('Settings Action');

export function loadHelp() {
  // todo: mover la carga del pdf a un util.
  logger.log('saveSettings');
  /* const promise = ClientSettingsHelper.saveOrUpdateCollection(settings).then((result) => {
    const setupSetting = settings.find(setting => setting.id === CSC.SETUP_CONFIG);
    logger.log('Configure the latest setup for connectivity');
    configureAndTestConnectivity(setupSetting.value);
    return result;
  });
  return (dispatch) => {
    promise
      .then(() => dispatch(saveConfirmation(true)))
      .catch((error) => dispatch(saveConfirmation(false, error)));
    return dispatch({
      type: STATE_SAVE_SETTINGS,
      payload: promise
    });
  }; */
  /* const win = new BrowserWindow({ width: 800, height: 600 });
  PDFWindow.addSupport(win);
  win.loadURL('./assets/amp-help.pdf'); */
  // win.loadURL('http://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf');
  // win.loadURL('http://google.com');
  const fileLocation = url.format({
    pathname: path.join("assets", "amp-help.pdf"),
    protocol: 'file:',
    slashes: true
  });
  console.log("File Location: " + fileLocation);
  const win = new BrowserWindow({ width: 800, height: 600 });
  PDFWindow.addSupport(win);
  win.loadURL(fileLocation);
  return (dispatch) => (
    dispatch({ type: 'nada' })
  );
}
