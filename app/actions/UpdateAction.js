import store from '../index';
import * as UrlUtils from '../utils/URLUtils';
import { UPDATE_URL } from '../utils/Constants';
import ConnectivityStatus from '../modules/connectivity/ConnectivityStatus';
import { MANDATORY_UPDATE } from './ConnectivityAction';

export const STATE_DOWNLOAD_UPDATE_CONFIRMATION_PENDING = 'STATE_DOWNLOAD_UPDATE_CONFIRMATION_PENDING';
export const STATE_DOWNLOAD_UPDATE_CONFIRMED = 'STATE_DOWNLOAD_UPDATE_CONFIRMED';
export const STATE_DOWNLOAD_UPDATE_DISMISSED = 'STATE_DOWNLOAD_UPDATE_DISMISSED';
export const STATE_DOWNLOAD_UPDATE_PENDING = 'STATE_DOWNLOAD_UPDATE_PENDING';
export const STATE_DOWNLOAD_UPDATE_IN_PROGRESS = 'STATE_DOWNLOAD_UPDATE_IN_PROGRESS';
export const STATE_CHECK_FOR_UPDATES = 'STATE_CHECK_FOR_UPDATES';

export function goToDownloadPage() {
  store.dispatch({ type: STATE_DOWNLOAD_UPDATE_PENDING });
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
