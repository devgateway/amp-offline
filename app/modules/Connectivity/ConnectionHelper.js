import request from 'request';
import {BASE_URL} from '../../utils/Constants';

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
      request(options, function (error, response, body) {
        console.log(body);
        if (response.statusCode === 500 || body.error) {

          reject((error || JSON.stringify(body.error)));
        } else {
          resolve(body);
        }
      });
    });

  }
};

module.exports = ConnectionHelper;
