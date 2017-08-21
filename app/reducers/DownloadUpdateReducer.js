import {
  STATE_DOWNLOAD_UPDATE_PENDING,
  STATE_DOWNLOAD_UPDATE_FULFILLED,
  STATE_DOWNLOAD_UPDATE_REJECTED,
  STATE_UPDATE_STARTED,
  STATE_UPDATE_FAILED
} from '../actions/DownloadUpdateAction';
import LoggerManager from '../modules/util/LoggerManager';

const defaultState = {
  errorMessage: '',
  downloadingUpdate: false,
  downloadedUpdate: false,
  fullUpdateFileName: '',
  installingUpdate: false,
  installUpdateFailed: false
};

export default function downloadUpdateReducer(state: Object = defaultState, action: Object) {
  LoggerManager.log('downloadUpdateReducer');
  switch (action.type) {
    case STATE_DOWNLOAD_UPDATE_PENDING:
      return Object.assign({}, state, {
        downloadingUpdate: true,
        downloadedUpdate: false,
        errorMessage: '',
        fullUpdateFileName: ''
      });
    case STATE_DOWNLOAD_UPDATE_FULFILLED:
      return Object.assign({}, state, {
        downloadingUpdate: false,
        downloadedUpdate: true,
        errorMessage: '',
        fullUpdateFileName: action.payload
      });
    case STATE_DOWNLOAD_UPDATE_REJECTED:
      return Object.assign({}, state, {
        downloadingUpdate: false,
        downloadedUpdate: false,
        errorMessage: action.payload,
        fullUpdateFileName: ''
      });
    case STATE_UPDATE_STARTED:
      return Object.assign({}, state, {
        installingUpdate: true,
        installUpdateFailed: false,
        errorMessage: ''
      });
    case STATE_UPDATE_FAILED:
      return Object.assign({}, state, {
        installingUpdate: false,
        installUpdateFailed: true,
        errorMessage: action.message
      });
    default:
      return state;
  }
}
