import ConnectivityStatus from '../modules/connectivity/ConnectivityStatus';
import ConnectionHelper from '../modules/connectivity/ConnectionHelper';
import { URL_CONNECTIVITY_CHECK_EP } from '../modules/connectivity/AmpApiConstants';
// TODO: this is temporary to move on and final binding to the store will be done through AMPOFFLINE-103
import { store } from '../index';

export const STATE_AMP_CONNECTION_STATUS_UPDATE = 'STATE_AMP_CONNECTION_STATUS_UPDATE';
export const STATE_AMP_CONNECTION_STATUS_UPDATE_PENDING = 'STATE_AMP_CONNECTION_STATUS_UPDATE_PENDING';

/**
 * Checks and updates the connectivity status
 */

export function connectivityCheck() {
  console.log('connectivityCheck');
  return (dispatch, ownProps) => {
    dispatch({ type: STATE_AMP_CONNECTION_STATUS_UPDATE_PENDING });
    // we should introduce a manager here to keep the actions simple
    const url = URL_CONNECTIVITY_CHECK_EP;
    const paramsMap = { 'amp-offline-version': VERSION };
    ConnectionHelper.doGet({ url, paramsMap }).then(data => {
      const connectivityData = _processResult(data);
      dispatch({ type: STATE_AMP_CONNECTION_STATUS_UPDATE, actionData: connectivityData });
    }).catch(error => {
      console.error(`Couldn't check the connection status. Error: ${error}`);
      const data = _processResult(null);
      dispatch({ type: STATE_AMP_CONNECTION_STATUS_UPDATE, actionData: data });
    });
  };
}

function _processResult(data) {
  let status;
  if (data === null || data === undefined) {
    const lastConnectivityStatus = store.getState().ampConnectionStatus.status;
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
    const isAmpClientEnabled = data['amp-offline-enabled'] === true;
    const isAmpCompatible = data['amp-offline-compatible'] === true;
    status = new ConnectivityStatus(true, isAmpClientEnabled, isAmpCompatible, data['amp-version']);
  }
  return status;
}
