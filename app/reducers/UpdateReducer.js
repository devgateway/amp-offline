import {
  STATE_CHECK_FOR_UPDATES,
  STATE_DOWNLOAD_UPDATE_CONFIRMATION_PENDING,
  STATE_DOWNLOAD_UPDATE_CONFIRMED,
  STATE_DOWNLOAD_UPDATE_DISMISSED,
  STATE_DOWNLOAD_UPDATE_PENDING
} from '../actions/UpdateAction';
import { STATE_LOGOUT_REQUESTED } from '../actions/LoginAction';
import { STATE_AMP_CONNECTION_STATUS_UPDATE } from '../actions/ConnectivityAction';

const defaultState = {
  proceedToUpdateDownload: false,
  confirmationPending: false,
  updatePending: false,
  newUpdateToCheck: false,
  updateInProgress: false
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
    case STATE_DOWNLOAD_UPDATE_PENDING:
      return { ...state, proceedToUpdateDownload: false, updatePending: true };
    default:
      return state;
  }
}
