import DatabaseManager from '../database/DatabaseManager';
import {COLLECTION_USERS} from '../../utils/Constants';
import Auth from '../security/Auth';

const LoginManager = {

  processLogin(email, password) {
    console.log('processLogin');
    let self = this;
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
    return new Promise(function (resolve, reject) {
      DatabaseManager.getCollection(COLLECTION_USERS, {useEncryption: true})
        .then(DatabaseManager.saveOrUpdate.bind(null, userData))
        .then(resolve)
        .catch(reject);
    });
  }

};

module.exports = LoginManager;
