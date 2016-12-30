import Auth from '../security/Auth';
import UserHelper from '../helpers/UserHelper';

const LoginManager = {

  processLogin(email, password) {
    console.log('processLogin');
    let self = this;
    return new Promise(function (resolve, reject) {
      // 1) Check if AMPOffline is available.
      const isAMPOfflineAvailable = true; //TODO: read from a redux state.
      if (isAMPOfflineAvailable) {
        // 2) Find this email in db.
        UserHelper.findByUsername(email).then(function (dbUser) {
          console.log(dbUser);

          Auth.login(email, password).then(function (data) {
            // Save user info for later usage, encrypt if possible.
            self.registerLogin(data).then(function () {
              resolve(data);
            }).catch(function (err) {
              console.error(err);
              reject(err);
            });
          }).catch(function (err) {
            console.error(err);
            reject(err);
          });
        }).catch(function (err) {
          console.error(err);
          reject(err);
        });
      } else {
        reject(translate('login.AMPOfflineUnavailableError'));
      }
    });
  },

  registerLogin(userData) {
    console.log('registerLogin');
    return UserHelper.saveOrUpdateUser(userData);
  }
};

module.exports = LoginManager;
