import ConnectionHelper from '../connectivity/ConnectionHelper'
import WorkspaceHelper from  '../helpers/WorkspaceHelper';
import { GET_WORKSPACES_URL } from '../connectivity/AmpApiConstants';



const SyncUpManager = {
  getSyncUpHistory(){
    return new Promise(function (resolve, reject) {
      //TODO this should come from the Database
      //it's just a sample to show it in the sync page
      const syncUpHistory = {
        "requested-date": "07/12/2016 12:10:12",
        "sync-date": "07/12/2016 12:11:25",
        "status": "pending",
        "requested-by": {
          "email": "jdeanquin@developmentgateway.org"
        },
        "collections-to-be-synced": [
          {
            "collection": "users",
            "sync-handler": "userSync",
            "status": "pending",
            "order": 1,
            "continue-next-if-failed": false
          }, {
            "collection": "workspaces",
            "sync-handler": "workspaceSync",
            "sync-date": "07/12/2016 12:10:15",
            "status": "pending",
            "order": 1,
            "continue-next-if-failed": false
          },
          {
            "collection": "translations",
            "sync-handler": "traslationSync",
            "sync-date": "07/12/2016 12:10:15",
            "status": "pending",
            "order": 1,
            "continue-next-if-failed": false
          }
        ],
      };
      resolve(syncUpHistory);
    });
  },
  syncUp(){
    console.log("syncup in progress");
    const self = this;

    return new Promise(function (resolve, reject) {
      //we are going to syncup users
      self.syncUpWs( GET_WORKSPACES_URL).then(function (data) {
        const syncUpResult = {
          syncStatus: "synced",
        }
        resolve(syncUpResult);
        console.log("end sncup");
      }).catch(function (err) {
        console.log(err);
        reject(err);
      });
    });
  },
  syncUpUser(){
    //once we
  },
  //this will be moved to its own utility class
  syncUpWs(url){
    return new Promise(function (resolve, reject) {
      //TODO the workspace list should be for the useres in the UserStore, once we have defined
      //The userSync we can modify this call to only retrieve
      ConnectionHelper.doGet({url}).then((data) => {
        WorkspaceHelper.replaceWorkspaces(data).then(resolve).catch(reject);
      }).catch((error) => {
        reject(error);
      });
    });
  }
};


module.exports = SyncUpManager;
