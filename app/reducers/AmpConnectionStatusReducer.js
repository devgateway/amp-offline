import { STATE_AMP_CONNECTION_STATUS_UPDATE,
  STATE_AMP_CONNECTION_STATUS_UPDATE_PENDING } from '../actions/ConnectivityAction';

const defaultState = {
  status: undefined,
  updateInProgress: true
};

export default function ampConnectionStatus(state = defaultState, action: Object) {
  console.log('AmpConnectionStatusReducer');

  switch (action.type) {
    case STATE_AMP_CONNECTION_STATUS_UPDATE:
      return Object.assign({}, state, { status: action.actionData, updateInProgress: false });
    case STATE_AMP_CONNECTION_STATUS_UPDATE_PENDING:
      return Object.assign({}, state, { updateInProgress: true });
    default:
      return state;
  }
}
