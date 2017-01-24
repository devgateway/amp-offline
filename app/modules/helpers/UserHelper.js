import DatabaseManager from '../database/DatabaseManager';
import { COLLECTION_USERS, AKEY, HASH_ITERATIONS } from '../../utils/Constants';
import Auth from '../security/Auth';

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
    const example = { email: email };
    return this.findUserByExample(example);
  },

  findUserByExample(example) {
    console.log('findUserByExample');
    return DatabaseManager.findOne(example, COLLECTION_USERS);
  },

  findAllUserByExample(example) {
    console.log('findUserByExample');
    return DatabaseManager.findAll(example, COLLECTION_USERS);
  },

  /**
   * Save the User without the original password, with an ID and with the hash of the online password.
   * @param userData
   * @returns {Promise}
   */
  saveOrUpdateUser(userData) {
    console.log('saveOrUpdateUser');
    return DatabaseManager.saveOrUpdate(userData.id, userData, COLLECTION_USERS, {});
  },

  generateAMPOfflineHashFromPassword(password) {
    console.log('generateAMPOfflineHashFromPassword');
    return Auth.secureHash(password, AKEY, HASH_ITERATIONS);
  },

  saveOrUpdateUserCollection(usersData) {
    console.log('saveOrUpdateUserCollection');
    return DatabaseManager.saveOrUpdateCollection(usersData, COLLECTION_USERS);
  }
};

module.exports = UserHelper;
