import * as ApiC from './AmpApiConstants';

/**
 * Connectivity status
 *
 * @author Nadejda Mandrescu
 */
export default class ConnectivityStatus {
  /**
   * Deserialize connectivity status from JSON
   * @param json
   */
  static deserialize(json) {
    return Object.assign(new ConnectivityStatus(), json);
  }

  /**
   * Stores AMP connectivity & compatibility status, usually filled in when connection is successfully established
   * @param isAmpAvailable
   * @param isAmpClientEnabled
   * @param isAmpCompatible
   * @param ampVersion
   * @param latestAmpOffline
   * @param serverId the AMP server identifier
   * @param serverIdMatch true if locally registered server id matched the one provided
   */
  constructor(isAmpAvailable, isAmpClientEnabled, isAmpCompatible, ampVersion, latestAmpOffline, serverId: String,
    serverIdMatch: boolean) {
    this._isAmpAvailable = isAmpAvailable;
    this._isAmpClientEnabled = isAmpClientEnabled;
    this._isAmpCompatible = isAmpCompatible;
    this._ampVersion = ampVersion;
    this._latestAmpOffline = latestAmpOffline;
    this._serverId = serverId;
    this._serverIdMatch = serverIdMatch;
  }

  /**
   * @returns {boolean} that clarifies if AMP is reachable or not
   */
  get isAmpAvailable() {
    return this._isAmpAvailable;
  }

  /**
   * @returns {boolean} that clarifies if AMP Client is still enabled on AMP or not
   */
  get isAmpClientEnabled() {
    return this._isAmpClientEnabled;
  }

  /**
   * @returns {boolean} that clarifies if AMP is compatible or not
   */
  get isAmpCompatible() {
    return this._isAmpCompatible;
  }

  /**
   * @returns {String} AMP version
   */
  get ampVersion() {
    return this._ampVersion;
  }

  /**
   * @returns {Object} Data to upgrade the current installation (if available).
   */
  get latestAmpOffline() {
    return this._latestAmpOffline;
  }

  /**
   * @return {String} the AMP server identifier
   */
  get serverId() {
    return this._serverId;
  }

  /**
   * @return {boolean} if AMP server id matched with the one registered by AMP Offline
   */
  get serverIdMatch() {
    return this._serverIdMatch;
  }

  /**
   * @return {string} the AMP connectivity error code
   */
  get ampErrorCode() {
    if (!this.isAmpAvailable) return ApiC.AMP_ERROR_NOT_AVAILABLE;
    if (!this.serverId) return ApiC.AMP_ERROR_NO_SERVER_ID;
    if (!this.serverIdMatch) return ApiC.AMP_ERROR_SERVER_ID_MISMATCH;
    if (!this.isAmpCompatible) return ApiC.AMP_ERROR_NOT_COMPATIBLE;
    if (!this.isAmpClientEnabled) return ApiC.AMP_ERROR_OFFLINE_DISABLED;
    return ApiC.AMP_ERROR_NO_ERROR;
  }

  isConnectionValid(isForSetupOrUpdate: boolean, serverId: String) {
    if (!this.isAmpAvailable) {
      return false;
    }
    if (this.serverIdMatch) {
      return isForSetupOrUpdate ? true : this.isAmpCompatible;
    }
    return (!serverId && this.serverId) && this.isAmpCompatible;
  }

  /**
   * @see ConnectivityStatus.compare
   * @param s2 the other connectivity status
   * @returns {Integer}
   */
  compareTo(s2: ConnectivityStatus) {
    return ConnectivityStatus.compare(this, s2);
  }

  /**
   * Compares two connectivity statuses to clarify which is less critical according to AMP_ERRORS_BY_PRIORITY_ASC
   * @param s1 the first ConnectivityStatus
   * @param s2 the second ConnectivityStatus
   * @returns {Integer} 0 if both statuses are the same, negative if s1 is less critical, positive otherwise
   */
  static compare(s1: ConnectivityStatus, s2:ConnectivityStatus) {
    const error1 = ApiC.AMP_ERRORS_BY_PRIORITY_ASC.indexOf(s1.ampErrorCode);
    const error2 = ApiC.AMP_ERRORS_BY_PRIORITY_ASC.indexOf(s2.ampErrorCode);
    return error1 - error2;
  }

  /**
   * Detects the least critical status from the list based on AMP_ERRORS_BY_PRIORITY_ASC
   * @param statuses
   * @returns {null|ConnectivityStatus}
   */
  static getLeastCriticalStatusFromList(statuses: Array<ConnectivityStatus>) {
    if (statuses && statuses.length) {
      return statuses.sort(ConnectivityStatus.compare)[0];
    }
    return null;
  }

  /**
   * Detects the least critical status based on AMP_ERRORS_BY_PRIORITY_ASC
   * @param s1
   * @param s2
   * @returns {ConnectivityStatus}
   */
  static getLeastCriticalStatus(s1: ConnectivityStatus, s2:ConnectivityStatus) {
    return s1.compareTo(s2) > 0 ? s2 : s1;
  }
}

