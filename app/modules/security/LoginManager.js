import Auth from '../security/Auth';
import UserHelper from '../helpers/UserHelper';
import translate from '../../utils/translate';
import Util from '../../utils/Utils';
import { store } from '../../index';

const LoginManager = {

  processLogin(email, password) {
    console.log('processLogin');
    const self = this;
    return new Promise(function (resolve, reject) {
      // 1) Check if AMPOffline is available.
      const isAMPOfflineAvailable = true; // TODO: read from a redux state (to be done on AMPOFFLINE-100).
      if (isAMPOfflineAvailable) {
        // 2) Find this email in db.
        UserHelper.findByEmail(email).then((dbUser) => {
          if (dbUser !== null && dbUser.ampOfflinePassword && dbUser.ampOfflinePassword.toString() !== '') {
            // 3) Check if secureHash(entered password) === <saved user>.ampOfflinePassword.
            UserHelper.generateAMPOfflineHashFromPassword(password).then(function (hash) {
              if (hash === dbUser.ampOfflinePassword) {
                resolve({dbUser: dbUser});
              } else {
                reject(translate('login.wrongPassword'));
              }
            }).catch(reject);
          } else {
            // 3.1) First time this user login.
            // TODO: call another function to check if amp is online (to be done on AMPOFFLINE-103).
            const isAMPAvailable = true;
            if (isAMPAvailable) {
              self.processOnlineLogin({email, password}).then(resolve).catch(reject);
            } else {
              reject(translate('login.AMPUnreachableError'));
            }
          }
        }).catch(function (err) {
          reject(err);
        });
      } else {
        reject(translate('login.AMPOfflineUnavailableError'));
      }
    });
  },

  clearCredentialsInDB(email) {
    console.log('clearCredentialsInDB');
    return new Promise(function (resolve, reject) {
      UserHelper.findByEmail(email).then(function (data) {
        if (data) {
          delete data.ampOfflinePassword;
          UserHelper.saveOrUpdateUser(data, password).then(resolve).catch(reject);
        } else {
          reject(translate('cantCleanupCredentials'));
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
  processOnlineLogin({email, password}) {
    const self = this;
    return new Promise(function (resolve, reject) {
      Auth.onlineLogin(email, password).then(function (data) {
        self.saveLoginData(data, password).then(function (dbData) {
          resolve({dbUser: dbData, token: data.token});
        }).catch(function (err) {
          reject(err);
        });
      }).catch(function (err) {
        reject(err);
      });
    });
  },

  /**
   * Transform auth user data to db user data.
   */
  saveLoginData(userData, password) {
    console.log('saveLoginData');
    return new Promise(function (resolve, reject) {
      const email = userData.email || userData['user-name'];
      UserHelper.findByEmail(email).then(function (dbData) {
        UserHelper.generateAMPOfflineHashFromPassword(password).then(function (hash) {
          if (dbData) {
            dbData.ampOfflinePassword = hash;
            UserHelper.saveOrUpdateUser(dbData, password).then(resolve).catch(reject);
          } else {
            // TODO: this is just to generate an id because now we dont have it in the EP, we will remove it later.
            const id = userData.id || Util.stringToId(email);
            const dbUserData = {id: id, email: email};
            dbUserData.ampOfflinePassword = hash;
            UserHelper.saveOrUpdateUser(dbUserData, password).then(resolve).catch(reject);
          }
        }).catch(reject);
      }).catch(reject);
    });
  }
};

module.exports = LoginManager;
