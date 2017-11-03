import ClientSettingsManager from '../modules/settings/ClientSettingsManager';
import * as ClientSettingsHelper from '../modules/helpers/ClientSettingsHelper';
import * as CSC from '../utils/constants/ClientSettingsConstants';
import { configureAndTestConnectivity } from './SetupAction';
import Notification from '../modules/helpers/NotificationHelper';
import {
  NOTIFICATION_ORIGIN_SETTINGS, NOTIFICATION_SEVERITY_ERROR,
  NOTIFICATION_SEVERITY_INFO
} from '../utils/constants/ErrorConstants';
import translate from '../utils/translate';
import Logger from '../modules/util/LoggerManager';
import { addMessage } from './NotificationAction';

const STATE_LOAD_SETTINGS = 'STATE_LOAD_SETTINGS';
export const STATE_LOAD_SETTINGS_PENDING = 'STATE_LOAD_SETTINGS_PENDING';
export const STATE_LOAD_SETTINGS_FULFILLED = 'STATE_LOAD_SETTINGS_FULFILLED';
export const STATE_LOAD_SETTINGS_REJECTED = 'STATE_LOAD_SETTINGS_REJECTED';
const STATE_SAVE_SETTINGS = 'STATE_SAVE_SETTINGS';
export const STATE_SAVE_SETTINGS_PENDING = 'STATE_SAVE_SETTINGS_PENDING';
export const STATE_SAVE_SETTINGS_FULFILLED = 'STATE_SAVE_SETTINGS_FULFILLED';
export const STATE_SAVE_SETTINGS_REJECTED = 'STATE_SAVE_SETTINGS_REJECTED';

const logger = new Logger('Settings Action');

/**
 * Loads settings to be displayed in the Settings Page
 * @return {function(*, *): *}
 */
export function loadSettings() {
  return (dispatch, ownProps) => dispatch({
    type: STATE_LOAD_SETTINGS,
    payload: ClientSettingsManager.getVisibleSettings(!ownProps().loginReducer.loggedIn)
  });
}

export function saveSettings(settings) {
  logger.log('saveSettings');
  const promise = ClientSettingsHelper.saveOrUpdateCollection(settings).then((result) => {
    const setupSetting = settings.find(setting => setting.id === CSC.SETUP_CONFIG);
    logger.log('Configure the latest setup for connectivity');
    configureAndTestConnectivity(setupSetting.value);
    return result;
  });
  return (dispatch) => {
    promise
      .then(() => dispatch(saveConfirmation(true)))
      .catch((error) => dispatch(saveConfirmation(false, error)));
    return dispatch({
      type: STATE_SAVE_SETTINGS,
      payload: promise
    });
  };
}

function saveConfirmation(isSuccess, error) {
  logger.debug('saveConfirmation');
  const severity = isSuccess ? NOTIFICATION_SEVERITY_INFO : NOTIFICATION_SEVERITY_ERROR;
  const message = `${translate(isSuccess ? 'settingsSaveSuccess' : 'settingsSaveError')}`;
  const logFunc = isSuccess ? logger.log : logger.error;
  logFunc(`${message}: ${error || 'no error'}`);
  const notification = new Notification({ message, severity, origin: NOTIFICATION_ORIGIN_SETTINGS });
  return (dispatch) => dispatch(addMessage(notification));
}
