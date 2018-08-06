/* eslint no-nested-ternary: 0*/

import rp from 'request-promise';
import request from 'request';
import Promise from 'bluebird';
import RequestConfig from './RequestConfig';
import * as ErrorNotificationHelper from '../helpers/ErrorNotificationHelper';
import Notification from '../helpers/NotificationHelper';
import { ERRORS_NO_AMP_SERVER, ERRORS_TO_RETRY, MAX_RETRY_ATEMPTS } from '../../utils/Constants';
import {
  ERROR_CODE_NO_CONNECTIVITY,
  NOTIFICATION_ORIGIN_API_NETWORK,
  NOTIFICATION_ORIGIN_API_SECURITY
} from '../../utils/constants/ErrorConstants';
import store from '../../index';
import { loginAutomaticallyAction, logoutAction } from '../../actions/LoginAction';
import translate from '../../utils/translate';
import Logger from '../../modules/util/LoggerManager';
import * as URLUtils from '../../utils/URLUtils';

const logger = new Logger('Connection helper');

request.debug = true;

const ConnectionHelper = {

  doGet({ url, paramsMap, shouldRetry, extraUrlParam, writeStream }) {
    logger.debug('doGet');
    const method = 'GET';
    const requestConfig = RequestConfig.getRequestConfig({ method, url, paramsMap, extraUrlParam });
    return ConnectionHelper._doMethod(requestConfig, MAX_RETRY_ATEMPTS, shouldRetry, writeStream);
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
    return ConnectionHelper._doMethod(requestConfig, MAX_RETRY_ATEMPTS, shouldRetry, writeStream);
  },

  doPut({ url, paramsMap, body, shouldRetry, extraUrlParam, writeStream }) {
    logger.debug('doPut');
    const method = 'PUT';
    const requestConfig = RequestConfig.getRequestConfig({ method, url, paramsMap, body, extraUrlParam });
    return ConnectionHelper._doMethod(requestConfig, MAX_RETRY_ATEMPTS, shouldRetry, writeStream);
  },

  _doMethod(requestConfig, maxRetryAttempts, shouldRetry, writeStream) {
    logger.log('_doMethod ');
    const url = requestConfig.url;
    logger.log(url);
    if (!URLUtils.isValidUrl(url)) {
      return this._reportError(translate('invalidUrl'), NOTIFICATION_ORIGIN_API_NETWORK);
    }
    const resultRetryConfig = { requestConfig, maxRetryAttempts, shouldRetry, writeStream };
    const requestPromiseForcedTimeout = store.getState().startUpReducer.connectionInformation.forcedTimeout;
    const requestPromise = this._buildRequestPromise(requestConfig, writeStream);
    const bbPromise = requestPromise.promise && requestPromise.promise();
    if (bbPromise) {
      bbPromise.timeout(requestPromiseForcedTimeout);
    }
    // TODO I tried lower timeout for streaming and it seems to ignore it -> check how exactly to handle
    return requestPromise
      .then(response => this._processResultOrRetry({ ...resultRetryConfig, response, body: response.body }))
      .catch(reason => {
        if (reason instanceof Notification) {
          return Promise.reject(reason);
        }
        return this._processResultOrRetry({ ...resultRetryConfig, ...this._reasonToProcess(reason) });
      })
      .finally(() => {
        if (bbPromise && bbPromise.isCancelled()) {
          if (shouldRetry && maxRetryAttempts) {
            return this._doMethod(requestConfig, maxRetryAttempts - 1, shouldRetry, writeStream);
          } else {
            return this._reportError(translate('timeoutError'), NOTIFICATION_ORIGIN_API_NETWORK);
          }
        }
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
      const shouldRetryOnError = ERRORS_TO_RETRY.filter((value) => (
        value === (error ? error.code : (body ? body.error : 'unknownNetworkError'))
      ));
      if (shouldRetryOnError.length > 0) {
        if (maxRetryAttempts > 0 && shouldRetry) {
          return this._doMethod(requestConfig, maxRetryAttempts - 1, shouldRetry, writeStream);
        } else {
          return this._reportError(translate('timeoutError'), NOTIFICATION_ORIGIN_API_NETWORK);
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
            return this._reportError(null, NOTIFICATION_ORIGIN_API_SECURITY, null, authError);
          });
      } else {
        // Being here means the server might not be accessible.
        const isAMPunreachable = error && ERRORS_NO_AMP_SERVER.includes(error.code);
        const errorCode = isAMPunreachable ? ERROR_CODE_NO_CONNECTIVITY : undefined;
        const message = isAMPunreachable ? translate('AMPUnreachableError') : error || (body && body.error) || translate('unknownNetworkError');
        // We need to detect statusCode 403 to throw a security error.
        const origin = (response && response.statusCode === 403)
          ? NOTIFICATION_ORIGIN_API_SECURITY
          : NOTIFICATION_ORIGIN_API_NETWORK;
        return this._reportError(message, origin, errorCode);
      }
    } else if (response && !response.complete) {
      return this._reportError(translate('corruptedResponse'), NOTIFICATION_ORIGIN_API_NETWORK);
    } else {
      return writeStream ? response : body;
    }
  },

  _reportError(message, origin, errorCode, errorObject) {
    return Promise.reject(ErrorNotificationHelper.createNotification({ message, origin, errorCode, errorObject }));
  }

};

module.exports = ConnectionHelper;
