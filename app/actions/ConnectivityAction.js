import ConnectivityStatus from '../modules/connectivity/ConnectivityStatus';
import ConnectionHelper from '../modules/connectivity/ConnectionHelper';
import {
  AMP_OFFLINE_COMPATIBLE,
  AMP_OFFLINE_ENABLED,
  AMP_VERSION,
  LATEST_AMP_OFFLINE,
  URL_CONNECTIVITY_CHECK_EP
} from '../modules/connectivity/AmpApiConstants';
import { VERSION } from '../utils/Constants';
import store from '../index';
import Logger from '../modules/util/LoggerManager';
import * as ClientSettingsHelper from '../modules/helpers/ClientSettingsHelper';
import { LAST_CONNECTIVITY_STATUS } from '../utils/constants/ClientSettingsConstants';
import { configureOnLoad } from './SetupAction';

export const STATE_AMP_CONNECTION_STATUS_UPDATE = 'STATE_AMP_CONNECTION_STATUS_UPDATE';
export const STATE_AMP_CONNECTION_STATUS_UPDATE_PENDING = 'STATE_AMP_CONNECTION_STATUS_UPDATE_PENDING';
export const MANDATORY_UPDATE = 'mandatory_update';

export const STATE_PARAMETERS_LOADED = 'STATE_PARAMETERS_LOADED';
export const STATE_PARAMETERS_LOADING = 'STATE_PARAMETERS_LOADING';

/* Expected connectivity response fields. */
const CONNECTIVITY_RESPONSE_FIELDS = [AMP_OFFLINE_ENABLED, AMP_OFFLINE_COMPATIBLE, LATEST_AMP_OFFLINE, AMP_VERSION];
const logger = new Logger('Connectivity action');

export function isConnectivityCheckInProgress() {
  return store.getState().ampConnectionStatusReducer.updateInProgress;
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
 * @returns ConnectivityStatus
 */
export function connectivityCheck() {
  logger.log('connectivityCheck');
  store.dispatch({ type: STATE_AMP_CONNECTION_STATUS_UPDATE_PENDING });
  // we should introduce a manager here to keep the actions simple
  const url = URL_CONNECTIVITY_CHECK_EP;
  const paramsMap = { 'amp-offline-version': VERSION };
  let lastConnectivityStatus;
  return _getLastConnectivityStatus()
    .then(status => {
      lastConnectivityStatus = status;
      return ConnectionHelper.doGet({ url, paramsMap });
    })
    .then(data => _processResult(data, lastConnectivityStatus))
    .then(_saveConnectivityStatus)
    .catch(error => {
      logger.error(`Couldn't check the connection status. Error: ${error}`);
      return _processResult(null, lastConnectivityStatus);
    });
}

function _processResult(data, lastConnectivityStatus) {
  let status;
  if (!isValidAmpResponse(data)) {
    if (lastConnectivityStatus === undefined) {
      status = new ConnectivityStatus(false, true, true);
    } else {
      status = new ConnectivityStatus(
        false,
        lastConnectivityStatus.isAmpClientEnabled,
        lastConnectivityStatus.isAmpCompatible,
        lastConnectivityStatus.ampVersion,
        lastConnectivityStatus.latestAmpOffline
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
    status = new ConnectivityStatus(true, isAmpClientEnabled, isAmpCompatible, version, latestAmpOffline);
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
    return ClientSettingsHelper.findSettingByName(LAST_CONNECTIVITY_STATUS).then(statusSetting => {
      const statusJson = statusSetting && statusSetting.value;
      return statusJson && ConnectivityStatus.deserialize(statusJson);
    });
  }
  return Promise.resolve(lastConnectivityStatus);
}

/**
 * We need to store the new connectivity status to be available on the next AMP Client startup to have the latest
 * compatibility data even in offline mode
 * @private
 */
function _saveConnectivityStatus(status) {
  return ClientSettingsHelper.findSettingByName(LAST_CONNECTIVITY_STATUS).then(statusSetting => {
    statusSetting.value = status;
    return ClientSettingsHelper.saveOrUpdateSetting(statusSetting).then(() => status);
  });
}
