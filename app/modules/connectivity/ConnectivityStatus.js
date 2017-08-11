export default class ConnectivityStatus {
  /**
   * Stores AMP connectivity & compatibility status, usually filled in when connection is successfully established
   * @param isAmpAvailable
   * @param isAmpClientEnabled
   * @param isAmpCompatible
   * @param ampVersion
   * @param latestAmpOffline
   */
  constructor(isAmpAvailable, isAmpClientEnabled, isAmpCompatible, ampVersion, latestAmpOffline) {
    this._isAmpAvailable = isAmpAvailable;
    this._isAmpClientEnabled = isAmpClientEnabled;
    this._isAmpCompatible = isAmpCompatible;
    this._ampVersion = ampVersion;
    this._latestAmpOffline = latestAmpOffline;
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
  get getAmpVersion() {
    return this._ampVersion;
  }

  /**
   * @returns {Object} Data to upgrade the current installation (if available).
   */
  get getLatestAmpOffline() {
    return this._latestAmpOffline;
  }
}

