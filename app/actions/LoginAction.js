/* eslint flowtype-errors/show-errors: 0 */
import store from '../index';
import UrlUtils from '../utils/URLUtils';
import { LOGIN_URL, SYNCUP_URL } from '../utils/Constants';
import LoginManager from '../modules/security/LoginManager';
import ActivitiesPushToAMPManager from '../modules/syncup/syncupManagers/ActivitiesPushToAMPManager';
import { checkIfToForceSyncUp } from './SyncUpAction';
import { ampOfflineInit } from './StartUpAction';
import * as RequestConfig from '../modules/connectivity/RequestConfig';
import LoggerManager from '../modules/util/LoggerManager';
import { isMandatoryUpdate, STATE_CHECK_FOR_UPDATES } from './UpdateAction';

export const STATE_LOGIN_OK = 'STATE_LOGIN_OK';
export const STATE_LOGIN_FAIL = 'STATE_LOGIN_FAIL';
export const STATE_LOGIN_PROCESSING = 'STATE_LOGIN_PROCESSING';
export const STATE_LOGOUT_REQUESTED = 'STATE_LOGOUT_REQUESTED';
export const STATE_LOGOUT_ASK_TO_SYNC = 'STATE_LOGOUT_ASK_TO_SYNC';
export const STATE_LOGOUT_DISMISS_TO_SYNC = 'STATE_LOGOUT_DISMISS_TO_SYNC';
export const STATE_LOGOUT_DISMISS = 'STATE_LOGOUT_DISMISS';
export const STATE_LOGOUT = 'STATE_LOGOUT';

export function loginAction(email: string, password: string) {
  LoggerManager.log('loginAction');
  return (dispatch, ownProps) => {
    if (isMandatoryUpdate()) {
      dispatch({ type: STATE_CHECK_FOR_UPDATES });
    } else if (ownProps().loginReducer.loginProcessing === false) {
      dispatch(sendingRequest());
      const isAmpAvailable = (ownProps().ampConnectionStatusReducer.status
        && ownProps().ampConnectionStatusReducer.status.isAmpAvailable);
      return LoginManager.processLogin(email, password, isAmpAvailable).then((data) => {
        const userData = data.dbUser;
        const token = data.token;
        // Return the action object that will be dispatched on redux (it can be done manually with dispatch() too).
        dispatch(loginOk({ userData, password, token }));
        return checkIfToForceSyncUp().then(() => UrlUtils.forwardTo(SYNCUP_URL));
      }).catch((err) => {
        dispatch(loginFailed(err));
      });
    }
  };
}

export function loginAutomaticallyAction() {
  LoggerManager.log('loginAutomaticallyAction');
  return (dispatch, ownProps) => new Promise((resolve, reject) => {
    dispatch(sendingRequest());
    const email = ownProps().userReducer.userData.email;
    const password = ownProps().loginReducer.plainPassword;
    return LoginManager.processOnlineLogin(email, password).then((data) => {
      const userData = data.dbUser;
      const token = data.token;
      dispatch(loginOk({ userData, password, token }));
      return resolve(data);
    }).catch((err) => {
      dispatch(loginFailed(err));
      logoutAction();
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

export function checkIfShouldSyncBeforeLogout() {
  return ActivitiesPushToAMPManager.getActivitiesToPush().then(activities => {
    const askToSync = activities && activities.length > 0;
    store.dispatch({ type: STATE_LOGOUT_ASK_TO_SYNC, actionData: { askToSync } });
    return activities;
  }).catch(error => LoggerManager.error(error));
}

export function logoutAction(isInactivityTimeout = false, dispatch = store.dispatch) {
  LoggerManager.log('logoutAction');
  RequestConfig.clearCookies();
  dispatch({
    type: STATE_LOGOUT,
    actionData: { isInactivityTimeout }
  });
  UrlUtils.forwardTo(LOGIN_URL);
  return ampOfflineInit();
}

export function changePasswordOnline() {
  LoggerManager.log('changePasswordOnline');
  alert('changePasswordOnline');
}

export function solveLoginProblemsOnline() {
  LoggerManager.log('solveLoginProblemsOnline');
  alert('solveLoginProblemsOnline');
}
