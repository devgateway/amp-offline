import * as ActivityHelper from '../modules/helpers/ActivityHelper';
import * as FieldsHelper from '../modules/helpers/FieldsHelper';
import * as PossibleValuesHelper from '../modules/helpers/PossibleValuesHelper';
import * as WorkspaceHelper from '../modules/helpers/WorkspaceHelper';
import ActivityHydrator from '../modules/helpers/ActivityHydrator';
import ActivityFieldsManager from '../modules/activity/ActivityFieldsManager';
import ActivityFundingTotals from '../modules/activity/ActivityFundingTotals';
import Notification from '../modules/helpers/NotificationHelper';
import { TEAM, MODIFIED_BY, MODIFIED_ON, CREATED_BY, CREATED_ON } from '../utils/constants/ActivityConstants';
import { NEW_ACTIVITY_ID } from '../utils/constants/ValueConstants';
import { NOTIFICATION_ORIGIN_ACTIVITY } from '../utils/constants/ErrorConstants';
import { ADJUSTMENT_TYPE_PATH, TRANSACTION_TYPE_PATH } from '../utils/constants/FieldPathConstants';

export const ACTIVITY_LOAD_PENDING = 'ACTIVITY_LOAD_PENDING';
export const ACTIVITY_LOAD_FULFILLED = 'ACTIVITY_LOAD_FULFILLED';
export const ACTIVITY_LOAD_REJECTED = 'ACTIVITY_LOAD_REJECTED';
export const ACTIVITY_SAVE_PENDING = 'ACTIVITY_SAVE_PENDING';
export const ACTIVITY_SAVE_FULFILLED = 'ACTIVITY_SAVE_FULFILLED';
export const ACTIVITY_SAVE_REJECTED = 'ACTIVITY_SAVE_REJECTED';
export const ACTIVITY_UNLOADED = 'ACTIVITY_UNLOADED';
const ACTIVITY_LOAD = 'ACTIVITY_LOAD';
const ACTIVITY_SAVE = 'ACTIVITY_SAVE';

export function loadActivityForActivityPreview(activityId) {
  const paths = [ADJUSTMENT_TYPE_PATH, TRANSACTION_TYPE_PATH];
  return (dispatch, ownProps) =>
    dispatch({
      type: ACTIVITY_LOAD,
      payload: _loadActivity(activityId, ownProps().user.teamMember.id, paths)
    });
}

export function loadActivityForActivityForm(activityId) {
  return (dispatch, ownProps) =>
    dispatch({
      type: ACTIVITY_LOAD,
      payload: _loadActivity(activityId, ownProps().user.teamMember.id)
    });
}

export function unloadActivity() {
  return (dispatch) =>
    dispatch({
      type: ACTIVITY_UNLOADED
    });
}

export function saveActivity(activity) {
  return (dispatch, ownProps) =>
    dispatch({
      type: ACTIVITY_SAVE,
      payload: _saveActivity(activity, ownProps().user.teamMember,
        ownProps().activityReducer.activityFieldsManager.fieldsDef)
    });
}

function _loadActivity(activityId, teamMemberId, possibleValuesPaths) {
  return new Promise((resolve, reject) => {
    const pvFilter = possibleValuesPaths ? { id: { $in: possibleValuesPaths } } : {};
    return Promise.all([
      _getActivity(activityId),
      FieldsHelper.findByWorkspaceMemberId(teamMemberId),
      PossibleValuesHelper.findAll(pvFilter)
    ])
      .then(([activity, fieldDefs, possibleOptionsCollection]) => {
        const activityFieldsManager = new ActivityFieldsManager(fieldDefs.fields, possibleOptionsCollection);
        const activityFundingTotals = new ActivityFundingTotals(activity, activityFieldsManager);
        return WorkspaceHelper.findById(activity[TEAM]).then(activityWorkspace =>
          resolve({ activity, activityWorkspace, activityFieldsManager, activityFundingTotals })
          ).catch(error => reject(_toNotification(error)));
      }).catch(error => reject(_toNotification(error)));
  });
}

const _toNotification = (error) => new Notification({ message: error, origin: NOTIFICATION_ORIGIN_ACTIVITY });

const _getActivity = (activityId) => {
  // special case for the new activity
  if (activityId === NEW_ACTIVITY_ID) {
    return Promise.resolve({});
  }
  return ActivityHelper.findNonRejectedById(activityId).then(activity =>
    ActivityHydrator.hydrateActivity({ activity }));
};

function _saveActivity(activity, teamMember, fieldDefs) {
  const dehydrator = new ActivityHydrator(fieldDefs);
  return dehydrator.dehydrateActivity(activity).then(dehydratedActivity => {
    const modifiedOn = (new Date()).toISOString();
    if (!dehydratedActivity[TEAM]) {
      dehydratedActivity[TEAM] = teamMember['workspace-id'];
    }
    if (!dehydratedActivity[CREATED_BY]) {
      dehydratedActivity[CREATED_BY] = teamMember.id;
    }
    if (!dehydratedActivity[CREATED_ON]) {
      dehydratedActivity[CREATED_ON] = modifiedOn;
    }
    dehydratedActivity[MODIFIED_BY] = teamMember.id;
    dehydratedActivity[MODIFIED_ON] = modifiedOn;
    return ActivityHelper.saveOrUpdate(dehydratedActivity);
  });
}
