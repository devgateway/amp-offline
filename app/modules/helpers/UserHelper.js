import DatabaseManager from '../database/DatabaseManager';
import { COLLECTION_USERS, AKEY, HASH_ITERATIONS } from '../../utils/Constants';
import Auth from '../security/Auth';
import Utils from '../../utils/Utils';

/**
 * This helper is for User functions only.
 * We use this class not like a DAO but for having functions that can be reused on several Manager classes.
 * Since we use a NoSQL database we dont have a fixed data structure so this is not a place to define fields.
 */
const UserHelper = {

  /**
   * Find a user in the db by its email.
   * Provide an abstraction so the class calling this function doesnt have to know how the email field was implemented.
   * @param email
   * @returns {Promise}
   */
  findByEmail(email) {
    console.log('findByEmail');
    const example = {email: email};
    return this.findUserByExample(example);
  },

  findUserByExample(example) {
    console.log('findUserByExample');
    return new Promise(function (resolve, reject) {
      DatabaseManager.findOne(example, COLLECTION_USERS).then(resolve).catch(reject);
    });
  },

  /**
   * Save the User without the original password, with an ID and with the hash of the online password.
   * @param userData
   * @returns {Promise}
   */
  saveOrUpdateUser(userData, password) {
    console.log('saveOrUpdateUser');
    return new Promise((resolve, reject) => {
      DatabaseManager.saveOrUpdate(userData.id, userData, COLLECTION_USERS, {}).then(resolve).catch(reject);
    });
  },

  generateAMPOfflineHashFromPassword(password) {
    console.log('generateAMPOfflineHashFromPassword');
    return Auth.secureHash(password, AKEY, HASH_ITERATIONS);
  }
};

module.exports = UserHelper;
