import Auth from '../security/Auth';
import UserHelper from '../helpers/UserHelper';

const LoginManager = {

  processLogin(email, password) {
    console.log('processLogin');
    const self = this;
    return new Promise(function (resolve, reject) {
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
    });
  },

  registerLogin(userData) {
    console.log('registerLogin');
    return UserHelper.saveOrUpdateUser(userData);
  }
};

module.exports = LoginManager;
