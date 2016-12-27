import ConnectionHelper from '../connectivity/ConnectionHelper'
import DatabaseManager from '../database/DatabaseManager';
import {COLLECTION_WORKPACES} from '../../utils/Constants';

const GET_WORKSPACES_URL = "rest/security/workspaces";



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
  syncUp(token){
    console.log("syncup in progress");
    let self = this;

    return new Promise(function (resolve, reject) {
      //we are going to syncup users
      self.syncUpWs(token, GET_WORKSPACES_URL).then(function (data) {
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
  syncUpUser(token){
    //once we
  },
  //this will be moved to its own utility class
  syncUpWs(token, wsUrl){
    return new Promise(function (resolve, reject) {
      //TODO the workspace list should be for the useres in the UserStore, once we have defined
      //The userSync we can modify this call to only retrieve
      ConnectionHelper.getCallAuthenticated(token, wsUrl).then(function (data) {
        //TODO this is now async resolving in line 85 with an empty object. Once we have the bulk insert
        //we will make the call sync and resolve only when resolved
        data.forEach(function (value) {
          DatabaseManager.saveOrUpdate(value.id, value, COLLECTION_WORKPACES, null).then(function () {
          }).catch(function (err) {
            reject(err);
          });
        });
        resolve({});
      }).catch(function (err) {
        console.log("There was an error retrieving workspace data");
        console.log(JSON.stringify(err));

      });

    });
  }
};


module.exports = SyncUpManager;
