import DatabaseManager from '../database/DatabaseManager';
import {COLLECTION_USERS} from '../../utils/Constants';

const LoginManager = {

  registerLogin(userData) {
    return new Promise(function (resolve, reject) {
      DatabaseManager.getCollection(COLLECTION_USERS, {useEncryption: true})
        .then(DatabaseManager.saveOrUpdate.bind(null, userData))
        .then(resolve)
        .catch(reject);
    });
  }

};

module.exports = LoginManager;
