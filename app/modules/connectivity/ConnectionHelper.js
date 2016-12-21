import request from 'request';
import {BASE_URL} from '../../utils/Constants';
import RequestConfig from './RequestConfig';

const GET_WORKSPACES_URL = "rest/security/workspaces";

const ConnectionHelper = {

  getCallAuthenticated(token, url) {
    return new Promise(function (resolve, reject) {
      console.log('invoke get for ' + BASE_URL + "/" + url);
      const self = this;
      const options = {
        url: BASE_URL + "/" + url,
        json: true,
        headers: {'content-type': 'application/json', 'Accept': 'application/json', 'X-Auth-Token': token},
        method: 'GET'
      };
      return this._doMethod(options);
    });
  },

  doGet(url, paramsMap) {
    let requestConfig = RequestConfig.getRequestConfig('GET', url, paramsMap);
    return this._doMethod(requestConfig);
  },

  _doMethod(options) {
    return new Promise((resolve, reject) => {
      request(options, function (error, response, body) {
        //console.log(body);
        if (error || response.statusCode !== 200 || body.error) {
          reject((error || JSON.stringify(body === undefined? response.statusCode : body.error)));
        } else {
          resolve(body);
        }
      });
    });
  }

};

module.exports = ConnectionHelper;
