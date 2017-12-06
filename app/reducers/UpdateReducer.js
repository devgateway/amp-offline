import {
  STATE_CHECK_FOR_UPDATES,
  STATE_DOWNLOAD_UPDATE_CONFIRMATION_PENDING,
  STATE_DOWNLOAD_UPDATE_CONFIRMED,
  STATE_DOWNLOAD_UPDATE_DISMISSED,
  STATE_DOWNLOAD_UPDATE_FULFILLED,
  STATE_DOWNLOAD_UPDATE_PENDING,
  STATE_DOWNLOAD_UPDATE_REJECTED,
  STATE_LAST_UPDATE_DATA_FULFILLED,
  STATE_LAST_UPDATE_DATA_PENDING,
  STATE_LAST_UPDATE_DATA_REJECTED,
  STATE_UPDATE_FAILED,
  STATE_UPDATE_PENDING,
  STATE_UPDATE_PROGRESS_DETAILS,
  STATE_UPDATE_STARTED
} from '../actions/UpdateAction';
import { STATE_LOGOUT_REQUESTED } from '../actions/LoginAction';
import { STATE_AMP_CONNECTION_STATUS_UPDATE } from '../actions/ConnectivityAction';

const defaultState = {
  proceedToUpdateDownload: false,
  confirmationPending: false,
  updatePending: false,
  newUpdateToCheck: false,
  updateInProgress: false,
  errorMessage: undefined,
  downloadingUpdate: false,
  downloadedUpdate: false,
  progressData: undefined,
  fullUpdateFileName: undefined,
  installingUpdate: false,
  installUpdateFailed: false
};

export default function updateReducer(state = defaultState, action: Object) {
  switch (action.type) {
    case STATE_CHECK_FOR_UPDATES:
    case STATE_AMP_CONNECTION_STATUS_UPDATE:
      return { ...state, newUpdateToCheck: true };
    case STATE_DOWNLOAD_UPDATE_CONFIRMATION_PENDING:
      return { ...state, confirmationPending: true };
    case STATE_DOWNLOAD_UPDATE_CONFIRMED:
      return {
        ...state,
        proceedToUpdateDownload: true,
        updatePending: true,
        confirmationPending: false,
        newUpdateToCheck: false
      };
    case STATE_DOWNLOAD_UPDATE_DISMISSED:
    case STATE_LOGOUT_REQUESTED:
      return { ...defaultState };
    case STATE_UPDATE_PENDING:
      return { ...state, proceedToUpdateDownload: false, updatePending: true };
    case STATE_DOWNLOAD_UPDATE_PENDING:
      return Object.assign({}, state, {
        downloadingUpdate: true,
        downloadedUpdate: false,
        errorMessage: undefined,
        fullUpdateFileName: undefined
      });
    case STATE_DOWNLOAD_UPDATE_FULFILLED:
      return Object.assign({}, state, {
        downloadingUpdate: false,
        downloadedUpdate: true,
        errorMessage: undefined,
        fullUpdateFileName: action.payload
      });
    case STATE_DOWNLOAD_UPDATE_REJECTED:
      return Object.assign({}, state, {
        downloadingUpdate: false,
        downloadedUpdate: false,
        errorMessage: action.payload,
        fullUpdateFileName: undefined
      });
    case STATE_LAST_UPDATE_DATA_PENDING:
      return { ...state };
    case STATE_LAST_UPDATE_DATA_FULFILLED:
      return {
        ...state,
        fullUpdateFileName: action.payload.updateInstallerPath
      };
    case STATE_LAST_UPDATE_DATA_REJECTED:
      return {
        ...state,
        errorMessage: action.payload
      };
    case STATE_UPDATE_STARTED:
      return {
        ...state,
        installingUpdate: true,
        installUpdateFailed: false
      };
    case STATE_UPDATE_PROGRESS_DETAILS:
      return {
        ...state,
        progressData: action.actionData
      };
    case STATE_UPDATE_FAILED:
      return {
        ...state,
        installingUpdate: false,
        installUpdateFailed: true,
        errorMessage: action.errorMessage
      };
    default:
      return state;
  }
}
