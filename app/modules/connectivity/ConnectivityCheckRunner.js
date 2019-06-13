/* eslint-disable class-methods-use-this */
import ConnectionInformation from './ConnectionInformation';
import ConnectivityStatus from './ConnectivityStatus';
import {
  AMP_OFFLINE_COMPATIBLE,
  AMP_OFFLINE_ENABLED,
  AMP_SERVER_ID, AMP_SERVER_ID_MATCH, AMP_VERSION, LATEST_AMP_OFFLINE,
  URL_CONNECTIVITY_CHECK_EP
} from './AmpApiConstants';
import { VERSION } from '../../utils/Constants';
import * as ConnectionHelper from './ConnectionHelper';
import VersionUtils from '../../utils/VersionUtils';
import { MANDATORY_UPDATE } from '../../actions/ConnectivityAction';
import Logger from '../util/LoggerManager';

const logger = new Logger('ConnectivityCheckRunner');

/* Expected connectivity response fields. */
const CONNECTIVITY_RESPONSE_FIELDS = [AMP_OFFLINE_ENABLED, AMP_OFFLINE_COMPATIBLE, LATEST_AMP_OFFLINE, AMP_VERSION,
  AMP_SERVER_ID, AMP_SERVER_ID_MATCH];


/**
 * @author Nadejda Mandrescu
 */
export default class ConnectivityCheckRunner {
  _ci: ConnectionInformation;
  _pastConnectivityStatus: ConnectivityStatus;
  _serverId: String;

  /**
   * Runs connectivity check
   * @param ci the connection information used
   * @param pastConnectivityStatus the latest connectivity status
   * @param serverId the registered server id
   * @returns {ConnectivityStatus}
   */
  static run(ci: ConnectionInformation, pastConnectivityStatus: ConnectivityStatus, serverId: String) {
    return new ConnectivityCheckRunner(ci, pastConnectivityStatus, serverId).run();
  }

  /**
   * @param ci the connection information used
   * @param pastConnectivityStatus the latest connectivity status
   * @param serverId the registered server id
   */
  constructor(ci: ConnectionInformation, pastConnectivityStatus: ConnectivityStatus, serverId: String) {
    this._ci = ci;
    this._pastConnectivityStatus = pastConnectivityStatus;
    this._serverId = serverId;
  }

  /**
   * Runs connectivity check
   * @returns {ConnectivityStatus}
   */
  run() {
    logger.log('connectivity check run');
    if (!this._ci || !this._ci.getFullUrl()) {
      (this._ci ? logger.warn : logger.error)('Cannot run connectivity check: no connection information available. ');
      return this._pastConnectivityStatus;
    }
    const url = URL_CONNECTIVITY_CHECK_EP;
    const paramsMap = { 'amp-offline-version': VERSION };
    if (this._serverId) {
      paramsMap[AMP_SERVER_ID] = this._serverId;
    }
    return ConnectionHelper.doGet({ url, paramsMap })
      .then(data => this._processResult(data))
      .catch(error => {
        logger.error(`Couldn't check the connection status. Error: ${error}`);
        return this._processResult(null);
      });
  }

  _processResult(data) {
    let status;
    if (!this._isValidAmpResponse(data)) {
      if (this._pastConnectivityStatus === undefined || this._ci.isTestUrl) {
        status = new ConnectivityStatus(false, true, true, null, null, null, false);
      } else {
        status = new ConnectivityStatus(
          false,
          this._pastConnectivityStatus.isAmpClientEnabled,
          this._pastConnectivityStatus.isAmpCompatible,
          this._pastConnectivityStatus.ampVersion,
          this._preProcessLatestAmpOffline(this._pastConnectivityStatus.latestAmpOffline),
          this._pastConnectivityStatus.serverId,
          this._pastConnectivityStatus.serverIdMatch
        );
      }
    } else {
      const isAmpClientEnabled = data[AMP_OFFLINE_ENABLED] === true;
      const isAmpCompatible = data[AMP_OFFLINE_COMPATIBLE] === true;
      const latestAmpOffline = this._preProcessLatestAmpOffline(data[LATEST_AMP_OFFLINE], isAmpCompatible);
      const version = data[AMP_VERSION];
      status = new ConnectivityStatus(true, isAmpClientEnabled, isAmpCompatible, version, latestAmpOffline,
        data[AMP_SERVER_ID], data[AMP_SERVER_ID_MATCH]);
    }
    return status;
  }

  _preProcessLatestAmpOffline(latestAmpOffline, isAmpCompatible) {
    if (latestAmpOffline) {
      if (VersionUtils.compareVersion(latestAmpOffline.version, VERSION) > 0) {
        latestAmpOffline[MANDATORY_UPDATE] = latestAmpOffline.critical === true || !isAmpCompatible;
      } else {
        latestAmpOffline[MANDATORY_UPDATE] = null;
      }
    }
    return latestAmpOffline;
  }

  _isValidAmpResponse(response) {
    const keys = (response && response instanceof Object && Object.keys(response)) || null;
    return keys && CONNECTIVITY_RESPONSE_FIELDS.some(field => keys.includes(field));
  }

}
