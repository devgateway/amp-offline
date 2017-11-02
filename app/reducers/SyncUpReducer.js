import {
  STATE_SYNCUP_COMPLETED,
  STATE_SYNCUP_CONNECTION_UNAVAILABLE,
  STATE_SYNCUP_DISMISS_COMPLETE,
  STATE_SYNCUP_DISMISSED,
  STATE_SYNCUP_FAILED,
  STATE_SYNCUP_FORCED,
  STATE_SYNCUP_IN_PROCESS,
  STATE_SYNCUP_LOADING_HISTORY,
  STATE_SYNCUP_LOG_LOADED,
  STATE_SYNCUP_SEARCH_FAILED,
  STATE_SYNCUP_SHOW_HISTORY
} from '../actions/SyncUpAction';
import { STATE_LOGOUT_DISMISS_TO_SYNC } from '../actions/LoginAction';
import Logger from '../modules/util/LoggerManager';

const logger = new Logger('Syncup reducer');

const defaultState = {
  loadingSyncHistory: false,
  syncUpInProgress: false,
  errorMessage: '',
  historyData: [],
  forceSyncUp: false,
  lastSuccessfulSyncUp: undefined,
  didUserSuccessfulSyncUp: false,
  didSyncUp: false,
  syncUpRejected: false,
  syncUpAccepted: false,
  daysFromLastSuccessfulSyncUp: undefined
};

export default function syncUpReducer(state: Object = defaultState, action: Object) {
  logger.log('SyncUpReducer');
  switch (action.type) {
    case STATE_SYNCUP_SHOW_HISTORY:
      return Object.assign({}, state, { loadingSyncHistory: false, historyData: action.actionData, });
    case STATE_SYNCUP_SEARCH_FAILED:
      return Object.assign({}, state, {
        loadingSyncHistory: false,
        errorMessage: action.actionData.errorMessage,
      });
    case STATE_SYNCUP_LOADING_HISTORY:
      return Object.assign({}, state, {
        loadingSyncHistory: true,
        syncUpRejected: false
      });
    case STATE_SYNCUP_COMPLETED:
      return Object.assign({}, state, {
        syncUpInProgress: false,
        syncUpResults: action.actionData,
        errorMessage: '',
        forceSyncUpMessage: ''
      });
    case STATE_SYNCUP_IN_PROCESS:
      return Object.assign({}, state, {
        syncUpInProgress: true,
        errorMessage: '',
        forceSyncUp: false,
        forceSyncUpMessage: ''
      });
    case STATE_SYNCUP_FAILED:
      return Object.assign({}, state, {
        syncUpInProgress: false,
        errorMessage: action.actionData.errorMessage,
        forceSyncUp: action.actionData.forceSyncUp,
        forceSyncUpMessage: action.actionData.warnMessage
      });
    case STATE_SYNCUP_FORCED:
      return Object.assign({}, state, {
        forceSyncUp: action.actionData.forceSyncUp,
        lastSuccessfulSyncUp: action.actionData.lastSuccessfulSyncUp,
        didUserSuccessfulSyncUp: action.actionData.didUserSuccessfulSyncUp,
        didSyncUp: action.actionData.didSyncUp,
        daysFromLastSuccessfulSyncUp: action.actionData.daysFromLastSuccessfulSyncUp,
        syncUpRejected: false,
        syncUpAccepted: false
      });
    case STATE_SYNCUP_CONNECTION_UNAVAILABLE:
      return Object.assign({}, state, {
        errorMessage: action.actionData.errorMessage
      });
    case STATE_SYNCUP_DISMISSED:
      return { ...state, syncUpRejected: true };
    case STATE_SYNCUP_DISMISS_COMPLETE:
      return {
        ...state,
        syncUpRejected: false,
        syncUpAccepted: false
      };
    case STATE_LOGOUT_DISMISS_TO_SYNC:
      return { ...state, syncUpAccepted: true };
    case STATE_SYNCUP_LOG_LOADED:
      return { ...state, historyData: state.historyData.concat(action.actionData) };
    default:
      return state;
  }
}
