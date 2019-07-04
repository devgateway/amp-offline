export default class ConnectionInformation {
  /**
   * Stores AMP connection information needed to reach a given AMP endpoint
   * @param serverUrl
   * @param baseRestUrl usually /rest in case of AMP
   * @param protocol usually will be HTTPS
   * @param basePort usually will be 443
   * @param timeout request timeout
   * @param forcedTimeout
   * @param isFullUrl specifies if serverUrl is already a full url that doesn't need to be reconstructed
   * @param isTestUrl flags if this URL is used for testing as a valid connection (e.g. within Setup or Settings page)
   */
  constructor(serverUrl, baseRestUrl, protocol, basePort, timeout, forcedTimeout, isFullUrl, isTestUrl) {
    this._serverUrl = serverUrl;
    this._baseRestUrl = baseRestUrl;
    this._protocol = protocol;
    this._basePort = basePort;
    this._timeout = timeout;
    this._forcedTimeout = forcedTimeout;
    this._isFullUrl = isFullUrl;
    this._isTestUrl = isTestUrl;
  }

  get baseRestUrl() {
    return this._baseRestUrl;
  }

  get serverUrl() {
    return this._serverUrl;
  }

  get protocol() {
    return this._protocol;
  }

  get basePort() {
    return this._basePort;
  }

  get timeOut() {
    return this._timeout;
  }

  get forcedTimeout() {
    return this._forcedTimeout;
  }

  get isFullUrl() {
    return this._isFullUrl;
  }

  get isTestUrl() {
    return this._isTestUrl;
  }

  /**
   * Returns the full REST url to call amp api enpdoints
   * @returns {string}
   */
  getFullRestUrl() {
    return `${this.getFullUrl()}${this.baseRestUrl}`;
  }

  /**
   * Returns full AMP ROOT url
   * @returns {string}
   */
  getFullUrl() {
    if (this.isFullUrl) {
      return this.serverUrl;
    }
    return `${this.protocol}://${this.serverUrl}${this.getPort()}`;
  }

  getPort() {
    let portPart = '';
    /* configure the port if we are in secure mode and the port is not 443
    or if we are not in secure and the port is not 80 */
    if ((this.protocol === 'https' && this.basePort !== 443) || (this.protocol === 'http' && this.basePort !== 80)) {
      portPart = `:${this.basePort}`;
    }
    return portPart;
  }
}
