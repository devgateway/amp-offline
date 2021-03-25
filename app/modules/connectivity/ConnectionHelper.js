/* eslint no-nested-ternary: 0*/

import rp from 'request-promise';
import request from 'request';
import Promise from 'bluebird';
import { Constants, ErrorConstants } from 'amp-ui';
import RequestConfig from './RequestConfig';
import * as ErrorNotificationHelper from '../helpers/ErrorNotificationHelper';
import Notification from '../helpers/NotificationHelper';
import store from '../../index';
import { loginAutomaticallyAction, logoutAction } from '../../actions/LoginAction';
import Logger from '../../modules/util/LoggerManager';
import * as URLUtils from '../../utils/URLUtils';
import ApiErrorConverter from './ApiErrorConverter';

const logger = new Logger('Connection helper');

const ConnectionHelper = {

  doGet({ url, paramsMap, shouldRetry, extraUrlParam, writeStream }) {
    logger.debug('doGet');
    const method = 'GET';
    const requestConfig = RequestConfig.getRequestConfig({ method, url, paramsMap, extraUrlParam });
    return ConnectionHelper._doMethod(requestConfig, 100, shouldRetry, writeStream);
  },

  /**
   * POST method call
   * @param url
   * @param paramsMap
   * @param body
   * @param shouldRetry
   * @param extraUrlParam
   * @param writeStream
   * @return {Promise}
   */
  doPost({ url, paramsMap, body, shouldRetry, extraUrlParam, writeStream }) {
    logger.debug('doPost');
    // Notice that we are actually receiving an object as a parameter  but we are destructuring it
    const method = 'POST';
    const requestConfig = RequestConfig.getRequestConfig({ method, url, paramsMap, body, extraUrlParam });
    return ConnectionHelper._doMethod(requestConfig, 100, shouldRetry, writeStream);
  },

  doPut({ url, paramsMap, body, shouldRetry, extraUrlParam, writeStream }) {
    logger.debug('doPut');
    const method = 'PUT';
    const requestConfig = RequestConfig.getRequestConfig({ method, url, paramsMap, body, extraUrlParam });
    return ConnectionHelper._doMethod(requestConfig, 100, shouldRetry, writeStream);
  },

  _doMethod(requestConfig, maxRetryAttempts, shouldRetry, writeStream) {
    logger.log('_doMethod ');
    const url = requestConfig.url;
    logger.log(url);
    if (!URLUtils.isValidUrl(url)) {
      return this._reportError(ErrorConstants.MSG_INVALID_URL, ErrorConstants.NOTIFICATION_ORIGIN_API_NETWORK);
    }
    const resultRetryConfig = { requestConfig, maxRetryAttempts, shouldRetry, writeStream };
    // TODO I tried lower timeout for streaming and it seems to ignore it -> check how exactly to handle
    return this._buildRequestPromise(requestConfig, writeStream)
      .then(response => this._processResultOrRetry({ ...resultRetryConfig, response, body: response.body }))
      .catch(reason => {
        if (reason instanceof Notification) {
          return Promise.reject(reason);
        }
        return this._processResultOrRetry({ ...resultRetryConfig, ...this._reasonToProcess(reason) });
      });
  },

  _buildRequestPromise(requestConfig, writeStream) {
    if (writeStream) {
      return new Promise((resolve, reject) => {
        request(requestConfig)
          .on('response', (response) => {
            writeStream
              .on('finish', () => resolve(response))
              .on('error', reject);
          })
          .on('error', reject)
          .pipe(writeStream);
      });
    }
    return rp(requestConfig);
  },

  _reasonToProcess(reason) {
    return {
      error: reason.error,
      response: reason.response,
      body: reason.response && reason.response.body
    };
  },

  _processResultOrRetry({ error, response, body, requestConfig, maxRetryAttempts, shouldRetry, writeStream }) {
    if (error || !(response && response.statusCode >= 200 && response.statusCode < 400) || (body && body.error)) {
      const shouldRetryOnError = Constants.ERRORS_TO_RETRY.filter((value) => (
        value === (error ? error.code : (body ? body.error : ErrorConstants.MSG_UNKNOWN_NETWORK_ERROR))
      ));
      if (shouldRetryOnError.length > 0) {
        if (maxRetryAttempts > 0 && shouldRetry) {
          return this._doMethod(requestConfig, maxRetryAttempts - 1, shouldRetry, writeStream);
        } else {
          return this._reportError(ErrorConstants.MSG_TIMEOUT, ErrorConstants.NOTIFICATION_ORIGIN_API_NETWORK);
        }
      } else if (response && response.statusCode === 401) {
        // Lets try to relogin online automatically (https://github.com/reactjs/redux/issues/974)
        return store.dispatch(loginAutomaticallyAction())
          .then(() => this._doMethod(requestConfig, maxRetryAttempts, shouldRetry, writeStream))
          .catch((reason) => {
            const authResponse = reason.response;
            const authError = (authResponse && authResponse.body && authResponse.body.error) || reason.error;
            if (reason.response.statusCode === 401) {
              // If we couldn't relogin online automatically then we logout completely and forward to login page.
              store.dispatch(logoutAction());
            }
            return this._reportError(null, ErrorConstants.NOTIFICATION_ORIGIN_API_SECURITY, null,
              authError);
          });
      } else {
        // Being here means the server might not be accessible.
        const isAMPunreachable = (error && Constants.Constants.ERRORS_NO_AMP_SERVER.includes(error.code)) || !response;
        const isAccessDenied = response && response.statusCode === 403;
        const errorCode = isAccessDenied ? ErrorConstants.ERROR_CODE_ACCESS_DENIED : undefined;
        const message = isAMPunreachable ? ErrorConstants.MSG_AMP_UNREACHABLE :
          error || (ApiErrorConverter.toLocalError(body && body.error)) ||
          ErrorConstants.MSG_UNKNOWN_NETWORK_ERROR;
        // We need to detect statusCode 403 to throw a security error.
        const origin = isAccessDenied ? ErrorConstants.NOTIFICATION_ORIGIN_API_SECURITY :
          ErrorConstants.NOTIFICATION_ORIGIN_API_NETWORK;
        return this._reportError(message, origin, errorCode);
      }
    } else if (response && !response.complete) {
      return this._reportError('corruptedResponse', ErrorConstants.NOTIFICATION_ORIGIN_API_NETWORK);
    } else {
      return writeStream ? response : body;
    }
  },

  _reportError(message, origin, errorCode, errorObject) {
    if (!errorCode && ErrorConstants.GENERAL_CONNECTION_ERRORS.includes(message)) {
      errorCode = ErrorConstants.ERROR_CODE_NO_CONNECTIVITY;
    }
    return Promise.reject(ErrorNotificationHelper.createNotification({ message, origin, errorCode, errorObject }));
  }

};

module.exports = ConnectionHelper;
