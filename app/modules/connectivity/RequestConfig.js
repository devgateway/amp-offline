import request from 'request';
import os from 'os';
import store from '../../index';
import routesConfiguration from '../../utils/RoutesConfiguration';
import Notification from '../helpers/NotificationHelper';
import { NOTIFICATION_ORIGIN_API_NETWORK, NOTIFICATION_SEVERITY_ERROR } from '../../utils/constants/ErrorConstants';
import {
  ARCH32,
  ARCH64,
  ARCH64_NODE_OS_OPTIONS,
  ARCH64_USER_AGENT_OPTIONS,
  PARAM_AMPOFFLINE_AGENT,
  PLATFORM_DEBIAN,
  PLATFORM_MAC_OS,
  PLATFORM_REDHAT,
  PLATFORM_WINDOWS,
  TRANSLATIONS_PARAM
} from './AmpApiConstants';
import { VERSION } from '../../utils/Constants';
import Utils from '../../utils/Utils';

let cookiesStore = request.jar();

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
    const addTranslations = routeConfiguration.regularAmpUrl !== true;
    const urlParams = this._paramsMapToString(paramsMap, addTranslations);
    const fullUrl = fullBaseUrl + (extraUrlParam ? `/${extraUrlParam}` : '') + urlParams;
    const headers = {
      'User-Agent': `${PARAM_AMPOFFLINE_AGENT}/${VERSION} ${this._getExtendedUserAgent(navigator.userAgent)}`
    };
    if (!routeConfiguration.isBinary) {
      // If it is not binary we assume its JSON if we need to handle
      // more types we can adjust accordingly
      headers['content-type'] = 'application/json';
      headers.Accept = routeConfiguration.accept || 'application/json';
    }
    const requestConfig = {
      url: fullUrl,
      json: true,
      headers,
      method,
      simple: false,
      resolveWithFullResponse: true,
      gzip: true,
      jar: cookiesStore // enables cookies to be saved
    };
    if (routeConfiguration.isBinary) {
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

    if (body !== undefined) {
      requestConfig.body = body;
    }
    return requestConfig;
  },

  _getExtendedUserAgent(userAgent) {
    const userAgentLowerCase = userAgent.toLowerCase();
    let platform = os.platform().toLowerCase();
    if (platform === 'darwin') {
      platform = PLATFORM_MAC_OS;
    } else if (platform === 'win32') {
      platform = PLATFORM_WINDOWS;
    } else if (platform === 'linux') {
      if (userAgentLowerCase.includes('red hat')) {
        platform = PLATFORM_REDHAT;
      } else {
        platform = PLATFORM_DEBIAN;
      }
    }
    let arch = os.arch();
    if (ARCH64_NODE_OS_OPTIONS.has(arch) || ARCH64_USER_AGENT_OPTIONS.some(a64 => userAgentLowerCase.includes(a64))) {
      arch = ARCH64;
    } else {
      arch = ARCH32;
    }
    return `(${platform}; ${arch}) ${userAgent}`;
  },

  _addTranslations(paramsMap) {
    let translations = store.getState().translationReducer.languageList;
    if (translations && translations.length > 0) {
      translations = translations.join('|');
      if (paramsMap instanceof Map) {
        paramsMap.set(TRANSLATIONS_PARAM, translations);
      } else if (!paramsMap) {
        paramsMap = Utils.toMap(TRANSLATIONS_PARAM, translations);
      } else {
        paramsMap[TRANSLATIONS_PARAM] = translations;
      }
    }
    return paramsMap;
  },

  _paramsMapToString(paramsMap, addTranslations) {
    if (addTranslations) {
      paramsMap = this._addTranslations(paramsMap);
    }
    const kv = [];
    if (paramsMap) {
      if (paramsMap instanceof Map) {
        paramsMap.forEach((key, value) => kv.push(`${key}=${encodeURIComponent(value)}`));
      } else {
        Object.keys(paramsMap).forEach(prop => kv.push(`${prop}=${encodeURIComponent(paramsMap[prop])}`));
      }
      return `?${kv.join('&')}`;
    }
    return '';
  },

  _getFullBaseUrl(url, routeConfiguration) {
    // if the route is regularAMPUrl we fetch the ROOT for amp
    // if not we get the REST url
    return routeConfiguration.regularAmpUrl ?
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
    // above we ensure we have only one route
    return routesConfigurationFiltered[0];
  },

  clearCookies() {
    cookiesStore = request.jar();
  }
};

export default RequestConfig;
