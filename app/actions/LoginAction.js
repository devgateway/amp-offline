// @flow
import UrlUtils from '../utils/URLUtils'
import { WORKSPACE_URL, LOGIN_URL } from '../utils/Constants';
import LoginManager from '../modules/security/LoginManager';
import { store } from '../index';

export const STATE_LOGIN_OK = 'STATE_LOGIN_OK';
export const STATE_LOGIN_FAIL = 'STATE_LOGIN_FAIL';
export const STATE_LOGIN_PROCESSING = 'STATE_LOGIN_PROCESSING';
export const STATE_LOGOUT = 'STATE_LOGOUT';

export function loginAction(email, password) {
  console.log('loginAction');
  return (dispatch, ownProps) => {
    if (store.getState().login.loginProcessing === false) {
      return LoginManager.processLogin(email, password).then(function (data) {
        const userData = data.dbUser;
        const token = data.token;
        // Return the action object that will be dispatched on redux (it can be done manually with dispatch() too).
        dispatch(loginOk({userData, password, token}));
        // Tell react-router to move to another page.
        UrlUtils.forwardTo(WORKSPACE_URL);
      }).catch(function (err) {
        dispatch(loginFailed(err));
      });
    }
    dispatch(sendingRequest());
  };
}

export function logoutAction() {
  console.log('logoutAction');
  return (dispatch, ownProps) => {
    dispatch(logout());
    UrlUtils.forwardTo(LOGIN_URL);
  };
}

export function loginAutomaticallyAction() {
  console.log('loginAutomaticallyAction');
  return dispatch => new Promise((resolve, reject) => {
    dispatch(sendingRequest());
    const email = store.getState().user.userData.email;
    const password = store.getState().login.plainPassword;
    LoginManager.processOnlineLogin(email, password).then(function (data) {
      const userData = data.dbUser;
      const token = data.token;
      resolve(data);
      dispatch(loginOk({userData, password, token}));
    }).catch(reject);
  });
}

/**
 * Register successful login user data
 * @returns {{type: string, actionData: {userData: *, plainPassword: *, token: *}}}
 */
function loginOk({userData, password, token}) {
  console.log('Login OK: ' + JSON.stringify(userData));
  let loginData = {
    userData: userData,
    password: password,
    token: token
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

export function logout() {
  console.log('logoutAction');
  return {
    type: STATE_LOGOUT
  };
}
