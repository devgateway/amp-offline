import { STATE_OPEN_HELP_WINDOW } from '../actions/HelpAction';
import Logger from '../modules/util/LoggerManager';

const logger = new Logger('Help reducer');

const defaultState = {};

export default function helpReducer(state = defaultState, action: Object) {
  logger.debug('desktopReducer');
  switch (action.type) {
    case STATE_OPEN_HELP_WINDOW:
      return Object.assign({}, state, {});
    default:
      return state;
  }
}
