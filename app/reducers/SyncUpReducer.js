import {
  STATE_SYNCUP_SHOW_HISTORY,
  STATE_SYNCUP_LOADING_HISTORY,
  STATE_SYNCUP_SEARCH_FAILED,
  STATE_SYNCUP_IN_PROCESS,
  STATE_SYNCUP_COMPLETED,
  STATE_SYNCUP_FAILED
} from '../actions/SyncUpAction';
import LoggerManager from '../modules/util/LoggerManager';

const defaultState = {
  loadingSyncHistory: false,
  syncUpInProgress: false,
  errorMessage: '',
  historyData: {}
};

export default function syncUp(state: Object = defaultState, action: Object) {
  LoggerManager.log('SyncUpReducer');
  switch (action.type) {
    case STATE_SYNCUP_SHOW_HISTORY:
      return Object.assign({}, state, { loadingSyncHistory: false, historyData: action.actionData, });
    case STATE_SYNCUP_SEARCH_FAILED:
      return Object.assign({}, state, {
        loadingSyncHistory: false,
        errorMessage: action.actionData.errorMessage,
      });
    case STATE_SYNCUP_LOADING_HISTORY:
      return Object.assign({}, state, { loadingSyncHistory: true, errorMessage: '' });
    case STATE_SYNCUP_COMPLETED:
      return Object.assign({}, state, { syncUpInProgress: false, syncUpResutls: action.actionData, errorMessage: '' });
    case STATE_SYNCUP_IN_PROCESS:
      return Object.assign({}, state, { syncUpInProgress: true, errorMessage: '' });
    case STATE_SYNCUP_FAILED:
      return Object.assign({}, state, {
        syncUpInProgress: false, errorMessage: action.actionData.errorMessage,
      });
    default:
      return state;
  }
}
