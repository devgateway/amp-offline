import ConnectivityStatus from '../modules/connectivity/ConnectivityStatus';
import ConnectionHelper from '../modules/connectivity/ConnectionHelper';
import { URL_CONNECTIVITY_CHECK_EP } from '../modules/connectivity/AmpApiConstants';
import { VERSION } from '../utils/Constants';
import store from '../index';
import LoggerManager from '../modules/util/LoggerManager';
import * as ClientSettingsHelper from '../modules/helpers/ClientSettingsHelper';
import { LAST_CONNECTIVITY_STATUS } from '../utils/constants/ClientSettingsConstants';

export const STATE_AMP_CONNECTION_STATUS_UPDATE = 'STATE_AMP_CONNECTION_STATUS_UPDATE';
export const STATE_AMP_CONNECTION_STATUS_UPDATE_PENDING = 'STATE_AMP_CONNECTION_STATUS_UPDATE_PENDING';
export const MANDATORY_UPDATE = 'mandatory_update';

/**
 * Checks and updates the connectivity status
 * @returns ConnectivityStatus
 */
export function connectivityCheck() {
  LoggerManager.log('connectivityCheck');
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
      LoggerManager.error(`Couldn't check the connection status. Error: ${error}`);
      return _processResult(null, lastConnectivityStatus);
    });
}

function _processResult(data, lastConnectivityStatus) {
  let status;
  if (data === null || data === undefined) {
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
    const isAmpClientEnabled = data['amp-offline-enabled'] === true;
    const isAmpCompatible = data['amp-offline-compatible'] === true;
    const latestAmpOffline = data['latest-amp-offline'];
    const version = data['amp-version'];
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
