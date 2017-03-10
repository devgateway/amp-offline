export default class ConnectionInformation {
  /**
   * Stores AMP connection information needed to reach a given AMP endpoint
   * @param serverUrl
   * @param baseRestUrl usually /rest in case of AMP
   * @param protocol usually will be HTTPS
   * @param basePort usually will be 443
   * @param timeout request timeout
   */
  constructor(serverUrl, baseRestUrl, protocol, basePort, timeout) {
    this._serverUrl = serverUrl;
    this._baseRestUrl = baseRestUrl;
    this._protocol = protocol;
    this._basePort = basePort;
    this._timeout = timeout;
  }

  getFullRestUrl() {
    return `${this.protocol}://${this.serverUrl}${this.getPort()}${this.baseRestUrl}`;
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
