/* eslint no-nested-ternary: 0*/

import request from 'request';
import RequestConfig from './RequestConfig';
import Notification from '../helpers/NotificationHelper';
import { MAX_RETRY_ATEMPTS, ERRORS_TO_RETRY, ERROR_NO_AMP_SERVER } from '../../utils/Constants';
import {
  NOTIFICATION_ORIGIN_API_SECURITY,
  NOTIFICATION_ORIGIN_API_NETWORK
} from '../../utils/constants/ErrorConstants';
import store from '../../index';
import { loginAutomaticallyAction, logoutAction } from '../../actions/LoginAction';
import translate from '../../utils/translate';

const ConnectionHelper = {

  doGet({ url, paramsMap, shouldRetry, extraUrlParam }) {
    console.log('doGet');
    const method = 'GET';
    // Modify the call to use ES6 destructuring
    const requestConfig = RequestConfig.getRequestConfig({ method, url, paramsMap, extraUrlParam });
    return this._doMethod(requestConfig, MAX_RETRY_ATEMPTS, shouldRetry);
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
    return this._doMethod(requestConfig, MAX_RETRY_ATEMPTS, shouldRetry);
  },

  _doMethod(requestConfig, maxRetryAttempts, shouldRetry) {
    console.log('_doMethod ');
    console.log(requestConfig.url);
    const self = this;
    return new Promise((resolve, reject) => (
      request(requestConfig, (error, response, body) => {
        if (error || !(response.statusCode >= 200 && response.statusCode < 400) || body.error) {
          const shouldRetryOnError = ERRORS_TO_RETRY.filter((value) => (
            value === (error ? error.code : (body ? body.error : 'unknownNetworkError'))
          ));
          if (shouldRetryOnError.length > 0) {
            if (maxRetryAttempts > 0 && shouldRetry) {
              maxRetryAttempts -= 1;
              return this._doMethod(requestConfig, maxRetryAttempts, shouldRetry).then(resolve).catch(reject);
            } else {
              const notifErrorTimeout = this.createNotification({
                message: translate('timeoutError'),
                origin: NOTIFICATION_ORIGIN_API_NETWORK
              });
              reject(notifErrorTimeout);
            }
          } else if (response && response.statusCode === 401) {
            // Lets try to relogin online automatically (https://github.com/reactjs/redux/issues/974)
            return store.dispatch(loginAutomaticallyAction()).then(() => {
              const options_ = RequestConfig.replaceToken(requestConfig);
              return self._doMethod(options_).then((body_) => (
                resolve(body_)
              )).catch((error_) => {
                // If we couldnt relogin online automatically then we logout completely and forward to login page.
                reject(this.createNotification({ errorObject: error_, origin: NOTIFICATION_ORIGIN_API_SECURITY }));
                return store.dispatch(logoutAction());
              });
            }).catch((error2) => {
              reject(this.createNotification({
                errorObject: error2,
                message: body.error || translate('unknownNetworkError'),
                origin: NOTIFICATION_ORIGIN_API_SECURITY
              }));
            });
          } else {
            // Being here means the server might not be accessible.
            let message = error || body.error || translate('unknownNetworkError');
            if (error && error.code === ERROR_NO_AMP_SERVER) {
              message = translate('AMPUnreachableError');
            }
            reject(this.createNotification({
              message,
              origin: NOTIFICATION_ORIGIN_API_NETWORK
            }));
          }
        } else {
          resolve(body);
        }
      })
    ));
  },

  createNotification({ message, origin, errorObject }) {
    return new Notification({
      message,
      origin,
      errorObject
    });
  }
};

module.exports = ConnectionHelper;
