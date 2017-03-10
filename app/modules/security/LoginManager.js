import Auth from '../security/Auth';
import UserHelper from '../helpers/UserHelper';
import Notification from '../helpers/NotificationHelper';
import {
  NOTIFICATION_ORIGIN_AUTHENTICATION,
  NOTIFICATION_ORIGIN_API_SECURITY
} from '../../utils/constants/ErrorConstants';
import { DIGEST_ALGORITHM_SHA1 } from '../../utils/Constants';

const LoginManager = {

  processLogin(email, password) {
    console.log('processLogin');
    return new Promise((resolve, reject) => {
      // 1) Check if AMPOffline is available.
      const isAMPOfflineAvailable = true; // TODO: read from a redux state (to be done on AMPOFFLINE-100).
      if (isAMPOfflineAvailable) {
        // 2) Find this email in db.
        UserHelper.findByEmail(email).then((dbUser) => {
          if (dbUser !== null && dbUser.ampOfflinePassword && dbUser.ampOfflinePassword.toString() !== '') {
            // 3) Check if secureHash(entered password) === <saved user>.ampOfflinePassword.
            UserHelper.generateAMPOfflineHashFromPassword(password).then((hash) => {
              if (hash === dbUser.ampOfflinePassword) {
                resolve({ dbUser });
              } else {
                reject(new Notification({
                  message: 'wrongPassword',
                  origin: NOTIFICATION_ORIGIN_AUTHENTICATION
                }));
              }
            }).catch(reject);
          } else {
            // 3.1) First time this user login.
            // TODO: call another function to check if amp is online (to be done on AMPOFFLINE-103).
            const isAMPAvailable = true;
            if (isAMPAvailable) {
              this.processOnlineLogin(email, password).then(resolve).catch(reject);
            } else {
              reject(new Notification({
                message: 'AMPUnreachableError',
                origin: NOTIFICATION_ORIGIN_AUTHENTICATION
              }));
            }
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
    console.log('clearCredentialsInDB');
    return new Promise((resolve, reject) => {
      UserHelper.findByEmail(email).then((data) => {
        if (data) {
          delete data.ampOfflinePassword;
          UserHelper.saveOrUpdateUser(data).then(resolve).catch(reject);
        } else {
          resolve();
        }
      }).catch(reject);
    });
  },

  /**
   * We always return the data from User in database + current token.
   * @param email
   * @param password
   * @returns {Promise}
   */
  processOnlineLogin(email, password) {
    console.log('processOnlineLogin');
    return new Promise((resolve, reject) => {
      Auth.sha(password, DIGEST_ALGORITHM_SHA1).then((passwordDigest) => {
        Auth.onlineLogin(email, passwordDigest).then((data) => {
          this.saveLoginData(data, email, password).then((dbData) => {
            resolve({ dbUser: dbData, token: data.token });
          }).catch(reject);
        }).catch((error) => {
          // If error was caused because an authentication problem then we clear ampOfflinePassword.
          if (error.origin === NOTIFICATION_ORIGIN_API_SECURITY) {
            this.clearCredentialsInDB(email);
          }
          reject(error);
        });
      });
    });
  },

  /**
   * Transform auth user data to db user data.
   */
  saveLoginData(userData, email, password) {
    console.log('saveLoginData');
    return new Promise((resolve, reject) => {
      UserHelper.findByEmail(email).then((dbData) => {
        UserHelper.generateAMPOfflineHashFromPassword(password).then((hash) => {
          if (dbData) {
            dbData.ampOfflinePassword = hash;
            UserHelper.saveOrUpdateUser(dbData).then(resolve).catch(reject);
          } else {
            const id = userData['user-id'];
            const dbUserData = { id, email };
            dbUserData.ampOfflinePassword = hash;
            UserHelper.saveOrUpdateUser(dbUserData).then(resolve).catch(reject);
          }
        }).catch(reject);
      }).catch(reject);
    });
  }
};

module.exports = LoginManager;
