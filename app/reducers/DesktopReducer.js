import {
  STATE_DESKTOP_LOADED,
  STATE_DESKTOP_LOADING,
  STATE_DESKTOP_ERROR
} from '../actions/DesktopAction';

const defaultState = {
  errorMessage: '',
  isLoadingDesktop: false,
  loaded: false,
  activeProjects: [],
  rejectedProjects: [],
  tabsData: []
};

export default function desktop(state = defaultState, action: Object) {
  console.log('desktop');
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
    default:
      return state;
  }
}
