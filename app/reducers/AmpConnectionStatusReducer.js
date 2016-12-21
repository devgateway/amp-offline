export const STATE_AMP_CONNECTION_STATUS_UPDATE = 'STATE_AMP_CONNECTION_STATUS_UPDATE';

const defaultState = {
  ampConnectionStatus: undefined
};

export default function ampConnectionStatus(state = defaultState, action: Object) {
  console.log('AmpConnectionStatusReducer');

  switch (action.type) {
    case STATE_AMP_CONNECTION_STATUS_UPDATE:
      return Object.assign({}, state, {ampConnectionStatus: action.actionData});
    default:
      console.log('default state: ' + action.type);
      return state;
  }
}
