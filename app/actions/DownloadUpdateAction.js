import store from '../index';
import LoggerManager from '../modules/util/LoggerManager';
import VersionUpdateManager from '../modules/versionUpdate/VersionUpdateManager';

export const STATE_DOWNLOAD_UPDATE_PENDING = 'STATE_DOWNLOAD_UPDATE_PENDING';
export const STATE_DOWNLOAD_UPDATE_FULFILLED = 'STATE_DOWNLOAD_UPDATE_FULFILLED';
export const STATE_DOWNLOAD_UPDATE_REJECTED = 'STATE_DOWNLOAD_UPDATE_REJECTED';
const STATE_DOWNLOAD_UPDATE = 'STATE_DOWNLOAD_UPDATE';
export const STATE_UPDATE_STARTED = 'STATE_UPDATE_STARTED';
export const STATE_UPDATE_FAILED = 'STATE_UPDATE_FAILED';

export function downloadUpdate() {
  LoggerManager.log('downloadUpdate');
  // TODO: This constant will be params after AMPOFFLINE-191 is done.
  const id = 1;
  const downloadPromise = VersionUpdateManager.downloadInstaller(id).then(fileName => (fileName));
  store.dispatch({
    type: STATE_DOWNLOAD_UPDATE,
    payload: downloadPromise
  });
  return downloadPromise;
}

/**
 * It triggers the app update process. If is successful the app will close, if not throw an error.
 */
export function installUpdate() {
  LoggerManager.log('installUpdate');
  const path = store.getState().downloadUpdateReducer.fullUpdateFileName;
  store.dispatch({ type: STATE_UPDATE_STARTED });
  return VersionUpdateManager.runInstaller(path).catch((error) => (store.dispatch({
    type: STATE_UPDATE_FAILED,
    message: error.toString()
  })));
}
