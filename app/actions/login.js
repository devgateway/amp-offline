// @flow
import auth from '../modules/security/Auth'
import urlUtils from '../utils/urlUtils'

export const STATE_LOGIN_OK = 'STATE_LOGIN_OK';
export const STATE_LOGIN_FAIL = 'STATE_LOGIN_FAIL';
export const STATE_LOGOUT = 'STATE_LOGOUT';
export const STATE_LOGIN_PROCESSING = 'STATE_LOGIN_PROCESSING';

export function loginAction(email, password) {
  return (dispatch) => {
    console.log('loginAction');
    auth.login(email, password, (success, data) => {
      if (success === true) {
        // Return the action object that will be dispatched on redux (it can be done manually with dispatch() too).
        dispatch(loginOk(data));
        // Tell react-router to move to another page.
        urlUtils.forwardTo('/workspace'); //TODO: use a constants file for all urls.
      } else {
        dispatch(loginFailed(data));
      }
    });

    dispatch(sendingRequest());
  }
}

export function loginOk(data) {
  console.log('Login OK: ' + JSON.stringify(data));
  return {
    type: STATE_LOGIN_OK,
    actionData: data
  };
}

export function loginFailed(err) {
  console.log('Login Fail: ' + err);
  return {
    type: STATE_LOGIN_FAIL,
    actionData: {errorMessage: err}
  };
}

export function sendingRequest() {
  console.log('Login processing...');
  return {
    type: STATE_LOGIN_PROCESSING
  }
}

export function logoutAction() {
  console.log('actions/login.js - logout()');
  return {
    type: STATE_LOGOUT
  };
}
