import request from "request";
import RequestConfig from "./RequestConfig";
import Notification from "../helpers/NotificationHelper";
import {
  NOTIFICATION_ORIGIN_API_SECURITY,
  NOTIFICATION_ORIGIN_API_NETWORK,
  NOTIFICATION_SEVERITY_ERROR
} from "../../utils/constants/ErrorConstants";
import { store } from "../../index";
import { loginAutomaticallyAction, logoutAction } from "../../actions/LoginAction";
import translate from "../../utils/translate";
const ConnectionHelper = {

  doGet({url, paramsMap}) {
    console.log('doGet');
    const method = 'GET';
    // Modify the call to use ES6 destructuring
    const requestConfig = RequestConfig.getRequestConfig({method, url, paramsMap});
    return this._doMethod(requestConfig);
  },

  /**
   *
   * @param url
   * @param paramsMap
   * @param body
   * @returns {Promise}
   */
  doPost({url, paramsMap, body}) {
    console.log('doPost');
    // Notice that we are actually receiving an object as a parameter  but we are destructuring it
    const method = 'POST';
    const requestConfig = RequestConfig.getRequestConfig({method, url, paramsMap, body});
    return this._doMethod(requestConfig);
  },

  _doMethod(options) {
    console.log('_doMethod');
    const self = this;
    return new Promise((resolve, reject) => {
      request(options, (error, response, body) => {
        if (error || response.statusCode !== 200 || body.error) {
          if (response && response.statusCode === 401) {
            // Lets try to relogin online automatically (https://github.com/reactjs/redux/issues/974)
            store.dispatch(loginAutomaticallyAction()).then((data) => {
              options = RequestConfig.replaceToken(options);
              self._doMethod(options).then((body_) => {
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
            }).catch(() => {
              reject(new Notification({
                errorObject: error || body.error,
                origin: NOTIFICATION_ORIGIN_API_SECURITY,
                severity: NOTIFICATION_SEVERITY_ERROR
              }));
            });
          } else {
            reject(new Notification({
              errorObject: error || body.error || translate('network.unknownNetworkError'),
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
