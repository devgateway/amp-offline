/* eslint flowtype-errors/show-errors: 0 */
import UrlUtils from '../utils/URLUtils';
import { WORKSPACE_URL, LOGIN_URL, SYNCUP_FORCE_DAYS, SYNCUP_URL } from '../utils/Constants';
import LoginManager from '../modules/security/LoginManager';
import store from '../index';
import SyncUpManager from '../modules/syncup/SyncUpManager';

export const STATE_LOGIN_OK = 'STATE_LOGIN_OK';
export const STATE_LOGIN_FAIL = 'STATE_LOGIN_FAIL';
export const STATE_LOGIN_PROCESSING = 'STATE_LOGIN_PROCESSING';
export const STATE_LOGOUT = 'STATE_LOGOUT';

export function loginAction(email: string, password: string) {
  console.log('loginAction');
  return (dispatch) => {
    if (store.getState().login.loginProcessing === false) {
      return LoginManager.processLogin(email, password).then((data) => {
        const userData = data.dbUser;
        const token = data.token;
        // Return the action object that will be dispatched on redux (it can be done manually with dispatch() too).
        dispatch(loginOk({ userData, password, token }));

        // Tell react-router to move to another page.
        return SyncUpManager.getLastSyncInDays().then(days => { // TODO: mover a LoginManager o dispachear SyncUpAction para tener los dias en redux.
          if (days > SYNCUP_FORCE_DAYS) {
            return UrlUtils.forwardTo(SYNCUP_URL);
          } else {
            return UrlUtils.forwardTo(WORKSPACE_URL);
          }
        });
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
  return dispatch => new Promise((resolve, reject) => {
    dispatch(sendingRequest());
    const email = store.getState().user.userData.email;
    const password = store.getState().login.plainPassword;
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
