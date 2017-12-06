import encoding from 'text-encoding';
import { LOGIN_URL } from '../connectivity/AmpApiConstants';
import ConnectionHelper from '../../modules/connectivity/ConnectionHelper';
import store from '../../index';
import Notification from '../helpers/NotificationHelper';
import { NOTIFICATION_ORIGIN_AUTHENTICATION } from '../../utils/constants/ErrorConstants';
import { hexBufferToString } from '../../utils/Utils';
import { DIGEST_ALGORITHM_SHA256 } from '../../utils/Constants';
import Logger from '../../modules/util/LoggerManager';

const logger = new Logger('auth');

export default class Auth {

  static onlineLogin(email, password) {
    logger.log('login');
    const url = LOGIN_URL;
    const body = {
      username: email,
      password
    };
    return new Promise((resolve, reject) => {
      const shouldRetry = true;
      ConnectionHelper.doPost({ url, body, shouldRetry }).then((data) => (
        resolve(data)
      )).catch(reject);
    });
  }

  static loggedIn() {
    // TODO: Implement more complex token validation scheme with expiration time, multiple users, etc.
    return (store.getState().loginReducer && store.getState().loginReducer.loggedIn);
  }

  static logout() {
    // TODO: Implement this logic.
  }

  static secureHash(password, salt, iterations) {
    return new Promise((resolve, reject) => {
      logger.log('secureHash');
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
        return resolve(passwordHash);
      })
        .catch((err) => {
          reject(new Notification({
            message: `Key derivation failed: ${err.message}`,
            origin: NOTIFICATION_ORIGIN_AUTHENTICATION
          }));
        });
    });
  }

  /**
   * Generate SHA digest from string.
   * @param password
   * @param algorithm can be DIGEST_ALGORITHM_SHA256 or DIGEST_ALGORITHM_SHA1
   * @returns {Promise.<TResult>|*}
   */
  static sha(password, algorithm) {
    logger.log('sha');
    // Transform the string into an arraybuffer.
    const buffer = new encoding.TextEncoder('utf-8').encode(password);
    return window.crypto.subtle.digest(algorithm, buffer).then((hash) => hexBufferToString(hash));
  }
}
