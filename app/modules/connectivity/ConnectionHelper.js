import request from 'request';
import RequestConfig from './RequestConfig';
import { store } from '../../index';
import { loginAutomaticallyAction } from '../../actions/LoginAction';

const ConnectionHelper = {

  doGet({url, paramsMap}) {
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
    // Notice that we are actually receiving an object as a parameter  but we are destructuring it
    const method = 'POST';
    const requestConfig = RequestConfig.getRequestConfig({method, url, paramsMap, body});
    return this._doMethod(requestConfig);
  },

  _doMethod(options) {
    const self = this;
    return new Promise((resolve, reject) => {
      request(options, function (error, response, body) {
        if (error || response.statusCode !== 200 || body.error) {
          // We return body.error without string
          // aca tengo q parsear el error, si es 401 -> tratar de reloguear mediante el LoginAction -> si ok entonces reintentar, sino reject.
          // https://github.com/reactjs/redux/issues/974
          if (response && response.statusCode === 401) {
            // Lets try to relogin.
            store.dispatch(loginAutomaticallyAction()).then(() => {
              self._doMethod(options);
            }).catch(reject('problema'));
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
