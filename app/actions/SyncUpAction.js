import store from '../index';
import * as URLUtils from '../utils/URLUtils';
import { WORKSPACE_URL } from '../utils/Constants';
import { SYNC_STATUS_COMPLETED } from '../utils/constants/syncConstants';
import translate from '../utils/translate';
import SyncUpManager from '../modules/syncup/SyncUpManager';
import LoggerManager from '../modules/util/LoggerManager';
import { resetDesktop } from '../actions/DesktopAction';
import { checkIfShouldSyncBeforeLogout } from './LoginAction';

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

export function loadSyncUpHistory() {
  LoggerManager.log('getSyncUpHistory');
  if (store.getState().syncUpReducer.loadingSyncHistory === false) {
    SyncUpManager.getSyncUpHistory().then((data) => (
      // Return the action object that will be dispatched on redux (it can be done manually with dispatch() too).
      store.dispatch(syncUpSearchHistoryOk(data))
    )).catch((err) => (
      store.dispatch(syncUpSearchHistoryFailed(err))
    ));
  }
  store.dispatch(sendingRequest());
}

export function checkSyncConnection() {
  LoggerManager.log('checkSyncConnection');
  if (store.getState().ampConnectionStatusReducer.status.isAmpAvailable) {
    startSyncUp();
  } else {
    store.dispatch(syncConnectionUnavailable());
  }
}

export function startSyncUp(historyData) {
  LoggerManager.log('startSyncUp');
  /* Save current syncup redux state because this might be a "forced" syncup and we dont want
   the user to be able to leave the page if this syncup fails. */
  if (store.getState().syncUpReducer.syncUpInProgress === false) {
    store.dispatch(resetDesktop()); // Mark the desktop for reset the next time we open it.
    store.dispatch(syncUpInProgress());
    return SyncUpManager.syncUpAllTypesOnDemand().then(() => checkIfToForceSyncUp()).then(() => {
      // TODO probably the way in which we will update the ui will change
      // once we get the final version also it will change the way in which pass
      // the historyData object
      const newHistoryData = Object.assign({}, historyData, { status: SYNC_STATUS_COMPLETED });
      LoggerManager.log('syncupSucessfull');
      store.dispatch({ type: 'STATE_SYNCUP_COMPLETED', actionData: newHistoryData });
      return newHistoryData;
    }).catch((err) => {
      const actionData = { errorMessage: err };
      store.dispatch({ type: 'STATE_SYNCUP_FAILED', actionData });
      return checkIfToForceSyncUp();
    });
  }
  return Promise.resolve();
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
  return checkIfShouldSyncBeforeLogout().then(() => URLUtils.forwardTo(WORKSPACE_URL));
}

function syncUpSearchHistoryOk(data) {
  LoggerManager.log(`syncUpSearchHistoryOk: ${JSON.stringify(data)}`);
  return {
    type: STATE_SYNCUP_SHOW_HISTORY,
    actionData: data
  };
}

function syncUpSearchHistoryFailed(err) {
  LoggerManager.log(`STATE_SYNCUP_SEARCH_FAILED: ${err}`);
  return {
    type: STATE_SYNCUP_SEARCH_FAILED,
    actionData: { errorMessage: err }
  };
}

function sendingRequest() {
  LoggerManager.log('sendingRequest');
  return {
    type: STATE_SYNCUP_LOADING_HISTORY
  };
}

function syncUpInProgress() {
  LoggerManager.log('sendingRequest');
  return {
    type: STATE_SYNCUP_IN_PROCESS
  };
}

function syncConnectionUnavailable() {
  LoggerManager.log('syncConnectionUnavailable');
  const msg = translate('syncConnectionError');
  return {
    type: STATE_SYNCUP_CONNECTION_UNAVAILABLE,
    actionData: { errorMessage: msg }
  };
}
