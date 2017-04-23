import {
  STATE_PARAMETERS_LOADING,
  STATE_PARAMETERS_LOADED,
  STATE_PARAMETERS_FAILED,
  STATE_GS_NUMBERS_LOADED
} from '../actions/StartUpAction';
import LoggerManager from '../modules/util/LoggerManager';

const defaultState = {
  connectionInformation: undefined,
  loadingInProgress: false,
  gsNumberData: undefined
};

export default function startUp(state = defaultState, action: Object) {
  LoggerManager.log('startUpReducer');

  switch (action.type) {
    case STATE_PARAMETERS_LOADED:
      return Object.assign({}, state, {
        connectionInformation: action.actionData.connectionInformation,
        loadingInProgress: false
      });
    case STATE_PARAMETERS_LOADING:
      return Object.assign({}, state, { loadingInProgress: true });
    case STATE_PARAMETERS_FAILED:
      return Object.assign({}, state, { error: action.error, loadingInProgress: false });
    case STATE_GS_NUMBERS_LOADED:
      return Object.assign({}, state, { error: action.error, gsNumberData: action.actionData });
    default:
      return state;
  }
}
