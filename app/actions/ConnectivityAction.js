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

export function isAmpAccessible() {
  const connectivityStatus = store.getState().ampConnectionStatusReducer.status;
  return isValidConnectionByStatus(connectivityStatus) && connectivityStatus.isAmpClientEnabled;
}

export function isValidConnectionByStatus(connectivityStatus: ConnectivityStatus) {
  const serverId = getRegisteredServerId();
  return connectivityStatus && connectivityStatus.isAmpAvailable && connectivityStatus.isAmpCompatible &&
    (!serverId || connectivityStatus.serverIdMatch);
}

/**
 * @return {String} the server id registered on the client
 */
export function getRegisteredServerId() {
  return store.getState().ampConnectionStatusReducer.serverId;
}

export function getStatusErrorLabel(connectivityStatus: ConnectivityStatus, unavailableLabel = 'urlNotWorking') {
  if (!connectivityStatus.isAmpAvailable) {
    return unavailableLabel;
  }
  const registeredServerId = getRegisteredServerId();
  if (registeredServerId && !connectivityStatus.serverIdMatch) {
    return 'serverIdentityMismatch';
  }
  if (!connectivityStatus.serverId) {
    return 'serverIdentityMissing';
  }
  // TODO custom messages for other use cases (e.g. AMPOFFLINE-1079, AMPOFFLINE-1140)
  return unavailableLabel;
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
 * @param saveResult if the result must be saved or not
 * @returns ConnectivityStatus
 */
export function connectivityCheck(saveResult = true) {
  logger.log('connectivityCheck');
  store.dispatch({ type: STATE_AMP_CONNECTION_STATUS_UPDATE_PENDING });
  // we should introduce a manager here to keep the actions simple
  const url = URL_CONNECTIVITY_CHECK_EP;
  const paramsMap = { 'amp-offline-version': VERSION };
  let lastConnectivityStatus;
  return Promise.all([_getLastConnectivityStatus(), _getServerId()])
    .then(([status, serverId]) => {
      lastConnectivityStatus = status;
      if (serverId) {
        paramsMap[AMP_SERVER_ID] = serverId;
      }
      return ConnectionHelper.doGet({ url, paramsMap });
    })
    .then(data => _processResult(data, lastConnectivityStatus))
    .then(result => (saveResult ? _saveConnectivityStatus(result) : result))
    .catch(error => {
      logger.error(`Couldn't check the connection status. Error: ${error}`);
      return _processResult(null, lastConnectivityStatus);
    });
}

function _processResult(data, lastConnectivityStatus: ConnectivityStatus) {
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
        lastConnectivityStatus.latestAmpOffline,
        lastConnectivityStatus.serverId,
        lastConnectivityStatus.serverIdMatch
      );
    }
  } else {
    const isAmpClientEnabled = data[AMP_OFFLINE_ENABLED] === true;
    const isAmpCompatible = data[AMP_OFFLINE_COMPATIBLE] === true;
    const latestAmpOffline = data[LATEST_AMP_OFFLINE];
    const version = data[AMP_VERSION];
    // Process data related to version upgrades.
    if (latestAmpOffline) {
      if (isAmpCompatible === false || latestAmpOffline.critical === true) {
        latestAmpOffline[MANDATORY_UPDATE] = true;
      } else if (latestAmpOffline.version !== version) {
        latestAmpOffline[MANDATORY_UPDATE] = false;
      }
    }
    status = new ConnectivityStatus(true, isAmpClientEnabled, isAmpCompatible, version, latestAmpOffline,
      data[AMP_SERVER_ID], data[AMP_SERVER_ID_MATCH]);
  }
  store.dispatch({ type: STATE_AMP_CONNECTION_STATUS_UPDATE, actionData: status });
  return status;
}

function isValidAmpResponse(response) {
  const keys = (response && response instanceof Object && Object.keys(response)) || null;
  return keys && CONNECTIVITY_RESPONSE_FIELDS.some(field => keys.includes(field));
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
