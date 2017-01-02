import { LOGIN_URL } from '../connectivity/AmpApiConstants';
import ConnectionHelper from '../../modules/connectivity/ConnectionHelper';
const HARD_CODED_WORKSPACE = 2;

const Auth = {

  login(email, password) {
    console.log('login');
    const self = this;
    const url = LOGIN_URL;
    const body = {
      "username": email,
      "password": password
    };
    return new Promise(function (resolve, reject) {
      // TODO: remove this line, just for testing redirection.
      self.logout();
      if (self.loggedIn()) {
        resolve();
      }

      ConnectionHelper.doPost({url, body}).then((data) => {
        resolve(data);
        console.log(body);
        localStorage.setItem('token', 'ImLoggedInToken');
        // TODO: save the token, etcetc.
      }).catch((err) => {
        console.log(err);
        reject(err);
      });
    });
  },

  loggedIn() {
    // TODO: Implement more complex token validation scheme with expiration time, multiple users, etc.
    return !!localStorage.token;
  },
  logout() {
    localStorage.removeItem('token');
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
