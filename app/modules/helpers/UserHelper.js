import * as DatabaseManager from '../database/DatabaseManager';
import { COLLECTION_USERS, AKEY, HASH_ITERATIONS } from '../../utils/Constants';
import * as Auth from '../security/Auth';
import LoggerManager from '../../modules/util/LoggerManager';

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
    LoggerManager.log('findByEmail');
    const example = { email };
    return this.findUserByExample(example);
  },

  findUserByExample(example) {
    LoggerManager.log('findUserByExample');
    return DatabaseManager.findOne(example, COLLECTION_USERS);
  },

  findAllUsersByExample(example, projections) {
    LoggerManager.log('findUserByExample');
    return DatabaseManager.findAll(example, COLLECTION_USERS, projections);
  },

  /**
   * Save the User without the original password, with an ID and with the hash of the online password.
   * @param userData
   * @returns {Promise}
   */
  saveOrUpdateUser(userData) {
    LoggerManager.log('saveOrUpdateUser');
    return DatabaseManager.saveOrUpdate(userData.id, userData, COLLECTION_USERS);
  },

  generateAMPOfflineHashFromPassword(password) {
    LoggerManager.log('generateAMPOfflineHashFromPassword');
    return Auth.secureHash(password, AKEY, HASH_ITERATIONS);
  },

  saveOrUpdateUserCollection(usersData) {
    LoggerManager.log('saveOrUpdateUserCollection');
    return DatabaseManager.saveOrUpdateCollection(usersData, COLLECTION_USERS);
  },

  replaceUsers(users) {
    LoggerManager.log('replaceUsers');
    return DatabaseManager.replaceCollection(users, COLLECTION_USERS, {});
  },

  /**
   * Remove the user by id
   * @param userId
   * @returns {Promise}
   */
  deleteUserById(userId) {
    LoggerManager.log('deleteUserById');
    return DatabaseManager.removeById(userId, COLLECTION_USERS);
  }
};

module.exports = UserHelper;
