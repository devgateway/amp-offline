import { ErrorConstants } from 'amp-ui';
import ConnectivityStatus from '../modules/connectivity/ConnectivityStatus';
import { RESPONSE_CHECK_INTERVAL_MS } from '../modules/connectivity/AmpApiConstants';
import store from '../index';
import Logger from '../modules/util/LoggerManager';
import * as ClientSettingsHelper from '../modules/helpers/ClientSettingsHelper';
import * as CSC from '../utils/constants/ClientSettingsConstants';
import { configureOnLoad } from './SetupAction';
import * as Utils from '../utils/Utils';
import Notification from '../modules/helpers/NotificationHelper';
import translate from '../utils/translate';
import { addFullscreenAlert } from './NotificationAction';
import ConnectionInformation from '../modules/connectivity/ConnectionInformation';
import ConnectivityCheckRunner from '../modules/connectivity/ConnectivityCheckRunner';

export const STATE_AMP_CONNECTION_STATUS_UPDATE = 'STATE_AMP_CONNECTION_STATUS_UPDATE';
export const STATE_AMP_CONNECTION_STATUS_UPDATE_PENDING = 'STATE_AMP_CONNECTION_STATUS_UPDATE_PENDING';
export const STATE_AMP_SERVER_ID_UPDATED = 'STATE_AMP_SERVER_ID_UPDATED';
export const MANDATORY_UPDATE = 'mandatory_update';

export const STATE_PARAMETERS_LOADED = 'STATE_PARAMETERS_LOADED';
export const STATE_PARAMETERS_LOADING = 'STATE_PARAMETERS_LOADING';

const logger = new Logger('Connectivity action');

export function isConnectivityCheckInProgress() {
  return store.getState().ampConnectionStatusReducer.updateInProgress;
}

export function isAmpSuitableForSetupOrUpdate(connectivityStatus: ConnectivityStatus) {
  return isAmpAccessible(connectivityStatus, true);
}

export function isAmpUsableByCurrentClient(connectivityStatus: ConnectivityStatus) {
  return isAmpAccessible(connectivityStatus, false);
}

function isAmpAccessible(connectivityStatus: ConnectivityStatus, isForSetupOrUpdate: boolean) {
  return isValidConnectionByStatus(connectivityStatus, isForSetupOrUpdate) && connectivityStatus.isAmpClientEnabled;
}

export function isValidConnectionByStatus(connectivityStatus: ConnectivityStatus, isForSetupOrUpdate: boolean) {
  return connectivityStatus ? connectivityStatus.isConnectionValid(isForSetupOrUpdate, getRegisteredServerId()) : false;
}

/**
 * @return {String} the server id registered on the client
 */
export function getRegisteredServerId() {
  return store.getState().ampConnectionStatusReducer.serverId;
}

/**
 * Converts connectivity status to NotificationHelper message
 * @param connectivityStatus
 * @param isSetup if true, then during setup some statuses are handled with different messages
 * @return {NotificationHelper}
 */
export function getStatusNotification(connectivityStatus: ConnectivityStatus, isSetup = false) {
  const unavailableLabel = isSetup ? 'urlNotWorking' : 'AMPUnreachableError';
  const registeredServerId = getRegisteredServerId();
  let message = unavailableLabel;
  let details;
  if (!connectivityStatus.isAmpAvailable) {
    message = unavailableLabel;
  } else if (registeredServerId && !connectivityStatus.serverIdMatch) {
    message = 'serverIdentityMismatch';
    details = 'aboutIdentity';
  } else if (!connectivityStatus.serverId) {
    message = 'serverIdentityMissing';
    details = 'aboutIdentity';
  } else if (!connectivityStatus.isAmpCompatible) {
    message = isSetup ? 'ampServerIncompatible' : 'ampServerIncompatibleContinueToUse';
  }
  // TODO custom messages for other use cases (e.g. AMPOFFLINE-100, AMPOFFLINE-1140)
  return new Notification({ message, details });
}

export function configureConnectionInformation(connectionInformation) {
  store.dispatch({
    type: STATE_PARAMETERS_LOADED,
    actionData: { connectionInformation }
  });
  return connectionInformation;
}

export function loadConnectionInformation() {
  logger.log('loadConnectionInformation');
  store.dispatch({ type: STATE_PARAMETERS_LOADING });
  return configureOnLoad();
}

/**
 * Checks and updates the connectivity status
 * @param ci (optional) the connectivity information to use; if missing, the global one will be used
 * @returns ConnectivityStatus
 */
export function connectivityCheck(ci: ConnectionInformation) {
  logger.log('connectivityCheck');
  let pastConnectivityStatus;
  const globalCI = _getConnectionInformation();
  return Utils.waitWhile(isConnectivityCheckInProgress, RESPONSE_CHECK_INTERVAL_MS)
    .then(() => {
      store.dispatch({ type: STATE_AMP_CONNECTION_STATUS_UPDATE_PENDING });
      return Promise.all([_getLastConnectivityStatus(), _getServerId()]);
    }).then(([pastStatus, serverId]) => {
      pastConnectivityStatus = pastStatus;
      if (ci == null) {
        ci = globalCI;
      } else {
        configureConnectionInformation(ci);
      }
      return ConnectivityCheckRunner.run(ci, pastConnectivityStatus, serverId);
    }).then(status => {
      if (ci !== globalCI) {
        configureConnectionInformation(globalCI);
      }
      store.dispatch({
        type: STATE_AMP_CONNECTION_STATUS_UPDATE,
        actionData: ci.isTestUrl ? pastConnectivityStatus : status
      });
      if (ci.isTestUrl || !status) {
        return status;
      } else {
        reportCompatibilityError(pastConnectivityStatus, status);
        return _saveConnectivityStatus(status);
      }
    });
}


function reportCompatibilityError(lastConnectivityStatus: ConnectivityStatus, currentStatus: ConnectivityStatus) {
  if ((!lastConnectivityStatus || lastConnectivityStatus.isAmpCompatible) && !currentStatus.isAmpCompatible) {
    const notUpgradable = !currentStatus.latestAmpOffline || currentStatus.latestAmpOffline[MANDATORY_UPDATE] === null;
    if (notUpgradable) {
      const incompatibilityNotification = new Notification({
        message: translate('ampServerIncompatibleContinueToUse'),
        origin: ErrorConstants.NOTIFICATION_ORIGIN_API_GENERAL,
        severity: ErrorConstants.NOTIFICATION_SEVERITY_ERROR
      });
      store.dispatch(addFullscreenAlert(incompatibilityNotification));
    }
  }
}

/**
 * @return {ConnectionInformation}
 */
function _getConnectionInformation() {
  return store.getState().startUpReducer.connectionInformation;
}

function _getLastConnectivityStatus() {
  const lastConnectivityStatus = store.getState().ampConnectionStatusReducer.status;
  if (!lastConnectivityStatus) {
    return ClientSettingsHelper.findSettingByName(CSC.LAST_CONNECTIVITY_STATUS).then(statusSetting => {
      const statusJson = statusSetting && statusSetting.value;
      return statusJson && ConnectivityStatus.deserialize(statusJson);
    });
  }
  return Promise.resolve(lastConnectivityStatus);
}

function _getServerId() {
  let serverId = getRegisteredServerId();
  if (serverId === undefined) {
    return ClientSettingsHelper.findSettingByName(CSC.AMP_SERVER_ID).then(serverIdSetting => {
      serverId = serverIdSetting.value || null;
      store.dispatch({ type: STATE_AMP_SERVER_ID_UPDATED, actionData: serverId });
      return serverId;
    });
  }
  return Promise.resolve(serverId);
}

/**
 * We need to store the new connectivity status to be available on the next AMP Client startup to have the latest
 * compatibility data even in offline mode
 * @private
 */
function _saveConnectivityStatus(status) {
  return ClientSettingsHelper.findAllSettingsByNames([CSC.LAST_CONNECTIVITY_STATUS, CSC.AMP_SERVER_ID])
    .then(Utils.toMapByKey)
    .then(settingsMap => {
      const statusSetting = settingsMap.get(CSC.LAST_CONNECTIVITY_STATUS);
      statusSetting.value = status;
      return Promise.all([
        _saveServerIdSetting(settingsMap.get(CSC.AMP_SERVER_ID), status),
        ClientSettingsHelper.saveOrUpdateSetting(statusSetting)
      ]).then(() => status);
    });
}

function _saveServerIdSetting(serverIdSetting, status: ConnectivityStatus) {
  if (serverIdSetting.value || !status.serverId) {
    return Promise.resolve();
  }
  serverIdSetting.value = status.serverId;
  store.dispatch({ type: STATE_AMP_SERVER_ID_UPDATED, actionData: status.serverId });
  return ClientSettingsHelper.saveOrUpdateSetting(serverIdSetting);
}
