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
}

