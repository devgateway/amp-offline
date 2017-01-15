import { COLLECTION_WORKPACES } from '../../utils/Constants';
import DatabaseManager from '../database/DatabaseManager';
import Notification from '../helpers/NotificationHelper';
import { NOTIFICATION_ORIGIN_DATABASE } from '../../utils/constants/ErrorConstants';

const WorkspaceManager = {

  getWorkspacesFromStore(){
    return new Promise(function (resolve, reject) {
      DatabaseManager._getCollection(COLLECTION_WORKPACES, null).then((workspaceStore) => {
        workspaceStore.find({}, function (err, workspaceCollection) {
          if (err != null) {
            reject(new Notification({message: err.toString(), origin: NOTIFICATION_ORIGIN_DATABASE}));
          } else {
            resolve(workspaceCollection);
          }
        });
      }).catch(reject);
    });
  }
};

module.exports = WorkspaceManager;
