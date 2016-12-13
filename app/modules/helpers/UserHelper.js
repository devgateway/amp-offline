import DatabaseManager from '../database/DatabaseManager';
import {COLLECTION_USERS} from '../../utils/Constants';

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
    let example = {email: email};
    return this.findUserByExample(example);
  },

  findByUsername(name) {
    console.log('findByUsername');
    let example = {userName: name};
    return this.findUserByExample(example);
  },

  findUserByExample(example) {
    console.log('findUserByExample');
    return new Promise(function (resolve, reject) {
      DatabaseManager.findOne(example, COLLECTION_USERS).then(resolve).catch(reject);
    });
  },

  saveOrUpdateUser(userData) {
    console.log('saveOrUpdateUser');
    let self = this;
    return new Promise(function (resolve, reject) {
      //TODO: this is just to generate an id because now we dont have it in the EP.
      userData.id = self.emailToId(userData['user-name']);
      DatabaseManager.saveOrUpdate(userData.id, userData, COLLECTION_USERS, {})
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

module.exports = UserHelper;
