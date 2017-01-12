import {STATE_PARAMETERS_LOADING, STATE_PARAMETERS_LOADED, STATE_PARAMETERS_FAILED} from '../actions/StartUpAction';

const defaultState = {
  connectionInformation: undefined,
  loadingInProgress: false
};

export default function startUp(state = defaultState, action: Object) {
  console.log('startUpReducer');

  switch (action.type) {
    case STATE_PARAMETERS_LOADED:
      return Object.assign({}, state, {
        connectionInformation: action.actionData.connectionInformation,
        loadingInProgress: false
      });
    case STATE_PARAMETERS_LOADING:
      return Object.assign({}, state, {loadingInProgress: true});
    case STATE_PARAMETERS_FAILED:
      return Object.assign({}, state, {error: action.error, loadingInProgress: false});
    default:
      return state;
  }
}
