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
    var self = this;
    return new Promise(function (resolve, reject) {
      //TODO: this is just to generate an id because now we dont have it in the EP.
      userData.id = self.emailToId(userData['user-name']);
      DatabaseManager.saveOrUpdate(userData.id, userData, COLLECTION_USERS, {useEncryption: true})
        .then(resolve)
        .catch(reject);
    });
  },

  emailToId(email) {
    let hash = 5381;
    let i = email.length;
    while (i) {
      hash = (hash * 33) ^ email.charCodeAt(--i);
    }
    return hash >>> 0;
  }

};

module.exports = LoginManager;
