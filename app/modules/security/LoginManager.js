/* eslint no-else-return: 0*/
import Auth from '../security/Auth';
import UserHelper from '../helpers/UserHelper';
import Notification from '../helpers/NotificationHelper';
import {
  NOTIFICATION_ORIGIN_API_SECURITY,
  NOTIFICATION_ORIGIN_AUTHENTICATION
} from '../../utils/constants/ErrorConstants';
import { DIGEST_ALGORITHM_SHA1 } from '../../utils/Constants';
import LoggerManager from '../util/LoggerManager';

const LoginManager = {

  processLogin(email, password, isAMPAvailable) {
    LoggerManager.log('processLogin');
    return new Promise((resolve, reject) => {
      // 1) Check if AMPOffline is available.
      const isAMPOfflineAvailable = true; // TODO: read from a redux state (to be done on AMPOFFLINE-100).
      if (isAMPOfflineAvailable) {
        // 2) Find this email in db.
        return UserHelper.findByEmail(email).then((dbUser) => {
          if (dbUser !== null && dbUser.ampOfflinePassword && dbUser.ampOfflinePassword.toString() !== '') {
            // 3) Check if secureHash(entered password) === <saved user>.ampOfflinePassword.
            return UserHelper.generateAMPOfflineHashFromPassword(password).then((hash) => {
              if (hash === dbUser.ampOfflinePassword) {
                return resolve({ dbUser });
              } else {
                return reject(new Notification({
                  message: 'wrongPassword',
                  origin: NOTIFICATION_ORIGIN_AUTHENTICATION
                }));
              }
            }).catch(reject);
          } else if (isAMPAvailable) {
            return this.processOnlineLogin(email, password).then(resolve).catch(reject);
          } else {
            return reject(new Notification({
              message: 'AMPUnreachableError',
              origin: NOTIFICATION_ORIGIN_AUTHENTICATION
            }));
          }
        }).catch(reject);
      } else {
        reject(new Notification({
          message: 'AMPOfflineUnavailableError',
          origin: NOTIFICATION_ORIGIN_AUTHENTICATION
        }));
      }
    });
  },

  clearCredentialsInDB(email) {
    LoggerManager.log('clearCredentialsInDB');
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
    LoggerManager.log('processOnlineLogin');
    return new Promise((resolve, reject) => (
      Auth.sha(password, DIGEST_ALGORITHM_SHA1).then((passwordDigest) => (
        Auth.onlineLogin(email, passwordDigest).then((data) => (
          this.saveLoginData(data, email, password).then((dbData) => (
            resolve({ dbUser: dbData, token: data.token })
          )).catch(reject)
        )).catch((error) => {
          // If error was caused because an authentication problem then we clear ampOfflinePassword.
          if (error.origin === NOTIFICATION_ORIGIN_API_SECURITY) {
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
    LoggerManager.log('saveLoginData');
    return UserHelper.findByEmail(email).then((dbData) => (
      UserHelper.generateAMPOfflineHashFromPassword(password).then((hash) => {
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
