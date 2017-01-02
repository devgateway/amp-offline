import request from 'request';
import {BASE_URL} from '../../utils/Constants';
import {store} from '../../index';

const LOGIN_URL = "rest/security/user";
const HARD_CODED_WORKSPACE = 4;

const Auth = {

  onlineLogin(email, password) {
    console.log('login');
    const self = this;

    return new Promise(function (resolve, reject) {
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
      //TODO: we need an util class for handling all ajax requests.
      request(options, function (error, response, body) {
        if (error != null || response.statusCode === 500 || body.error) {
          reject(((error !== null ? error.toString() : null) || JSON.stringify(body.error)));
        } else {
          console.log(body);
          //TODO: save the token, etcetc.
          resolve(body);
        }
      });
    });
  },

  loggedIn() {
    //TODO: Implement more complex token validation scheme with expiration time, multiple users, etc.
    return (store.getState().login && store.getState().login.loggedIn);
  },

  logout() {
    //TODO: Implement this logic.
  },

  secureHash(password, salt, iterations) {
    return new Promise(function (resolve, reject) {
      console.log('secureHash');
      // https://blog.engelke.com/2015/02/14/deriving-keys-from-passwords-with-webcrypto/
      const saltBuffer = Buffer.from(salt, 'utf8');
      const passphraseKey = Buffer.from(password, 'utf8');
      window.crypto.subtle.importKey(
        'raw',
        passphraseKey,
        {name: 'PBKDF2'},
        false,
        ['deriveBits', 'deriveKey']
      ).then(function (key) {
        return window.crypto.subtle.deriveKey(
          {
            "name": 'PBKDF2',
            "salt": saltBuffer,
            "iterations": iterations,
            "hash": 'SHA-256'
          },
          key,
          {"name": 'AES-CBC', "length": 256},
          true,
          ["encrypt", "decrypt"]
        )
      }).then(function (webKey) {
        return crypto.subtle.exportKey("raw", webKey);
      }).then(function (buffer) {
        let passwordHash = Buffer.from(buffer).toString('hex');
        resolve(passwordHash);
      }).catch(function (err) {
        reject("Key derivation failed: " + err.message);
      });
    });
  }
};

module.exports = Auth;
