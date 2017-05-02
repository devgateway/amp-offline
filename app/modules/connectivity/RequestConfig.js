import store from '../../index';
import routesConfiguration from '../../utils/RoutesConfiguration';
import Notification from '../helpers/NotificationHelper';
import { NOTIFICATION_ORIGIN_API_NETWORK, NOTIFICATION_SEVERITY_ERROR } from '../../utils/constants/ErrorConstants';
import { PARAM_AMPOFFLINE_AGENT } from './AmpApiConstants';
import LoggerManager from '../util/LoggerManager';

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
    const routeConfiguration = this._getRouteConfiguration(method, url);
    const fullBaseUrl = this._getFullBaseUrl(url, routeConfiguration);
    const urlParams = this._paramsMapToString(paramsMap);
    const fullUrl = fullBaseUrl + (extraUrlParam ? `/${extraUrlParam}` : '') + urlParams;
    const headers = { 'User-Agent': PARAM_AMPOFFLINE_AGENT };
    if (!routeConfiguration[0].isBinary) {
      // If it is not binary we assume its JSON if we need to handle
      // more types we can adjust accordingly
      headers['content-type'] = 'application/json';
      headers.Accept = 'application/json';
    }
    const requestConfig = {
      url: fullUrl,
      json: true,
      headers,
      method
    };
    if (routeConfiguration[0].isBinary) {
      // in case its binary we need to set json to false
      // and encoding to null in order to be able to receive
      // the binary as an array of bytes
      // We asume JSON as default
      requestConfig.json = false;
      requestConfig.encoding = null;
    }

    if (store.getState().startUpReducer.connectionInformation.timeOut) {
      requestConfig.timeout = store.getState().startUpReducer.connectionInformation.timeOut;
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
    const kv = [];
    if (paramsMap instanceof Map) {
      paramsMap.forEach((key, value) => kv.push(`${key}=${value}`));
    } else {
      Object.keys(paramsMap).forEach(prop => kv.push(`${prop}=${paramsMap[prop]}`));
    }
    return `?${kv.join('&')}`;
  },

  _getFullBaseUrl(url, routeConfiguration) {
    // if the route is regularAMPUrl we fetch the ROOT for amp
    // if not we get the REST url
    return routeConfiguration[0].regularAmpUrl ?
      store.getState().startUpReducer.connectionInformation.getFullUrl() + url :
      store.getState().startUpReducer.connectionInformation.getFullRestUrl() + url;
  },

  _getRouteConfiguration(method, url) {
    const routesConfigurationFiltered = routesConfiguration.filter(element =>
    element.url === url && element.method === method);

    if (!routesConfigurationFiltered || routesConfigurationFiltered.length !== 1) {
      throw new Notification({
        message: `Route ${url} for method ${method} is not configured`,
        origin: NOTIFICATION_ORIGIN_API_NETWORK,
        severity: NOTIFICATION_SEVERITY_ERROR
      });
    }
    return routesConfigurationFiltered;
  },
  _getToken(method, url) {
    // We go to check to routes config to see if we need to generate a token
    if (this._getRouteConfiguration(method, url)[0].requiresToken) {
      if (store.getState().loginReducer.token) {
        return store.getState().loginReducer.token;
      }
      // TODO if the token is not present we try to log the user in;
    }
  },

  replaceToken(requestConfig) {
    LoggerManager.log('replaceToken');
    requestConfig.headers['X-Auth-Token'] = store.getState().loginReducer.token;
    return requestConfig;
  }
};

module.exports = RequestConfig;
