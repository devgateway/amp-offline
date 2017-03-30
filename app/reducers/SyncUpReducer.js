import {
  STATE_SYNCUP_SHOW_HISTORY,
  STATE_SYNCUP_LOADING_HISTORY,
  STATE_SYNCUP_SEARCH_FAILED,
  STATE_SYNCUP_IN_PROCESS,
  STATE_SYNCUP_COMPLETED,
  STATE_SYNCUP_FAILED,
  STATE_SYNCUP_FORCED
} from '../actions/SyncUpAction';

const defaultState = {
  loadingSyncHistory: false,
  syncUpInProgress: false,
  errorMessage: '',
  historyData: {},
  forceSyncUp: false,
  forceSyncUpMessage: ''
};

export default function syncUp(state: Object = defaultState, action: Object) {
  console.log('SyncUpReducer');
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
      return Object.assign({}, state, {
        syncUpInProgress: false,
        syncUpResutls: action.actionData,
        errorMessage: '',
        forceSyncUp: false,
        forceSyncUpMessage: ''
      });
    case STATE_SYNCUP_IN_PROCESS:
      return Object.assign({}, state, { syncUpInProgress: true, errorMessage: '' });
    case STATE_SYNCUP_FAILED:
      return Object.assign({}, state, {
        syncUpInProgress: false, errorMessage: action.actionData.errorMessage,
      });
    case STATE_SYNCUP_FORCED:
      return Object.assign({}, state, {
        forceSyncUp: action.actionData.force,
        forceSyncUpMessage: action.actionData.message
      });
    default:
      return state;
  }
}
