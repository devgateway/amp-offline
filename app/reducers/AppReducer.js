import * as AppAction from '../actions/AppAction';

const defaultState = {
  pathToNavigate: undefined,
};

export default function appReducer(state = defaultState, action: Object) {
  switch (action.type) {
    case AppAction.STATE_GO_TO_PATH:
      return { ...state, pathToNavigate: action.actionData };
    case AppAction.STATE_GO_TO_PATH_DONE:
      return { ...state, pathToNavigate: null };
    default:
      return state;
  }
}
