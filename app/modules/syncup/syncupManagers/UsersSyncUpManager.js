import ConnectionHelper from '../../connectivity/ConnectionHelper';
import * as UserHelper from '../../helpers/UserHelper';
import AbstractAtomicSyncUpManager from './AbstractAtomicSyncUpManager';
import { USER_PROFILE_URL } from '../../connectivity/AmpApiConstants';
import { SYNCUP_TYPE_USERS } from '../../../utils/Constants';
import LoggerManager from '../../util/LoggerManager';

/* eslint-disable class-methods-use-this */

/**
 * Users SyncUp Manager. Any sync up changes to users must be atomic, no interruption.
 * @author Nadejda Mandrescu
 */
export default class UsersSyncUpManager extends AbstractAtomicSyncUpManager {

  constructor() {
    super(SYNCUP_TYPE_USERS);
  }

  /**
   * Sync detailed data about the users we currently have in the local db.
   * @returns {Promise}
   */
  doAtomicSyncUp({ saved, removed }) {
    LoggerManager.log('syncUpUsers');
    this.diff = { saved, removed };
    return new Promise((resolve, reject) =>
      Promise.all([
        this._pullUserData(saved).then((data) => {
          this.diff.saved = [];
          return data;
        }),
        this._deleteUsers(removed).then((data) => {
          this.diff.removed = [];
          return data;
        })
      ]).then(resolve).catch(reject)
    );
  }

  _deleteUsers(removed) {
    return Promise.all([removed.map(id => UserHelper.deleteUserById(id))]);
  }

  _pullUserData(saved) {
    return UserHelper.findAllUsersByExample({}).then((dbUsers) =>
      ConnectionHelper.doGet({ url: USER_PROFILE_URL, paramsMap: { ids: saved } })
        .then((data) => UserHelper.saveOrUpdateUserCollection(this._getNewUsers(data, dbUsers)))
    );
  }

  _getNewUsers(usersEP, usersDB) {
    const newUsers = [];
    usersEP.forEach(userEP => {
      newUsers.push(this._getUser(userEP, usersDB));
    });
    return newUsers;
  }

  _getUser(userEP, usersDB) {
    const userDB = usersDB.find(user => user.id === userEP.id);
    // if the user was already synced before, then we can check if the password was changed or the user was banned
    if (userDB && userDB['first-name']) {
      const pwdChange = userEP['password-changed-at'] !== userDB['password-changed-at'];
      const userBanned = userEP['is-banned'] === true;
      if (pwdChange || userBanned) {
        userDB.ampOfflinePassword = undefined;
      }
    }
    return Object.assign({}, userDB, userEP);
  }
}
