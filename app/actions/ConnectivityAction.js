import ConnectivityStatus from '../modules/connectivity/ConnectivityStatus';
import ConnectionHelper from '../modules/connectivity/ConnectionHelper';
import {URL_CONNECTIVITY_CHECK_EP} from '../modules/connectivity/AmpApiConstants';
// TODO: this is temporary to move on and final binding to the store will be done through AMPOFFLINE-103
import {store} from '../index.js';

export const STATE_AMP_CONNECTION_STATUS_UPDATE = 'STATE_AMP_CONNECTION_STATUS_UPDATE';
export const STATE_AMP_CONNECTION_STATUS_UPDATE_PENDING = 'STATE_AMP_CONNECTION_STATUS_UPDATE_PENDING';

/**
 * Checks and updates the connectivity status
 * @returns ConnectivityStatus
 */
export function connectivityCheck() {
  store.dispatch({type: STATE_AMP_CONNECTION_STATUS_UPDATE_PENDING});
  ConnectionHelper.doGet(URL_CONNECTIVITY_CHECK_EP, {"amp-offline-version": VERSION}).then(data => {
    return _processResult(data);
  }).catch(error => {
    console.error('Couldn\'t check the connection status. Error: ' + error);
    return _processResult(null);
  });
}

function _processResult(data) {
  const lastConnectivityStatus = store.getState().ampConnectionStatus.status;
  const currentConnectivityStatus = _toConnectivityStatus(data, lastConnectivityStatus);
  store.dispatch({type: STATE_AMP_CONNECTION_STATUS_UPDATE, actionData: currentConnectivityStatus});
  return currentConnectivityStatus;
}

function _toConnectivityStatus(data, lastConnectivityStatus) {
  let status;
  if (data === null || data === undefined) {
    if (lastConnectivityStatus === undefined) {
      status = new ConnectivityStatus(false, true, true);
    } else {
      status = new ConnectivityStatus(
        false,
        lastConnectivityStatus.isAmpClientEnabled(),
        lastConnectivityStatus.isAmpCompatible(),
        lastConnectivityStatus.getAmpVersion()
      );
    }
  } else {
    const isAmpClientEnabled = true === data["amp-offline-enabled"];
    const isAmpCompatible = true === data["amp-offline-compatible"];
    status = new ConnectivityStatus(true, isAmpClientEnabled, isAmpCompatible, data["amp-version"]);
  }
  return Object.freeze(status);
}
