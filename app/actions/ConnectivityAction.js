import ConnectivityStatus from '../modules/connectivity/ConnectivityStatus';
import ConnectionHelper from '../modules/connectivity/ConnectionHelper';
import { URL_CONNECTIVITY_CHECK_EP } from '../modules/connectivity/AmpApiConstants';
import { VERSION } from '../utils/Constants';

export const STATE_AMP_CONNECTION_STATUS_UPDATE = 'STATE_AMP_CONNECTION_STATUS_UPDATE';
export const STATE_AMP_CONNECTION_STATUS_UPDATE_PENDING = 'STATE_AMP_CONNECTION_STATUS_UPDATE_PENDING';

/**
 * Checks and updates the connectivity status
@returns ConnectivityStatus
 */

export function connectivityCheck() {
  console.log('connectivityCheck');
  return (dispatch, ownProps) => {
    dispatch({ type: STATE_AMP_CONNECTION_STATUS_UPDATE_PENDING });
    // we should introduce a manager here to keep the actions simple
    const url = URL_CONNECTIVITY_CHECK_EP;
    const paramsMap = { 'amp-offline-version': VERSION };
    const lastConnectivityStatus = ownProps().ampConnectionStatus.status;
    return ConnectionHelper.doGet({ url, paramsMap }).then(data => {
      const connectivityData = _processResult(data, lastConnectivityStatus);
      return dispatch({ type: STATE_AMP_CONNECTION_STATUS_UPDATE, actionData: connectivityData });
    }).catch(error => {
      console.error(`Couldn't check the connection status. Error: ${error}`);
      const data = _processResult(null, lastConnectivityStatus);
      return dispatch({ type: STATE_AMP_CONNECTION_STATUS_UPDATE, actionData: data });
    });
  };
}

function _processResult(data, lastConnectivityStatus) {
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
    const isAmpClientEnabled = data['amp-offline-enabled'] === true;
    const isAmpCompatible = data['amp-offline-compatible'] === true;
    status = new ConnectivityStatus(true, isAmpClientEnabled, isAmpCompatible, data['amp-version']);
  }
  return status;
}
