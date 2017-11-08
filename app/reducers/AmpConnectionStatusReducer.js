import { STATE_AMP_CONNECTION_STATUS_UPDATE,
  STATE_AMP_CONNECTION_STATUS_UPDATE_PENDING } from '../actions/ConnectivityAction';
import Logger from '../modules/util/LoggerManager';

const logger = new Logger('AMP Connection status reducer');

const defaultState = {
  status: undefined,
  updateInProgress: false
};

export default function ampConnectionStatusReducer(state = defaultState, action: Object) {
  logger.debug('AmpConnectionStatusReducer');

  switch (action.type) {
    case STATE_AMP_CONNECTION_STATUS_UPDATE:
      return Object.assign({}, state, { status: action.actionData, updateInProgress: false });
    case STATE_AMP_CONNECTION_STATUS_UPDATE_PENDING:
      return Object.assign({}, state, { updateInProgress: true });
    default:
      return state;
  }
}
