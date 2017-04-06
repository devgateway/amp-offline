/* eslint flowtype-errors/show-errors: 0 */
import UrlUtils from '../utils/URLUtils';
import { WORKSPACE_URL, LOGIN_URL, SYNCUP_URL } from '../utils/Constants';
import LoginManager from '../modules/security/LoginManager';
import { isForceSyncUpAction } from './SyncUpAction';
import LoggerManager from '../modules/util/LoggerManager';

export const STATE_LOGIN_OK = 'STATE_LOGIN_OK';
export const STATE_LOGIN_FAIL = 'STATE_LOGIN_FAIL';
export const STATE_LOGIN_PROCESSING = 'STATE_LOGIN_PROCESSING';
export const STATE_LOGOUT = 'STATE_LOGOUT';

export function loginAction(email: string, password: string) {
  LoggerManager.log('loginAction');
  return (dispatch, ownProps) => {
    if (ownProps().login.loginProcessing === false) {
      const isAmpAvailable = ownProps().ampConnectionStatus.status.isAmpAvailable;
      return LoginManager.processLogin(email, password, isAmpAvailable).then((data) => {
        const userData = data.dbUser;
        const token = data.token;
        // Return the action object that will be dispatched on redux (it can be done manually with dispatch() too).
        dispatch(loginOk({ userData, password, token }));

        // Tell react-router to move to another page.
        return dispatch(isForceSyncUpAction((force) => {
          if (force) {
            return UrlUtils.forwardTo(SYNCUP_URL);
          } else {
            return UrlUtils.forwardTo(WORKSPACE_URL);
          }
        }));
      }).catch((err) => {
        dispatch(loginFailed(err));
      });
    }
    dispatch(sendingRequest());
  };
}

export function logoutAction() {
  LoggerManager.log('logoutAction');
  return (dispatch) => {
    dispatch(logout());
    UrlUtils.forwardTo(LOGIN_URL);
  };
}

export function loginAutomaticallyAction() {
  LoggerManager.log('loginAutomaticallyAction');
  return (dispatch, ownProps) => new Promise((resolve, reject) => {
    dispatch(sendingRequest());
    const email = ownProps().user.userData.email;
    const password = ownProps().login.plainPassword;
    return LoginManager.processOnlineLogin(email, password).then((data) => {
      const userData = data.dbUser;
      const token = data.token;
      dispatch(loginOk({ userData, password, token }));
      return resolve(data);
    }).catch((err) => {
      dispatch(loginFailed(err));
      dispatch(logoutAction());
      reject(err);
    });
  });
}

/**
 * Register successful login user data
 * @returns {{type: string, actionData: {userData: *, plainPassword: *, token: *}}}
 */
function loginOk({ userData, password, token }) {
  LoggerManager.log('loginOk');
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
  LoggerManager.log('loginFailed');
  return {
    type: STATE_LOGIN_FAIL,
    actionData: { errorMessage: err }
  };
}

function sendingRequest() {
  LoggerManager.log('sendingRequest');
  return {
    type: STATE_LOGIN_PROCESSING
  };
}

export function logout() {
  LoggerManager.log('logoutAction');
  return {
    type: STATE_LOGOUT
  };
}
