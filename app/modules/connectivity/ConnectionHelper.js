import request from 'request';
import RequestConfig from './RequestConfig';
import { store } from '../../index';
import { loginAutomaticallyAction } from '../../actions/LoginAction';

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
      request(options, function (error, response, body) {
        if (error || response.statusCode !== 200 || body.error) {
          if (response && response.statusCode === 401) {
            // Lets try to relogin.
            // https://github.com/reactjs/redux/issues/974
            store.dispatch(loginAutomaticallyAction()).then((data) => {
              if (data) {
                options = RequestConfig.replaceToken(options);
                self._doMethod(options).then(function (body_) {
                  resolve(body_);
                }).catch(function (error_) {
                  //TODO: we need to check if the user needs to relogin manually, invalidate the session and send him to login page.
                  reject(error_);
                });
              } else {
                resolve();
              }
            }).catch(function () {
              reject(error || (body && body.error))
            });
          } else {
            reject(error || body.error);
          }
        } else {
          resolve(body);
        }
      });
    });
  }
};

module.exports = ConnectionHelper;
