/* eslint flowtype-errors/show-errors: 0 */
import store from '../index';
import UrlUtils from '../utils/URLUtils';
import { LOGIN_URL, SYNCUP_REDIRECT_URL } from '../utils/Constants';
import LoginManager from '../modules/security/LoginManager';
import ActivitiesPushToAMPManager from '../modules/syncup/syncupManagers/ActivitiesPushToAMPManager';
import { checkIfToForceSyncUp } from './SyncUpAction';
import { ampOfflineInit } from './StartUpAction';
import * as RequestConfig from '../modules/connectivity/RequestConfig';
import Logger from '../modules/util/LoggerManager';
import { isMandatoryUpdate, STATE_CHECK_FOR_UPDATES } from './UpdateAction';
import * as AAC from '../modules/connectivity/AmpApiConstants';
import { loadWorkspaces } from './WorkspaceAction';

export const STATE_LOGIN_OK = 'STATE_LOGIN_OK';
export const STATE_LOGIN_FAIL = 'STATE_LOGIN_FAIL';
export const STATE_LOGIN_PROCESSING = 'STATE_LOGIN_PROCESSING';
export const STATE_LOGOUT_REQUESTED = 'STATE_LOGOUT_REQUESTED';
export const STATE_LOGOUT_ASK_TO_SYNC = 'STATE_LOGOUT_ASK_TO_SYNC';
export const STATE_LOGOUT_DISMISS_TO_SYNC = 'STATE_LOGOUT_DISMISS_TO_SYNC';
export const STATE_LOGOUT_DISMISS = 'STATE_LOGOUT_DISMISS';
export const STATE_LOGOUT = 'STATE_LOGOUT';
export const STATE_CHANGE_PASSWORD_ONLINE = 'STATE_CHANGE_PASSWORD_ONLINE';
export const STATE_RESET_PASSWORD_ONLINE = 'STATE_RESET_PASSWORD_ONLINE';

const logger = new Logger('Login action');

export function loginAction(email: string, password: string) {
  logger.log('loginAction');
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
        dispatch(loadWorkspaces());
        return checkIfToForceSyncUp().then(() => UrlUtils.forwardTo(SYNCUP_REDIRECT_URL));
      }).catch((err) => {
        dispatch(loginFailed(err));
      });
    }
  };
}

export function loginAutomaticallyAction() {
  logger.log('loginAutomaticallyAction');
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
  logger.log('loginOk');
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
  logger.log('loginFailed');
  return {
    type: STATE_LOGIN_FAIL,
    actionData: { errorMessage: err }
  };
}

function sendingRequest() {
  logger.log('sendingRequest');
  return {
    type: STATE_LOGIN_PROCESSING
  };
}

export function checkIfShouldSyncBeforeLogout() {
  return ActivitiesPushToAMPManager.getActivitiesToPush().then(activities => {
    const askToSync = activities && activities.length > 0;
    store.dispatch({ type: STATE_LOGOUT_ASK_TO_SYNC, actionData: { askToSync } });
    return activities;
  }).catch(error => logger.error(error));
}

export function logoutAction(isInactivityTimeout = false, dispatch = store.dispatch) {
  logger.log('logoutAction');
  RequestConfig.clearCookies();
  dispatch({
    type: STATE_LOGOUT,
    actionData: { isInactivityTimeout }
  });
  UrlUtils.forwardTo(LOGIN_URL);
  return ampOfflineInit(true);
}

export function changePasswordOnline() {
  return (dispatch) => {
    logger.log('changePasswordOnline');
    UrlUtils.redirectExternalLink('GET', AAC.CHANGE_PASSWORD_URL);
    dispatch({ type: STATE_CHANGE_PASSWORD_ONLINE });
  };
}

export function resetPasswordOnline() {
  return (dispatch) => {
    logger.log('resetPasswordOnline');
    UrlUtils.redirectExternalLink('GET', AAC.RESET_PASSWORD_URL);
    dispatch({ type: STATE_RESET_PASSWORD_ONLINE });
  };
}
