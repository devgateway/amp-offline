import request from 'request';
import { ErrorConstants } from 'amp-ui';
import store from '../../index';
import routesConfiguration from '../../utils/RoutesConfiguration';
import Notification from '../helpers/NotificationHelper';
import { LANGUAGE_PARAM, PARAM_AMPOFFLINE_AGENT, TRANSLATIONS_PARAM } from './AmpApiConstants';
import { VERSION } from '../../utils/Constants';
import Utils from '../../utils/Utils';

let cookiesStore = request.jar();

/*
As of now we have 5 parallel pull activities requests and 5 contacts requests that run at the same time. Until
contacts are pulled in batches, it takes about the same time to pull both, though I saw a few other requests come
in between. According to stats, 11 brings optimal result, plus it's best to avoid running too many keep-alive requests.
 */
const pool = { maxSockets: 100 };

const RequestConfig = {
  /**
   * A simple api connection builder
   * @param method
   * @param url
   * @param paramsMap can be a Map, Object or an Array of [key, value] pairs
   * @param body
   */
  /* adding {} to destructure method body so we can or can not send paramsMap
   in case we don't want to send id we dont have to send null or nothing*/
  getRequestConfig({ method, url, paramsMap, body, extraUrlParam }) {
    const routeConfiguration = this._getRouteConfiguration(method, url);
    const fullUrl = this.getFullURL({ method, url, paramsMap, body, extraUrlParam });
    const headers = {
      'User-Agent': `${PARAM_AMPOFFLINE_AGENT}/${VERSION} ${this._getExtendedUserAgent(navigator.userAgent)}`
    };
    if (!routeConfiguration.isBinary) {
      // If it is not binary we assume its JSON if we need to handle
      // more types we can adjust accordingly
      headers['content-type'] = routeConfiguration.isForm ? 'multipart/form-data' : 'application/json';
      headers.Accept = routeConfiguration.accept || 'application/json';
    }
    const requestConfig = {
      agent: false,
      url: fullUrl,
      json: true,
      headers,
      method,
      simple: false,
      strictSSL: true,
      resolveWithFullResponse: true,
      gzip: true,
      forever: true,
      pool,
      jar: cookiesStore, // enables cookies to be saved,
      timeout: 15000,
      keepAlive: true
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
      if (routeConfiguration.isForm) {
        requestConfig.multipart = body;
      } else {
        requestConfig.body = body;
      }
    }
    return requestConfig;
  },

  getFullURL({ method, url, paramsMap, extraUrlParam }) {
    const routeConfiguration = this._getRouteConfiguration(method, url);
    const fullBaseUrl = this._getFullBaseUrl(url, routeConfiguration);
    const urlParams = this._paramsMapToString(paramsMap, routeConfiguration);
    return fullBaseUrl + (extraUrlParam ? `/${extraUrlParam}` : '') + urlParams;
  },

  _getExtendedUserAgent(userAgent) {
    const { platform, arch } = Utils.getPlatformDetails();
    return `(${platform}; ${arch}) ${userAgent}`;
  },

  _addLanguage(paramsMap) {
    const { lang } = store.getState().translationReducer;
    return this._addParam(paramsMap, LANGUAGE_PARAM, lang);
  },

  _addTranslations(paramsMap) {
    let translations = store.getState().translationReducer.languageList;
    if (translations && translations.length > 0) {
      translations = translations.join('|');
      return this._addParam(paramsMap, TRANSLATIONS_PARAM, translations);
    }
  },

  _addParam(paramsMap, name, value) {
    if (paramsMap instanceof Map) {
      paramsMap.set(name, value);
    } else if (!paramsMap) {
      paramsMap = Utils.toMap(name, value);
    } else {
      paramsMap[name] = value;
    }
    return paramsMap;
  },

  _paramsMapToString(paramsMap, routeConfiguration) {
    const { regularAmpUrl, translations } = routeConfiguration;
    const addTranslations = regularAmpUrl !== true && translations !== false;
    if (addTranslations) {
      paramsMap = this._addTranslations(paramsMap);
    }
    paramsMap = this._addLanguage(paramsMap);
    const kv = [];
    if (paramsMap) {
      if (paramsMap instanceof Map) {
        paramsMap.forEach((key, value) => kv.push(`${key}=${encodeURIComponent(value)}`));
      } else if (paramsMap instanceof Array) {
        paramsMap.forEach(([key, value]) => kv.push(`${key}=${encodeURIComponent(value)}`));
      } else {
        Object.keys(paramsMap).forEach(prop => kv.push(`${prop}=${encodeURIComponent(paramsMap[prop])}`));
      }
    }
    return kv.length ? `?${kv.join('&')}` : '';
  },

  _getFullBaseUrl(url, routeConfiguration) {
    if (routeConfiguration.isFull) {
      return url;
    }
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
        origin: ErrorConstants.NOTIFICATION_ORIGIN_API_NETWORK,
        severity: ErrorConstants.NOTIFICATION_SEVERITY_ERROR
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
