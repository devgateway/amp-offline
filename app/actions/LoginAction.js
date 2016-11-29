// @flow
import Auth from '../modules/security/Auth'
import urlUtils from '../utils/URLUtils'
import {WORKSPACE_URL} from '../utils/Constants';
import LoginManager from '../modules/security/LoginManager';

export const STATE_LOGIN_OK = 'STATE_LOGIN_OK';
export const STATE_LOGIN_FAIL = 'STATE_LOGIN_FAIL';
export const STATE_LOGOUT = 'STATE_LOGOUT';
export const STATE_LOGIN_PROCESSING = 'STATE_LOGIN_PROCESSING';

export function loginAction(email, password) {
  console.log('loginAction');
  return (dispatch) => {
    Auth.login(email, password, (success, data) => {
      if (success === true) {
        // Save user info for later usage, encrypt if possible.
        LoginManager.registerLogin(data).then(function () {
          // Return the action object that will be dispatched on redux (it can be done manually with dispatch() too).
          dispatch(loginOk(data));
          // Tell react-router to move to another page.
          urlUtils.forwardTo(WORKSPACE_URL);
        }).catch(function (err) {
          console.error(err);
          dispatch(loginFailed(err));
        });
      } else {
        dispatch(loginFailed(data));
      }
    });

    dispatch(sendingRequest());
  }
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
