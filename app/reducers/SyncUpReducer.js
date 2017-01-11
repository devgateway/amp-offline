// @flow
import {
  STATE_SYNCUP_SHOW_HISTORY,
  STATE_SYNCUP_LOADING_HISTORY,
  STATE_SYNCUP_SEARCH_FAILED,
  STATE_SYNCUP_IN_PROCESS,
  STATE_SYNCUP_COMPLETED,
  STATE_SYNCUP_FAILED
} from '../actions/SyncUpAction';

const defaultState = {
  loadingSyncHistory: false,
  syncUpInProgress: false,
  errorMessage: '',
  historyData: {}
};

export default function syncUp(state = defaultState, action: Object) {

  console.log('SyncUpReducer');

  switch (action.type) {
    case STATE_SYNCUP_SHOW_HISTORY:
      return Object.assign({}, state, {loadingSyncHistory: false, historyData: action.actionData,});
      break;
    case STATE_SYNCUP_SEARCH_FAILED:
      return Object.assign({}, state, {
        loadingSyncHistory: false,
        errorMessage: action.actionData.errorMessage,
      });
      break;
    case STATE_SYNCUP_LOADING_HISTORY:
      return Object.assign({}, state, {loadingSyncHistory: true, errorMessage: ''});
      break;
    case STATE_SYNCUP_COMPLETED:
      return Object.assign({}, state, {syncUpInProgress: false, syncUpResutls: action.actionData, errorMessage: ''});
      break;
    case STATE_SYNCUP_IN_PROCESS:
      return Object.assign({}, state, {syncUpInProgress: true, errorMessage: ''});
      break;
    case STATE_SYNCUP_FAILED:
      return Object.assign({}, state, {
        syncUpInProgress: false, errorMessage: action.actionData.errorMessage,
      });
      break;

    default:
      console.log('default state: ' + action.type);
      return state;
  }
}
