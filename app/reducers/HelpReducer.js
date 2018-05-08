import { STATE_HELP_WINDOW_CLOSED, STATE_HELP_WINDOW_OPEN } from '../actions/HelpAction';
import Logger from '../modules/util/LoggerManager';

const logger = new Logger('Help reducer');

const defaultState = {
  open: false
};

export default function helpReducer(state = defaultState, action: Object) {
  logger.debug('desktopReducer');
  switch (action.type) {
    case STATE_HELP_WINDOW_OPEN:
      return Object.assign({}, state, { open: true });
    case STATE_HELP_WINDOW_CLOSED:
      return Object.assign({}, state, { open: false });
    default:
      return state;
  }
}
