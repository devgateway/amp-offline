import request from 'request';
import RequestConfig from './RequestConfig';
import Notification from '../helpers/NotificationHelper';
import { MAX_RETRY_ATEMPTS, ERRORS_TO_RETRY } from '../../utils/Constants';
import {
  NOTIFICATION_ORIGIN_API_SECURITY,
  NOTIFICATION_ORIGIN_API_NETWORK,
  NOTIFICATION_SEVERITY_ERROR
} from "../../utils/constants/ErrorConstants";
import store from "../../index";
import { loginAutomaticallyAction, logoutAction } from "../../actions/LoginAction";
import translate from "../../utils/translate";
const ConnectionHelper = {

  doGet({ url, paramsMap, shouldRetry, extraUrlParam }) {
    console.log('doGet');
    const method = 'GET';
    // Modify the call to use ES6 destructuring
    const requestConfig = RequestConfig.getRequestConfig({ method, url, paramsMap, extraUrlParam });
    const maxRetryAttemps = MAX_RETRY_ATEMPTS;
    return this._doMethod(requestConfig, maxRetryAttemps, shouldRetry);
  },

  /**
   *
   * @param url
   * @param paramsMap
   * @param body
   * @returns {Promise}
   */
  doPost({ url, paramsMap, body, shouldRetry, extraUrlParam }) {
    console.log('doPost');
    // Notice that we are actually receiving an object as a parameter  but we are destructuring it
    const method = 'POST';
    const requestConfig = RequestConfig.getRequestConfig({ method, url, paramsMap, body, extraUrlParam });
    const maxRetryAttemps = MAX_RETRY_ATEMPTS;
    return this._doMethod(requestConfig, maxRetryAttemps, shouldRetry);
  },

  _doMethod(requestConfig, maxRetryAttemps, shouldRetry) {
    console.log('_doMethod');
    const self = this;
    return new Promise((resolve, reject) => {
      request(requestConfig, (error, response, body) => {
        if (error || !(response.statusCode >= 200 && response.statusCode < 400 ) || body.error) {
          const shouldRetryOnError = ERRORS_TO_RETRY.filter((value) => {
            return value === (error ? error.code : (body ? body.error : 'unknownNetworkError'));
          });
          if (shouldRetryOnError.length > 0) {
            if (maxRetryAttemps > 0 && shouldRetry) {

              return this._doMethod(requestConfig, --maxRetryAttemps, shouldRetry).then(resolve).catch(reject);

            } else {
              const notifErrorTimeout = new Notification({
                errorObject: error,
                origin: NOTIFICATION_ORIGIN_API_NETWORK,
                severity: NOTIFICATION_SEVERITY_ERROR,
                message: error.code
              });
              reject(notifErrorTimeout);
            }
          } else if (response && response.statusCode === 401) {
            // Lets try to relogin online automatically (https://github.com/reactjs/redux/issues/974)
            store.dispatch(loginAutomaticallyAction()).then((data) => {
              const options_ = RequestConfig.replaceToken(requestConfig);
              self._doMethod(options_).then((body_) => {
                resolve(body_);
              }).catch((error_) => {
                // If we couldnt relogin online automatically we logout completely and forward to login page.
                reject(new Notification({
                  errorObject: error_,
                  origin: NOTIFICATION_ORIGIN_API_SECURITY,
                  severity: NOTIFICATION_SEVERITY_ERROR
                }));
                store.dispatch(logoutAction());
              });
            }).catch((error2) => {
              reject(new Notification({
                message: error2 || body.error || translate('unknownNetworkError'),
                origin: NOTIFICATION_ORIGIN_API_SECURITY,
                severity: NOTIFICATION_SEVERITY_ERROR
              }));
            });
          } else {
            reject(new Notification({
              message: error || body.error || translate('unknownNetworkError'),
              origin: NOTIFICATION_ORIGIN_API_NETWORK,
              severity: NOTIFICATION_SEVERITY_ERROR
            }));
          }
        } else {
          resolve(body);
        }
      });
    });
  }
};

module.exports = ConnectionHelper;
