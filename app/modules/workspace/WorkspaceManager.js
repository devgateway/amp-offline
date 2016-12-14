import request from 'request';
import {BASE_URL, COLLECTION_WORKPACES} from '../../utils/Constants';

import DatabaseManager from '../database/DatabaseManager';
export const GET_WORKSPACES_URL = "rest/security/workspaces";

const WorkspaceManager = {
  getWorkspacesFromStore(){
    return new Promise(function (resolve, reject) {
      DatabaseManager._getCollection(COLLECTION_WORKPACES, null).then(function (workspaceStore) {
        workspaceStore.find({}, function (err, workspaceCollection) {
          if (err != null) {
            reject(err);
          } else {
            resolve(workspaceCollection);
          }
        });
      }).catch(reject);
    });
  }
}

module.exports = WorkspaceManager;
