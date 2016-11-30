import request from 'request';
import _ from 'underscore';
import {BASE_URL} from '../../utils/Constants';

const LOGIN_URL = "rest/security/user";
const HARD_CODED_WORKSPACE = 4;

const Auth = {

  //TODO: change callback to promise.
  login(email, password) {
    console.log('login');
    const self = this;

    return new Promise(function (resolve, reject) {
      self.logout(); //TODO: remove this line, just for testing redirection.
      if (self.loggedIn()) {
        resolve();
      }

      const options = {
        url: BASE_URL + "/" + LOGIN_URL,
        json: true,
        body: {
          "username": email,
          "password": password,
          "workspaceId": HARD_CODED_WORKSPACE
        },
        headers: {'content-type': 'application/json', 'Accept': 'application/json'},
        method: 'POST'
      };
      request(options, function (error, response, body) {
        if (error != null || response.statusCode === 500 || body.error) {
          reject(((error !== null ? error.toString() : null) || JSON.stringify(body.error)));
        } else {
          console.log(body);
          localStorage.setItem('token', 'ImLoggedInToken');
          //TODO: save the token, etcetc.
          resolve(body);
        }
      });
    });
  },

  loggedIn() {
    //TODO: Implement more complex token validation scheme with expiration time, multiple users, etc.
    return !!localStorage.token;
  },

  logout() {
    localStorage.removeItem('token');
  }
};

module.exports = Auth;
