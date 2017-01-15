import { LOGIN_URL } from '../connectivity/AmpApiConstants';
import ConnectionHelper from '../../modules/connectivity/ConnectionHelper';
import { store } from '../../index';
import Notification from '../helpers/NotificationHelper';
import { NOTIFICATION_ORIGIN_AUTHENTICATION } from '../../utils/constants/ErrorConstants';

const Auth = {

  onlineLogin(email, password) {
    console.log('login');
    const url = LOGIN_URL;
    const body = {
      username: email,
      password
    };
    return new Promise((resolve, reject) => {
      ConnectionHelper.doPost({ url, body }).then((data) => {
        resolve(data);
        console.log(body);
      }).catch(reject);
    });
  },

  loggedIn() {
    // TODO: Implement more complex token validation scheme with expiration time, multiple users, etc.
    return (store.getState().login && store.getState().login.loggedIn);
  },

  logout() {
    // TODO: Implement this logic.
  },

  secureHash(password, salt, iterations) {
    return new Promise((resolve, reject) => {
      console.log('secureHash');
      // https://blog.engelke.com/2015/02/14/deriving-keys-from-passwords-with-webcrypto/
      const saltBuffer = Buffer.from(salt, 'utf8');
      const passphraseKey = Buffer.from(password, 'utf8');
      window.crypto.subtle.importKey(
        'raw',
        passphraseKey,
        { name: 'PBKDF2' },
        false,
        ['deriveBits', 'deriveKey']
      ).then((key) => window.crypto.subtle.deriveKey(
        {
          name: 'PBKDF2',
          salt: saltBuffer,
          iterations,
          hash: 'SHA-256'
        },
        key,
        { name: 'AES-CBC', length: 256 },
        true,
        ['encrypt', 'decrypt']
      )).then((webKey) => crypto.subtle.exportKey('raw', webKey)).then((buffer) => {
        const passwordHash = Buffer.from(buffer).toString('hex');
        resolve(passwordHash);
      }).catch((err) => {
        reject(new Notification({
          message: `Key derivation failed: ${err.message}`,
          origin: NOTIFICATION_ORIGIN_AUTHENTICATION
        }));
      });
    });
  }
};

module.exports = Auth;
