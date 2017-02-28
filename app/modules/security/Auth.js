import { LOGIN_URL } from '../connectivity/AmpApiConstants';
import ConnectionHelper from '../../modules/connectivity/ConnectionHelper';
import { store } from '../../index';
import Notification from '../helpers/NotificationHelper';
import { NOTIFICATION_ORIGIN_AUTHENTICATION } from '../../utils/constants/ErrorConstants';
import { hexBufferToString } from '../../utils/Utils';
import { DIGEST_ALGORITHM_SHA256 } from '../../utils/Constants';

const Auth = {

  onlineLogin(email, password) {
    console.log('login');
    const url = LOGIN_URL;
    const body = {
      username: email,
      password
    };
    return new Promise((resolve, reject) => {
      const shouldRetry = true;
      ConnectionHelper.doPost({ url, body ,shouldRetry}).then((data) => {
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
          hash: DIGEST_ALGORITHM_SHA256
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
  },

  /**
   * Generate SHA digest from string.
   * @param password
   * @param algorithm can be DIGEST_ALGORITHM_SHA256 or DIGEST_ALGORITHM_SHA1
   * @returns {Promise.<TResult>|*}
   */
  sha(password, algorithm) {
    console.log('sha');
    // Transform the string into an arraybuffer.
    const buffer = new TextEncoder('utf-8').encode(password);
    return crypto.subtle.digest(algorithm, buffer).then((hash) => hexBufferToString(hash));
  }
};

module.exports = Auth;
