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
        UserHelper.findByUsername(email).then((dbUser) => {
          if (dbUser !== null) {
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
              Auth.onlineLogin(email, password).then(function (data) {
                self.registerLogin(data, password).then(function () {
                  resolve(data);
                }).catch(function (err) {
                  reject(err);
                });
              }).catch(function (err) {
                reject(err);
              });
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

  registerLogin(userData, password) {
    console.log('registerLogin');
    return UserHelper.saveOrUpdateUser(userData, password);
  }
};

module.exports = LoginManager;
