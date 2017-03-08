import ConnectionHelper from '../connectivity/ConnectionHelper';
import UserHelper from '../helpers/UserHelper';

/**
 * Sync detailed data about the users we currently have in the local db.
 * @param url
 * @returns {Promise}
 */
export default function syncUpUsers(url) {
  console.log('syncUpUsers');
  return new Promise((resolve, reject) =>
    UserHelper.findAllUsersByExample({}).then((dbUsers) => {
      if (dbUsers) {
        const userIds = dbUsers.map(value => value.id);
        return ConnectionHelper.doGet({ url, paramsMap: { ids: userIds } }).then(
          // any user deleted on AMP, will be removed from the client as well as part of the replace
          (data) => resolve(UserHelper.replaceUsers(_getNewUsers(data, dbUsers)))
        ).catch(reject);
      }
      return resolve();
    }).catch(reject)
  );
}

function _getNewUsers(usersEP, usersDB) {
  const newUsers = [];
  usersEP.forEach(userEP => {
    newUsers.push(_getUser(userEP, usersDB));
  });
  return newUsers;
}

function _getUser(userEP, usersDB) {
  const userDB = usersDB.find(user => user.id === userEP.id);
  // if the user was already synced before, then we can check if the password was changed or the user was banned
  if (userDB['first-name']) {
    const pwdChange = userEP['password-changed-at'] !== userDB['password-changed-at'];
    const userBanned = userEP['is-banned'] === true;
    if (pwdChange || userBanned) {
      userDB.ampOfflinePassword = undefined;
    }
  }
  return Object.assign({}, userDB, userEP);
}
