/* eslint no-nested-ternary: 0*/

import rp from 'request-promise';
import RequestConfig from './RequestConfig';
import ErrorNotificationHelper from '../helpers/ErrorNotificationHelper';
import { MAX_RETRY_ATEMPTS, ERRORS_TO_RETRY, ERROR_NO_AMP_SERVER } from '../../utils/Constants';
import {
  NOTIFICATION_ORIGIN_API_SECURITY,
  NOTIFICATION_ORIGIN_API_NETWORK
} from '../../utils/constants/ErrorConstants';
import store from '../../index';
import { loginAutomaticallyAction, logoutAction } from '../../actions/LoginAction';
import translate from '../../utils/translate';
import LoggerManager from '../../modules/util/LoggerManager';

const ConnectionHelper = {

  doGet({ url, paramsMap, shouldRetry, extraUrlParam }) {
    LoggerManager.log('doGet');
    const method = 'GET';
    // Modify the call to use ES6 destructuring
    const requestConfig = RequestConfig.getRequestConfig({ method, url, paramsMap, extraUrlParam });
    return this._doMethod(requestConfig, MAX_RETRY_ATEMPTS, shouldRetry);
  },

  /**
   * POST method call
   * @param url
   * @param paramsMap
   * @param body
   * @param shouldRetry
   * @param extraUrlParam
   * @return {Promise}
   */
  doPost({ url, paramsMap, body, shouldRetry, extraUrlParam }) {
    LoggerManager.log('doPost');
    // Notice that we are actually receiving an object as a parameter  but we are destructuring it
    const method = 'POST';
    const requestConfig = RequestConfig.getRequestConfig({ method, url, paramsMap, body, extraUrlParam });
    return this._doMethod(requestConfig, MAX_RETRY_ATEMPTS, shouldRetry);
  },

  _doMethod(requestConfig, maxRetryAttempts, shouldRetry) {
    LoggerManager.log('_doMethod ');
    LoggerManager.log(requestConfig.url);
    const resultRetryConfig = { requestConfig, maxRetryAttempts, shouldRetry };
    const requestPromiseForcedTimeout = store.getState().startUpReducer.connectionInformation.forcedTimeout;
    const requestPromise = rp(requestConfig);
    const bbPromise = requestPromise.promise();
    /*
    // doesn't seem to be needed
    const cancelIfStillPending = () => {
      if (bbPromise.isPending()) {
        requestPromise.cancel();
      }
      return null;
    };
     Utils.delay(requestPromiseForcedTimeout).then(cancelIfStillPending).catch(cancelIfStillPending);
    */
    bbPromise.timeout(requestPromiseForcedTimeout);
    return requestPromise
      .then(response => this._processResultOrRetry({ ...resultRetryConfig, response, body: response.body }))
      .catch(reason => this._processResultOrRetry({ ...resultRetryConfig, ...this._reasonToProcess(reason) }))
      .finally(() => {
        if (bbPromise.isCancelled()) {
          if (shouldRetry && maxRetryAttempts) {
            return this._doMethod(requestConfig, maxRetryAttempts - 1, shouldRetry);
          } else {
            return this._reportError(translate('timeoutError'), NOTIFICATION_ORIGIN_API_NETWORK);
          }
        }
      });
  },

  _reasonToProcess(reason) {
    return {
      error: reason.error,
      response: reason.response,
      body: reason.response && reason.response.body
    };
  },

  _processResultOrRetry({ error, response, body, requestConfig, maxRetryAttempts, shouldRetry }) {
    if (error || !(response && response.statusCode >= 200 && response.statusCode < 400) || body.error) {
      const shouldRetryOnError = ERRORS_TO_RETRY.filter((value) => (
        value === (error ? error.code : (body ? body.error : 'unknownNetworkError'))
      ));
      if (shouldRetryOnError.length > 0) {
        if (maxRetryAttempts > 0 && shouldRetry) {
          return this._doMethod(requestConfig, maxRetryAttempts - 1, shouldRetry);
        } else {
          return this._reportError(translate('timeoutError'), NOTIFICATION_ORIGIN_API_NETWORK);
        }
      } else if (response && response.statusCode === 401) {
        // Lets try to relogin online automatically (https://github.com/reactjs/redux/issues/974)
        return store.dispatch(loginAutomaticallyAction())
          .then(() => this._doMethod(requestConfig))
          .catch((reason) => {
            const authResponse = reason.response;
            const authError = (authResponse && authResponse.body && authResponse.body.error) || reason.error;
            if (reason.response.statusCode === 401) {
              // If we couldn't relogin online automatically then we logout completely and forward to login page.
              store.dispatch(logoutAction());
            }
            return this._reportError(null, NOTIFICATION_ORIGIN_API_SECURITY, authError);
          });
      } else {
        // Being here means the server might not be accessible.
        const message = error && error.code === ERROR_NO_AMP_SERVER ? translate('AMPUnreachableError') :
          error || (body && body.error) || translate('unknownNetworkError');
        // We need to detect statusCode 403 to throw a security error.
        const origin = (response && response.statusCode === 403)
          ? NOTIFICATION_ORIGIN_API_SECURITY
          : NOTIFICATION_ORIGIN_API_NETWORK;
        return this._reportError(message, origin);
      }
    } else if (!response.complete) {
      return this._reportError(translate('corruptedResponse'), NOTIFICATION_ORIGIN_API_NETWORK);
    } else {
      return body;
    }
  },

  _reportError(message, origin, errorObject) {
    return Promise.reject(ErrorNotificationHelper.createNotification({ message, origin, errorObject }));
  }

};

module.exports = ConnectionHelper;
