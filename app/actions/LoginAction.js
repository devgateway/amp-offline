// @flow
import UrlUtils from '../utils/URLUtils'
import {WORKSPACE_URL} from '../utils/Constants';
import LoginManager from '../modules/security/LoginManager';

export const STATE_LOGIN_OK = 'STATE_LOGIN_OK';
export const STATE_LOGIN_FAIL = 'STATE_LOGIN_FAIL';
export const STATE_LOGOUT = 'STATE_LOGOUT';
export const STATE_LOGIN_PROCESSING = 'STATE_LOGIN_PROCESSING';

export function loginAction(email, password) {
  console.log('loginAction');
  return (dispatch) => {
    LoginManager.processLogin(email, password).then(function (data) {
      // Return the action object that will be dispatched on redux (it can be done manually with dispatch() too).
      dispatch(loginOk(data));
      // Tell react-router to move to another page.
      UrlUtils.forwardTo(WORKSPACE_URL);
    }).catch(function (err) {
      dispatch(loginFailed(err));
    });
    dispatch(sendingRequest());
  };
}

function loginOk(data) {
  console.log('Login OK: ' + JSON.stringify(data));
  return {
    type: STATE_LOGIN_OK,
    actionData: data
  };
}

function loginFailed(err) {
  console.log('Login Fail: ' + err);
  return {
    type: STATE_LOGIN_FAIL,
    actionData: {errorMessage: err}
  };
}

function sendingRequest() {
  console.log('sendingRequest');
  return {
    type: STATE_LOGIN_PROCESSING
  }
}

export function logoutAction() {
  console.log('logoutAction');
  return {
    type: STATE_LOGOUT
  };
}
