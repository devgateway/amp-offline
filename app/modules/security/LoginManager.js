import Auth from '../security/Auth';
import UserHelper from '../helpers/UserHelper';
import translate from '../../utils/translate';

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
                resolve(dbUser);
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
          dbData.token = data.token;
          resolve(dbData);
        }).catch(function (err) {
          reject(err);
        });
      }).catch(function (err) {
        reject(err);
      });
    });
  },

  saveLoginData(userData, password) {
    console.log('saveLoginData');
    // The user we save in db is different than userData coming from the login EP.
    const userToSave = {email: userData['user-name']};
    return UserHelper.saveOrUpdateUser(userToSave, password);
  }
};

module.exports = LoginManager;
