import { store } from '../../index';
import routesConfiguration from '../../utils/RoutesConfiguration';
import Notification from '../helpers/NotificationHelper';
import {
  NOTIFICATION_ORIGIN_API_NETWORK,
  NOTIFICATION_SEVERITY_ERROR
} from '../../utils/constants/ErrorConstants';
import { PARAM_AMPOFFLINE_AGENT } from './AmpApiConstants';

const RequestConfig = {
  /**
   * A simple api connection builder
   * @param method
   * @param url
   * @param paramsMap
   * @param body
   */
  /* adding {} to destructure method body so we can or can not send paramsMap
   in case we don't want to send id we dont have to send null or nothing*/
  getRequestConfig({ method, url, paramsMap, body, extraUrlParam }) {
    const fullBaseUrl = this._getFullBaseUrl(url);
    const urlParams = this._paramsMapToString(paramsMap);
    const fullUrl = fullBaseUrl + (extraUrlParam ? '/' + extraUrlParam : '') + urlParams;
    const requestConfig = {
      url: fullUrl,
      json: true,
      headers: {
        'content-type': 'application/json',
        Accept: 'application/json',
        'User-Agent': PARAM_AMPOFFLINE_AGENT
      },
      method
    };
    if (store.getState().startUp.connectionInformation.timeOut) {
      requestConfig.timeout = store.getState().startUp.connectionInformation.timeOut;
    }
    const token = this._getToken(method, url);
    if (token) {
      requestConfig.headers['X-Auth-Token'] = token;
    }

    if (body !== undefined) {
      requestConfig.body = body;
    }
    return requestConfig;
  },

  _paramsMapToString(paramsMap) {
    if (paramsMap === null || paramsMap === undefined) {
      return '';
    }
    let kv = [];
    if (paramsMap instanceof Map) {
      paramsMap.forEach((key, value) => kv.push(key + '=' + value));
    } else {
      for (let prop in paramsMap) {
        kv.push(prop + '=' + paramsMap[prop]);
      }
    }
    const paramsStr = '?' + kv.join('&');
    return paramsStr;
  },

  _getFullBaseUrl(url) {
    return store.getState().startUp.connectionInformation.getFullRestUrl() + url;
  },

  _getToken(method, url) {
    // We go to check to routes config to see if we need to generate a token
    const routesConfigurationFiltered = routesConfiguration.filter((element) => {
      return element.url === url && element.method === method;
    });
    if (routesConfigurationFiltered && routesConfigurationFiltered.length === 1) {
      if (routesConfigurationFiltered[0].requiresToken) {
        if (store.getState().login.token) {
          return store.getState().login.token;
        } else {
          // TODO if the token is not present we try to log the user in;
        }
      }
    } else {
      throw new Notification({
        message: `Route ${url} for method ${method} is not configured`,
        origin: NOTIFICATION_ORIGIN_API_NETWORK,
        severity: NOTIFICATION_SEVERITY_ERROR
      });
    }
  },

  replaceToken(requestConfig) {
    console.log('replaceToken');
    requestConfig.headers['X-Auth-Token'] = store.getState().login.token;
    return requestConfig;
  }
};

module.exports = RequestConfig;
