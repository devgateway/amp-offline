// @flow
import UrlUtils from '../utils/URLUtils';
import { WORKSPACE_URL, LOGIN_URL } from '../utils/Constants';
import LoginManager from '../modules/security/LoginManager';

export const STATE_LOGIN_OK = 'STATE_LOGIN_OK';
export const STATE_LOGIN_FAIL = 'STATE_LOGIN_FAIL';
export const STATE_LOGIN_PROCESSING = 'STATE_LOGIN_PROCESSING';
export const STATE_LOGOUT = 'STATE_LOGOUT';

export function loginAction(email: string, password: string) {
  console.log('loginAction');
  return (dispatch,ownProps) => {
    debugger;
    if (ownProps().login.loginProcessing === false) {
      return LoginManager.processLogin(email, password,ownProps().ampConnectionStatus.status.isAmpAvailable).then((data) => {
        const userData = data.dbUser;
        const token = data.token;
        // Return the action object that will be dispatched on redux (it can be done manually with dispatch() too).
        dispatch(loginOk({ userData, password, token }));
        // Tell react-router to move to another page.
        return UrlUtils.forwardTo(WORKSPACE_URL);
      }).catch((err) => {
        dispatch(loginFailed(err));
      });
    }
    dispatch(sendingRequest());
  };
}

export function logoutAction() {
  console.log('logoutAction');
  return (dispatch) => {
    dispatch(logout());
    UrlUtils.forwardTo(LOGIN_URL);
  };
}

export function loginAutomaticallyAction() {
  console.log('loginAutomaticallyAction');
  return (dispatch,ownProps) => new Promise((resolve, reject) => {
    debugger;
    dispatch(sendingRequest());
    const email = ownProps.user.userData.email;
    const password = ownProps.login.plainPassword;
    return LoginManager.processOnlineLogin(email, password).then((data) => {
      const userData = data.dbUser;
      const token = data.token;
      dispatch(loginOk({ userData, password, token }));
      return resolve(data);
    }).catch(reject);
  });
}

/**
 * Register successful login user data
 * @returns {{type: string, actionData: {userData: *, plainPassword: *, token: *}}}
 */
function loginOk({ userData, password, token }) {
  console.log('loginOk');
  const loginData = {
    userData,
    password,
    token
  };
  return {
    type: STATE_LOGIN_OK,
    actionData: loginData
  };
}

function loginFailed(err) {
  console.log('loginFailed');
  return {
    type: STATE_LOGIN_FAIL,
    actionData: { errorMessage: err }
  };
}

function sendingRequest() {
  console.log('sendingRequest');
  return {
    type: STATE_LOGIN_PROCESSING
  };
}

export function logout() {
  console.log('logoutAction');
  return {
    type: STATE_LOGOUT
  };
}
