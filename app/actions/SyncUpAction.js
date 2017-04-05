/* eslint flowtype-errors/show-errors: 0 */
import { SYNC_STATUS_COMPLETED } from '../utils/constants/syncConstants';
import SyncUpManager from '../modules/syncup/SyncUpManager';
import LoggerManager from '../modules/util/LoggerManager';

// Types of redux actions
export const STATE_SYNCUP_SHOW_HISTORY = 'STATE_SYNCUP_SHOW_HISTORY';
export const STATE_SYNCUP_LOADING_HISTORY = 'STATE_SYNCUP_LOADING_HISTORY';
export const STATE_SYNCUP_SEARCH_FAILED = 'STATE_SYNCUP_SEARCH_FAILED';
export const STATE_SYNCUP_IN_PROCESS = 'STATE_SYNCUP_IN_PROCESS';
export const STATE_SYNCUP_COMPLETED = 'STATE_SYNCUP_COMPLETED';
export const STATE_SYNCUP_FAILED = 'STATE_SYNCUP_FAILED';

export function getSyncUpHistory() {
  LoggerManager.log('getSyncUpHistory');
  return (dispatch, ownProps) => {
    if (ownProps().syncUp.loadingSyncHistory === false) {
      SyncUpManager.getSyncUpHistory().then((data) => (
        // Return the action object that will be dispatched on redux (it can be done manually with dispatch() too).
        dispatch(syncUpSearchHistoryOk(data))
      )).catch((err) => (
        dispatch(syncUpSearchHistoryFailed(err))
      ));
    }
    dispatch(sendingRequest());
  };
}

export function startSyncUp(historyData) {
  LoggerManager.log('startSyncUp');
  return (dispatch, ownProps) => {
    if (ownProps().syncUp.syncUpInProgress === false) {
      SyncUpManager.syncUpAllTypesOnDemand().then(() => {
        // TODO probably the way in which we will update the ui will change
        // once we get the final version also it will change the way in which pass
        // the historyData object
        const newHistoryData = Object.assign({}, historyData, { status: SYNC_STATUS_COMPLETED });
        LoggerManager.log('syncupSucessfull');
        return dispatch({ type: 'STATE_SYNCUP_COMPLETED', actionData: newHistoryData });
      }).catch((err) => {
        LoggerManager.log('syncupSucessfailed');
        return dispatch({ type: 'STATE_SYNCUP_FAILED', actionData: { errorMessage: err } });
      });
      dispatch(syncUpInProgress());
      LoggerManager.log('startSyncUp');
    }
  };
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
