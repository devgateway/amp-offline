import { Constants } from 'amp-ui';
import store from '../index';
import * as URLUtils from '../utils/URLUtils';
import { SYNC_STATUS_COMPLETED } from '../utils/constants/syncConstants';
import translate from '../utils/translate';
import SyncUpManager from '../modules/syncup/SyncUpManager';
import Logger from '../modules/util/LoggerManager';
import { resetDesktop } from '../actions/DesktopAction';
import { checkIfShouldSyncBeforeLogout } from './LoginAction';
import {
  connectivityCheck,
  getStatusNotification,
  isAmpUsableByCurrentClient
} from './ConnectivityAction';
import { ERROR_CODE_ACCESS_DENIED, ERROR_CODE_NO_CONNECTIVITY } from '../utils/constants/ErrorConstants';
import NotificationHelper from '../modules/helpers/NotificationHelper';

// Types of redux actions
export const STATE_SYNCUP_SHOW_HISTORY = 'STATE_SYNCUP_SHOW_HISTORY';
export const STATE_SYNCUP_LOADING_HISTORY = 'STATE_SYNCUP_LOADING_HISTORY';
export const STATE_SYNCUP_SEARCH_FAILED = 'STATE_SYNCUP_SEARCH_FAILED';
export const STATE_SYNCUP_IN_PROCESS = 'STATE_SYNCUP_IN_PROCESS';
export const STATE_SYNCUP_COMPLETED = 'STATE_SYNCUP_COMPLETED';
export const STATE_SYNCUP_FAILED = 'STATE_SYNCUP_FAILED';
export const STATE_SYNCUP_FORCED = 'STATE_SYNCUP_FORCED';
export const STATE_SYNCUP_CONNECTION_UNAVAILABLE = 'STATE_SYNCUP_CONNECTION_UNAVAILABLE';
export const STATE_SYNCUP_DISMISSED = 'STATE_SYNCUP_DISMISSED';
export const STATE_SYNCUP_DISMISS_COMPLETE = 'STATE_SYNCUP_DISMISS_COMPLETE';
export const STATE_CONNECTION_CHECK_IN_PROGRESS = 'STATE_CONNECTION_CHECK_IN_PROGRESS';
export const STATE_SYNCUP_LOG_LOADED = 'STATE_SYNCUP_LOG_LOADED';

const logger = new Logger('Syncup action');

export function loadSyncUpHistory() {
  logger.log('getSyncUpHistory');
  return (dispatch) => {
    if (store.getState().syncUpReducer.loadingSyncHistory === false) {
      SyncUpManager.getSyncUpHistory().then((data) => (
        dispatch(syncUpSearchHistoryOk(data))
      )).catch((err) => (
        dispatch(syncUpSearchHistoryFailed(err))
      ));
    }
    dispatch(sendingRequest());
  };
}

export function startSyncUpIfConnectionAvailable() {
  return connectivityCheck().then(status => {
    if (isAmpUsableByCurrentClient(status)) {
      return startSyncUp();
    }
    store.dispatch(syncConnectionUnavailable(getStatusNotification(status).message));
    return null;
  });
}

export function startSyncUp(historyData) {
  logger.log('startSyncUp');
  /* Save current syncup redux state because this might be a "forced" syncup and we dont want
   the user to be able to leave the page if this syncup fails. */
  if (store.getState().syncUpReducer.syncUpInProgress === false) {
    store.dispatch(syncUpInProgress());
    URLUtils.forwardTo(Constants.SYNCUP_REDIRECT_URL);
    store.dispatch(resetDesktop()); // Mark the desktop for reset the next time we open it.

    return SyncUpManager.syncUpAllTypesOnDemand()
      .then((log) => {
        const newHistoryData = Object.assign({}, historyData, { status: SYNC_STATUS_COMPLETED });
        logger.log('syncupSucessfull');
        store.dispatch({ type: 'STATE_SYNCUP_COMPLETED', actionData: newHistoryData });
        const { id } = log;
        store.dispatch({
          type: STATE_SYNCUP_LOG_LOADED,
          actionData: log
        });
        URLUtils.forwardTo(`/syncUpSummary/${id}`);
        return checkIfToForceSyncUp();
      }
    ).catch((err) => {
      logger.error(err);
      const errorMessage = getSyncErrorByCode(err);
      store.dispatch({ type: 'STATE_SYNCUP_FAILED', actionData: { errorMessage } });
      URLUtils.forwardTo('/syncUpSummary');
      return checkIfToForceSyncUp();
    });
  }
  return Promise.resolve();
}

function getSyncErrorByCode(error: NotificationHelper) {
  switch (error.errorCode) {
    case ERROR_CODE_NO_CONNECTIVITY:
      return `${translate('defaultSyncError')} ${error.message}`;
    case ERROR_CODE_ACCESS_DENIED:
      return error.message;
    default:
      return translate('defaultSyncError');
  }
}

export function checkIfToForceSyncUp() {
  return SyncUpManager.checkIfToForceSyncUp().then((forceData) => {
    store.dispatch({
      type: STATE_SYNCUP_FORCED,
      actionData: forceData
    });
    return forceData.forceSyncUp;
  });
}

export function isForceSyncUp() {
  return store.getState().syncUpReducer.forceSyncUp;
}

export function dismissSyncAndChooseWorkspace() {
  store.dispatch({ type: STATE_SYNCUP_DISMISS_COMPLETE });
  return checkIfShouldSyncBeforeLogout().then(() => URLUtils.forwardTo(Constants.WORKSPACE_URL));
}

function syncUpSearchHistoryOk(data) {
  return {
    type: STATE_SYNCUP_SHOW_HISTORY,
    actionData: data
  };
}

function syncUpSearchHistoryFailed(err) {
  logger.log(`STATE_SYNCUP_SEARCH_FAILED: ${err}`);
  return {
    type: STATE_SYNCUP_SEARCH_FAILED,
    actionData: { errorMessage: err }
  };
}

function sendingRequest() {
  logger.debug('sendingRequest');
  return {
    type: STATE_SYNCUP_LOADING_HISTORY
  };
}

function syncUpInProgress() {
  logger.debug('sendingRequest');
  return {
    type: STATE_SYNCUP_IN_PROCESS
  };
}

function syncConnectionUnavailable(errorMessage) {
  return {
    type: STATE_SYNCUP_CONNECTION_UNAVAILABLE,
    actionData: { errorMessage }
  };
}
