import ConnectivityStatus from '../modules/connectivity/ConnectivityStatus';
import ConnectionHelper from '../modules/connectivity/ConnectionHelper';
import {
  AMP_OFFLINE_COMPATIBLE,
  AMP_OFFLINE_ENABLED,
  AMP_SERVER_ID,
  AMP_SERVER_ID_MATCH,
  AMP_VERSION,
  LATEST_AMP_OFFLINE,
  URL_CONNECTIVITY_CHECK_EP
} from '../modules/connectivity/AmpApiConstants';
import { VERSION } from '../utils/Constants';
import store from '../index';
import Logger from '../modules/util/LoggerManager';
import * as ClientSettingsHelper from '../modules/helpers/ClientSettingsHelper';
import * as CSC from '../utils/constants/ClientSettingsConstants';
import { configureOnLoad } from './SetupAction';
import * as Utils from '../utils/Utils';
import VersionUtils from '../utils/VersionUtils';
import Notification from '../modules/helpers/NotificationHelper';
import { NOTIFICATION_ORIGIN_API_GENERAL, NOTIFICATION_SEVERITY_ERROR, } from '../utils/constants/ErrorConstants';
import translate from '../utils/translate';
import { addFullscreenAlert } from './NotificationAction';

export const STATE_AMP_CONNECTION_STATUS_UPDATE = 'STATE_AMP_CONNECTION_STATUS_UPDATE';
export const STATE_AMP_CONNECTION_STATUS_UPDATE_PENDING = 'STATE_AMP_CONNECTION_STATUS_UPDATE_PENDING';
export const STATE_AMP_SERVER_ID_UPDATED = 'STATE_AMP_SERVER_ID_UPDATED';
export const MANDATORY_UPDATE = 'mandatory_update';

export const STATE_PARAMETERS_LOADED = 'STATE_PARAMETERS_LOADED';
export const STATE_PARAMETERS_LOADING = 'STATE_PARAMETERS_LOADING';

/* Expected connectivity response fields. */
const CONNECTIVITY_RESPONSE_FIELDS = [AMP_OFFLINE_ENABLED, AMP_OFFLINE_COMPATIBLE, LATEST_AMP_OFFLINE, AMP_VERSION,
  AMP_SERVER_ID, AMP_SERVER_ID_MATCH];
const logger = new Logger('Connectivity action');

export function isConnectivityCheckInProgress() {
  return store.getState().ampConnectionStatusReducer.updateInProgress;
}

export function isAmpAccessible(isSetup) {
  const connectivityStatus = store.getState().ampConnectionStatusReducer.status;
  return isValidConnectionByStatus(connectivityStatus, isSetup) && connectivityStatus.isAmpClientEnabled;
}

export function isValidConnectionByStatus(connectivityStatus: ConnectivityStatus, isSetup: boolean) {
  const serverId = getRegisteredServerId();
  if (!connectivityStatus || !connectivityStatus.isAmpAvailable) {
    return false;
  }
  if (connectivityStatus.serverIdMatch) {
    return isSetup ? true : connectivityStatus.isAmpCompatible;
  }
  return (!serverId && connectivityStatus.serverId) && connectivityStatus.isAmpCompatible;
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
 * @param isSetup in setup mode some status is handled with a different message
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
 * @param isCheckingAlternative if the connectivity check is for testing a different URL
 * @returns ConnectivityStatus
 */
export function connectivityCheck(isCheckingAlternative: boolean = false) {
  logger.log('connectivityCheck');
  store.dispatch({ type: STATE_AMP_CONNECTION_STATUS_UPDATE_PENDING });
  // we should introduce a manager here to keep the actions simple
  const url = URL_CONNECTIVITY_CHECK_EP;
  const paramsMap = { 'amp-offline-version': VERSION };
  let lastConnectivityStatus;
  return Promise.all([_getLastConnectivityStatus(), _getServerId()])
    .then(([status, serverId]) => {
      lastConnectivityStatus = status;
      const ci = _getConnectionInformation();
      if (ci.isTestUrl && !isCheckingAlternative) {
        store.dispatch({ type: STATE_AMP_CONNECTION_STATUS_UPDATE, action: lastConnectivityStatus });
        return Promise.resolve();
      }
      if (serverId) {
        paramsMap[AMP_SERVER_ID] = serverId;
      }
      return ConnectionHelper.doGet({ url, paramsMap });
    })
    .then(data => _processResult(data, lastConnectivityStatus, isCheckingAlternative))
    .catch(error => {
      logger.error(`Couldn't check the connection status. Error: ${error}`);
      return _processResult(null, lastConnectivityStatus, isCheckingAlternative);
    })
    .then(result => (isCheckingAlternative ? result : _saveConnectivityStatus(result)));
}

function _processResult(data, lastConnectivityStatus: ConnectivityStatus, isCheckingAlternative: boolean) {
  let status;
  if (!isValidAmpResponse(data)) {
    if (lastConnectivityStatus === undefined) {
      status = new ConnectivityStatus(false, true, true, null, null, null, false);
    } else {
      status = new ConnectivityStatus(
        false,
        lastConnectivityStatus.isAmpClientEnabled,
        lastConnectivityStatus.isAmpCompatible,
        lastConnectivityStatus.ampVersion,
        preProcessLatestAmpOffline(lastConnectivityStatus.latestAmpOffline),
        lastConnectivityStatus.serverId,
        lastConnectivityStatus.serverIdMatch
      );
    }
  } else {
    const isAmpClientEnabled = data[AMP_OFFLINE_ENABLED] === true;
    const isAmpCompatible = data[AMP_OFFLINE_COMPATIBLE] === true;
    const latestAmpOffline = preProcessLatestAmpOffline(data[LATEST_AMP_OFFLINE], isAmpCompatible);
    const version = data[AMP_VERSION];
    status = new ConnectivityStatus(true, isAmpClientEnabled, isAmpCompatible, version, latestAmpOffline,
      data[AMP_SERVER_ID], data[AMP_SERVER_ID_MATCH]);
  }
  store.dispatch({
    type: STATE_AMP_CONNECTION_STATUS_UPDATE,
    actionData: isCheckingAlternative ? lastConnectivityStatus : status
  });
  if (!isCheckingAlternative) {
    reportCompatibilityError(lastConnectivityStatus, status);
  }
  return status;
}

function preProcessLatestAmpOffline(latestAmpOffline, isAmpCompatible) {
  if (latestAmpOffline) {
    if (VersionUtils.compareVersion(latestAmpOffline.version, VERSION) > 0) {
      latestAmpOffline[MANDATORY_UPDATE] = latestAmpOffline.critical === true || !isAmpCompatible;
    } else {
      latestAmpOffline[MANDATORY_UPDATE] = null;
    }
  }
  return latestAmpOffline;
}

function isValidAmpResponse(response) {
  const keys = (response && response instanceof Object && Object.keys(response)) || null;
  return keys && CONNECTIVITY_RESPONSE_FIELDS.some(field => keys.includes(field));
}

function reportCompatibilityError(lastConnectivityStatus: ConnectivityStatus, currentStatus: ConnectivityStatus) {
  if ((!lastConnectivityStatus || lastConnectivityStatus.isAmpCompatible) && !currentStatus.isAmpCompatible) {
    const notUpgradable = !currentStatus.latestAmpOffline || currentStatus.latestAmpOffline[MANDATORY_UPDATE] === null;
    if (notUpgradable) {
      const incompatibilityNotification = new Notification({
        message: translate('ampServerIncompatibleContinueToUse'),
        origin: NOTIFICATION_ORIGIN_API_GENERAL,
        severity: NOTIFICATION_SEVERITY_ERROR
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
