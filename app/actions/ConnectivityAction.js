import ConnectivityStatus from '../modules/connectivity/ConnectivityStatus';
import ConnectionHelper from '../modules/connectivity/ConnectionHelper';
import { URL_CONNECTIVITY_CHECK_EP } from '../modules/connectivity/AmpApiConstants';
import { VERSION } from '../utils/Constants';
import LoggerManager from '../modules/util/LoggerManager';
import store from '../index';

export const STATE_AMP_CONNECTION_STATUS_UPDATE = 'STATE_AMP_CONNECTION_STATUS_UPDATE';
export const STATE_AMP_CONNECTION_STATUS_UPDATE_PENDING = 'STATE_AMP_CONNECTION_STATUS_UPDATE_PENDING';
export const MANDATORY_UPDATE = 'mandatory_update';

/**
 * Checks and updates the connectivity status
 @returns ConnectivityStatus
 */

export function connectivityCheck() {
  LoggerManager.log('connectivityCheck');
  return (dispatch, ownProps) => {
    dispatch({ type: STATE_AMP_CONNECTION_STATUS_UPDATE_PENDING });
    // we should introduce a manager here to keep the actions simple
    const url = URL_CONNECTIVITY_CHECK_EP;
    const paramsMap = { 'amp-offline-version': VERSION };
    const lastConnectivityStatus = ownProps().ampConnectionStatusReducer.status;
    return connect(url, paramsMap, lastConnectivityStatus).then(connectivityData => (dispatch({
      type: STATE_AMP_CONNECTION_STATUS_UPDATE,
      actionData: connectivityData
    }))).catch(error => {
      LoggerManager.error(`Couldn't check the connection status. Error: ${error}`);
      const data = _processResult(null, lastConnectivityStatus);
      return dispatch({ type: STATE_AMP_CONNECTION_STATUS_UPDATE, actionData: data });
    });
  };
}

function connect(url, paramsMap, lastConnectivityStatus) {
  LoggerManager.log('connect');
  return new Promise((resolve, reject) => (
    ConnectionHelper.doGet({ url, paramsMap }).then(data => {
      const connectivityData = _processResult(data, lastConnectivityStatus);
      return resolve(connectivityData);
    }).catch(error => {
      LoggerManager.error(`Couldn't check the connection status. Error: ${error}`);
      const data = _processResult(null, lastConnectivityStatus);
      return reject(data);
    })
  ));
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
        lastConnectivityStatus.getAmpVersion,
        lastConnectivityStatus.getLatestAmpOffline
      );
    }
  } else {
    const isAmpClientEnabled = data['amp-offline-enabled'] === true;
    const isAmpCompatible = data['amp-offline-compatible'] === true;
    const latestAmpOffline = data['latest-amp-offline'];
    const version = data['amp-version'];
    // Process data related to version upgrades.
    if (latestAmpOffline) {
      const url = buildDownloadUrl(latestAmpOffline.url);
      if (isAmpCompatible === false || latestAmpOffline.critical === true) {
        // This is a mandatory update.
        latestAmpOffline.url = url;
        latestAmpOffline[MANDATORY_UPDATE] = true;
      } else if (latestAmpOffline.version !== version) {
        // This is an optional update.
        latestAmpOffline.url = url;
        latestAmpOffline[MANDATORY_UPDATE] = false;
      }
    }
    status = new ConnectivityStatus(true, isAmpClientEnabled, isAmpCompatible, version, latestAmpOffline);
  }

  return status;
}

function buildDownloadUrl(url) {
  LoggerManager.log('buildDownloadUrl');
  const baseUrl = store.getState().startUpReducer.connectionInformation.getFullUrl();
  return url.replace(/<base_url>/gi, baseUrl);
}
