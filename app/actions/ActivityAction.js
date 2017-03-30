import * as ActivityHelper from '../modules/helpers/ActivityHelper';
import * as FieldsHelper from '../modules/helpers/FieldsHelper';
import * as PossibleValuesHelper from '../modules/helpers/PossibleValuesHelper';
import * as WorkspaceHelper from '../modules/helpers/WorkspaceHelper';
import ActivityHydrator from '../modules/helpers/ActivityHydrator';
import ActivityFieldsManager from '../modules/activity/ActivityFieldsManager';
import ActivityFundingTotals from '../modules/activity/ActivityFundingTotals';
import Notification from '../modules/helpers/NotificationHelper';
import { TEAM } from '../utils/constants/ActivityConstants';
import { NOTIFICATION_ORIGIN_ACTIVITY } from '../utils/constants/ErrorConstants';
import { ADJUSTMENT_TYPE_PATH, TRANSACTION_TYPE_PATH } from '../utils/constants/FieldPathConstants';

export const ACTIVITY_LOAD_PENDING = 'ACTIVITY_LOAD_PENDING';
export const ACTIVITY_LOAD_FULFILLED = 'ACTIVITY_LOAD_FULFILLED';
export const ACTIVITY_LOAD_REJECTED = 'ACTIVITY_LOAD_REJECTED';

export function loadActivityForActivityPreview(activityId) {
  const paths = [ADJUSTMENT_TYPE_PATH, TRANSACTION_TYPE_PATH];
  return (dispatch, ownProps) =>
    dispatch({
      type: 'ACTIVITY_LOAD',
      payload: _loadActivity(activityId, ownProps().user.teamMember.id, paths)
    });
}

export function loadActivityForActivityForm(activityId) {
  // TODO deep clone
  return (dispatch, ownProps) =>
    dispatch({
      type: 'ACTIVITY_LOAD',
      payload: _loadActivity(activityId, ownProps().user.teamMember.id)
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

// TODO remove teamMemberId once it is set under user during workspace selection
const _getActivity = (activityId) =>
  ActivityHelper.findNonRejectedById(activityId).then(activity =>
    ActivityHydrator.hydrateActivity({ activity }));
