import store from '../index';
import * as UrlUtils from '../utils/URLUtils';
import { UPDATE_URL } from '../utils/Constants';
import ConnectivityStatus from '../modules/connectivity/ConnectivityStatus';
import { MANDATORY_UPDATE } from './ConnectivityAction';
import UpdateManager from '../modules/update/UpdateManager';
import * as ClientSettingsHelper from '../modules/helpers/ClientSettingsHelper';
import { UPDATE_INSTALLER_PATH } from '../utils/constants/ClientSettingsConstants';


export const STATE_DOWNLOAD_UPDATE_CONFIRMATION_PENDING = 'STATE_DOWNLOAD_UPDATE_CONFIRMATION_PENDING';
export const STATE_DOWNLOAD_UPDATE_CONFIRMED = 'STATE_DOWNLOAD_UPDATE_CONFIRMED';
export const STATE_DOWNLOAD_UPDATE_DISMISSED = 'STATE_DOWNLOAD_UPDATE_DISMISSED';
export const STATE_UPDATE_PENDING = 'STATE_UPDATE_PENDING';
export const STATE_DOWNLOAD_UPDATE_IN_PROGRESS = 'STATE_DOWNLOAD_UPDATE_IN_PROGRESS';
export const STATE_CHECK_FOR_UPDATES = 'STATE_CHECK_FOR_UPDATES';
export const STATE_DOWNLOAD_UPDATE_PENDING = 'STATE_DOWNLOAD_UPDATE_PENDING';
export const STATE_DOWNLOAD_UPDATE_FULFILLED = 'STATE_DOWNLOAD_UPDATE_FULFILLED';
export const STATE_DOWNLOAD_UPDATE_REJECTED = 'STATE_DOWNLOAD_UPDATE_REJECTED';
const STATE_DOWNLOAD_UPDATE = 'STATE_DOWNLOAD_UPDATE';
export const STATE_LAST_UPDATE_DATA_PENDING = 'STATE_LAST_UPDATE_DATA_PENDING';
export const STATE_LAST_UPDATE_DATA_FULFILLED = 'STATE_LAST_UPDATE_DATA_FULFILLED';
export const STATE_LAST_UPDATE_DATA_REJECTED = 'STATE_LAST_UPDATE_DATA_REJECTED';
const STATE_LAST_UPDATE_DATA = 'STATE_LAST_UPDATE_DATA';
export const STATE_UPDATE_STARTED = 'STATE_UPDATE_STARTED';
export const STATE_UPDATE_FAILED = 'STATE_UPDATE_FAILED';


export function goToDownloadPage() {
  store.dispatch({ type: STATE_UPDATE_PENDING });
  UrlUtils.forwardTo(UPDATE_URL);
}

export function dismissUpdate() {
  return dispatch => dispatch({ type: STATE_DOWNLOAD_UPDATE_DISMISSED });
}

export function isMandatoryUpdate() {
  const ampConnectionStatusReducer = store.getState().ampConnectionStatusReducer;
  return getMandatoryValue(ampConnectionStatusReducer && ampConnectionStatusReducer.status) === true;
}

export function isOptionalUpdate() {
  const ampConnectionStatusReducer = store.getState().ampConnectionStatusReducer;
  return getMandatoryValue(ampConnectionStatusReducer && ampConnectionStatusReducer.status) === false;
}

function getMandatoryValue(status: ConnectivityStatus) {
  return status && status.latestAmpOffline && status.latestAmpOffline[MANDATORY_UPDATE];
}


export function getNewClientVersion() {
  const ampConnectionStatusReducer = store.getState().ampConnectionStatusReducer;
  const status: ConnectivityStatus = ampConnectionStatusReducer && ampConnectionStatusReducer.status;
  return status && status.latestAmpOffline && status.latestAmpOffline.version;
}

export function isCheckForUpdates() {
  const { syncUpReducer, activityReducer, updateReducer, ampConnectionStatusReducer } = store.getState();
  const { proceedToUpdateDownload, confirmationPending, updatePending, updateInProgress } = updateReducer;
  return updateReducer.newUpdateToCheck && !(activityReducer.isActivityLoadedForAf || syncUpReducer.syncUpInProgress
    || ampConnectionStatusReducer.updateInProgress
    || proceedToUpdateDownload || confirmationPending || updatePending || updateInProgress);
}

export function initUpdateData() {
  // TODO if update was interrupted but file downloaded
  const updateDataPromise = ClientSettingsHelper.findSettingByName(UPDATE_INSTALLER_PATH)
    .then((updateInstallerPathSetting) => {
      const data = {
        updateInstallerPath: updateInstallerPathSetting && updateInstallerPathSetting.value
      };
      return data;
    });
  store.dispatch({
    type: STATE_LAST_UPDATE_DATA,
    payload: updateDataPromise
  });
  return updateDataPromise;
}

export function downloadUpdate(id) {
  // TODO check if the update can be interrupted => avoid re-download on next update attempt (remember file per version)
  const downloadPromise = UpdateManager.downloadInstaller(id);
  return dispatch => dispatch({
    type: STATE_DOWNLOAD_UPDATE,
    payload: downloadPromise
  });
}

/**
 * It triggers the app update process. If is successful the app will close, if not throw an error.
 */
export function installUpdate(path) {
  store.dispatch({ type: STATE_UPDATE_STARTED });
  return UpdateManager.runInstaller(path).catch((error) => (store.dispatch({
    type: STATE_UPDATE_FAILED,
    errorMessage: error.toString()
  })));
}
