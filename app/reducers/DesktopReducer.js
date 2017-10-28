import {
  STATE_DESKTOP_LOADED,
  STATE_DESKTOP_LOADING,
  STATE_DESKTOP_ERROR,
  STATE_DESKTOP_RESET
} from '../actions/DesktopAction';
import Logger from '../modules/util/LoggerManager';

const logger = new Logger('Desktop reducer');

const defaultState = {
  errorMessage: '',
  isLoadingDesktop: false,
  loaded: false,
  activeProjects: [],
  rejectedProjects: [],
  tabsData: []
};

export default function desktopReducer(state = defaultState, action: Object) {
  logger.log('desktopReducer');
  switch (action.type) {
    case STATE_DESKTOP_LOADED:
      return Object.assign({}, state, {
        isLoadingDesktop: false,
        loaded: true,
        activeProjects: action.actionData.activeProjects,
        rejectedProjects: action.actionData.rejectedProjects,
        tabsData: action.actionData.tabs
      });
    case STATE_DESKTOP_LOADING:
      return Object.assign({}, defaultState, { isLoadingDesktop: true });
    case STATE_DESKTOP_ERROR:
      return Object.assign({}, defaultState, {
        errorMessage: action.errorMessage
      });
    case STATE_DESKTOP_RESET:
      return Object.assign({}, defaultState);
    default:
      return state;
  }
}
