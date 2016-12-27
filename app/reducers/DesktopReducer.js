// @flow
import {
  STATE_DESKTOP_LOADED,
  STATE_DESKTOP_LOADING
} from '../actions/DesktopAction';

const defaultState = {
  errorMessage: '',
  isLoadingDesktop: false
};

export default function loadDesktop(state = defaultState, action: Object) {

  console.log('loadDesktopReducer');

  switch (action.type) {
    case STATE_DESKTOP_LOADED:
      return Object.assign({}, state, {isLoadingDesktop: false});
      break;
    case STATE_DESKTOP_LOADING:
      return Object.assign({}, state, {isLoadingDesktop: true});
      break;
    default:
      console.log('default state: ' + action.type);
      return state;
  }
}
