/* eslint no-else-return: 0*/
import { Constants, ErrorConstants } from 'amp-ui';
import Auth from '../security/Auth';
import UserHelper from '../helpers/UserHelper';
import Notification from '../helpers/NotificationHelper';
import Logger from '../util/LoggerManager';
import { LEGACY_KEY } from '../../utils/constants/UserConstants';

const logger = new Logger('Login manager');

const LoginManager = {

  processLogin(email, password, isAMPAvailable) {
    logger.log('processLogin');
    return new Promise((resolve, reject) => {
      // 1) Check if AMPOffline is available.
      const isAMPOfflineAvailable = true; // TODO: read from a redux state (to be done on AMPOFFLINE-100).
      if (isAMPOfflineAvailable) {
        // 2) Find this email in db.
        return UserHelper.findByEmail(email).then((dbUser) => {
          if (dbUser !== null && dbUser.ampOfflinePassword && dbUser.ampOfflinePassword.toString() !== '') {
            // 3) Check if secureHash(entered password) === <saved user>.ampOfflinePassword.
            return UserHelper.generateAMPOfflineHashFromPassword(email, password, dbUser[LEGACY_KEY]).then((hash) => {
              if (hash === dbUser.ampOfflinePassword) {
                return LoginManager._clearLegacyKey(dbUser, email, password).then(dbU => resolve({ dbUser: dbU }));
              } else {
                return reject(new Notification({
                  message: 'wrongPassword',
                  origin: ErrorConstants.NOTIFICATION_ORIGIN_AUTHENTICATION
                }));
              }
            }).catch(reject);
          } else if (isAMPAvailable) {
            return this.processOnlineLogin(email, password).then(resolve).catch(reject);
          } else {
            return reject(new Notification({
              message: 'AMPUnreachableError',
              origin: ErrorConstants.NOTIFICATION_ORIGIN_AUTHENTICATION
            }));
          }
        }).catch(reject);
      } else {
        reject(new Notification({
          message: 'AMPOfflineUnavailableError',
          origin: ErrorConstants.NOTIFICATION_ORIGIN_AUTHENTICATION
        }));
      }
    });
  },

  _clearLegacyKey(dbUser, email, password) {
    if (dbUser[LEGACY_KEY]) {
      return UserHelper.generateAMPOfflineHashFromPassword(email, password).then(hash => {
        dbUser.ampOfflinePassword = hash;
        delete dbUser[LEGACY_KEY];
        return UserHelper.saveOrUpdateUser(dbUser);
      });
    }
    return Promise.resolve(dbUser);
  },

  clearCredentialsInDB(email) {
    logger.log('clearCredentialsInDB');
    return UserHelper.findByEmail(email).then((data) => {
      if (data) {
        delete data.ampOfflinePassword;
        return UserHelper.saveOrUpdateUser(data);
      } else {
        return Promise.resolve();
      }
    });
  },

  /**
   * We always return the data from User in database + current token.
   * @param email
   * @param password
   * @returns {Promise}
   */
  processOnlineLogin(email, password) {
    logger.log('processOnlineLogin');
    return new Promise((resolve, reject) => (
      Auth.sha(password, Constants.DIGEST_ALGORITHM_SHA1).then((passwordDigest) => (
        Auth.onlineLogin(email, passwordDigest).then((data) => (
          this.saveLoginData(data, email, password).then((dbData) => (
            resolve({ dbUser: dbData, token: data.token })
          )).catch(reject)
        )).catch((error) => {
          // If error was caused because an authentication problem then we clear ampOfflinePassword.
          if (error.origin === ErrorConstants.NOTIFICATION_ORIGIN_API_SECURITY) {
            return this.clearCredentialsInDB(email).then(() => reject(error)).catch(() => reject(error));
          }
          reject(error);
        })
      ))
    ));
  },

  /**
   * Transform auth user data to db user data.
   */
  saveLoginData(userData, email, password) {
    logger.log('saveLoginData');
    return UserHelper.findByEmail(email).then((dbData) => (
      UserHelper.generateAMPOfflineHashFromPassword(email, password).then((hash) => {
        if (!dbData) {
          dbData = { id: userData['user-id'], email };
        }
        if (!dbData.registeredOnClient) {
          dbData.registeredOnClient = new Date().toISOString();
        }
        dbData.ampOfflinePassword = hash;
        return UserHelper.saveOrUpdateUser(dbData);
      })
    ));
  }
};

module.exports = LoginManager;
