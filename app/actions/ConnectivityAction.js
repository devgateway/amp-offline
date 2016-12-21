import ConnectivityStatus from '../modules/connectivity/ConnectivityStatus';
import ConnectionHelper from '../modules/connectivity/ConnectionHelper';
import {URL_CONNECTIVITY_CHECK_EP} from '../modules/connectivity/AmpApiConstants';
import {STATE_AMP_CONNECTION_STATUS_UPDATE} from '../reducers/AmpConnectionStatusReducer';
var {dispatch, getState} = require ('../reducers/index');


const ampClientVersion = require('../../package.json').version;


const ConnectivityAction = {
  /**
   * Checks and updates the connectivity status
   * @returns ConnectivityStatus
   */
  check() {
    ConnectionHelper.doGet(URL_CONNECTIVITY_CHECK_EP, {"amp-offline-version" : ampClientVersion}).then(data => {
      this._processResult(data);
    }).catch(error => {
      console.log('Couldn\'t check the connection status. Error: ' + error);
      this._processResult(null);
    });
  },

  _processResult(data) {
      let state = getState();
      let lastConnectivityStatus = state.ampConnectionStatus;
      let currentConnectivityStatus = this._toConnectivityStatus(data, lastConnectivityStatus);
      dispatch({type: STATE_AMP_CONNECTION_STATUS_UPDATE, actionData: currentConnectivityStatus});
  },

  _toConnectivityStatus(data, lastConnectivityStatus) {
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
      let isAmpClientEnabled = true === data["amp-offline-enabled"];
      let isAmpCompatible = true === data["amp-offline-compatible"];
      status = new ConnectivityStatus(true, isAmpClientEnabled, isAmpCompatible, data["amp-version"]);
    }
    return Object.freeze(status);
  }
}

module.exports = ConnectivityAction;
