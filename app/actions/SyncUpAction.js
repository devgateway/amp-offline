/* eslint flowtype-errors/show-errors: 0 */
import { SYNC_STATUS_COMPLETED } from '../utils/constants/syncConstants';
import SyncUpManager from '../modules/syncup/SyncUpManager';

// Types of redux actions
export const STATE_SYNCUP_SHOW_HISTORY = 'STATE_SYNCUP_SHOW_HISTORY';
export const STATE_SYNCUP_LOADING_HISTORY = 'STATE_SYNCUP_LOADING_HISTORY';
export const STATE_SYNCUP_SEARCH_FAILED = 'STATE_SYNCUP_SEARCH_FAILED';
export const STATE_SYNCUP_IN_PROCESS = 'STATE_SYNCUP_IN_PROCESS';
export const STATE_SYNCUP_COMPLETED = 'STATE_SYNCUP_COMPLETED';
export const STATE_SYNCUP_FAILED = 'STATE_SYNCUP_FAILED';
export const STATE_SYNCUP_IS_FORCE_NEEDED = 'STATE_SYNCUP_IS_FORCE_NEEDED';

export function getSyncUpHistory() {
  console.log('getSyncUpHistory');
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
  console.log('startSyncUp');
  return (dispatch, ownProps) => {
    if (ownProps().syncUp.syncUpInProgress === false) {
      dispatch(syncUpInProgress());
      return SyncUpManager.syncUpAllTypesOnDemand().then(() => {
        // TODO probably the way in which we will update the ui will change
        // once we get the final version also it will change the way in which pass
        // the historyData object
        const newHistoryData = Object.assign({}, historyData, { status: SYNC_STATUS_COMPLETED });
        console.log('syncupSucessfull');
        return dispatch({ type: 'STATE_SYNCUP_COMPLETED', actionData: newHistoryData });
      }).catch((err) => {
        console.log('syncupSucessfailed');
        return dispatch({ type: 'STATE_SYNCUP_FAILED', actionData: { errorMessage: err } });
      });
    }
  };
}

export function isForceSyncUpAction(callback) {
  console.log('isForceSyncUpAction');
  return (dispatch) => (
    SyncUpManager.isForceSyncUp().then((forceData) => {
      dispatch({
        type: STATE_SYNCUP_IS_FORCE_NEEDED,
        actionData: { force: forceData.force, message: forceData.message }
      });
      return callback(forceData.force);
    }));
}

function syncUpSearchHistoryOk(data) {
  console.log(`syncUpSearchHistoryOk: ${JSON.stringify(data)}`);
  return {
    type: STATE_SYNCUP_SHOW_HISTORY,
    actionData: data
  };
}

function syncUpSearchHistoryFailed(err) {
  console.log(`STATE_SYNCUP_SEARCH_FAILED: ${err}`);
  return {
    type: STATE_SYNCUP_SEARCH_FAILED,
    actionData: { errorMessage: err }
  };
}

function sendingRequest() {
  console.log('sendingRequest');
  return {
    type: STATE_SYNCUP_LOADING_HISTORY
  };
}

function syncUpInProgress() {
  console.log('sendingRequest');
  return {
    type: STATE_SYNCUP_IN_PROCESS
  };
}
