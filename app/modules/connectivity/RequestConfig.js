import {BASE_URL} from '../../utils/Constants';

const RequestConfig = {
  /**
   * A simple api connection builder
   * @param method
   * @param url
   * @param paramsMap
   * @param body
   */
  getRequestConfig(method, url, paramsMap, body) {
    let urlParams = this._paramsMapToString(paramsMap);
    let fullUrl = BASE_URL + "/rest/" + url + urlParams;
    let requestConfig = {
      url: fullUrl,
      json: true,
      headers: {'content-type': 'application/json', 'Accept': 'application/json'},
      method: method
    }
    if (body !== undefined) {
      requestConfig.body = body;
    }
    return requestConfig;
  },

  _paramsMapToString(paramsMap) {
    if (paramsMap === null || paramsMap === undefined) {
      return "";
    }
    // TODO: return "" for now, then "?param1=xx&..."
    return "";
  }
}

module.exports = RequestConfig;
