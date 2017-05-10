/* eslint flowtype-errors/show-errors: 0 */
import { SYNC_STATUS_COMPLETED } from '../utils/constants/syncConstants';
import SyncUpManager from '../modules/syncup/SyncUpManager';
import LoggerManager from '../modules/util/LoggerManager';
import { resetDesktop } from '../actions/DesktopAction';

// Types of redux actions
export const STATE_SYNCUP_SHOW_HISTORY = 'STATE_SYNCUP_SHOW_HISTORY';
export const STATE_SYNCUP_LOADING_HISTORY = 'STATE_SYNCUP_LOADING_HISTORY';
export const STATE_SYNCUP_SEARCH_FAILED = 'STATE_SYNCUP_SEARCH_FAILED';
export const STATE_SYNCUP_IN_PROCESS = 'STATE_SYNCUP_IN_PROCESS';
export const STATE_SYNCUP_COMPLETED = 'STATE_SYNCUP_COMPLETED';
export const STATE_SYNCUP_FAILED = 'STATE_SYNCUP_FAILED';
export const STATE_SYNCUP_FORCED = 'STATE_SYNCUP_FORCED';

export function getSyncUpHistory() {
  LoggerManager.log('getSyncUpHistory');
  return (dispatch, ownProps) => {
    if (ownProps().syncUpReducer.loadingSyncHistory === false) {
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
    /* Save current syncup redux state because this might be a "forced" syncup and we dont want
     the user to be able to leave the page if this syncup fails. */
    const currentState = ownProps().syncUpReducer;
    if (ownProps().syncUpReducer.syncUpInProgress === false) {
      dispatch(resetDesktop()); // Mark the desktop for reset the next time we open it.
      dispatch(syncUpInProgress());
      return SyncUpManager.syncUpAllTypesOnDemand().then(() => {
        // TODO probably the way in which we will update the ui will change
        // once we get the final version also it will change the way in which pass
        // the historyData object
        const newHistoryData = Object.assign({}, historyData, { status: SYNC_STATUS_COMPLETED });
        LoggerManager.log('syncupSucessfull');
        return dispatch({ type: 'STATE_SYNCUP_COMPLETED', actionData: newHistoryData });
      }).catch((err) => {
        const actionData = { errorMessage: err };
        // Check if we need to remain in the force syncup state.
        if (currentState.forceSyncUp) {
          actionData.force = true;
          actionData.warnMessage = currentState.forceSyncUpMessage;
        }
        return dispatch({ type: 'STATE_SYNCUP_FAILED', actionData });
      });
    }
  };
}

export function isForceSyncUpAction(callback) {
  LoggerManager.log('isForceSyncUpAction');
  return (dispatch) => (
    SyncUpManager.isForceSyncUp().then((forceData) => {
      dispatch({
        type: STATE_SYNCUP_FORCED,
        actionData: { force: forceData.force, message: forceData.message }
      });
      return callback(forceData.force);
    }));
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
