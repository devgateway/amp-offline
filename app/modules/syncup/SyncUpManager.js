import ConnectionHelper from '../connectivity/ConnectionHelper';
import WorkspaceHelper from '../helpers/WorkspaceHelper';
import GlobalSettingsHelper from '../helpers/GlobalSettingsHelper';
import {
  GET_WORKSPACES_URL,
  GLOBAL_SETTINGS_URL,
  USER_PROFILE_URL,
  WORKSPACE_MEMBER_URL,
  TEST_URL
} from '../connectivity/AmpApiConstants';
import UserHelper from '../helpers/UserHelper';
import TeamMemberHelper from '../helpers/TeamMemberHelper';

const SyncUpManager = {

  getSyncUpHistory() {
    return new Promise((resolve, reject) => {
      // TODO this should come from the Database
      // it's just a sample to show it in the sync page
      const syncUpHistory = {
        'requested-date': '07/12/2016 12:10:12',
        'sync-date': '07/12/2016 12:11:25',
        status: 'pending',
        'requested-by': {
          email: 'jdeanquin@developmentgateway.org'
        },
        'collections-to-be-synced': [
          {
            collection: 'users',
            'sync-handler': 'userSync',
            status: 'pending',
            order: 1,
            'continue-next-if-failed': false
          }, {
            collection: 'workspaces',
            'sync-handler': 'workspaceSync',
            'sync-date': '07/12/2016 12:10:15',
            status: 'pending',
            order: 1,
            'continue-next-if-failed': false
          },
          {
            collection: 'translations',
            'sync-handler': 'traslationSync',
            'sync-date': '07/12/2016 12:10:15',
            status: 'pending',
            order: 1,
            'continue-next-if-failed': false
          }
        ],
      };
      resolve(syncUpHistory);
    });
  },

  syncUp() {
    console.log('syncUp');
    return new Promise((resolve, reject) => {
      this.prepareNetworkForSyncUp(TEST_URL).then(() => {
        Promise.all([this.syncUpWorkspace(GET_WORKSPACES_URL),
          this.syncUpGlobalSettings(GLOBAL_SETTINGS_URL),
          this.syncUpUsers(USER_PROFILE_URL),
          this.syncWorkspaceMembers(WORKSPACE_MEMBER_URL)])
          .then(() => {
            const syncUpResult = {
              syncStatus: 'synced',
            };
            resolve(syncUpResult);
            console.log('end sncup');
          }).catch(reject);
      }).catch(reject);
    });
  },

  /**
   * This function is used to call a testing EP that will force the online login (just one time) if needed.
   * This way we avoid having multiple concurrent online logins for each sync call.
   * @param url
   * @returns {*}
   */
  prepareNetworkForSyncUp(url) {
    console.log('prepareNetworkForSyncUp');
    return ConnectionHelper.doGet({ url });
  },

  // this will be moved to its own utility class
  syncUpWorkspace(url) {
    console.log('syncUpWorkspace');
    return new Promise((resolve, reject) => {
      // TODO the workspace list should be for the useres in the UserStore, once we have defined
      // The userSync we can modify this call to only retrieve
      ConnectionHelper.doGet({ url, paramsMap: { management: false, private: false } }).then((data) => {
        WorkspaceHelper.replaceWorkspaces(data).then(resolve).catch(reject);
      }).catch(reject);
    });
  },

  /**
   * Go to an EP, get the list of global settings and save it in a collection,
   * thats the only responsibility of this function.
   * @param url
   * @returns {Promise}
   */
  syncUpGlobalSettings(url) {
    console.log('syncUpGlobalSettings');
    return new Promise((resolve, reject) => {
      ConnectionHelper.doGet({ url }).then((data) => {
        GlobalSettingsHelper.saveGlobalSetting(data).then(resolve).catch(reject);
      }).catch(reject);
    });
  },

  /**
   * Sync detailed data about the users we currently have in the local db.
   * @param url
   * @returns {Promise}
   */
  syncUpUsers(url) {
    console.log('syncUpUsers');
    return new Promise((resolve, reject) => {
      UserHelper.findAllUserByExample({}).then((dbUsers) => {
        if (dbUsers) {
          const userIds = dbUsers.map(value => value.id);
          ConnectionHelper.doGet({ url: url, paramsMap: { ids: userIds } }).then((data) => {
            const newUsers = [];
            userIds.forEach((id) => {
              const currentUserDB = dbUsers.find(item => item.id === id);
              const currentUserEP = data.find(item => item.id === id);
              newUsers.push(Object.assign({}, currentUserDB, currentUserEP));
            });
            UserHelper.saveOrUpdateUserCollection(newUsers).then(resolve).catch(reject);
          }).catch(reject);
        } else {
          resolve();
        }
      }).catch(reject);
    });
  },

  syncWorkspaceMembers(url) {
    console.log('syncWorkspaceMembers');
    return new Promise((resolve, reject) => {
      const workspaceMemberIdsList = []; //TODO: we will implement this list later.
      ConnectionHelper.doGet({ url: url, paramsMap: { ids: workspaceMemberIdsList } }).then((data) => {
        TeamMemberHelper.saveOrUpdateTeamMembers(data).then(resolve).catch(reject);
      }).catch(reject);
    });
  }
};

module.exports = SyncUpManager;
