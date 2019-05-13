import * as DatabaseManager from '../database/DatabaseManager';
import { COLLECTION_USERS, AKEY, HASH_ITERATIONS } from '../../utils/Constants';
import Auth from '../security/Auth';
import * as Utils from '../../utils/Utils';
import Logger from '../../modules/util/LoggerManager';

const logger = new Logger('User helper');

/**
 * This helper is for User functions only.
 * We use this class not like a DAO but for having functions that can be reused on several Manager classes.
 * Since we use a NoSQL database we dont have a fixed data structure so this is not a place to define fields.
 */
const UserHelper = {

  findById(id) {
    logger.debug('findById');
    const filter = { id };
    return this.findUserByExample(filter);
  },

  /**
   * Find a user in the db by its email.
   * Provide an abstraction so the class calling this function doesnt have to know how the email field was implemented.
   * @param email
   * @returns {Promise}
   */
  findByEmail(email) {
    logger.debug('findByEmail');
    const example = { email };
    return this.findUserByExample(example);
  },

  findUserByExample(example) {
    logger.debug('findUserByExample');
    return DatabaseManager.findOne(example, COLLECTION_USERS);
  },

  findAllUsersByExample(example, projections) {
    logger.debug('findUserByExample');
    return DatabaseManager.findAll(example, COLLECTION_USERS, projections);
  },

  findAllClientRegisteredUsersByExample(example, projections) {
    logger.debug('findAllClientRegisteredUsersByExample');
    example.registeredOnClient = { $exists: true };
    return DatabaseManager.findAll(example, COLLECTION_USERS, projections);
  },

  getNonBannedRegisteredUserIds() {
    return this.findAllClientRegisteredUsersByExample({ 'is-banned': { $ne: true } }, { id: 1 }).then(users =>
      Utils.flattenToListByKey(users, 'id'));
  },

  /**
   * Save the User without the original password, with an ID and with the hash of the online password.
   * @param userData
   * @returns {Promise}
   */
  saveOrUpdateUser(userData) {
    logger.log('saveOrUpdateUser');
    return DatabaseManager.saveOrUpdate(userData.id, userData, COLLECTION_USERS);
  },

  generateAMPOfflineHashFromPassword(password) {
    logger.log('generateAMPOfflineHashFromPassword');
    return Auth.secureHash(password, AKEY, HASH_ITERATIONS);
  },

  saveOrUpdateUserCollection(usersData) {
    logger.log('saveOrUpdateUserCollection');
    return DatabaseManager.saveOrUpdateCollection(usersData, COLLECTION_USERS);
  },

  replaceUsers(users) {
    logger.log('replaceUsers');
    return DatabaseManager.replaceCollection(users, COLLECTION_USERS);
  },

  /**
   * Remove the user by id
   * @param userId
   * @returns {Promise}
   */
  deleteUserById(userId) {
    logger.log('deleteUserById');
    return DatabaseManager.removeById(userId, COLLECTION_USERS);
  }
};

module.exports = UserHelper;
