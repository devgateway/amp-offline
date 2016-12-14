// @flow
import UrlUtils from '../utils/URLUtils'
import {WORKSPACE_URL} from '../utils/Constants';
import {
  SYNC_STATUS_PENDING, SYNC_STATUS_IN_PROGRESS,
  SYNC_STATUS_FAILED, SYNC_STATUS_CANCELLED,
  SYNC_STATUS_COMPLETED
} from '../utils/constants/syncConstants'
import SyncUpManager from '../modules/syncup/SyncUpManager';


export const STATE_SYNCUP_SHOW_HISTORY = 'STATE_SYNCUP_SHOW_HISTORY';
export const STATE_SYNCUP_LOADING_HISTORY = 'STATE_SYNCUP_LOADING_HISTORY';
export const STATE_SYNCUP_SEARCH_FAILED = 'STATE_SYNCUP_SEARCH_FAILED';


export const STATE_SYNCUP_IN_PROCESS = 'STATE_SYNCUP_IN_PROCESS';
export const STATE_SYNCUP_COMPLETED = 'STATE_SYNCUP_COMPLETED';
export const STATE_SYNCUP_FAILED = 'STATE_SYNCUP_FAILED';

export function getSyncUpHistory() {
  console.log('getSyncUpHistory');

  return (dispatch, ownProps) => {
    if (ownProps().syncUp.loadingSyncHistory === false) {
      SyncUpManager.getSyncUpHistory().then(function (data) {
        // Return the action object that will be dispatched on redux (it can be done manually with dispatch() too).
        dispatch(syncUpSearchHistoryOk(data));
      }).catch(function (err) {
        dispatch(syncUpSearchHistoryFailed(err));
      });
    }
    dispatch(sendingRequest());
  };
}
export function startSyncUp(historyData, token) {
  console.log("startSyncUp");

  return (dispatch, ownProps) => {
    if (ownProps().syncUp.syncUpInProgress === false) {

      SyncUpManager.syncUp(token).then((response) => {
        //TODO probably the way in which we will update the ui will change
        //once we get the final version also it will change the way in which pass
        //the historyData object
        historyData.status = SYNC_STATUS_COMPLETED;
        console.log("syncupSucessfull");
        dispatch({type: "STATE_SYNCUP_COMPLETED", actionData: historyData})
      }).catch((err) => {
        console.log("syncupSucessfailed");
        historyData.status = SYNC_STATUS_FAILED;
        dispatch({type: "STATE_SYNCUP_FAILED", actionData: {errorMessage: err}})
      });
      dispatch(syncUpInProgress());

      console.log('startSyncUp');
    }
    ;
  }
}

function syncUpSearchHistoryOk(data) {
  console.log('syncUpSearchHistoryOk: ' + JSON.stringify(data));
  return {
    type: STATE_SYNCUP_SHOW_HISTORY,
    actionData: data
  };
}

function syncUpSearchHistoryFailed(err) {
  console.log('STATE_SYNCUP_SEARCH_FAILED: ' + err);
  return {
    type: STATE_SYNCUP_SEARCH_FAILED,
    actionData: {errorMessage: err}
  };
}

function sendingRequest() {
  console.log('sendingRequest');
  return {
    type: STATE_SYNCUP_LOADING_HISTORY
  }
}

function syncUpInProgress() {
  console.log('sendingRequest');
  return {
    type: STATE_SYNCUP_IN_PROCESS
  }
}


