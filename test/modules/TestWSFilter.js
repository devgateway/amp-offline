import DatabaseManager from '../../app/modules/database/DatabaseManager';
import WorkspaceHelper from '../../app/modules/helpers/WorkspaceHelper';
import WorkspaceManager from '../../app/modules/workspace/WorkspaceManager';
import { selectWorkspace } from '../../app/actions/WorkspaceAction';
import { COLLECTION_ACTIVITIES } from '../../app/utils/Constants';

const activities = require('./activities.json');
const workspaces = require('./workspaces.json');

// TODO: this is a quick test, not the final one. A separate ticket for this will be needed.
const Test = {
  fillInDummyActivities() {
    DatabaseManager.replaceCollection(activities, COLLECTION_ACTIVITIES);
  },

  fillInDummyWorkspaces() {
    /*
     const workspaces = [{id: 1}, {id: 2, "parent-workspace-id": 1}, {id: 3, "parent-workspace-id": 1},
     {id: 4, "parent-workspace-id": 2}, {id: 5}];
      */
    WorkspaceHelper.replaceWorkspaces(workspaces);
  },

  selectDummyWorkspace() {
    WorkspaceHelper.findById(18).then(workspace => selectWorkspace(workspace)).catch(err => console.log(err));
  },

  testWorkspaceFilter() {
    WorkspaceManager.getWorkspaceFilter().then(
      dbFilter => {
        DatabaseManager.findAll(dbFilter, COLLECTION_ACTIVITIES).then(filteredActivities => {
          console.log(filteredActivities);
          return filteredActivities;
        }).catch((err1) => console.log(err1));
        console.log(dbFilter);
        return dbFilter;
      }
    ).catch(error => console.log(error));
  }

};

module.exports = Test;
