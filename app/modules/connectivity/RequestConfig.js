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
    var kv = [];
    if (paramsMap instanceof Map) {
      paramsMap.forEach((key, value) => kv.push(key + "=" + value));
    } else {
      for (var prop in paramsMap) {
        kv.push(prop + '=' + paramsMap[prop]);
      }
    }
    let paramsStr = '?' + kv.join('&');
    return paramsStr;
  }
}

module.exports = RequestConfig;
