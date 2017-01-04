// @flow
import UrlUtils from '../utils/URLUtils'
import { WORKSPACE_URL } from '../utils/Constants';
import LoginManager from '../modules/security/LoginManager';

export const STATE_LOGIN_OK = 'STATE_LOGIN_OK';
export const STATE_LOGIN_FAIL = 'STATE_LOGIN_FAIL';
export const STATE_LOGOUT = 'STATE_LOGOUT';
export const STATE_LOGIN_PROCESSING = 'STATE_LOGIN_PROCESSING';

export function loginAction(email, password) {
  console.log('loginAction');
  return (dispatch, ownProps) => {
    if (ownProps().login.loginProcessing === false) {
      LoginManager.processLogin(email, password).then(function (data) {
        const userData = data.dbUser;
        const token = data.token;
        const userName = data.dbUser.email;
        // Return the action object that will be dispatched on redux (it can be done manually with dispatch() too).
        dispatch(loginOk({userData, password, token, userName}));
        // Tell react-router to move to another page.
        UrlUtils.forwardTo(WORKSPACE_URL);
      }).catch(function (err) {
        dispatch(loginFailed(err));
      });
    }
    dispatch(sendingRequest());
  };
}

/**
 * Register successful login user data
 * @returns {{type: string, actionData: {userData: *, plainPassword: *, token: *}}}
 */
function loginOk({userData, password, token, userName}) {
  console.log('Login OK: ' + JSON.stringify(userData));
  let loginData = {
    userData: userData,
    password: password,
    token: token,
    userName: userName
  };
  return {
    type: STATE_LOGIN_OK,
    actionData: loginData
  };
}

function loginFailed(err) {
  console.error('Login Fail: ' + err);
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
