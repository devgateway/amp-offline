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
    const urlParams = this._paramsMapToString(paramsMap);
    const fullUrl = BASE_URL + "/rest/" + url + urlParams;
    const requestConfig = {
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
    let kv = [];
    if (paramsMap instanceof Map) {
      paramsMap.forEach((key, value) => kv.push(key + "=" + value));
    } else {
      for (let prop in paramsMap) {
        kv.push(prop + '=' + paramsMap[prop]);
      }
    }
    const paramsStr = '?' + kv.join('&');
    return paramsStr;
  }
}

module.exports = RequestConfig;
