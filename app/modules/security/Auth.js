import request from 'request';
import _ from 'underscore';

const BASE_URL = "http://localhost:8080";
const LOGIN_URL = "rest/security/user";
const HARD_CODED_WORKSPACE = 23;

const Auth = {

  login(email, password, callback) {
    this.logout(); //TODO: remove this line, just for testing redirection.

    //TODO: what if we use promises instead of a callback?
    if (this.loggedIn()) {
      callback(true);
      return;
    }

    const self = this;
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
      if (response.statusCode === 500 || body.error) {
        callback(false, (error || JSON.stringify(body.error)));
      } else {
        console.log(body);
        localStorage.setItem('token', 'ImLoggedInToken');
        //TODO: save the token, etcetc.
        callback(true, body);
      }
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
